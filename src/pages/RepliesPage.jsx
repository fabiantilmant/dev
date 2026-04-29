// src/pages/RepliesPage.jsx
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { getReplies, markReplied } from '../lib/supabase'
import { generateReply } from '../lib/ai'
import BottomNav from '../components/BottomNav'

export default function RepliesPage() {
  const { shop } = useApp()
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all') // 'all' | 'question'
  const [drafting, setDrafting] = useState({}) // { [id]: string }
  const [aiLoading, setAiLoading] = useState({})
  const [sent, setSent] = useState({})

  useEffect(() => {
    if (!shop) return
    getReplies(shop.id).then(data => {
      // Inject demo data if empty
      if (!data || data.length === 0) {
        setReplies(DEMO_REPLIES)
      } else {
        setReplies(data)
      }
      setLoading(false)
    }).catch(() => {
      setReplies(DEMO_REPLIES)
      setLoading(false)
    })
  }, [shop])

  async function handleAiDraft(reply) {
    setAiLoading(p => ({ ...p, [reply.id]: true }))
    try {
      const result = await generateReply({
        shop, customerName: reply.customer_name,
        customerMessage: reply.customer_message,
        replyType: reply.reply_type
      })
      setDrafting(p => ({ ...p, [reply.id]: result.reply }))
    } catch {
      // Fallback demo drafts
      setDrafting(p => ({ ...p, [reply.id]: DEMO_DRAFTS[reply.customer_name] || "Merci pour votre message ! Nous serions ravis de vous aider — passez nous voir en boutique. 😊" }))
    } finally {
      setAiLoading(p => ({ ...p, [reply.id]: false }))
    }
  }

  async function handleSend(reply) {
    const content = drafting[reply.id]
    if (!content?.trim()) return
    try {
      await markReplied(reply.id, content)
      setSent(p => ({ ...p, [reply.id]: true }))
    } catch {
      setSent(p => ({ ...p, [reply.id]: true })) // optimistic
    }
  }

  const filtered = filter === 'all' ? replies : replies.filter(r => r.reply_type === 'question')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-terra px-5 pt-10 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl text-white font-bold">Réponses & avis</h1>
            <p className="text-white/60 text-[10px] mt-0.5">{replies.filter(r => r.status !== 'replied').length} messages à traiter</p>
          </div>
          <div className="flex gap-1.5">
            {['all','question'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  filter === f ? 'bg-white/20 text-white' : 'bg-white/08 text-white/50'
                }`}>
                {f === 'all' ? 'Tous' : 'Questions'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div style={{width:32,height:32,border:'2.5px solid #F0E8DF',borderTopColor:'#C4612C',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
          </div>
        ) : filtered.map(reply => (
          <ReplyCard key={reply.id} reply={reply}
            draft={drafting[reply.id] || ''}
            setDraft={v => setDrafting(p => ({ ...p, [reply.id]: v }))}
            aiLoading={aiLoading[reply.id]}
            onAiDraft={() => handleAiDraft(reply)}
            onSend={() => handleSend(reply)}
            sent={sent[reply.id] || reply.status === 'replied'}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}

function ReplyCard({ reply, draft, setDraft, aiLoading, onAiDraft, onSend, sent }) {
  const badgeClass = {
    question: 'bg-terra-light text-terra-dark',
    review:   'bg-sage-light text-sage',
    comment:  'bg-yellow-50 text-yellow-700'
  }[reply.reply_type] || 'bg-terra-light text-terra-dark'

  const badgeLabel = {
    question: 'Question',
    review:   '★ Avis',
    comment:  'Commentaire'
  }[reply.reply_type] || 'Message'

  return (
    <div className="bg-white rounded-2xl border border-terra-light p-3.5" style={{animation:'fUp .25s ease both'}}>
      {/* Top */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-base flex-shrink-0">
          {reply.avatar || '👤'}
        </div>
        <div>
          <div className="text-xs font-semibold text-brown">{reply.customer_name}</div>
          <div className="text-[10px] text-brown-light">{reply.time_label}</div>
        </div>
        <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Message */}
      <p className="text-xs text-brown leading-relaxed mb-2.5">{reply.customer_message}</p>
      {reply.rating && <div className="text-yellow-400 text-sm mb-2.5">{'★'.repeat(reply.rating)}</div>}

      {/* Replied state */}
      {sent ? (
        <div className="bg-sage-light rounded-lg px-3 py-2 text-[10px] font-semibold text-sage text-center">
          ✓ Répondu sur Facebook
        </div>
      ) : reply.status === 'replied' && reply.reply_content ? (
        <div className="bg-green-50 rounded-lg px-3 py-2">
          <div className="text-[9px] text-brown-light mb-0.5">Votre réponse :</div>
          <div className="text-xs text-brown">{reply.reply_content}</div>
        </div>
      ) : (
        <>
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            rows={2} placeholder="Tapez ou laissez l'IA rédiger…"
            className="w-full px-2.5 py-2 border border-terra-light rounded-lg text-xs text-brown bg-cream outline-none focus:border-terra resize-none transition-colors mb-2"/>
          <div className="flex items-center justify-between">
            <button onClick={onAiDraft} disabled={aiLoading}
              className="text-[10px] text-terra font-semibold disabled:opacity-50">
              {aiLoading ? '⏳ Génération…' : '✨ Brouillon IA'}
            </button>
            <button onClick={onSend} disabled={!draft.trim()}
              className="bg-terra text-white text-[10px] font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 active:scale-95 transition-all">
              Envoyer
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const DEMO_REPLIES = [
  { id:'1', customer_name:'Marie Dubois', avatar:'👩', time_label:'Il y a 2 heures · sur votre post', customer_message:"Avez-vous encore du miel de lavande en stock ? J'adorerais passer cet après-midi ! 🍯", reply_type:'question', status:'pending', rating: null },
  { id:'2', customer_name:'Luc Martin', avatar:'⭐', time_label:'Hier', customer_message:"La meilleure boutique du quartier ! Les bougies sentent divinement bon et l'équipe est adorable !", reply_type:'review', status:'pending', rating: 5 },
  { id:'3', customer_name:'Ahmed Benali', avatar:'👨', time_label:'Il y a 2 jours', customer_message:'Quelles sont vos horaires le dimanche ?', reply_type:'question', status:'replied', reply_content:"Bonjour Ahmed ! Nous sommes ouverts le dimanche de 10h à 17h. À bientôt ! 🛍️" },
]

const DEMO_DRAFTS = {
  'Marie Dubois': "Bonjour Marie ! Oui, il nous reste encore quelques pots de miel de lavande — mais ça part vite ! Mieux vaut passer avant 16h pour ne pas le manquer. On serait ravis de vous accueillir ! 🍯",
  'Luc Martin': "Merci infiniment, Luc — vos mots nous ont fait chaud au cœur ! C'est grâce à des clients comme vous que cette boutique est si spéciale. À très bientôt ! 🛍️"
}
