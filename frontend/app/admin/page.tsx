"use client";

import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Revenus du jour</h3>
          <p className="text-3xl font-bold text-gray-900">0 XOF</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Commandes</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Produits en ligne</h3>
          <p className="text-3xl font-bold text-indigo-600">Actifs</p>
        </div>
      </div>
    </div>
  );
}
