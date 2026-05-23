"use client";

import React, { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  stock: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: newName, slug: newSlug, price: Number(newPrice) };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const mapped = {
          id: created.id ?? created._id ?? String(created.id ?? Date.now()),
          name: created.name ?? payload.name,
          slug: created.slug ?? payload.slug,
          price: created.price ?? payload.price,
          stock: created.stock ?? 0,
        } as Product;
        setProducts((prev) => [mapped, ...prev]);
        setNewName("");
        setNewSlug("");
        setNewPrice("");
      } else {
        console.error("Erreur lors de l'ajout du produit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
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
        <form onSubmit={handleAddProduct} className="flex gap-4 items-end">
          <div className="flex-1">
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
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Slug (URL)</label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              required
              className="w-full border p-2 rounded"
              placeholder="power-bank-30k"
            />
          </div>
          <div className="w-32">
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
