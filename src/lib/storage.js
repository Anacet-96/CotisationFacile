// ============================================================
// STORAGE — Upload vers Supabase Storage
// ============================================================
import { supabase } from './supabaseClient';

const BUCKET = 'media';

/**
 * Upload un fichier et retourne son URL publique
 * @param {File} file
 * @param {string} folder - ex: 'products', 'kits', 'kit-items', 'orders'
 * @returns {Promise<{ url: string|null, error: string|null }>}
 */
export async function uploadImage(file, folder = 'misc') {
  if (!file) return { url: null, error: 'Aucun fichier.' };

  // Vérifs
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'Le fichier doit être une image.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'Image trop lourde (max 5 MB).' };
  }

  // Nom unique : timestamp + aléatoire + extension
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${folder}/${safeName}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (upErr) {
    console.error('[storage] upload error:', upErr);
    return { url: null, error: upErr.message };
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, error: null };
}

/**
 * Supprime une image par son URL publique
 */
export async function deleteImage(url) {
  if (!url) return;
  // Extrait le chemin après /media/
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.substring(idx + marker.length);

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('[storage] delete error:', error);
}