"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "./context/CartContext";
import Link from "next/link";

type Variant = { price: number };
type Product = {
  id: string;
  name: string;
  shortDesc?: string;
  categoryId?: string;
  variants?: Variant[];
};

type CategorySection = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORY_SECTIONS: CategorySection[] = [
  {
    id: "electronique",
    name: "Électronique",
    description: "Power Banks, câbles, chargeurs et audio performants.",
    icon: "⚡",
  },
  {
    id: "electromenager",
    name: "Électroménager",
    description: "Appareils pratiques pour la maison et la cuisine.",
    icon: "🍳",
  },
  {
    id: "mode",
    name: "Mode",
    description: "Accessoires, vêtements et tendances au quotidien.",
    icon: "👕",
  },
];

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
  const rating = Math.floor(Math.random() * 2) + 3; // 3-5 stars simulation
  const reviews = Math.floor(Math.random() * 200) + 10;
  const isNew = Math.random() > 0.7;
  const isPromo = Math.random() > 0.75;
  const oldPrice = isPromo ? Math.round(price * 1.25) : null;

  return (
    <div className="product-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
      <img 
        src={`https://placehold.co/400x300/1e3a8a/4ade80?text=${encodeURIComponent(product.name)}`} 
        alt={product.name}
        className="rounded-lg h-48 mb-4 w-full object-cover"
/>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">NOUVEAU</span>}
          {isPromo && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-20%</span>}
        </div>
        {/* Wishlist */}
        <button className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-1">Power Banks</p>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{product.shortDesc || "Produit de haute qualité, livraison rapide partout en Côte d'Ivoire."}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={rating} />
          <span className="text-xs text-gray-500">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-xl font-black text-gray-900">{price.toLocaleString("fr-FR")} <span className="text-sm font-semibold text-gray-500">XOF</span></span>
          {oldPrice && <span className="text-sm text-gray-400 line-through">{oldPrice.toLocaleString("fr-FR")} XOF</span>}
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-green-600 font-medium">En stock · Livraison 24-48h</span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={() => onAddToCart(product)}
          className="btn-primary w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="skeleton h-48 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-24 rounded"></div>
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-3/4 rounded"></div>
        <div className="skeleton h-6 w-32 rounded"></div>
        <div className="skeleton h-10 w-full rounded-xl"></div>
      </div>
    </div>
  );
}

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("electronique");
  const [sortBy, setSortBy] = useState("popular");
  const [toast, setToast] = useState("");
  const [priceRange, setPriceRange] = useState(500000);
  const [currentBanner, setCurrentBanner] = useState(0);

  const activeSection = CATEGORY_SECTIONS.find((section) => section.id === activeCategory);
  const activeSectionProducts = products.filter((product) =>
    product.categoryId?.toLowerCase().includes(activeCategory),
  );

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navigateToCategory = (id: string) => {
    window.location.href = `/${id}`;
  };

  const BANNERS = [
    { bg: "from-indigo-600 via-purple-600 to-pink-500", title: "Power Banks Ultra", subtitle: "Rechargez partout, à tout moment", cta: "Découvrir", badge: "NOUVEAU 2025" },
    { bg: "from-emerald-500 via-teal-500 to-cyan-500", title: "Livraison Express", subtitle: "Recevez vos commandes en 24h à Abidjan", cta: "Commander maintenant", badge: "LIVRAISON GRATUITE" },
    { bg: "from-orange-500 via-red-500 to-pink-500", title: "Soldes d'été 🔥", subtitle: "Jusqu'à -40% sur les accessoires sélectionnés", cta: "Profiter des offres", badge: "-40% CE WEEKEND" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    const price = product.variants?.[0]?.price || 0;
    addToCart({ id: product.id, name: product.name, price });
    setToast(`✅ "${product.name}" ajouté au panier !`);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner Slider */}
      <div className="relative overflow-hidden">
        {BANNERS.map((banner, i) => (
          <div
            key={i}
            className={`bg-gradient-to-r ${banner.bg} transition-all duration-700 ${i === currentBanner ? "block" : "hidden"}`}
          >
            <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white text-center md:text-left">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">{banner.badge}</span>
                <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight">{banner.title}</h1>
                <p className="text-white/80 text-lg md:text-xl mb-6 max-w-lg">{banner.subtitle}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {CATEGORY_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => navigateToCategory(section.id)}
                      className="rounded-3xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                    >
                      {section.icon} {section.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="w-64 h-64 bg-white/10 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30 overflow-hidden">
                  <img src="/logo.png" alt="Debymarket" className="w-full h-full object-contain p-6 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setCurrentBanner(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentBanner ? "bg-white w-6" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Promo strips */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { icon: "🚚", title: "Livraison rapide", sub: "Abidjan & intérieur" },
            { icon: "🔒", title: "Paiement sécurisé", sub: "Orange Money, MTN, Moov" },
            { icon: "↩️", title: "Retour 7 jours", sub: "Remboursement garanti" },
            { icon: "🎧", title: "Support 7j/7", sub: "Chat & WhatsApp" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-2 py-1">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORY_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={`/${section.id}`}
              className={`rounded-3xl border px-5 py-4 text-left transition ${
                activeCategory === section.id
                  ? "border-indigo-600 bg-indigo-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-indigo-300"
              }`}
            >
              <div className="text-2xl mb-2">{section.icon}</div>
              <div className="text-sm font-bold text-slate-900">{section.name}</div>
              <p className="text-sm text-slate-500 mt-2">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-800">Découvrez nos univers</h2>
              <p className="text-gray-500 text-sm mt-2">Trois sections claires pour l'électronique, l'électroménager et la mode — avec un accès direct à chaque collection.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={`/${section.id}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === section.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {section.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-800">
                  {activeSection?.name || "Découvrez nos catégories"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {loading
                    ? "Chargement des produits..."
                    : `${activeSectionProducts.length} résultats dans ${activeSection?.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 outline-none focus:border-indigo-400 bg-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products sections */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun produit disponible</h3>
                <p className="text-gray-400 mb-6">Les produits seront bientôt disponibles.</p>
                <Link href="/admin/products" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                  Ajouter des produits
                </Link>
              </div>
            ) : (
              <div className="space-y-16">
                {CATEGORY_SECTIONS.map((section) => {
                  const sectionProducts = products.filter((product) =>
                    product.categoryId?.toLowerCase().includes(section.id),
                  );
                  return (
                    <section key={section.id} id={section.id} className="scroll-mt-28">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 mb-3">
                            <span>{section.icon}</span>
                            {section.name}
                          </div>
                          <h3 className="text-3xl font-black text-gray-900 mb-2">{section.name}</h3>
                          <p className="text-gray-500 max-w-2xl">{section.description} Retrouvez les meilleures sélections et les meilleures offres de la catégorie.</p>
                        </div>
                        <Link
                          href={`/${section.id}`}
                          className="rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
                        >
                          Voir {section.name}
                        </Link>
                      </div>

                      {sectionProducts.length === 0 ? (
                        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-10 text-center text-slate-500">
                          Aucun produit trouvé pour cette catégorie.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                          {sectionProducts.map((product) => (
                            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Featured brands */}
        {!loading && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Nos Marques Partenaires</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {["Anker", "Baseus", "UGREEN", "Samsung", "Xiaomi", "Apple", "Huawei", "Sony"].map((brand) => (
                <div key={brand} className="bg-white border border-gray-200 rounded-xl px-6 py-4 text-sm font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all cursor-pointer">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {!loading && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">Ce que disent nos clients</h2>
            <p className="text-gray-400 text-center mb-8">Plus de 2 000 clients satisfaits</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: "Konan A.", city: "Abidjan", text: "Livraison très rapide, produit identique à la description. Je recommande vivement !", rating: 5 },
                { name: "Fatou D.", city: "Bouaké", text: "Mon power bank fonctionne parfaitement depuis 6 mois. Excellent rapport qualité-prix.", rating: 5 },
                { name: "Serge K.", city: "San-Pédro", text: "Le service client est super réactif. J'ai été remboursé rapidement. Merci Debymarket!", rating: 4 },
              ].map((review) => (
                <div key={review.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
                      <p className="text-gray-400 text-xs">{review.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${s <= review.rating ? "star-filled" : "star-empty"}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8">
        {/* Newsletter */}
        <div className="bg-indigo-600 py-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">📧 Abonnez-vous à nos offres exclusives</h3>
              <p className="text-indigo-100 text-sm mt-1">Recevez les meilleures promotions directement dans votre boîte mail</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="email" placeholder="votre@email.com" className="flex-1 md:w-72 bg-white text-gray-800 px-4 py-3 rounded-xl text-sm outline-none" />
              <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white">D</div>
              <span className="font-black text-lg">Debymarket</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Votre marché de confiance pour les produits électroniques en Côte d'Ivoire.</p>
            <div className="flex gap-3">
              {["f", "in", "tw", "yt"].map((social) => (
                <a key={social} href="#" className="w-8 h-8 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Boutique", links: ["Nouveautés", "Meilleures ventes", "Promotions", "Toutes les catégories"] },
            { title: "Service client", links: ["Suivre ma commande", "Retours & remboursements", "FAQ", "Contactez-nous"] },
            { title: "Informations", links: ["À propos de nous", "Mentions légales", "Politique de confidentialité", "Conditions d'utilisation"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-400">
            <p>© 2026 Debymarket. Tous droits réservés.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-gray-800 px-3 py-1 rounded-full">Orange Money</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">MTN MoMo</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">Moov Money</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">CinetPay</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium toast flex items-center gap-3 z-50 max-w-sm">
          {toast}
          <button onClick={() => setToast("")} className="text-gray-400 hover:text-white ml-2">✕</button>
        </div>
      )}
    </div>
  );
}