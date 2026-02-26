import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbcowhkqgxptkllvmgre.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY293aGtxZ3hwdGtsbHZtZ3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjA4NDksImV4cCI6MjA4NzY5Njg0OX0.HOfw2kFFBWtL8VZJguR0_YIBRS-nyh0q75EvgClBq3A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY293aGtxZ3hwdGtsbHZtZ3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMDg0OSwiZXhwIjoyMDg3Njk2ODQ5fQ.QcNLvNMvgj9L4TcvEwYyUxQfYsBW19EykP9Vfbq2m0Y'
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
