"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Mon Panier</h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg mb-4">Votre panier est vide.</p>
            <Link href="/" className="text-blue-600 hover:underline font-semibold">
              ← Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b py-4 last:border-b-0"
              >
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-500">Quantité: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-lg text-green-600">{item.price * item.quantity} XOF</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t-2 border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-800">Total :</span>
                <span className="text-3xl font-bold text-green-600">{cartTotal} XOF</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={clearCart}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Vider le panier
                </button>
                <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg">
                  Payer avec Mobile Money 💳
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}