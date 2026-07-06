"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import LoadingSpinner from "../components/LoadingSpinner";

type Variant = { price: number };
type Product = {
  id: string;
  name: string;
  shortDesc?: string;
  categoryId?: string;
  variants?: Variant[];
  images?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORY_INFO = {
  name: "Mode",
  description: "Accessoires, vêtements et tendances au quotidien pour un style unique.",
  icon: "👕",
  color: "pink"
};

const SORT_OPTIONS = [
  { label: "Plus populaires", value: "popular" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Nouveautés", value: "newest" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${star <= rating ? "star-filled" : "star-empty"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const price = product.variants?.[0]?.price || 0;
  const rating = Math.floor(Math.random() * 2) + 3;
  const reviews = Math.floor(Math.random() * 200) + 10;
  const isNew = Math.random() > 0.7;
  const isPromo = Math.random() > 0.75;
  const oldPrice = isPromo ? Math.round(price * 1.25) : null;
  const imageUrl = product.images?.[0] || `https://placehold.co/400x300/ec4899/fce7f3?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="product-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
      <div className="relative overflow-hidden bg-gray-50">
        <img 
          src={imageUrl}
          alt={product.name}
          className="rounded-lg h-48 mb-4 w-full object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && <span className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">NOUVEAU</span>}
          {isPromo && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-20%</span>}
        </div>
        <button className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-pink-500 font-semibold uppercase tracking-wider mb-1">Mode</p>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{product.shortDesc || "Produit de haute qualité, livraison rapide partout en Côte d'Ivoire."}</p>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={rating} />
          <span className="text-xs text-gray-500">({reviews})</span>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="text-xl font-black text-gray-900">{price.toLocaleString("fr-FR")} <span className="text-sm font-semibold text-gray-500">XOF</span></span>
          {oldPrice && <span className="text-sm text-gray-400 line-through">{oldPrice.toLocaleString("fr-FR")} XOF</span>}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-green-600 font-medium">En stock · Livraison 24-48h</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="btn-primary w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

export default function ModePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = Array.isArray(data) 
          ? data.filter((p: Product) => p.categoryId?.toLowerCase().includes('mode'))
          : [];
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => {
        // Mock data for demonstration
        const mockProducts: Product[] = [
          {
            id: '7',
            name: 'Sac à Dos Urbain',
            shortDesc: 'Imperméable laptop 15.6"',
            categoryId: 'mode',
            variants: [{ price: 18000 }],
            images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Sac'],
          },
          {
            id: '8',
            name: 'Montre Sport LED',
            shortDesc: 'Podomètre cardio étanche',
            categoryId: 'mode',
            variants: [{ price: 12000 }],
            images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Montre'],
          },
          {
            id: '9',
            name: 'Lunettes de Soleil UV400',
            shortDesc: 'Polarisées UV400',
            categoryId: 'mode',
            variants: [{ price: 8000 }],
            images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Lunettes'],
          },
          {
            id: '10',
            name: 'Casquette Baseball',
            shortDesc: 'Coton ajustable brodé',
            categoryId: 'mode',
            variants: [{ price: 5000 }],
            images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Casquette'],
          },
          {
            id: '11',
            name: 'Ceinture Cuir Genuine',
            shortDesc: 'Cuir véritable boucle métal',
            categoryId: 'mode',
            variants: [{ price: 10000 }],
            images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Ceinture'],
          },
          {
            id: '12',
            name: 'Portefeuille RFID',
            shortDesc: 'Protection RFID 8 cartes',
            categoryId: 'mode',
            variants: [{ price: 7000 }],
            images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Portefeuille'],
          },
        ];
        setProducts(mockProducts);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    const price = product.variants?.[0]?.price || 0;
    addToCart({ id: product.id, name: product.name, price });
    setToast(`✅ "${product.name}" ajouté au panier !`);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{CATEGORY_INFO.icon}</span>
            <h1 className="text-4xl font-black">{CATEGORY_INFO.name}</h1>
          </div>
          <p className="text-pink-100 text-lg max-w-2xl">{CATEGORY_INFO.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-sm">
              {loading ? "Chargement..." : `${products.length} produits`}
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 outline-none focus:border-pink-400 bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={60} color="#ec4899" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">👕</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun produit disponible</h3>
            <p className="text-gray-400 mb-6">Les produits de cette catégorie seront bientôt disponibles.</p>
            <Link href="/" className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium toast flex items-center gap-3 z-50 max-w-sm">
          {toast}
          <button onClick={() => setToast("")} className="text-gray-400 hover:text-white ml-2">✕</button>
        </div>
      )}
    </div>
  );
}
