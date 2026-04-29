// src/pages/FbCallbackPage.jsx
// Cette page reçoit le code OAuth de Facebook après la connexion

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateShop } from '../lib/supabase'
import { validateOAuthState } from '../lib/facebook'
import { useApp } from '../App'

export default function FbCallbackPage() {
  const { shop, setShop } = useApp()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Connexion à Facebook en cours…')
  const [error, setError]   = useState('')

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code  = params.get('code')
      const state = params.get('state')
      const err   = params.get('error')

      if (err) { setError('Connexion Facebook annulée.'); return }
      if (!code) { setError('Code OAuth manquant.'); return }
      if (!validateOAuthState(state)) { setError('Erreur de sécurité. Réessayez.'); return }

      try {
        setStatus('Échange du code contre un token…')
        // Appel à votre Vercel Function qui échange le code côté serveur
        const res = await fetch('/api/auth/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        if (!res.ok) throw new Error('Erreur serveur lors de l\'échange du token')
        const { pageId, pageName, pageAccessToken } = await res.json()

        setStatus('Connexion de votre Page…')
        const updated = await updateShop(shop.id, {
          fb_page_id: pageId,
          fb_page_name: pageName,
          fb_page_access_token: pageAccessToken,
          fb_connected_at: new Date().toISOString()
        })
        setShop(updated)
        setStatus('Connecté ! Redirection…')
        setTimeout(() => navigate('/shop'), 1000)
      } catch (err) {
        setError(err.message)
      }
    }

    if (shop) handleCallback()
  }, [shop])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 gap-4">
      <div className="w-14 h-14 bg-[#1877F2] rounded-2xl flex items-center justify-center font-serif text-white text-3xl font-bold">f</div>

      {error ? (
        <>
          <p className="text-red-600 text-sm text-center">{error}</p>
          <button onClick={() => navigate('/shop')} className="bg-terra text-white font-semibold px-6 py-3 rounded-xl text-sm active:scale-95 transition-all">
            Retour à Ma boutique
          </button>
        </>
      ) : (
        <>
          <div style={{width:32,height:32,border:'3px solid #E8F0FE',borderTopColor:'#1877F2',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
          <p className="text-brown-light text-sm text-center">{status}</p>
        </>
      )}
    </div>
  )
}
