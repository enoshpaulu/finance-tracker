import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://itdusgwiywyprhbjcact.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZHVzZ3dpeXd5cHJoYmpjYWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTE1NjMsImV4cCI6MjA4NDM4NzU2M30.wQpg4KjfL_oLqNyLcOPEd2LDz8rDLbuTXSdZB031lsI"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
