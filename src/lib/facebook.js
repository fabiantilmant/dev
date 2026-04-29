// src/lib/facebook.js
// Gestion de la connexion Facebook et publication

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID
const APP_URL   = import.meta.env.VITE_APP_URL

// Permissions requises
const SCOPES = [
  'pages_manage_posts',
  'pages_read_engagement',
  'pages_show_list',
  'pages_read_user_content'
].join(',')

// --- OAuth ---

export function getFacebookLoginUrl() {
  const state = crypto.randomUUID() // protection CSRF
  sessionStorage.setItem('fb_oauth_state', state)

  const params = new URLSearchParams({
    client_id:     FB_APP_ID,
    redirect_uri:  `${APP_URL}/auth/facebook/callback`,
    scope:         SCOPES,
    response_type: 'code',
    state
  })
  return `https://www.facebook.com/dialog/oauth?${params}`
}

export function validateOAuthState(returnedState) {
  const savedState = sessionStorage.getItem('fb_oauth_state')
  sessionStorage.removeItem('fb_oauth_state')
  return savedState && savedState === returnedState
}

// Note : l'échange du code contre un token se fait côté serveur
// (voir /api/auth/facebook dans vos Vercel Functions)
// pour ne jamais exposer votre App Secret côté client


// --- Pages Facebook ---

export async function getUserPages(userAccessToken) {
  const res = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.data // tableau de pages avec access_token par page
}

// --- Publication ---

export async function publishPhotoPost(pageId, pageToken, caption, photoUrl) {
  const res = await fetch(
    `https://graph.facebook.com/${pageId}/photos`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url:          photoUrl,
        message:      caption,
        access_token: pageToken
      })
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data // { id, post_id }
}

export async function publishTextPost(pageId, pageToken, message) {
  const res = await fetch(
    `https://graph.facebook.com/${pageId}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: pageToken
      })
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}

// --- Métriques ---

export async function getPostReach(postId, pageToken) {
  const res = await fetch(
    `https://graph.facebook.com/${postId}/insights/post_impressions_unique?access_token=${pageToken}`
  )
  const data = await res.json()
  if (data.error) return 0
  return data.data?.[0]?.values?.[0]?.value ?? 0
}

// --- Commentaires & avis ---

export async function getPageComments(pageId, pageToken) {
  const res = await fetch(
    `https://graph.facebook.com/${pageId}/feed?fields=comments{from,message,created_time}&access_token=${pageToken}`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.data
}

export async function replyToComment(commentId, pageToken, message) {
  const res = await fetch(
    `https://graph.facebook.com/${commentId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: pageToken })
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}
