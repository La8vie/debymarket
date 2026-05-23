"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "./context/CartContext";

type Variant = { price: number };
type Product = {
  id: string;
  name: string;
  shortDesc?: string;
  variants?: Variant[];
};

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    const price = product.variants?.[0]?.price || 0;
    addToCart({ id: product.id, name: product.name, price: price });
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-800">
          Nos Produits
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Power Banks & Accessoires Électroniques
        </p>

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">Aucun produit disponible.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col border-t-4 border-blue-600"
              >
                <div className="bg-gray-200 rounded-lg h-40 mb-4 flex items-center justify-center text-gray-400">
                  Image
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4 flex-grow">
                  {product.shortDesc || "Description à venir..."}
                </p>
                <div className="mt-auto">
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    {product.variants?.[0]?.price || 0} <span className="text-sm text-gray-400">XOF</span>
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}