// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://iwvopkjhvuxyspirxqrc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dm9wa2podnV4eXNwaXJ4cXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDUyNjEsImV4cCI6MjA5MTk4MTI2MX0.nE7QqPlaMWZikX5hMzPkDaWkJ3AWoSugocRNJhtsJyU'
)

export default supabase