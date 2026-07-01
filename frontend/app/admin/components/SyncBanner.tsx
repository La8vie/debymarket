// app/admin/components/SyncBanner.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useSyncStore, useProductStore } from '@/lib/store/useProductStore'

export default function SyncBanner() {
  const { isOnline, isSyncing, total, done } = useSyncStore()
  const { pendingCount, refreshPendingCount } = useProductStore()
  const prevOnline = useRef(isOnline)

  useEffect(() => {
    refreshPendingCount()
  }, [isSyncing, refreshPendingCount])

  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  if (isOnline && pendingCount === 0 && !isSyncing) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mx-4 mt-4 rounded-xl border px-4 py-3 text-sm ${
        !isOnline
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : isSyncing
          ? 'bg-blue-50 border-blue-200 text-blue-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg" aria-hidden="true">
          {!isOnline ? '📴' : isSyncing ? '🔄' : '⏳'}
        </span>
        <div className="flex-1">
          {!isOnline && (
            <p>
              <strong>Hors ligne</strong>
              {pendingCount > 0 && ` — ${pendingCount} produit${pendingCount > 1 ? 's' : ''} en attente de synchronisation`}
            </p>
          )}
          {isOnline && isSyncing && (
            <p>
              Synchronisation en cours… ({done}/{total})
            </p>
          )}
          {isOnline && !isSyncing && pendingCount > 0 && (
            <p>
              {pendingCount} produit{pendingCount > 1 ? 's' : ''} non synchronisé{pendingCount > 1 ? 's' : ''}
            </p>
          )}

          {isSyncing && (
            <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-green-600' : 'text-amber-700'}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          {isOnline ? 'Connecté' : 'Hors ligne'}
        </div>
      </div>
    </div>
  )
}
