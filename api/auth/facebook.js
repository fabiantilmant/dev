// api/auth/facebook.js
// Vercel Function — échange le code OAuth contre un token de Page Facebook
// L'App Secret ne sort JAMAIS du serveur

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'code requis' })

  const APP_ID     = process.env.FACEBOOK_APP_ID
  const APP_SECRET = process.env.FACEBOOK_APP_SECRET
  const APP_URL    = process.env.APP_URL

  try {
    // 1. Échanger le code contre un user access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/oauth/access_token?` +
      new URLSearchParams({
        client_id:     APP_ID,
        client_secret: APP_SECRET,
        redirect_uri:  `${APP_URL}/auth/facebook/callback`,
        code
      })
    )
    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error.message)
    const userToken = tokenData.access_token

    // 2. Récupérer les Pages de l'utilisateur
    const pagesRes = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${userToken}`
    )
    const pagesData = await pagesRes.json()
    if (pagesData.error) throw new Error(pagesData.error.message)
    if (!pagesData.data?.length) throw new Error('Aucune Page Facebook trouvée')

    // 3. Prendre la première page (dans une vraie app, laisser l'user choisir)
    const page = pagesData.data[0]

    // 4. Échanger contre un token longue durée
    const longRes = await fetch(
      `https://graph.facebook.com/oauth/access_token?` +
      new URLSearchParams({
        grant_type:        'fb_exchange_token',
        client_id:          APP_ID,
        client_secret:      APP_SECRET,
        fb_exchange_token:  page.access_token
      })
    )
    const longData = await longRes.json()
    const longToken = longData.access_token || page.access_token

    return res.status(200).json({
      pageId:          page.id,
      pageName:        page.name,
      pageAccessToken: longToken
    })
  } catch (err) {
    console.error('facebook-oauth error:', err)
    return res.status(500).json({ error: err.message })
  }
}


// ─────────────────────────────────────────────
// api/generate-reply.js  (à créer séparément)
// ─────────────────────────────────────────────
//
// import Anthropic from '@anthropic-ai/sdk'
//
// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).end()
//   const { shop, customerName, customerMessage, replyType } = req.body
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
//
//   const message = await client.messages.create({
//     model: 'claude-sonnet-4-20250514',
//     max_tokens: 300,
//     messages: [{
//       role: 'user',
//       content: `Tu gères les réponses de la boutique "${shop.name}".
//         Ton : ${shop.brand_voice}.
//         Type : ${replyType}.
//         Client : ${customerName}
//         Message : "${customerMessage}"
//         Rédige une réponse courte, chaleureuse, en français.
//         Réponds UNIQUEMENT avec : {"reply": "votre réponse"}`
//     }]
//   })
//
//   const raw = message.content[0].text
//   const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
//   res.json(parsed)
// }
