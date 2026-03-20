import { useState } from 'react';

const MOTIFS = [
  { value: 'retard', label: 'Retard' },
  { value: 'dommage', label: 'Dommage' },
  { value: 'geste_commercial', label: 'Geste commercial' },
  { value: 'autre', label: 'Autre' },
];

export function AvoirModal({ isOpen, onClose, onSubmit, clientNom, loading }) {
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('geste_commercial');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) return;

    onSubmit({
      montant: montantNum,
      motif,
      notes: notes || null,
    });

    // Reset form
    setMontant('');
    setMotif('geste_commercial');
    setNotes('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Accorder un avoir
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Client info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Client</p>
          <p className="font-medium text-gray-900">{clientNom || 'Sans nom'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                EUR
              </span>
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOTIFS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMotif(m.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    motif === m.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Raison de l'avoir..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !montant || parseFloat(montant) <= 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              {loading ? 'En cours...' : 'Accorder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
