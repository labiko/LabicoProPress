import { useState, useEffect } from 'react';
import * as brotherPrinter from '../lib/brotherPrinter';

export default function LabelModal({ isOpen, onClose, orderData, onConfirm, isConfirming = false }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copies, setCopies] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isSupported = brotherPrinter.isSupported();

  useEffect(() => {
    if (isOpen && orderData) {
      // Nombre de copies par defaut = nombre d'articles
      setCopies(orderData.nbArticles || 1);
      setIsConfirmed(false);
      setError(null);
      setSuccess(null);

      const labelData = {
        pressingName: orderData.pressingName || 'PRESSING',
        orderNumber: orderData.orderNumber,
        clientName: orderData.clientName || 'Client',
        date: orderData.date || new Date().toLocaleDateString('fr-FR'),
        totalAmount: orderData.totalAmount || 0,
        nbArticles: orderData.nbArticles || 1
      };

      const url = brotherPrinter.previewLabel(labelData);
      setPreviewUrl(url);
    }
  }, [isOpen, orderData]);

  useEffect(() => {
    setIsConnected(brotherPrinter.isConnected());
  }, []);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      await brotherPrinter.connect();
      setIsConnected(true);
      setSuccess('Imprimante connectee');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setError('Aucune imprimante selectionnee');
      } else {
        setError(`Erreur de connexion: ${err.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await brotherPrinter.disconnect();
    setIsConnected(false);
  };

  const handlePrint = async () => {
    setError(null);
    setIsPrinting(true);

    try {
      const labelData = {
        pressingName: orderData.pressingName || 'PRESSING',
        orderNumber: orderData.orderNumber,
        clientName: orderData.clientName || 'Client',
        date: orderData.date || new Date().toLocaleDateString('fr-FR'),
        totalAmount: orderData.totalAmount || 0,
        nbArticles: orderData.nbArticles || 1
      };

      // IMPRIMER D'ABORD
      await brotherPrinter.printLabel(labelData, copies);

      // PUIS creer la commande si impression reussie
      if (onConfirm && !isConfirmed) {
        const confirmSuccess = await onConfirm();
        if (!confirmSuccess) {
          setError('Erreur lors de la creation de la commande');
          setIsPrinting(false);
          return;
        }
        setIsConfirmed(true);
      }

      setSuccess(`${copies} etiquette(s) imprimee(s) - Commande creee`);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err) {
      // En cas d'erreur d'impression, la commande n'est PAS creee
      setError(`Erreur d'impression: ${err.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Impression Etiquette</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isSupported && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Web Serial API non supportee. Utilisez Chrome 117+ ou Edge.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Apercu de l'etiquette */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Apercu:</p>
          <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Apercu etiquette"
                className="border border-gray-300 shadow-sm"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="text-gray-400">Chargement...</div>
            )}
          </div>
        </div>

        {/* Statut connexion */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Imprimante connectee' : 'Non connectee'}
            </span>
          </div>

          {isSupported && (
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
              className={`px-3 py-1 text-sm rounded ${
                isConnected
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              {isConnecting ? 'Connexion...' : isConnected ? 'Deconnecter' : 'Connecter'}
            </button>
          )}
        </div>

        {/* Nombre de copies */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Nombre de copies:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCopies(Math.max(1, copies - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 text-lg"
            >
              -
            </button>
            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="10"
              className="w-16 h-10 text-center border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => setCopies(Math.min(10, copies + 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Boutons action */}
        <div className="space-y-2">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isConfirming || isPrinting}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isConfirmed ? 'Fermer' : 'Annuler'}
            </button>
            <button
              onClick={handlePrint}
              disabled={!isConnected || isPrinting || isConfirming || !isSupported}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPrinting || isConfirming ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isConfirming ? 'Creation...' : 'Impression...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Aide */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Assurez-vous que l'imprimante Brother PT-P710BT est appairee dans les parametres Bluetooth de votre appareil.
        </p>
      </div>
    </div>
  );
}
