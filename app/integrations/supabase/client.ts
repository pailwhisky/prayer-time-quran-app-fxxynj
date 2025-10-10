import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://asuhklwnekgmfdfvjxms.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdWhrbHduZWtnbWZkZnZqeG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDI5MjAsImV4cCI6MjA3NTY3ODkyMH0.ky936M5QT5UQMH7hpiCmUjTsH7evsiro_bW228Ixt8U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
