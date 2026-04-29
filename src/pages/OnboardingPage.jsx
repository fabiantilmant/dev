// src/pages/OnboardingPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createShop } from '../lib/supabase'
import { useApp } from '../App'

const VOICES = [
  { value: 'Chaleureux & de quartier', emoji: '🤝' },
  { value: 'Enjoué & spontané',        emoji: '😄' },
  { value: 'Raffiné & artisanal',      emoji: '✨' },
]

export default function OnboardingPage() {
  const { user, setShop } = useApp()
  const navigate = useNavigate()
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm]     = useState({
    name: '', address: '', hours: '',
    brand_voice: 'Chaleureux & de quartier',
    hashtags: '#BoutiqueLocale'
  })

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleFinish() {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)
    try {
      const shop = await createShop(user.id, form)
      setShop(shop)
      navigate('/create')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <div className="bg-terra px-6 pt-12 pb-8">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-4 border border-white/25">🛍️</div>
        <h1 className="font-serif text-2xl text-white font-bold">Bienvenue !</h1>
        <p className="text-white/70 text-sm mt-1">Configurons votre boutique en 2 étapes</p>
        {/* Progress */}
        <div className="flex gap-2 mt-5">
          {[1,2].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/25'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        {step === 1 && (
          <>
            <h2 className="font-serif text-xl text-brown font-bold">Votre boutique</h2>

            <Field label="Nom de la boutique *">
              <input value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="ex : La Ruche Dorée" className={inputCls} />
            </Field>

            <Field label="Adresse">
              <input value={form.address} onChange={e => update('address', e.target.value)}
                placeholder="ex : 12 rue du Marché, Bruxelles" className={inputCls} />
            </Field>

            <Field label="Horaires">
              <input value={form.hours} onChange={e => update('hours', e.target.value)}
                placeholder="ex : Lun–Sam 9h–18h, Dim 10h–17h" className={inputCls} />
            </Field>

            <Field label="Vos hashtags habituels">
              <input value={form.hashtags} onChange={e => update('hashtags', e.target.value)}
                placeholder="#BoutiqueLocale #VotreBoutique" className={inputCls} />
            </Field>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button onClick={() => { if (!form.name.trim()) { setError('Le nom est requis'); return; } setError(''); setStep(2) }}
              className="w-full bg-terra text-white font-semibold py-3.5 rounded-xl mt-auto active:scale-95 transition-all">
              Continuer →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-serif text-xl text-brown font-bold">Quel est votre ton ?</h2>
            <p className="text-brown-light text-sm -mt-2">L'IA adaptera les publications à votre style.</p>

            <div className="flex flex-col gap-3 mt-2">
              {VOICES.map(v => (
                <button key={v.value}
                  onClick={() => update('brand_voice', v.value)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl border-2 text-left transition-all ${
                    form.brand_voice === v.value
                      ? 'border-terra bg-terra-light'
                      : 'border-terra-light bg-white'
                  }`}>
                  <span className="text-2xl">{v.emoji}</span>
                  <span className={`font-semibold text-sm ${form.brand_voice === v.value ? 'text-terra-dark' : 'text-brown'}`}>
                    {v.value}
                  </span>
                  {form.brand_voice === v.value && (
                    <span className="ml-auto text-terra font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>

            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

            <div className="flex gap-3 mt-auto">
              <button onClick={() => setStep(1)}
                className="flex-1 bg-terra-light text-terra-dark font-semibold py-3.5 rounded-xl active:scale-95 transition-all">
                ← Retour
              </button>
              <button onClick={handleFinish} disabled={loading}
                className="flex-1 bg-terra text-white font-semibold py-3.5 rounded-xl disabled:opacity-60 active:scale-95 transition-all">
                {loading ? 'Création…' : "C'est parti ! 🎉"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 border border-terra-light rounded-xl text-sm text-brown outline-none focus:border-terra transition-colors bg-white"

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-brown-light uppercase tracking-wide block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
