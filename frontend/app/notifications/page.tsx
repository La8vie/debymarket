'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
};

export default function NotificationsPage() {
  const [userId, setUserId] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedId = window.localStorage.getItem('debymarket-user-id');
    if (storedId) {
      setUserId(storedId);
      loadNotifications(storedId);
    }
  }, []);

  const loadNotifications = async (id?: string) => {
    const currentUserId = id || userId;
    if (!currentUserId) {
      setMessage('Entrez votre ID utilisateur pour charger vos notifications.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.get(`${API_URL}/notifications/user/${currentUserId}`);
      setNotifications(Array.isArray(response.data) ? response.data : []);
      setMessage('Notifications chargées.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    setSaving(true);
    setMessage('');

    try {
      await axios.put(`${API_URL}/notifications/user/${userId}/read/${notificationId}`);
      await loadNotifications(userId);
      setMessage('Notification marquée comme lue.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Impossible de marquer la notification comme lue.');
    } finally {
      setSaving(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;
    setSaving(true);
    setMessage('');

    try {
      await axios.delete(`${API_URL}/notifications/user/${userId}/${notificationId}`);
      await loadNotifications(userId);
      setMessage('Notification supprimée.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Impossible de supprimer la notification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mes notifications</h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Consultez vos alertes promotionnelles et les messages importants liés à votre compte.
            </p>
          </div>
          <Link href="/preferences" className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Préférences de notification
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">ID utilisateur</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Entrez votre ID utilisateur"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => loadNotifications()}
            disabled={loading || !userId}
            className="h-fit rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Chargement...' : 'Charger'}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
            {message}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
            {loading ? 'Recherche de notifications...' : 'Aucune notification à afficher.'}
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-3xl border px-6 py-5 shadow-sm transition ${notification.isRead ? 'border-slate-200 bg-white' : 'border-indigo-300 bg-indigo-50'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-600 font-semibold">{notification.type || 'Promotion'}</p>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{notification.title}</h2>
                  </div>
                  <div className="text-sm text-slate-500">{new Date(notification.createdAt).toLocaleString('fr-FR')}</div>
                </div>
                <p className="mt-4 text-slate-700 whitespace-pre-line">{notification.message}</p>
                {notification.data && (
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-100 p-4 text-xs text-slate-600">{JSON.stringify(notification.data, null, 2)}</pre>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      disabled={saving}
                      className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                    disabled={saving}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
