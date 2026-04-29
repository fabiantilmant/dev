// src/lib/ai.js
// Génération de publications via l'API Anthropic
// ⚠️  Cet appel doit passer par une Vercel Function (api/generate-post.js)
//     pour ne jamais exposer ANTHROPIC_API_KEY côté client

// --- Appel depuis le front vers votre Vercel Function ---

export async function generatePost({ shop, mood, photoDescription, userNote, lucky }) {
  const res = await fetch('/api/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop, mood, photoDescription, userNote, lucky })
  })
  if (!res.ok) throw new Error('Erreur lors de la génération')
  const data = await res.json()
  return data // { content, hashtags, mood }
}

export async function generateReply({ shop, customerName, customerMessage, replyType }) {
  const res = await fetch('/api/generate-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop, customerName, customerMessage, replyType })
  })
  if (!res.ok) throw new Error('Erreur lors de la génération')
  return res.json() // { reply }
}


// --- Vercel Function : api/generate-post.js ---
// (Ce fichier va dans /api/generate-post.js à la racine du projet)
//
// import Anthropic from '@anthropic-ai/sdk'
//
// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).end()
//
//   const { shop, mood, photoDescription, userNote, lucky } = req.body
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
//
//   const prompt = buildPrompt({ shop, mood, photoDescription, userNote, lucky })
//
//   const message = await client.messages.create({
//     model: 'claude-sonnet-4-20250514',
//     max_tokens: 400,
//     messages: [{ role: 'user', content: prompt }]
//   })
//
//   const raw = message.content[0].text
//   // Parser le JSON retourné par Claude
//   const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
//   res.json(parsed)
// }

export function buildPrompt({ shop, mood, photoDescription, userNote, lucky }) {
  return `Tu es un assistant spécialisé dans la communication pour les petites boutiques locales.

BOUTIQUE :
- Nom : ${shop.name}
- Adresse : ${shop.address || 'non précisée'}
- Ton : ${shop.brand_voice || 'Chaleureux & de quartier'}
- Hashtags habituels : ${shop.hashtags || '#BoutiqueLocale'}

PHOTO : ${photoDescription || 'photo de boutique'}
AMBIANCE : ${lucky ? 'surprise — choisis toi-même l\'ambiance' : mood}
${userNote ? `DÉTAIL À METTRE EN AVANT : ${userNote}` : ''}

Génère une publication Facebook en français, chaleureuse et authentique.
Elle doit faire 2-3 phrases maximum, utiliser 1-2 emojis, et donner envie de venir en boutique.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{
  "content": "le texte de la publication",
  "hashtags": "les hashtags séparés par des espaces",
  "mood": "l'ambiance choisie"
}`
}
