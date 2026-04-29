// src/pages/LoginPage.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleFacebookLogin() {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          scopes: 'pages_manage_posts,pages_read_engagement,pages_show_list,pages_read_user_content',
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-cream">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-terra rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg">🛍️</div>
        <h1 className="font-serif text-3xl text-brown font-bold">Votre Boutique</h1>
        <p className="text-brown-light text-sm mt-2 leading-relaxed">
          Créez de belles publications Facebook<br/>pour votre boutique, en quelques secondes
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-terra-light">
        <h2 className="font-serif text-xl text-brown font-bold mb-2">Commencer</h2>
        <p className="text-brown-light text-xs mb-6 leading-relaxed">
          Connectez-vous avec Facebook pour accéder à vos photos de Page et publier directement depuis l'app.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full bg-[#1877F2] hover:bg-[#1464D0] text-white font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-3 disabled:opacity-60 transition-all active:scale-95"
        >
          <div className="w-5 h-5 bg-white rounded flex items-center justify-center font-serif text-[#1877F2] font-bold text-sm">f</div>
          {loading ? 'Redirection vers Facebook…' : 'Continuer avec Facebook'}
        </button>

        <p className="text-center text-[10px] text-brown-light mt-5 leading-relaxed px-2">
          En vous connectant, vous autorisez l'app à accéder à vos Pages Facebook pour publier en votre nom.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 px-2">
        {[
          ['🔒', 'Vos données restent privées'],
          ['📱', 'Fonctionne sur mobile et desktop'],
          ['🤖', "Publications rédigées par l'IA en français"],
        ].map(([icon, text]) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <span className="text-xs text-brown-light">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}