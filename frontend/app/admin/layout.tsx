import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">Debymarket Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block py-2 px-4 rounded hover:bg-blue-800 transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/admin/products" className="block py-2 px-4 rounded hover:bg-blue-800 transition-colors">
            🛍️ Produits
          </Link>
          <Link href="/admin/orders" className="block py-2 px-4 rounded hover:bg-blue-800 transition-colors">
            📦 Commandes
          </Link>
          <Link href="/" className="block py-2 px-4 rounded bg-blue-800 mt-10 transition-colors">
            ← Retour à la boutique
          </Link>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
