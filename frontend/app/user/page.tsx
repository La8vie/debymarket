"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type RegisterStep = "register" | "verify-email" | "verify-phone" | "success";

export default function UserPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [redirectTo, setRedirectTo] = useState("/admin/dashboard");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerStep, setRegisterStep] = useState<RegisterStep>("register");
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [emailToken, setEmailToken] = useState("");
  const [phoneToken, setPhoneToken] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get("redirectTo");
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      }, {
        withCredentials: true,
      });
      const user = res.data?.user;
      if (!user) throw new Error("Aucune donnée utilisateur reçue");
      
      router.push(redirectTo);
    } catch (err: any) {
      setLoginError(err.response?.data?.message || err.message || "Erreur lors de la connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }
      if (registerData.password.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }

      const res = await axios.post(`${API_URL}/auth/register`, {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });

      // Si des tokens de développement sont retournés, les pré-remplir
      if (res.data?.devTokens) {
        setEmailToken(res.data.devTokens.email);
        setPhoneToken(res.data.devTokens.phone);
        console.log("Tokens de développement:", res.data.devTokens);
      }

      setRegisterStep("verify-email");
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || err.message || "Erreur lors de l'inscription");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      await axios.post(`${API_URL}/auth/verify-email`, { token: emailToken });
      setRegisterStep("verify-phone");
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || "Erreur lors de la vérification");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      await axios.post(`${API_URL}/auth/verify-phone`, { token: phoneToken });
      setRegisterStep("success");
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || "Erreur lors de la vérification");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[380px_minmax(0,1fr)]">
        <div className="bg-indigo-700 text-white p-10 flex flex-col justify-between">
          <div>
            <img src="/logo.png" alt="Debymarket" className="h-14 w-14 rounded-2xl mb-8 object-contain bg-white/10 p-2" />
            <h1 className="text-3xl font-black mb-4">Bienvenue chez Debymarket</h1>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Gère ton compte, commande en toute sécurité et commence à vendre rapidement.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-200 mb-3">Pourquoi Debymarket ?</p>
              <ul className="space-y-3 text-sm text-indigo-100">
                <li>✓ Paiement sécurisé</li>
                <li>✓ Support réel 7j/7</li>
                <li>✓ Interface simple et fluide</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-200 mb-3">Déjà membre ?</p>
              <p className="text-sm text-indigo-100">Choisis la connexion pour accéder à ton espace et retrouver tes commandes.</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 rounded-full py-3 text-sm font-semibold transition ${tab === "login" ? "bg-indigo-600 text-white shadow-xl" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Connexion
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 rounded-full py-3 text-sm font-semibold transition ${tab === "register" ? "bg-indigo-600 text-white shadow-xl" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Inscription
            </button>
          </div>

          {tab === "login" ? (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Se connecter</h2>
              <p className="text-sm text-slate-500 mb-6">Accède à ton espace client en quelques secondes.</p>
              {loginError && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</div>}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                  <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">Créer un compte</Link>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loginLoading ? "Connexion..." : "Se connecter"}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h2>
              <p className="text-sm text-slate-500 mb-6">Inscris-toi et profite de toutes les fonctionnalités du site.</p>

              {registerStep === "register" && (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterInput}
                        required
                        className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterInput}
                        required
                        className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterInput}
                      required
                      className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterInput}
                      placeholder="+226 9000 0000"
                      required
                      className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
                      <input
                        type="password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterInput}
                        required
                        className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirmer</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterInput}
                        required
                        className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>

                  {registerError && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{registerError}</div>}

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {registerLoading ? "Inscription..." : "S'inscrire"}
                  </button>
                  <p className="text-sm text-slate-500 text-center">
                    Tu as déjà un compte ?{' '}
                    <button type="button" onClick={() => setTab("login")} className="font-semibold text-indigo-600 hover:text-indigo-700">
                      Connexion
                    </button>
                  </p>
                </form>
              )}

              {registerStep === "verify-email" && (
                <form onSubmit={handleVerifyEmail} className="space-y-5">
                  <div>
                    <p className="text-sm text-slate-600">Un code a été envoyé à <strong>{registerData.email}</strong>.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Code email</label>
                    <input
                      type="text"
                      value={emailToken}
                      onChange={(e) => setEmailToken(e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  {registerError && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{registerError}</div>}
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {registerLoading ? "Vérification..." : "Vérifier l'email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailToken('dev-bypass')}
                    className="w-full rounded-3xl bg-slate-200 px-5 py-3 text-slate-700 font-semibold transition hover:bg-slate-300 text-sm"
                  >
                    Mode Développement: Bypass
                  </button>
                </form>
              )}

              {registerStep === "verify-phone" && (
                <form onSubmit={handleVerifyPhone} className="space-y-5">
                  <div>
                    <p className="text-sm text-slate-600">Un code SMS a été envoyé à <strong>{registerData.phone}</strong>.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Code SMS</label>
                    <input
                      type="text"
                      value={phoneToken}
                      onChange={(e) => setPhoneToken(e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  {registerError && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{registerError}</div>}
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {registerLoading ? "Vérification..." : "Vérifier le téléphone"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneToken('dev-bypass')}
                    className="w-full rounded-3xl bg-slate-200 px-5 py-3 text-slate-700 font-semibold transition hover:bg-slate-300 text-sm"
                  >
                    Mode Développement: Bypass
                  </button>
                </form>
              )}

              {registerStep === "success" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">✓</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Inscription réussie</h3>
                    <p className="text-sm text-slate-500">Ton compte est prêt. Tu peux maintenant te connecter.</p>
                  </div>
                  <button
                    onClick={() => {
                      setTab("login");
                      setRegisterStep("register");
                    }}
                    className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                  >
                    Aller à la connexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
