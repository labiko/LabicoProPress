import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export function CommandeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { pressing } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Client - recherche par téléphone
  const [telephone, setTelephone] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientTrouve, setClientTrouve] = useState(null); // null = pas cherché, false = pas trouvé, object = trouvé
  const [searchingClient, setSearchingClient] = useState(false);

  // Selection articles
  const [lignes, setLignes] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState('basiques');
  const [showArticleSelector, setShowArticleSelector] = useState(true); // Ouvert par défaut
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [searchArticle, setSearchArticle] = useState(''); // Recherche articles

  // Utilisation avoir
  const [utiliserAvoir, setUtiliserAvoir] = useState(false);

  useEffect(() => {
    if (pressing?.id) {
      loadTarifs();
      if (isEdit) {
        loadCommande();
      } else {
        setLoadingData(false);
      }
    }
  }, [pressing?.id, id]);

  async function loadTarifs() {
    try {
      const [catRes, artRes] = await Promise.all([
        supabase.from('categories').select('*').order('ordre'),
        supabase.from('articles').select('*')
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (artRes.data) setArticles(artRes.data);
      if (catRes.data?.length > 0) setSelectedCategorie(catRes.data[0].id);
    } catch (err) {
      console.error('Erreur chargement tarifs:', err);
    }
  }

  // Recherche client par téléphone
  async function rechercherClient(tel) {
    if (!tel || tel.length < 4) {
      setClientTrouve(null);
      setSelectedClientId('');
      return;
    }

    setSearchingClient(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('pressing_id', pressing.id)
        .eq('telephone', tel)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setClientTrouve(data);
        setSelectedClientId(data.id);
        setClientNom(data.nom || '');
      } else {
        setClientTrouve(false);
        setSelectedClientId('');
      }
    } catch (err) {
      console.error('Erreur recherche client:', err);
      setClientTrouve(false);
      setSelectedClientId('');
    } finally {
      setSearchingClient(false);
    }
  }

  // Créer un nouveau client
  async function creerClient() {
    if (!telephone) return null;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          pressing_id: pressing.id,
          telephone: telephone,
          nom: clientNom || null,
        })
        .select()
        .single();

      if (error) throw error;

      setClientTrouve(data);
      setSelectedClientId(data.id);
      showSuccess('Client créé');
      return data;
    } catch (err) {
      console.error('Erreur création client:', err);
      if (err.code === '23505') {
        showError('Ce numéro existe déjà');
      } else {
        showError('Erreur lors de la création du client');
      }
      return null;
    }
  }

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (telephone && pressing?.id) {
        rechercherClient(telephone);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [telephone, pressing?.id]);

  async function loadCommande() {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*, clients(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSelectedClientId(data.client_id);
      setNotes(data.notes || '');

      // Charger les infos du client
      if (data.clients) {
        setTelephone(data.clients.telephone);
        setClientNom(data.clients.nom || '');
        setClientTrouve(data.clients);
      }

      // Charger les lignes de la commande
      const { data: lignesData } = await supabase
        .from('lignes_commande')
        .select('*')
        .eq('commande_id', id);

      if (lignesData && lignesData.length > 0) {
        setLignes(lignesData.map(l => ({
          article_id: l.article_id,
          article_nom: l.article_nom,
          quantite: l.quantite,
          prix_unitaire: parseFloat(l.prix_unitaire)
        })));
      }
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      showError('Commande non trouvée');
      navigate('/commandes');
    } finally {
      setLoadingData(false);
    }
  }

  // Fonctions de gestion des articles
  function ajouterArticle(article) {
    const existe = lignes.find(l => l.article_id === article.id);
    if (existe) {
      setLignes(lignes.map(l =>
        l.article_id === article.id
          ? { ...l, quantite: l.quantite + 1 }
          : l
      ));
    } else {
      setLignes([...lignes, {
        article_id: article.id,
        article_nom: article.nom,
        quantite: 1,
        prix_unitaire: parseFloat(article.prix)
      }]);
    }
  }

  function modifierQuantite(articleId, delta) {
    setLignes(lignes.map(l => {
      if (l.article_id === articleId) {
        const newQte = l.quantite + delta;
        return newQte > 0 ? { ...l, quantite: newQte } : l;
      }
      return l;
    }).filter(l => l.quantite > 0));
  }

  function supprimerLigne(articleId) {
    setLignes(lignes.filter(l => l.article_id !== articleId));
  }

  // Articles filtrés par catégorie ou recherche
  const articlesFiltres = searchArticle
    ? articles.filter(a => a.nom.toLowerCase().includes(searchArticle.toLowerCase()))
    : articles.filter(a => a.categorie_id === selectedCategorie);

  // Calcul du total et nb vetements
  const montantTotal = lignes.reduce((sum, l) => sum + (l.prix_unitaire * l.quantite), 0);
  const nbVetements = lignes.reduce((sum, l) => sum + l.quantite, 0);

  // Calcul avoir
  const soldeAvoir = clientTrouve ? parseFloat(clientTrouve.solde_avoir) || 0 : 0;
  const avoirUtilise = utiliserAvoir ? Math.min(soldeAvoir, montantTotal) : 0;
  const resteAPayer = montantTotal - avoirUtilise;

  async function genererNumero() {
    const annee = new Date().getFullYear();

    // Compter les commandes de l'année
    const { count } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .eq('pressing_id', pressing.id)
      .gte('created_at', `${annee}-01-01`);

    const numero = String((count || 0) + 1).padStart(4, '0');
    return `${annee}-${numero}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pressing?.id) return;
    if (!telephone) {
      showError('Entrez un numéro de téléphone');
      return;
    }
    if (lignes.length === 0) {
      showError('Ajoutez au moins un article');
      return;
    }

    setLoading(true);

    try {
      // Créer le client si nécessaire
      let clientId = selectedClientId;
      if (clientTrouve === false) {
        const newClient = await creerClient();
        if (!newClient) {
          setLoading(false);
          return;
        }
        clientId = newClient.id;
      }

      if (isEdit) {
        // Mise à jour commande
        const { error } = await supabase
          .from('commandes')
          .update({
            client_id: clientId,
            nb_vetements: nbVetements,
            montant_total: montantTotal,
            notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        // Supprimer anciennes lignes et recréer
        await supabase.from('lignes_commande').delete().eq('commande_id', id);

        if (lignes.length > 0) {
          const lignesInsert = lignes.map(l => ({
            commande_id: id,
            article_id: l.article_id,
            article_nom: l.article_nom,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
            sous_total: l.prix_unitaire * l.quantite
          }));
          await supabase.from('lignes_commande').insert(lignesInsert);
        }

        showSuccess('Commande modifiée');
      } else {
        // Création
        const numero = await genererNumero();

        const { data, error } = await supabase
          .from('commandes')
          .insert({
            pressing_id: pressing.id,
            client_id: clientId,
            numero,
            nb_vetements: nbVetements,
            montant_total: montantTotal,
            notes: notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Créer les lignes
        if (lignes.length > 0) {
          const lignesInsert = lignes.map(l => ({
            commande_id: data.id,
            article_id: l.article_id,
            article_nom: l.article_nom,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
            sous_total: l.prix_unitaire * l.quantite
          }));
          await supabase.from('lignes_commande').insert(lignesInsert);
        }

        // Utiliser l'avoir si coché
        if (utiliserAvoir && avoirUtilise > 0) {
          // Créer avoir type debit
          await supabase.from('avoirs').insert({
            pressing_id: pressing.id,
            client_id: clientId,
            commande_id: data.id,
            montant: avoirUtilise,
            type: 'debit',
            motif: 'utilisation',
            notes: `Utilisé pour commande ${numero}`,
          });

          // Mettre à jour solde client
          const nouveauSolde = Math.max(0, soldeAvoir - avoirUtilise);
          await supabase
            .from('clients')
            .update({ solde_avoir: nouveauSolde })
            .eq('id', clientId);
        }

        showSuccess(`Commande ${numero} créée${avoirUtilise > 0 ? ` (avoir -${avoirUtilise.toFixed(2)} EUR)` : ''}`);
      }

      navigate('/commandes');
    } catch (err) {
      console.error('Erreur sauvegarde commande:', err);
      showError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }

  // Vérifier si on peut soumettre
  const canSubmit = telephone && (clientTrouve !== null) && lignes.length > 0;

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/commandes')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Modifier commande' : 'Nouvelle commande'}
        </h2>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélection client par téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone client *
          </label>
          <div className="relative">
            <input
              type="tel"
              value={telephone}
              onChange={(e) => {
                setTelephone(e.target.value);
                setClientTrouve(null);
                setSelectedClientId('');
                setClientNom('');
                setUtiliserAvoir(false);
              }}
              placeholder="Ex: 0612345678"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                clientTrouve === false ? 'border-orange-300 bg-orange-50' :
                clientTrouve ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
            {searchingClient && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>

          {/* Client trouvé */}
          {clientTrouve && clientTrouve !== false && (
            <div className="mt-2 space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                  {clientTrouve.nom ? clientTrouve.nom.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">{clientTrouve.nom || 'Sans nom'}</p>
                  <p className="text-sm text-green-600">{clientTrouve.telephone}</p>
                </div>
                <span className="text-green-600 text-xl">✓</span>
              </div>

              {/* Option avoir si client a un solde */}
              {soldeAvoir > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={utiliserAvoir}
                      onChange={(e) => setUtiliserAvoir(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">Utiliser l'avoir</p>
                      <p className="text-sm text-orange-600">Solde disponible : {soldeAvoir.toFixed(2)} EUR</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Client non trouvé - formulaire création */}
          {clientTrouve === false && telephone && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 mb-2">
                Nouveau client - Entrez son nom (optionnel)
              </p>
              <input
                type="text"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
                placeholder="Nom du client (optionnel)"
                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
              />
              <p className="text-xs text-orange-600 mt-1">
                Le client sera créé automatiquement à la validation
              </p>
            </div>
          )}
        </div>

        {/* Selection articles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Articles ({nbVetements} articles - {montantTotal.toFixed(2)} EUR)
            </label>
            <button
              type="button"
              onClick={() => setShowArticleSelector(!showArticleSelector)}
              className="text-primary-600 text-sm font-medium"
            >
              {showArticleSelector ? 'Fermer' : '+ Ajouter'}
            </button>
          </div>

          {/* Lignes ajoutées */}
          {lignes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
              {lignes.map((ligne) => (
                <div key={ligne.article_id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ligne.article_nom}</p>
                    <p className="text-xs text-gray-500">{ligne.prix_unitaire.toFixed(2)} EUR x {ligne.quantite}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => modifierQuantite(ligne.article_id, -1)}
                      className="w-8 h-8 bg-gray-100 rounded-full text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium">{ligne.quantite}</span>
                    <button
                      type="button"
                      onClick={() => modifierQuantite(ligne.article_id, 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full text-lg font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => supprimerLigne(ligne.article_id)}
                      className="w-8 h-8 text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total commande</span>
                  <span className="text-gray-700">{montantTotal.toFixed(2)} EUR</span>
                </div>
                {utiliserAvoir && avoirUtilise > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Avoir utilisé</span>
                    <span>-{avoirUtilise.toFixed(2)} EUR</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-1">
                  <span>Reste à payer</span>
                  <span className={resteAPayer === 0 ? 'text-green-600' : 'text-primary-600'}>
                    {resteAPayer.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sélecteur d'articles */}
          {showArticleSelector && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Barre de recherche */}
              <div className="p-2 bg-gray-50 border-b">
                <div className="relative">
                  <input
                    type="text"
                    value={searchArticle}
                    onChange={(e) => setSearchArticle(e.target.value)}
                    placeholder="Rechercher un article..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    🔍
                  </span>
                  {searchArticle && (
                    <button
                      type="button"
                      onClick={() => setSearchArticle('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Onglets catégories - masqués si recherche active */}
              {!searchArticle && (
                <div className="flex overflow-x-auto bg-gray-50 border-b py-1 px-1 gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategorie(cat.id)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded-lg flex items-center gap-1 ${
                        selectedCategorie === cat.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.nom}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Résultat recherche */}
              {searchArticle && (
                <div className="px-3 py-2 bg-blue-50 text-sm text-blue-700">
                  {articlesFiltres.length} résultat{articlesFiltres.length > 1 ? 's' : ''} pour "{searchArticle}"
                </div>
              )}

              {/* Grille articles */}
              <div className="max-h-72 overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-2">
                  {articlesFiltres.map((article) => {
                    const ligneExistante = lignes.find(l => l.article_id === article.id);
                    return (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => ajouterArticle(article)}
                        className={`p-3 text-left rounded-lg border transition-all active:scale-95 ${
                          ligneExistante
                            ? 'bg-primary-50 border-primary-300'
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{article.nom}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-primary-600">
                            {parseFloat(article.prix).toFixed(2)} EUR
                          </span>
                          {ligneExistante && (
                            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                              x{ligneExistante.quantite}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {articlesFiltres.length === 0 && (
                  <p className="p-4 text-center text-gray-500 text-sm">
                    {searchArticle ? 'Aucun article trouvé' : 'Aucun article dans cette catégorie'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions particulières..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? 'Enregistrement...'
            : clientTrouve === false
            ? 'Créer client + commande'
            : isEdit
            ? 'Modifier'
            : 'Créer la commande'}
        </button>
      </form>
    </div>
  );
}
