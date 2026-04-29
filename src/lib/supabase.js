// src/lib/supabase.js
// Client Supabase — utilisé dans toute l'app

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// --- Auth ---

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// --- Boutique ---

export async function getShop(userId) {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

export async function createShop(userId, shopData) {
  const { data, error } = await supabase
    .from('shops')
    .insert({ user_id: userId, ...shopData })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateShop(shopId, updates) {
  const { data, error } = await supabase
    .from('shops')
    .update(updates)
    .eq('id', shopId)
    .select()
    .single()
  if (error) throw error
  return data
}

// --- Publications ---

export async function getPosts(shopId, limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function savePost(shopId, postData) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ shop_id: shopId, ...postData })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markPostPublished(postId, fbPostId, reach = 0) {
  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      fb_post_id: fbPostId,
      reach,
      published_at: new Date().toISOString()
    })
    .eq('id', postId)
    .select()
    .single()
  if (error) throw error
  return data
}

// --- Réponses ---

export async function getReplies(shopId) {
  const { data, error } = await supabase
    .from('replies')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markReplied(replyId, replyContent) {
  const { data, error } = await supabase
    .from('replies')
    .update({
      status: 'replied',
      reply_content: replyContent,
      replied_at: new Date().toISOString()
    })
    .eq('id', replyId)
    .select()
    .single()
  if (error) throw error
  return data
}
