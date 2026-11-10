import { createClient } from '@supabase/supabase-js';

// Read from environment variables, falling back to user-provided credentials
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jyvwrdibocdiicaurfrj.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dndyZGlib2NkaWljYXVyZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MjM4NjQsImV4cCI6MjA5OTE5OTg2NH0.jZFyS08mVOkv0slI3iv1eSY6JtAGeo4pwjPSqmS2Kfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
