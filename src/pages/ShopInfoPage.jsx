// src/pages/ShopInfoPage.jsx
import { useState } from 'react'
import { useApp } from '../App'
import { updateShop, signOut } from '../lib/supabase'
import { getFacebookLoginUrl } from '../lib/facebook'
import BottomNav from '../components/BottomNav'

export default function ShopInfoPage() {
  const { shop, setShop, user } = useApp()
  const [editing, setEditing] = useState(null) // field name
  const [value, setValue]     = useState('')
  const [saving, setSaving]   = useState(false)

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const updated = await updateShop(shop.id, { [editing]: value })
      setShop(updated)
      setEditing(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(field, current) {
    setEditing(field); setValue(current || '')
  }

  const fbConnected = !!shop?.fb_page_id

  return (
    <div className="flex flex-col h-full">
      {/* Header hero */}
      <div className="bg-terra px-5 pt-10 pb-5 flex-shrink-0 flex items-center gap-3">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/30">🛍️</div>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-xl text-white font-bold truncate">{shop?.name}</div>
          <div className="text-white/60 text-[10px] mt-0.5">{shop?.address || 'Adresse non renseignée'}</div>
        </div>
        <button onClick={() => startEdit('name', shop?.name)}
          className="bg-white/18 border border-white/30 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg">
          Modifier
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-2">
          {[['247','Abonnés'],['18','Publications'],['4.8★','Note']].map(([v,l]) => (
            <div key={l} className="bg-white rounded-xl border border-terra-light p-3 text-center" style={{animation:'fUp .25s ease both'}}>
              <div className="font-serif text-xl text-terra font-bold">{v}</div>
              <div className="text-[9px] text-brown-light mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Shop info */}
        <div className="px-4 py-2">
          <div className="text-[10px] font-semibold text-brown-light uppercase tracking-widest mb-2">Informations boutique</div>
          <div className="bg-white rounded-2xl border border-terra-light overflow-hidden">
            {[
              { field:'name',        icon:'🏪', label:'Nom',       value: shop?.name },
              { field:'address',     icon:'📍', label:'Adresse',   value: shop?.address },
              { field:'hours',       icon:'🕐', label:'Horaires',  value: shop?.hours },
              { field:'brand_voice', icon:'🎙️', label:'Ton',       value: shop?.brand_voice },
              { field:'hashtags',    icon:'#',  label:'Hashtags',  value: shop?.hashtags },
            ].map((row, i, arr) => (
              <div key={row.field} className={`flex items-center px-3.5 py-3 ${i < arr.length-1 ? 'border-b border-cream' : ''}`}>
                <span className="text-sm w-5 flex-shrink-0">{row.icon}</span>
                <span className="text-xs text-brown-light flex-1 ml-2">{row.label}</span>
                <span className="text-xs text-brown font-medium text-right max-w-[140px] truncate mr-2">{row.value || '—'}</span>
                <button onClick={() => startEdit(row.field, row.value)}
                  className="text-[10px] text-terra font-semibold flex-shrink-0">Modifier</button>
              </div>
            ))}
          </div>
        </div>

        {/* Facebook connect */}
        <div className="px-4 py-2 pb-4">
          <div className={`rounded-2xl p-3.5 flex items-center gap-3 ${fbConnected ? 'bg-blue-50' : 'bg-blue-50'}`}>
            <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center font-serif text-white text-xl font-bold flex-shrink-0">f</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#0C447C]">
                {fbConnected ? shop.fb_page_name : 'Connecter Facebook'}
              </div>
              <div className="text-[10px] text-[#185FA5]">
                {fbConnected ? 'Page connectée · Synchronisé' : 'Requis pour publier'}
              </div>
            </div>
            <button
              onClick={() => fbConnected ? null : window.location.href = getFacebookLoginUrl()}
              className="bg-[#1877F2] text-white text-[10px] font-bold px-3 py-2 rounded-lg flex-shrink-0 active:scale-95 transition-all">
              {fbConnected ? 'Gérer' : 'Connecter'}
            </button>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-4 pb-6">
          <button onClick={signOut} className="w-full text-brown-light text-xs font-medium py-3 border border-terra-light rounded-xl active:scale-95 transition-all">
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="bg-white w-full rounded-t-3xl p-6" style={{animation:'slideIn .25s ease'}}>
            <h3 className="font-serif text-lg text-brown font-bold mb-4">
              Modifier : {editing === 'name' ? 'Nom' : editing === 'address' ? 'Adresse' : editing === 'hours' ? 'Horaires' : editing === 'brand_voice' ? 'Ton' : 'Hashtags'}
            </h3>

            {editing === 'brand_voice' ? (
              <div className="flex flex-col gap-2 mb-5">
                {['Chaleureux & de quartier','Enjoué & spontané','Raffiné & artisanal'].map(v => (
                  <button key={v} onClick={() => setValue(v)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${value === v ? 'border-terra bg-terra-light' : 'border-terra-light'}`}>
                    <span className="text-xl">{v.includes('Chaleureux') ? '🤝' : v.includes('Enjoué') ? '😄' : '✨'}</span>
                    <span className={`text-sm font-semibold ${value === v ? 'text-terra-dark' : 'text-brown'}`}>{v}</span>
                    {value === v && <span className="ml-auto text-terra font-bold">✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              <input value={value} onChange={e => setValue(e.target.value)} autoFocus
                className="w-full px-3 py-3 border border-terra-light rounded-xl text-sm text-brown outline-none focus:border-terra mb-5 transition-colors"/>
            )}

            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 border border-terra-light rounded-xl py-3 text-sm text-brown-light font-medium">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-terra text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60 active:scale-95 transition-all">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
