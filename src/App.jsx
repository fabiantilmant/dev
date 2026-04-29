// src/App.jsx
// Point d'entrée principal — routing et contexte d'authentification

import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, getShop } from './lib/supabase'

// Pages
import LoginPage       from './pages/LoginPage'
import OnboardingPage  from './pages/OnboardingPage'
import CreatePostPage  from './pages/CreatePostPage'
import RepliesPage     from './pages/RepliesPage'
import ShopInfoPage    from './pages/ShopInfoPage'
import FbCallbackPage  from './pages/FbCallbackPage'

// --- Contexte global ---
const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [user, setUser]     = useState(undefined) // undefined = chargement
  const [shop, setShop]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Écoute les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const shopData = await getShop(currentUser.id)
          setShop(shopData)
        } else {
          setShop(null)
        }
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <LoadingScreen />

  const ctx = { user, shop, setShop }

  return (
    <AppContext.Provider value={ctx}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <LoginPage />
          } />
          <Route path="/auth/facebook/callback" element={<FbCallbackPage />} />

          {/* Protégées */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            !shop ? <Navigate to="/onboarding" /> :
            <Navigate to="/create" />
          } />
          <Route path="/onboarding" element={
            !user ? <Navigate to="/login" /> : <OnboardingPage />
          } />
          <Route path="/create"  element={<ProtectedPage><CreatePostPage /></ProtectedPage>} />
          <Route path="/replies" element={<ProtectedPage><RepliesPage /></ProtectedPage>} />
          <Route path="/shop"    element={<ProtectedPage><ShopInfoPage /></ProtectedPage>} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

function ProtectedPage({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" />
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#FBF6EF'
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #F0E8DF',
        borderTopColor: '#C4612C',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
