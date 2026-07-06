'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type Preferences = {
  emailPromotions: boolean;
  emailOrderUpdates: boolean;
  smsPromotions: boolean;
  smsOrderUpdates: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'monthly';
};

export default function PreferencesPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    emailPromotions: true,
    emailOrderUpdates: true,
    smsPromotions: false,
    smsOrderUpdates: true,
    notificationFrequency: 'weekly',
  });

  useEffect(() => {
    const storedUserId = window.localStorage.getItem('debymarket-user-id');
    if (storedUserId) {
      setUserId(storedUserId);
      loadPreferences(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      window.localStorage.setItem('debymarket-user-id', userId);
    }
  }, [userId]);

  const loadPreferences = async (id?: string) => {
    const currentId = id || userId;
    if (!currentId) {
      setMessage('Entrez un ID utilisateur pour charger vos préférences.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.get(`${API_URL}/notifications/preferences/${currentId}`);
      if (response.data) {
        setPreferences({
          emailPromotions: response.data.emailPromotions ?? true,
          emailOrderUpdates: response.data.emailOrderUpdates ?? true,
          smsPromotions: response.data.smsPromotions ?? false,
          smsOrderUpdates: response.data.smsOrderUpdates ?? true,
          notificationFrequency: response.data.notificationFrequency ?? 'weekly',
        });
        setMessage('Préférences chargées.');
      } else {
        setMessage('Aucune préférence trouvée pour cet utilisateur.');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Impossible de charger les préférences.');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!userId) {
      setMessage('Entrez un ID utilisateur avant de sauvegarder.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await axios.put(`${API_URL}/notifications/preferences/${userId}`, preferences);
      setMessage('Préférences enregistrées avec succès.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Impossible de sauvegarder les préférences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Préférences de notification</h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Gérez les messages que vous recevez par email et SMS. Si vous n'êtes pas encore connecté,
              utilisez l'ID utilisateur créé lors de l'inscription.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Retour à l'accueil
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">ID utilisateur</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => loadPreferences()}
              disabled={loading || !userId}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Chargement...' : 'Charger'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Promotions par email</span>
            <select
              value={preferences.emailPromotions ? 'enabled' : 'disabled'}
              onChange={(e) => setPreferences((prev) => ({ ...prev, emailPromotions: e.target.value === 'enabled' }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="enabled">Activé</option>
              <option value="disabled">Désactivé</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Mises à jour de commande par email</span>
            <select
              value={preferences.emailOrderUpdates ? 'enabled' : 'disabled'}
              onChange={(e) => setPreferences((prev) => ({ ...prev, emailOrderUpdates: e.target.value === 'enabled' }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="enabled">Activé</option>
              <option value="disabled">Désactivé</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Promotions par SMS</span>
            <select
              value={preferences.smsPromotions ? 'enabled' : 'disabled'}
              onChange={(e) => setPreferences((prev) => ({ ...prev, smsPromotions: e.target.value === 'enabled' }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="enabled">Activé</option>
              <option value="disabled">Désactivé</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Alertes commande par SMS</span>
            <select
              value={preferences.smsOrderUpdates ? 'enabled' : 'disabled'}
              onChange={(e) => setPreferences((prev) => ({ ...prev, smsOrderUpdates: e.target.value === 'enabled' }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="enabled">Activé</option>
              <option value="disabled">Désactivé</option>
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Fréquence des notifications</span>
            <select
              value={preferences.notificationFrequency}
              onChange={(e) => setPreferences((prev) => ({ ...prev, notificationFrequency: e.target.value as Preferences['notificationFrequency'] }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={savePreferences}
            disabled={saving || !userId}
            className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </button>
          <button
            type="button"
            onClick={() => loadPreferences()}
            disabled={loading || !userId}
            className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {loading ? 'Chargement...' : 'Rafraîchir'}
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
