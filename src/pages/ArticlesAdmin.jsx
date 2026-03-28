import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export function ArticlesAdmin() {
  const navigate = useNavigate();
  const { pressing } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);

  // Edition article
  const [editingArticle, setEditingArticle] = useState(null);
  const [editNom, setEditNom] = useState('');
  const [editPrix, setEditPrix] = useState('');

  // Ajout article
  const [showAddArticle, setShowAddArticle] = useState(null); // categorie_id
  const [newArticleNom, setNewArticleNom] = useState('');
  const [newArticlePrix, setNewArticlePrix] = useState('');

  // Ajout categorie
  const [showAddCategorie, setShowAddCategorie] = useState(false);
  const [newCategorieNom, setNewCategorieNom] = useState('');
  const [newCategorieIcon, setNewCategorieIcon] = useState('');

  // Confirmation suppression
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (pressing?.id) {
      loadData();
    }
  }, [pressing?.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, artRes] = await Promise.all([
        supabase.from('categories').select('*').eq('pressing_id', pressing.id).order('ordre'),
        supabase.from('articles').select('*').eq('pressing_id', pressing.id).order('nom')
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (artRes.data) setArticles(artRes.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
      showError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  // Sauvegarder modification article
  async function saveArticle() {
    if (!editingArticle || !editNom.trim() || !editPrix) return;

    try {
      const { error } = await supabase
        .from('articles')
        .update({ nom: editNom.trim(), prix: parseFloat(editPrix) })
        .eq('id', editingArticle);

      if (error) throw error;

      setArticles(prev => prev.map(a =>
        a.id === editingArticle ? { ...a, nom: editNom.trim(), prix: parseFloat(editPrix) } : a
      ));
      setEditingArticle(null);
      showSuccess('Article modifie');
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur de sauvegarde');
    }
  }

  // Supprimer article
  async function deleteArticle(id) {
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;

      setArticles(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
      showSuccess('Article supprime');
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur de suppression');
    }
  }

  // Ajouter article
  async function addArticle(categorieId) {
    if (!newArticleNom.trim() || !newArticlePrix) return;

    try {
      const newId = `${categorieId}_${Date.now()}`;
      const { data, error } = await supabase
        .from('articles')
        .insert({
          id: newId,
          categorie_id: categorieId,
          nom: newArticleNom.trim(),
          prix: parseFloat(newArticlePrix),
          pressing_id: pressing.id
        })
        .select()
        .single();

      if (error) throw error;

      setArticles(prev => [...prev, data]);
      setShowAddArticle(null);
      setNewArticleNom('');
      setNewArticlePrix('');
      showSuccess('Article ajoute');
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de l\'ajout');
    }
  }

  // Ajouter categorie
  async function addCategorie() {
    if (!newCategorieNom.trim()) return;

    try {
      const newId = `cat_${Date.now()}`;
      const maxOrdre = Math.max(0, ...categories.map(c => c.ordre || 0));
      const { data, error } = await supabase
        .from('categories')
        .insert({
          id: newId,
          nom: newCategorieNom.trim(),
          icon: newCategorieIcon || null,
          ordre: maxOrdre + 1,
          pressing_id: pressing.id
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setShowAddCategorie(false);
      setNewCategorieNom('');
      setNewCategorieIcon('');
      showSuccess('Categorie ajoutee');
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de l\'ajout');
    }
  }

  // Supprimer categorie (et ses articles)
  async function deleteCategorie(id) {
    try {
      // Supprimer d'abord les articles de cette categorie
      await supabase.from('articles').delete().eq('categorie_id', id);
      // Puis la categorie
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      setArticles(prev => prev.filter(a => a.categorie_id !== id));
      setDeleteConfirm(null);
      showSuccess('Categorie supprimee');
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur de suppression');
    }
  }

  const getArticlesByCategorie = (catId) => articles.filter(a => a.categorie_id === catId);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/parametres')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des articles</h2>
          <p className="text-sm text-gray-500">{articles.length} articles dans {categories.length} categories</p>
        </div>
      </div>

      {/* Bouton ajouter categorie */}
      <button
        onClick={() => setShowAddCategorie(true)}
        className="w-full flex items-center justify-center gap-2 bg-primary-50 text-primary-600 py-3 rounded-lg font-medium hover:bg-primary-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une categorie
      </button>

      {/* Modal ajouter categorie */}
      {showAddCategorie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-4 space-y-4">
            <h3 className="font-semibold text-lg">Nouvelle categorie</h3>
            <input
              type="text"
              value={newCategorieNom}
              onChange={(e) => setNewCategorieNom(e.target.value)}
              placeholder="Nom de la categorie"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
            />
            <input
              type="text"
              value={newCategorieIcon}
              onChange={(e) => setNewCategorieIcon(e.target.value)}
              placeholder="Emoji (optionnel)"
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddCategorie(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={addCategorie}
                disabled={!newCategorieNom.trim()}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des categories */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const catArticles = getArticlesByCategorie(cat.id);
          const isExpanded = expandedCat === cat.id;

          return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header categorie */}
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon || '📦'}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{cat.nom}</p>
                    <p className="text-sm text-gray-500">{catArticles.length} article{catArticles.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ type: 'categorie', id: cat.id, nom: cat.nom });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Articles de la categorie */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {catArticles.map((article) => (
                    <div key={article.id} className="p-3 border-b border-gray-50 last:border-b-0">
                      {editingArticle === article.id ? (
                        // Mode edition
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            autoFocus
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={editPrix}
                            onChange={(e) => setEditPrix(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Prix (EUR)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingArticle(null)}
                              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={saveArticle}
                              className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900">{article.nom}</p>
                            <p className="text-sm font-semibold text-primary-600">{parseFloat(article.prix).toFixed(2)} EUR</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingArticle(article.id);
                                setEditNom(article.nom);
                                setEditPrix(article.prix.toString());
                              }}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'article', id: article.id, nom: article.nom })}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Ajouter article */}
                  {showAddArticle === cat.id ? (
                    <div className="p-3 bg-gray-50 space-y-2">
                      <input
                        type="text"
                        value={newArticleNom}
                        onChange={(e) => setNewArticleNom(e.target.value)}
                        placeholder="Nom de l'article"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        autoFocus
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newArticlePrix}
                        onChange={(e) => setNewArticlePrix(e.target.value)}
                        placeholder="Prix (EUR)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddArticle(null)}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => addArticle(cat.id)}
                          disabled={!newArticleNom.trim() || !newArticlePrix}
                          className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAddArticle(cat.id);
                        setNewArticleNom('');
                        setNewArticlePrix('');
                      }}
                      className="w-full p-3 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter un article
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-4 space-y-4">
            <h3 className="font-semibold text-lg text-red-600">Confirmer la suppression</h3>
            <p className="text-gray-600">
              Voulez-vous vraiment supprimer {deleteConfirm.type === 'categorie' ? 'la categorie' : 'l\'article'} <strong>"{deleteConfirm.nom}"</strong> ?
              {deleteConfirm.type === 'categorie' && (
                <span className="block text-sm text-red-500 mt-1">
                  Tous les articles de cette categorie seront egalement supprimes.
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'categorie') {
                    deleteCategorie(deleteConfirm.id);
                  } else {
                    deleteArticle(deleteConfirm.id);
                  }
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
