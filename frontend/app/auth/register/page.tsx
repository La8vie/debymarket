// app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api/client'

const STEPS = {
  FORM: 'form',
  OTP_EMAIL: 'otp_email',
  OTP_PHONE: 'otp_phone',
  SUCCESS: 'success'
}

const registerSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide (ex: +2250701234567)'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  confirmPassword: z.string(),
  consentMarketing: z.boolean().optional()
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(STEPS.FORM)
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const onRegister = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        consent_marketing: !!data.consentMarketing
      })
      setFormData(data)
      setStep(STEPS.OTP_EMAIL)
      startResendTimer()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const onVerifyEmail = async () => {
    if (emailOtp.length !== 6) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-email', {
        email: formData.email,
        code: emailOtp
      })
      setEmailVerified(true)
      setStep(STEPS.OTP_PHONE)
      startResendTimer()
    } catch (e: any) {
      setError('Code incorrect ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const onVerifyPhone = async () => {
    if (phoneOtp.length !== 6) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-phone', {
        phone: formData.phone,
        code: phoneOtp
      })
      setStep(STEPS.SUCCESS)
    } catch (e: any) {
      setError('Code SMS incorrect ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const t = setInterval(() => {
      setResendTimer(n => {
        if (n <= 1) { clearInterval(t); return 0 }
        return n - 1
      })
    }, 1000)
  }

  const resendCode = async (type: 'email' | 'phone') => {
    if (resendTimer > 0) return
    try {
      await api.post('/auth/resend-code', {
        type,
        email: formData?.email,
        phone: formData?.phone
      })
      startResendTimer()
    } catch (e: any) {
      setError('Erreur lors du renvoi')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">MonShop CI</h1>
          <p className="text-gray-500 text-sm mt-1">Créez votre compte</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {['Informations', 'Email', 'Téléphone'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                i < [STEPS.FORM, STEPS.OTP_EMAIL, STEPS.OTP_PHONE].indexOf(step)
                  ? 'bg-green-500 text-white'
                  : i === [STEPS.FORM, STEPS.OTP_EMAIL, STEPS.OTP_PHONE].indexOf(step)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {i < [STEPS.FORM, STEPS.OTP_EMAIL, STEPS.OTP_PHONE].indexOf(step) ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${i < [STEPS.FORM, STEPS.OTP_EMAIL, STEPS.OTP_PHONE].indexOf(step) ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

          {step === STEPS.FORM && (
            <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <AuthField label="Prénom" error={errors.firstName?.message as string}>
                  <input {...register('firstName')} placeholder="Koné" className={authInput(errors.firstName)} />
                </AuthField>
                <AuthField label="Nom" error={errors.lastName?.message as string}>
                  <input {...register('lastName')} placeholder="Mamadou" className={authInput(errors.lastName)} />
                </AuthField>
              </div>
              <AuthField label="Email *" error={errors.email?.message as string}>
                <input {...register('email')} type="email" placeholder="vous@email.com" className={authInput(errors.email)} />
              </AuthField>
              <AuthField label="Numéro de téléphone *" error={errors.phone?.message as string}>
                <input {...register('phone')} type="tel" placeholder="+2250701234567" className={authInput(errors.phone)} />
                <p className="text-xs text-gray-400 mt-1">Format international requis pour recevoir le SMS</p>
              </AuthField>
              <AuthField label="Mot de passe *" error={errors.password?.message as string}>
                <input {...register('password')} type="password" placeholder="8 caractères minimum" className={authInput(errors.password)} />
              </AuthField>
              <AuthField label="Confirmer le mot de passe *" error={errors.confirmPassword?.message as string}>
                <input {...register('confirmPassword')} type="password" placeholder="Répétez le mot de passe" className={authInput(errors.confirmPassword)} />
              </AuthField>

              <label className="flex items-start gap-3 cursor-pointer">
                <input {...register('consentMarketing')} type="checkbox" className="mt-0.5 rounded" />
                <span className="text-xs text-gray-500">
                  J'accepte de recevoir des emails sur les nouvelles arrivées et promotions.
                  Je peux me désabonner à tout moment.
                </span>
              </label>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Envoi en cours...' : 'Créer mon compte'}
              </button>
            </form>
          )}

          {step === STEPS.OTP_EMAIL && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-2">📧</div>
              <h2 className="font-medium text-gray-900">Vérifiez votre email</h2>
              <p className="text-sm text-gray-500">
                Un code à 6 chiffres a été envoyé à <strong>{formData?.email}</strong>
              </p>
              <OtpInput value={emailOtp} onChange={setEmailOtp} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={onVerifyEmail}
                disabled={loading || emailOtp.length !== 6}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Vérification...' : 'Valider le code'}
              </button>
              <button
                onClick={() => resendCode('email')}
                disabled={resendTimer > 0}
                className="text-sm text-indigo-600 disabled:text-gray-400"
              >
                {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code'}
              </button>
            </div>
          )}

          {step === STEPS.OTP_PHONE && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-2">📱</div>
              <h2 className="font-medium text-gray-900">Vérifiez votre téléphone</h2>
              <p className="text-sm text-gray-500">
                Un SMS a été envoyé au <strong>{formData?.phone}</strong>
              </p>
              <OtpInput value={phoneOtp} onChange={setPhoneOtp} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={onVerifyPhone}
                disabled={loading || phoneOtp.length !== 6}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Vérification...' : 'Valider le SMS'}
              </button>
              <button
                onClick={() => resendCode('phone')}
                disabled={resendTimer > 0}
                className="text-sm text-indigo-600 disabled:text-gray-400"
              >
                {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le SMS'}
              </button>
            </div>
          )}

          {step === STEPS.SUCCESS && (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">🎉</div>
              <h2 className="font-semibold text-gray-900 text-lg">Compte activé !</h2>
              <p className="text-sm text-gray-500">Email et téléphone vérifiés. Votre compte est prêt.</p>
              <button
                onClick={() => router.push('/connexion')}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}
        </div>

        {step === STEPS.FORM && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Déjà un compte ?{' '}
            <Link href="/connexion" className="text-indigo-600 hover:underline">Se connecter</Link>
          </p>
        )}
      </div>
    </div>
  )
}

function OtpInput({ value, onChange }: any) {
  const digits = 6
  const chars = value.split('').concat(Array(digits).fill('')).slice(0, digits)

  const handleChange = (i: number, val: string) => {
    const newVal = value.split('')
    newVal[i] = val.slice(-1)
    const joined = newVal.join('').slice(0, digits)
    onChange(joined)
    if (val && i < digits - 1) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {chars.map((char, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={char}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-14 text-center text-xl font-semibold border-2 rounded-xl border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
        />
      ))}
    </div>
  )
}

function AuthField({ label, error, children }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function authInput(error?: any) {
  return `w-full px-3 py-2.5 text-sm rounded-xl border transition-colors outline-none ${
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
  } bg-white text-gray-900 placeholder-gray-400`
}
