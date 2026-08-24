import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFileToSupabase = async (fileBuffer, originalName, mimeType) => {
  const fileExt = 'webp';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Optimize image with sharp
  const optimizedBuffer = await sharp(fileBuffer)
    .resize(1080, 1080, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const { error } = await supabase.storage
    .from('products')
    .upload(fileName, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  return publicUrl;
};

export const deleteFileFromSupabase = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // Extract filename from the end of the URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (fileName) {
      const { error } = await supabase.storage
        .from('products')
        .remove([fileName]);
        
      if (error) {
        console.error('Failed to delete old image from Supabase:', error.message);
      }
    }
  } catch (err) {
    console.error('Error deleting image from Supabase:', err);
  }
};
