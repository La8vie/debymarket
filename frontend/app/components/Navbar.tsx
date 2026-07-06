"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Navbar() {
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });
      const user = await response.json();
      setIsLoggedIn(!!user);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-indigo-900 text-white text-xs py-2 text-center font-medium tracking-wide">
        🚚 Livraison gratuite dès 25 000 XOF &nbsp;|&nbsp; 📞 +225 07 00 00 00 &nbsp;|&nbsp; 🕒 Lun - Sam : 8h - 20h
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop row */}
          <div className="flex justify-between items-center py-3 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo.png" alt="Debymarket" className="h-12 w-12 rounded-xl object-contain shadow-lg" />
              <div className="hidden sm:block">
                <span className="text-xl font-black text-indigo-700 tracking-tight">Debymarket</span>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Marché en ligne</p>
              </div>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl hidden md:flex items-center bg-gray-100 rounded-xl overflow-hidden border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all">
              <select className="bg-transparent text-sm text-gray-500 px-3 py-3 border-r border-gray-300 outline-none cursor-pointer">
                <option>Tout</option>
                <option>Électronique</option>
                <option>Électroménager</option>
                <option>Mode</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2">
              {/* Account */}
              <Link href="/notifications" className="hidden sm:flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors px-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-xs mt-0.5">Alertes</span>
              </Link>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="hidden sm:flex items-center text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md border border-transparent hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  <span className="text-sm">Se déconnecter</span>
                </button>
              ) : (
                <Link href="/user" className="hidden sm:flex items-center text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md border border-transparent hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm">Se connecter</span>
                </Link>
              )}
              <Link href="/preferences" className="hidden sm:flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors px-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs mt-0.5">Compte</span>
              </Link>

              {/* Wishlist */}
              <Link href="#" className="hidden sm:flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors px-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs mt-0.5">Favoris</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors px-2">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold badge-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">Panier</span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Category navigation bar */}
          <div className="hidden md:flex items-center gap-6 pb-3 text-sm font-medium border-t border-gray-100 pt-2 overflow-x-auto">
            <Link href="/" className="text-indigo-600 border-b-2 border-indigo-600 pb-1 whitespace-nowrap">🏠 Accueil</Link>
            <Link href="/electronique" className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap">⚡ Électronique</Link>
            <Link href="/electromenager" className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap">🍳 Électroménager</Link>
            <Link href="/mode" className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap">👕 Mode</Link>
          </div>
        </div>

        {/* Mobile search + menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
            <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
              <input
                type="text"
                placeholder="Rechercher..."
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
              />
              <button className="bg-indigo-600 text-white px-4 py-2">🔍</button>
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link href="/" className="text-indigo-600 py-1">🏠 Accueil</Link>
              <Link href="/electronique" className="text-gray-600 py-1">⚡ Électronique</Link>
              <Link href="/electromenager" className="text-gray-600 py-1">🍳 Électroménager</Link>
              <Link href="/mode" className="text-gray-600 py-1">👕 Mode</Link>
              <Link href="/notifications" className="text-gray-600 py-1">🔔 Notifications</Link>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="text-left text-gray-600 py-1 hover:text-indigo-600">🔐 Se déconnecter</button>
              ) : (
                <Link href="/user" className="text-gray-600 py-1">🔐 Se connecter</Link>
              )}
              <Link href="/cart" className="text-gray-600 py-1">🛒 Mon Panier ({cartCount})</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
