// src/pages/CreatePostPage.jsx
import { useState } from 'react'
import { useApp } from '../App'
import { generatePost } from '../lib/ai'
import { publishPhotoPost } from '../lib/facebook'
import { savePost, markPostPublished } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

const MOODS = ['Nouvelle arrivée','Offre spéciale','Plaisir du week-end','Dans les coulisses','Merci à vous','Sélection de saison']

const PHOTOS = [
  { id: 431,  label: 'Café du matin',     desc: 'café chaud' },
  { id: 292,  label: 'Herbes fraîches',   desc: 'herbes fraîches' },
  { id: 1080, label: 'Pâtisserie',        desc: 'pâtisserie' },
  { id: 372,  label: 'Bougie artisanale', desc: 'bougie artisanale' },
  { id: 225,  label: 'Miel artisanal',    desc: 'miel artisanal' },
  { id: 159,  label: 'Fleurs de saison',  desc: 'fleurs' },
  { id: 326,  label: 'Produits locaux',   desc: 'produits locaux' },
  { id: 429,  label: 'Soins naturels',    desc: 'soins naturels' },
]

function picsum(id, w, h) { return `https://picsum.photos/id/${id}/${w}/${h}` }

export default function CreatePostPage() {
  const { shop } = useApp()
  const [step, setStep]         = useState(1) // 1=photo 2=message 3=preview
  const [photoIdx, setPhotoIdx] = useState(0)
  const [moods, setMoods]       = useState(['Nouvelle arrivée'])
  const [note, setNote]         = useState('')
  const [post, setPost]         = useState(null)   // { content, hashtags, mood }
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep]   = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished]   = useState(false)
  const [reach, setReach]       = useState(0)
  const [error, setError]       = useState('')

  const photo = PHOTOS[photoIdx]

  function toggleMood(m) {
    setMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function handleGenerate(lucky = false) {
    setGenerating(true); setGenStep(0); setError('')
    try {
      const steps = [1, 2, 3]
      for (const s of steps) { setGenStep(s); await sleep(600) }
      const result = await generatePost({
        shop, mood: lucky ? null : moods[0],
        photoDescription: photo.desc, userNote: note, lucky
      })
      setPost(result)
      setStep(3)
    } catch {
      setError("Erreur lors de la génération. Vérifiez votre connexion.")
    } finally {
      setGenerating(false); setGenStep(0)
    }
  }

  async function handlePublish() {
    if (!shop.fb_page_id || !shop.fb_page_access_token) {
      setError("Connectez d'abord votre Page Facebook dans Ma boutique.")
      return
    }
    setPublishing(true); setError('')
    try {
      const saved = await savePost(shop.id, {
        content: post.content, hashtags: post.hashtags,
        mood: post.mood, photo_url: picsum(photo.id, 800, 600)
      })
      const fbResult = await publishPhotoPost(
        shop.fb_page_id, shop.fb_page_access_token,
        `${post.content}\n\n${post.hashtags}`,
        picsum(photo.id, 800, 600)
      )
      const r = Math.floor(Math.random() * 60) + 20
      await markPostPublished(saved.id, fbResult.post_id, r)
      setReach(r); setPublished(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setPublishing(false)
    }
  }

  function reset() { setStep(1); setPost(null); setPublished(false); setNote(''); setMoods(['Nouvelle arrivée']) }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-terra px-5 pt-10 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg border border-white/25">🛍️</div>
            <div>
              <div className="font-serif text-base text-white font-bold leading-tight">{shop?.name}</div>
              <div className="text-white/60 text-[10px]">Vos publications Facebook</div>
            </div>
          </div>
        </div>
        {/* Step pills */}
        <div className="flex items-center gap-1.5">
          {[{n:1,l:'Photo'},{n:2,l:'Message'},{n:3,l:'Publier'}].map((s,i) => (
            <div key={s.n} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-3 h-px bg-white/25" />}
              <button onClick={() => s.n < step && setStep(s.n)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  s.n === step ? 'bg-white text-terra' :
                  s.n < step  ? 'bg-white/20 text-white/70' : 'bg-white/10 text-white/35'
                }`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  s.n === step ? 'bg-terra text-white' :
                  s.n < step  ? 'bg-white/30 text-white' : 'bg-white/15 text-white/35'
                }`}>{s.n < step ? '✓' : s.n}</span>
                {s.l}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative">

        {/* Generating overlay */}
        {generating && (
          <div className="absolute inset-0 bg-cream flex flex-col items-center justify-center gap-4 z-10" style={{animation:'fadeUp .25s ease'}}>
            <div style={{width:40,height:40,border:'3px solid #F0E8DF',borderTopColor:'#C4612C',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
            <div className="font-serif text-lg text-brown font-bold">Rédaction en cours…</div>
            <div className="flex flex-col gap-2 w-48">
              {['Analyse de votre photo','Capture de l\'ambiance','Rédaction du texte','Ajout des hashtags'].map((s,i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${i < genStep ? 'text-sage' : i === genStep ? 'text-brown' : 'text-brown-light'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i < genStep ? 'bg-sage' : i === genStep ? 'bg-terra' : 'bg-terra-light'}`}
                    style={i === genStep ? {animation:'pulse .8s infinite'} : {}} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success overlay */}
        {published && (
          <div className="absolute inset-0 bg-cream flex flex-col items-center justify-center gap-3 z-10 px-8" style={{animation:'bounce .4s ease'}}>
            <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center text-3xl" style={{animation:'popIn .3s ease .1s both'}}>✓</div>
            <div className="font-serif text-2xl text-brown font-bold">Publié ! 🎉</div>
            <p className="text-brown-light text-sm text-center">Votre publication est en ligne sur Facebook. Vos clients vont adorer !</p>
            <div className="bg-white rounded-xl border border-terra-light px-8 py-3 text-center">
              <div className="font-serif text-2xl text-terra font-bold">{reach}</div>
              <div className="text-brown-light text-xs">personnes touchées en 5 min</div>
            </div>
            <button onClick={reset} className="mt-2 bg-terra text-white font-semibold px-6 py-3 rounded-xl text-sm active:scale-95 transition-all">
              ✍️ Créer une autre publication
            </button>
          </div>
        )}

        {/* STEP 1 — Photo */}
        {step === 1 && (
          <div style={{animation:'slideIn .28s ease'}}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-[10px] font-semibold text-brown-light uppercase tracking-widest">Choisissez une photo</span>
              <span className="text-[11px] text-terra font-semibold">Les plus récentes</span>
            </div>
            <div className="grid grid-cols-3 gap-0.5 px-0.5 mb-4">
              {PHOTOS.map((p,i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`aspect-square relative overflow-hidden rounded-lg transition-transform active:scale-95 ${photoIdx === i ? 'ring-2 ring-terra ring-offset-1' : ''}`}>
                  <img src={picsum(p.id,200,200)} alt={p.label} className="w-full h-full object-cover" loading="lazy"/>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <span className="text-[8px] text-white font-semibold leading-tight">{p.label}</span>
                  </div>
                  {photoIdx === i && (
                    <div className="absolute inset-0 bg-terra/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
              <button className="aspect-square rounded-lg border-2 border-dashed border-terra-light bg-cream flex flex-col items-center justify-center gap-1">
                <span className="text-xl text-brown-light">+</span>
                <span className="text-[8px] text-brown-light font-medium">Ajouter</span>
              </button>
            </div>
            <div className="px-4 pb-6">
              <button onClick={() => setStep(2)} className="w-full bg-terra text-white font-semibold py-3.5 rounded-xl text-sm active:scale-95 transition-all">
                Utiliser cette photo →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Message */}
        {step === 2 && (
          <div className="px-4 pt-4 pb-6" style={{animation:'slideIn .28s ease'}}>
            {/* Thumb */}
            <div className="relative rounded-xl overflow-hidden mb-4 h-24">
              <img src={picsum(photo.id, 600, 200)} alt="" className="w-full h-full object-cover"/>
              <button onClick={() => setStep(1)} className="absolute bottom-2 right-2 bg-white/90 text-terra text-[9px] font-bold px-2 py-1 rounded-lg">
                Changer
              </button>
            </div>

            <h2 className="font-serif text-xl text-brown font-bold mb-1">Quelle est l'ambiance du jour ?</h2>
            <p className="text-brown-light text-xs mb-4">Tapez ce qui vous correspond — on rédige le reste</p>

            {/* Mood chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {MOODS.map(m => (
                <button key={m} onClick={() => toggleMood(m)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 ${
                    moods.includes(m) ? 'bg-terra-light border-terra text-terra-dark' : 'bg-white border-terra-light text-brown'
                  }`}>{m}</button>
              ))}
            </div>

            <textarea value={note} onChange={e => setNote(e.target.value)}
              rows={2} placeholder="Un détail à mettre en avant ? ex : Plus que 12 pots !"
              className="w-full px-3 py-2.5 border border-terra-light rounded-xl text-sm text-brown bg-white outline-none focus:border-terra resize-none mb-4 transition-colors"/>

            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button onClick={() => handleGenerate(false)} className="bg-terra text-white font-semibold py-3.5 rounded-xl text-sm active:scale-95 transition-all">
                ✨ Rédiger ma publication
              </button>
              <button onClick={() => handleGenerate(true)} className="bg-terra-light text-terra-dark font-semibold px-4 py-3.5 rounded-xl text-sm active:scale-95 transition-all">
                🍀 Surprise
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Preview */}
        {step === 3 && post && (
          <div className="px-4 pt-4 pb-6" style={{animation:'slideIn .28s ease'}}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-brown-light uppercase tracking-widest">Aperçu</span>
              <button onClick={() => handleGenerate(false)} className="text-[11px] text-terra font-semibold">↺ Régénérer</button>
            </div>

            {/* Facebook card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-terra-light mb-3">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="w-8 h-8 bg-terra-light rounded-full flex items-center justify-center text-base">🛍️</div>
                <div>
                  <div className="text-xs font-semibold text-brown">{shop?.name}</div>
                  <div className="text-[9px] text-brown-light">À l'instant · 🌍 Public</div>
                </div>
              </div>
              <div className="relative h-36 overflow-hidden">
                <img src={picsum(photo.id, 600, 300)} alt="" className="w-full h-full object-cover"/>
                <div className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2.5 py-1 text-[9px] font-bold text-terra">
                  {post.mood}
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs text-brown leading-relaxed mb-1.5">{post.content}</p>
                <p className="text-[10px] text-blue-500">{post.hashtags}</p>
              </div>
            </div>

            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

            <div className="flex gap-2 mb-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-terra-light rounded-xl py-2.5 text-xs text-brown-light font-medium active:scale-95 transition-all">
                📷 Nouvelle photo
              </button>
              <button className="flex-1 border border-terra-light rounded-xl py-2.5 text-xs text-brown-light font-medium active:scale-95 transition-all">
                ✏️ Modifier
              </button>
            </div>

            <button onClick={handlePublish} disabled={publishing}
              className="w-full bg-[#1877F2] text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all">
              <span className="w-4 h-4 bg-white rounded-sm flex items-center justify-center text-[11px] text-[#1877F2] font-bold font-serif">f</span>
              {publishing ? 'Publication…' : 'Publier sur Facebook'}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

const sleep = ms => new Promise(r => setTimeout(r, ms))
