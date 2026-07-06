"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal, clearCart, addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const LIVRAISON = 2000;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-TEST-001",
          amount: cartTotal + LIVRAISON,
          customerName: "Client Debymarket",
        }),
      });
      const data = await response.json();
      if (data.payment_url) {
        // Validate URL to prevent open redirect vulnerability
        const allowedDomains = [
          'https://pay.ci',
          'https://orange.ci',
          'https://mtn.ci',
          'https://moov.africa',
          'https://wave.com',
          'http://localhost'
        ];
        
        if (allowedDomains.some(domain => data.payment_url.startsWith(domain))) {
          window.location.href = data.payment_url;
        } else {
          console.error("Redirection bloquée : URL non autorisée");
          alert("URL de paiement non autorisée");
        }
      } else {
        alert("Erreur lors de la génération du lien de paiement");
      }
    } catch {
      alert("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-black text-gray-800">Mon Panier</h1>
          {cartItems.length > 0 && (
            <span className="bg-indigo-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
              {cartItems.reduce((a, i) => a + i.quantity, 0)} article{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          /* Empty cart */
          <div className="text-center bg-white py-24 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-7xl mb-5">🛒</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Votre panier est vide</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Vous n'avez encore rien ajouté à votre panier. Découvrez nos produits !</p>
            <Link href="/" className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors inline-block">
              Continuer mes achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={`https://placehold.co/80x80/e2e8f0/4f46e5?text=${encodeURIComponent(item.name[0])}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Livraison estimée : 24-48h</p>
                    <p className="text-xs text-green-600 font-medium mt-1">✅ En stock</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : addToCart({ id: item.id, name: item.name, price: item.price })}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-sm"
                    >
                      {item.quantity <= 1 ? "🗑" : "−"}
                    </button>
                    <span className="px-3 font-bold text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Price + Remove */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-800">{(item.price * item.quantity).toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-gray-400">XOF</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs mt-1 transition-colors"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}

              {/* Promo code */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">🎁 Code promo</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Entrez votre code..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                  <button className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Appliquer
                  </button>
                </div>
              </div>

              {/* Continue shopping */}
              <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continuer mes achats
              </Link>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-32">
                <h3 className="font-bold text-gray-800 mb-5 text-lg">Récapitulatif</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total ({cartItems.reduce((a, i) => a + i.quantity, 0)} article{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? "s" : ""})</span>
                    <span className="font-medium">{cartTotal.toLocaleString("fr-FR")} XOF</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="font-medium text-orange-500">{LIVRAISON.toLocaleString("fr-FR")} XOF</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Remise code promo</span>
                    <span>- 0 XOF</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between font-black text-gray-900 text-base">
                      <span>Total à payer</span>
                      <span>{(cartTotal + LIVRAISON).toLocaleString("fr-FR")} XOF</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">TVA incluse</p>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="mt-5 mb-4">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Modes de paiement acceptés :</p>
                  <div className="flex flex-wrap gap-2">
                    {["Orange Money", "MTN", "Moov", "Wave"].map((m) => (
                      <span key={m} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg font-medium">{m}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-black text-base transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Redirection...
                    </>
                  ) : (
                    <>
                      💳 Payer avec Mobile Money
                    </>
                  )}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-2 text-gray-400 hover:text-red-500 py-2 text-xs font-medium transition-colors"
                >
                  🗑 Vider le panier
                </button>

                {/* Trust indicators */}
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                  {["🔒 Paiement 100% sécurisé", "↩️ Retour gratuit sous 7 jours", "🚚 Livraison rapide 24-48h"].map((text) => (
                    <p key={text} className="text-xs text-gray-500 flex items-center gap-1">{text}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}