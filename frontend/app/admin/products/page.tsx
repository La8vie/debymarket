"use client";

import React, { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  stock: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem('debymarket-access-token') ||
    window.sessionStorage.getItem('debymarket-access-token') ||
    null
  );
};

const getAuthHeaders = (contentType?: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("electronique");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "local">("url");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data || []).map((p: any) => ({
          id: p.id ?? p._id ?? String(Math.random()),
          name: p.name,
          slug: p.slug,
          price: p.price ?? p.variants?.[0]?.price ?? 0,
          stock: p.stock ?? 0,
        }));
        setProducts(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNewImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageUrl(e.target.value);
    setImageMode('url');
    setNewImageFile(null);
  };

  const handleNewImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setNewImageFile(file);
    setNewImageUrl('');
    setImageMode('local');
  };

  const uploadNewImageFile = async () => {
    if (!newImageFile) return;

    setUploadingImage(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', newImageFile);

      const res = await fetch(`${API_URL}/products/image/upload`, {
        method: 'POST',
        headers: getAuthHeaders(undefined),
        body: uploadForm,
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Erreur d\'upload');
      }

      const data = await res.json();
      setNewImageUrl(data.url || '');
      setNewImageFile(null);
    } catch (err) {
      console.error(err);
      alert('Impossible d\'uploader l\'image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: newName,
      categoryId: newCategory,
      price: Number(newPrice),
      stock: 0,
      imageUrls: newImageUrl ? [newImageUrl] : undefined,
    };
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        alert('Vous devez être connecté en tant qu\'admin pour ajouter un produit.');
        return;
      }

      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const mapped = {
          id: created.id ?? created._id ?? String(created.id ?? Date.now()),
          name: created.name ?? payload.name,
          slug: created.slug,
          price: created.price ?? payload.price,
          stock: created.stock ?? 0,
        } as Product;
        setProducts((prev) => [mapped, ...prev]);
        setNewName("");
        setNewPrice("");
      } else {
        const errorText = await res.text();
        console.error("Erreur lors de l'ajout du produit", res.status, errorText);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        alert('Vous devez être connecté en tant qu\'admin pour supprimer un produit.');
        return;
      }

      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Formulaire d'ajout */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Ajouter un produit</h3>
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Nom</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full border p-2 rounded"
                placeholder="Power Bank 30000mAh"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Catégorie</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="electronique">⚡ Électronique</option>
                <option value="electromenager">🍳 Électroménager</option>
                <option value="mode">👕 Mode</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Prix (XOF)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
                className="w-full border p-2 rounded"
                placeholder="15000"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold text-gray-700">Image du produit</p>
                <p className="text-sm text-gray-500">Ajoutez une image via URL ou sélectionnez un fichier local.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-4 py-2 rounded-lg border ${imageMode === 'url' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('local')}
                  className={`px-4 py-2 rounded-lg border ${imageMode === 'local' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  Local
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <div className="space-y-3">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={handleNewImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border p-2 rounded"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="relative flex items-center justify-between gap-3 px-4 py-3 border border-dashed rounded-lg cursor-pointer bg-gray-50 text-gray-700 hover:border-indigo-600">
                  <span>{newImageFile ? newImageFile.name : 'Cliquez pour ajouter une image locale'}</span>
                  <span className="text-sm font-semibold text-indigo-600">Parcourir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleNewImageFileChange}
                  />
                </label>
                {newImageFile && (
                  <button
                    type="button"
                    onClick={uploadNewImageFile}
                    disabled={uploadingImage}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {uploadingImage ? 'Upload en cours...' : 'Uploader l\'image'}
                  </button>
                )}
              </div>
            )}

            {newImageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
                <img src={newImageUrl} alt="Aperçu du produit" className="max-w-xs rounded-lg border border-gray-200" />
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">Si vous chargez un fichier local, cliquez sur &quot;Uploader l'image&quot; pour générer une URL.</div>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Nom du produit</th>
              <th className="p-4 font-semibold text-gray-600">Prix</th>
              <th className="p-4 font-semibold text-gray-600">Stock</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{product.name}</td>
                <td className="p-4 font-medium">{product.price} XOF</td>
                <td className="p-4">
                  <span className={`${product.stock > 0 ? "text-green-600" : "text-red-600"} font-semibold`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:underline mr-2">Modifier</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">Aucun produit trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
