import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htrsfhppivgyketeibym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnNmaHBwaXZneWtldGVpYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MDgwOTEsImV4cCI6MjA5NTE4NDA5MX0.tCm9FN0pObD2UNtH2X1ihR5t_QVKGKv5AN-Br-FzQ44'

export const supabase = createClient(supabaseUrl, supabaseKey)