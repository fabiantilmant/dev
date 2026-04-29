// src/pages/LoginPage.jsx
import { useState } from 'react'
import { signIn, signUp } from '../lib/supabase'

export default function LoginPage() {
  const [mode, setMode]       = useState('login') // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await signIn(email, password)
      else await signUp(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-cream">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-terra rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🛍️</div>
        <h1 className="font-serif text-3xl text-brown font-bold">Votre Boutique</h1>
        <p className="text-brown-light text-sm mt-2">Vos publications Facebook, en toute simplicité</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-terra-light">
        <h2 className="font-serif text-xl text-brown font-bold mb-6">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-brown-light uppercase tracking-wide block mb-1.5">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@boutique.fr"
              required
              className="w-full px-3 py-2.5 border border-terra-light rounded-xl text-sm text-brown outline-none focus:border-terra transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brown-light uppercase tracking-wide block mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-3 py-2.5 border border-terra-light rounded-xl text-sm text-brown outline-none focus:border-terra transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terra text-white font-semibold py-3 rounded-xl text-sm mt-2 disabled:opacity-60 transition-all active:scale-95"
          >
            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-xs text-brown-light mt-5">
          {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-terra font-semibold"
          >
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}
