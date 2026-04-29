// api/generate-post.js
// Vercel Function — génère une publication via Claude
// Les secrets restent côté serveur, jamais exposés au client

import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { shop, mood, photoDescription, userNote, lucky } = req.body
  if (!shop) return res.status(400).json({ error: 'shop requis' })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `Tu es un assistant spécialisé dans la communication pour les petites boutiques locales.

BOUTIQUE :
- Nom : ${shop.name}
- Adresse : ${shop.address || 'non précisée'}
- Ton : ${shop.brand_voice || 'Chaleureux & de quartier'}
- Hashtags habituels : ${shop.hashtags || '#BoutiqueLocale'}

PHOTO : ${photoDescription || 'photo de boutique'}
AMBIANCE : ${lucky ? 'surprise — choisis toi-même' : mood}
${userNote ? `DÉTAIL À METTRE EN AVANT : ${userNote}` : ''}

Génère une publication Facebook en français, chaleureuse et authentique.
2-3 phrases maximum, 1-2 emojis, donne envie de venir en boutique.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{
  "content": "le texte de la publication",
  "hashtags": "les hashtags séparés par des espaces",
  "mood": "l'ambiance choisie"
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = message.content[0].text
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse invalide de Claude')
    const parsed = JSON.parse(match[0])
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('generate-post error:', err)
    return res.status(500).json({ error: err.message })
  }
}
