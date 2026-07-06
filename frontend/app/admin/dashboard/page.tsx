'use client';

import { useState, useEffect } from 'react';
import { useProductStore } from '@/app/stores/productStore';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORIES = [
  { id: 'electronique', name: 'Électronique', icon: '⚡', url: '/electronique' },
  { id: 'electromenager', name: 'Électroménager', icon: '🍳', url: '/electromenager' },
  { id: 'mode', name: 'Mode (Vêtements)', icon: '👕', url: '/mode' },
];

export default function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct, initDB } = useProductStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('electronique');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoSending, setPromoSending] = useState(false);
  const [promoForm, setPromoForm] = useState({
    title: '',
    message: '',
    discountPercent: '',
    validUntil: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    imageFile: null as File | null,
  });
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);

  const handlePromoChange = (field: string, value: string) => {
    setPromoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendPromotion = async () => {
    setPromoSending(true);
    setPromoMessage('');

    try {
      if (!promoForm.title || !promoForm.message) {
        throw new Error('Veuillez renseigner le titre et le message de la promotion.');
      }

      await axios.post(`${API_URL}/notifications/promotions`, {
        promotionId: `promo-${Date.now()}`,
        title: promoForm.title,
        message: promoForm.message,
        discountPercent: promoForm.discountPercent ? Number(promoForm.discountPercent) : undefined,
        validUntil: promoForm.validUntil || undefined,
      });

      setPromoMessage('Promotion envoyée à tous les clients vérifiés.');
      setPromoForm({ title: '', message: '', discountPercent: '', validUntil: '' });
    } catch (err: any) {
      setPromoMessage(err?.response?.data?.message || err.message || 'Erreur lors de l\'envoi de la promotion.');
    } finally {
      setPromoSending(false);
    }
  };

  useEffect(() => {
    // Initialiser la base de données
    initDB();

    // Écouter les changements de connexion
    const handleOnline = () => {
      setSyncStatus('Synchronisation...');
      // Synchroniser les données
    };

    const handleOffline = () => {
      setSyncStatus('Mode hors ligne - Les modifications seront synchronisées');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initDB]);

  // Admin notifications: fetch and SSE subscribe
  useEffect(() => {
    let es: EventSource | null = null;

    const getAuthToken = () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('debymarket-access-token') || window.sessionStorage.getItem('debymarket-access-token');
    };

    const fetchAdminNotifications = async () => {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get(`${API_URL}/admin/notifications`, { headers });
        const items = Array.isArray(res.data) ? res.data : [];
        setAdminNotifications(items);
        setAdminUnreadCount(items.filter((n: any) => !n.isRead).length);
      } catch (err) {
        // ignore
      }
    };

    fetchAdminNotifications();

    try {
      const storedToken = getAuthToken();
      const sseUrl = storedToken ? `${API_URL}/admin/notifications/subscribe?token=${encodeURIComponent(storedToken)}` : `${API_URL}/admin/notifications/subscribe`;
      es = new EventSource(sseUrl);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setAdminNotifications((prev) => [data, ...prev]);
          setAdminUnreadCount((c) => c + 1);
        } catch (err) {
          // ignore JSON parse
        }
      };
      es.onerror = () => {
        es?.close();
      };
    } catch (err) {
      // skip SSE if not available
    }

    return () => {
      es?.close();
    };
  }, []);

  /**
   * Gérer le changement d'image URL
   */
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
  };

  /**
   * Gérer l'upload d'image locale
   */
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file, imageUrl: '' }));
    }
  };

  /**
   * Uploader une image vers le serveur
   */
  const uploadImage = async () => {
    if (!formData.imageFile) return;

    setUploadingImage(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', formData.imageFile);

      const response = await axios.post(`${API_URL}/products/image/upload`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((prev) => ({
        ...prev,
        imageUrl: response.data.url,
        imageFile: null,
      }));

      setSuccess('Image uploadée avec succès!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Valider et soumettre le formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || !formData.price) {
        throw new Error('Veuillez remplir les champs obligatoires');
      }

      if (!formData.imageUrl && !formData.imageFile) {
        throw new Error('Veuillez ajouter une image');
      }

      const productData = {
        id: editingProduct?.id || `product-${Date.now()}`,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        categoryId: selectedCategory,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: [formData.imageUrl],
        createdAt: new Date().toISOString(),
      };

      if (editingProduct) {
        await updateProduct(productData);
        setSuccess('Produit mis à jour!');
      } else {
        await addProduct(productData);
        setSuccess('Produit ajouté avec succès!');
      }

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        imageFile: null,
      });
      setEditingProduct(null);
      setShowForm(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Éditer un produit
   */
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.images[0] || '',
      imageFile: null,
    });
    setSelectedCategory(product.categoryId);
    setShowForm(true);
  };

  /**
   * Supprimer un produit
   */
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      setLoading(true);
      try {
        await deleteProduct(id);
        setSuccess('Produit supprimé!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const markAdminNotificationAsRead = async (id: string) => {
    try {
      await axios.put(`${API_URL}/admin/notifications/${id}/read`);
      setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setAdminUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Impossible de marquer la notification admin comme lue', err);
    }
  };

  const deleteAdminNotification = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/admin/notifications/${id}`);
      setAdminNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.warn('Impossible de supprimer la notification admin', err);
    }
  };

  const categoryProducts = products.filter((p) => p.categoryId === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tableau de bord Admin</h1>
          <p className="text-gray-300">Gérez vos produits facilement</p>
          {syncStatus && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400 rounded-lg text-sm text-blue-200">
              {syncStatus}
            </div>
          )}
          {/* Admin notifications bell */}
          <div className="absolute right-8 top-8">
            <div className="relative inline-block">
              <button
                onClick={() => setShowAdminNotifications((s) => !s)}
                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
                title="Notifications admin"
              >
                🔔
                {adminUnreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">{adminUnreadCount}</span>
                )}
              </button>

              {showAdminNotifications && (
                <div className="mt-2 w-96 max-h-96 overflow-auto rounded-lg bg-white text-slate-900 shadow-lg border border-slate-200 p-3">
                  <h3 className="font-semibold mb-2">Notifications Admin</h3>
                  {adminNotifications.length === 0 ? (
                    <div className="text-sm text-slate-500">Aucune notification</div>
                  ) : (
                    <div className="space-y-2">
                      {adminNotifications.map((n) => (
                        <div key={n.id} className={`p-3 rounded-lg border ${n.isRead ? 'bg-white border-slate-200' : 'bg-indigo-50 border-indigo-200'}`}>
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <div className="text-sm text-indigo-600 uppercase">{n.type}</div>
                              <div className="font-semibold">{n.title}</div>
                              <div className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString('fr-FR')}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {!n.isRead && (
                                <button onClick={() => markAdminNotificationAsRead(n.id)} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Marquer lu</button>
                              )}
                              <button onClick={() => deleteAdminNotification(n.id)} className="text-xs border px-2 py-1 rounded">Supprimer</button>
                            </div>
                          </div>
                          {n.message && <div className="mt-2 text-sm text-slate-700">{n.message}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-lg text-green-200">
            {success}
          </div>
        )}
        {promoMessage && (
          <div className="mb-6 p-4 bg-indigo-500/20 border border-indigo-400 rounded-lg text-indigo-200">
            {promoMessage}
          </div>
        )}

        {/* Section promotions */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Envoyer une promotion</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Titre</label>
              <input
                type="text"
                value={promoForm.title}
                onChange={(e) => handlePromoChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Ex: Soldes d'été"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Réduction (%)</label>
              <input
                type="number"
                value={promoForm.discountPercent}
                onChange={(e) => handlePromoChange('discountPercent', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="20"
                min="0"
                max="100"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Valable jusqu'au</label>
              <input
                type="date"
                value={promoForm.validUntil}
                onChange={(e) => handlePromoChange('validUntil', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Message de la promotion</label>
            <textarea
              value={promoForm.message}
              onChange={(e) => handlePromoChange('message', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Par exemple : Bénéficiez de -20% sur tous les produits électroménagers pendant 48h."
            />
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={handleSendPromotion}
              disabled={promoSending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              {promoSending ? 'Envoi en cours...' : 'Envoyer la promotion'}
            </button>
            <button
              type="button"
              onClick={() => setPromoForm({ title: '', message: '', discountPercent: '', validUntil: '' })}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Bouton ajouter */}
        {!showForm && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                imageUrl: '',
                imageFile: null,
              });
              setShowForm(true);
            }}
            className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg"
          >
            ➕ Ajouter un produit
          </button>
        )}

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium mb-3">Catégorie</label>
                <div className="grid grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-lg border-2 transition duration-300 ${
                        selectedCategory === cat.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="font-medium">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Samsung Galaxy S24"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Décrivez votre produit..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
              </div>

              {/* Prix et Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prix (XOF) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="10000"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    placeholder="10"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Upload Image */}
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6">
                <label className="block text-sm font-medium mb-4">Image du produit *</label>

                {/* Option 1: URL */}
                <div className="mb-4">
                  <label className="text-sm text-gray-300 mb-2 block">URL de l\'image</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                {/* Option 2: Upload local */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Ou sélectionnez un fichier</label>
                  <label className="relative flex items-center justify-between gap-3 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg cursor-pointer text-gray-200 hover:border-blue-500 transition-colors">
                    <span>{formData.imageFile ? formData.imageFile.name : 'Cliquez ici pour sélectionner un fichier local'}</span>
                    <span className="text-sm text-blue-300 font-semibold">Parcourir</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <p className="text-xs text-slate-400 mt-2">Formats acceptés : JPG, PNG, WEBP. Taille max 5MB.</p>
                  {formData.imageFile && (
                    <button
                      type="button"
                      onClick={uploadImage}
                      disabled={uploadingImage}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                      {uploadingImage ? 'Upload en cours...' : 'Uploader l\'image'}
                    </button>
                  )}
                </div>

                {/* Aperçu */}
                {formData.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="max-w-xs rounded-lg border border-slate-600"
                    />
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  {loading ? 'Chargement...' : editingProduct ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des produits */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Produits ({categoryProducts.length})
          </h2>

          {categoryProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-gray-400 text-lg">Aucun produit dans cette catégorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition duration-300"
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">
                          {product.price.toLocaleString()} XOF
                        </p>
                        <p className="text-sm text-gray-400">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm"
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
