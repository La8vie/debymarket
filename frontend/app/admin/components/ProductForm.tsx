// app/admin/components/ProductForm.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { useProductStore, useSyncStore } from '@/lib/store/useProductStore'

// ─── Schéma de validation Zod ────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, 'Le nom est obligatoire (min 2 caractères)'),
  description: z.string().optional(),
  category: z.enum(['elec', 'appli', 'mode'], { required_error: 'Choisissez une catégorie' }),
  subcategory: z.string().min(1, 'Choisissez une sous-catégorie'),
  price: z.coerce.number().positive('Le prix doit être positif'),
  promoPrice: z.coerce.number().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0, 'Le stock ne peut pas être négatif'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageSource: z.enum(['upload', 'url']).default('upload')
})

// ─── Données de catégories ───────────────────────────────────────────────────
const CATEGORIES = {
  elec: {
    label: 'Électronique',
    subs: ['Smartphones', 'Tablettes', 'Ordinateurs', 'Audio', 'TV & Vidéo', 'Accessoires']
  },
  appli: {
    label: 'Électroménager',
    subs: ['Cuisine', 'Réfrigération', 'Lavage', 'Climatisation', 'Petit électroménager']
  },
  mode: {
    label: 'Mode',
    subs: ['Femme', 'Homme', 'Enfant', 'Chaussures', 'Sacs & Accessoires']
  }
}

interface ProductFormProps {
  product?: any
  onSuccess?: () => void
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { addProduct, updateProduct } = useProductStore()
  const { isOnline } = useSyncStore()
  const isEditing = !!product

  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null)
  const [imageTab, setImageTab] = useState('upload')
  const [chars, setChars] = useState(
    product?.characteristics
      ? Object.entries(product.characteristics).map(([k, v]: [string, any]) => ({ key: k, value: v }))
      : [{ key: '', value: '' }]
  )
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          promoPrice: product.promoPrice ?? '',
          stock: product.stock,
          imageUrl: product.imageUrl ?? ''
        }
      : { promoPrice: '', imageUrl: '' }
  })

  const selectedCategory = watch('category')

  // ─── Dropzone ─────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Upload Cloudinary
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || '')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      setValue('imageUrl', data.secure_url)
      setImagePreview(data.secure_url)
    } catch (err) {
      console.error('Upload Cloudinary failed:', err)
      setValue('imageUrl', previewUrl)
    }
  }, [setValue])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  })

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      const characteristics = chars.reduce((acc: Record<string, string>, { key, value }: any) => {
        if (key.trim()) acc[key.trim()] = value.trim()
        return acc
      }, {})

      const payload = {
        ...data,
        promoPrice: data.promoPrice === '' ? null : Number(data.promoPrice),
        imageUrl: imagePreview || data.imageUrl || null,
        characteristics
      }

      if (isEditing) {
        await updateProduct(product.localId, payload)
      } else {
        await addProduct(payload)
      }

      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  const addChar = () => setChars(c => [...c, { key: '', value: '' }])
  const removeChar = (i: number) => setChars(c => c.filter((_, idx) => idx !== i))
  const updateChar = (i: number, field: string, val: string) =>
    setChars(c => c.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <span>⚡</span>
          <span>Mode hors ligne — le produit sera sauvegardé localement et synchronisé à la reconnexion.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 space-y-4">

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-4">
              Informations générales
            </h3>

            <div className="space-y-3">
              <Field label="Nom du produit *" error={errors.name?.message as string}>
                <input
                  {...register('name')}
                  placeholder="Ex : iPhone 15 Pro 256Go"
                  className={input(errors.name)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Catégorie principale *" error={errors.category?.message as string}>
                  <select {...register('category')} className={input(errors.category)}>
                    <option value="">-- Choisir --</option>
                    {Object.entries(CATEGORIES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Sous-catégorie *" error={errors.subcategory?.message as string}>
                  <select
                    {...register('subcategory')}
                    disabled={!selectedCategory}
                    className={input(errors.subcategory)}
                  >
                    <option value="">
                      {selectedCategory ? '-- Choisir --' : '-- Catégorie d\'abord --'}
                    </option>
                    {selectedCategory && CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.subs.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Décrivez le produit..."
                  className={input()}
                />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-4">
              Prix & stock
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Prix (FCFA) *" error={errors.price?.message as string}>
                <input
                  {...register('price')}
                  type="number"
                  min="0"
                  placeholder="0"
                  className={input(errors.price)}
                />
              </Field>
              <Field label="Prix promo (optionnel)" error={errors.promoPrice?.message as string}>
                <input
                  {...register('promoPrice')}
                  type="number"
                  min="0"
                  placeholder="0"
                  className={input(errors.promoPrice)}
                />
              </Field>
              <Field label="Stock *" error={errors.stock?.message as string}>
                <input
                  {...register('stock')}
                  type="number"
                  min="0"
                  placeholder="0"
                  className={input(errors.stock)}
                />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide">
                Caractéristiques techniques
              </h3>
              <button type="button" onClick={addChar} className="btn-secondary text-xs">
                + Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {chars.map((char, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={char.key}
                    onChange={e => updateChar(i, 'key', e.target.value)}
                    placeholder="Clé (ex: Couleur)"
                    className={`${input()} flex-none w-36`}
                  />
                  <input
                    value={char.value}
                    onChange={e => updateChar(i, 'value', e.target.value)}
                    placeholder="Valeur (ex: Noir)"
                    className={`${input()} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeChar(i)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 flex-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-3">
              Image du produit
            </h3>

            <div className="flex gap-2 mb-3">
              {['upload', 'url'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setImageTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    imageTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'upload' ? '⬆ Upload' : '🔗 URL'}
                </button>
              ))}
            </div>

            {imageTab === 'upload' && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-2xl mb-2">📷</div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragActive ? 'Déposez ici' : 'Glisser ou cliquer'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG — max 5MB</p>
              </div>
            )}

            {imageTab === 'url' && (
              <Field error={errors.imageUrl?.message as string}>
                <input
                  {...register('imageUrl')}
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  className={input(errors.imageUrl)}
                  onChange={e => {
                    register('imageUrl').onChange(e)
                    if (e.target.value.startsWith('http')) setImagePreview(e.target.value)
                  }}
                />
              </Field>
            )}

            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Aperçu produit"
                  className="w-full aspect-video object-cover rounded-lg border border-gray-100"
                  onError={() => setImagePreview(null)}
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setValue('imageUrl', '') }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className={`flex items-center gap-2 text-xs ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
              {isOnline ? 'Sauvegarde directe (connecté)' : 'Sauvegarde locale (hors ligne)'}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Enregistrer le produit'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

function Field({ label, error, children }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function input(error?: any) {
  return `w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none ${
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
  } bg-white text-gray-900 placeholder-gray-400`
}
