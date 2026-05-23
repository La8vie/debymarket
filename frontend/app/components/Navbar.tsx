"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="bg-blue-700 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden">
            <img src="/logo.png" alt="Debymarket" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white tracking-tight">Debymarket</span>
            <span className="text-xs text-white/70 uppercase tracking-[0.2em]">Marché</span>
          </div>
        </Link>

        <Link
          href="/cart"
          className="relative bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-full transition-colors font-semibold"
        >
          Mon Panier
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
