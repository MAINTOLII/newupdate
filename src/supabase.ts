import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://swrgqktuatubssvwjkyx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cmdxa3R1YXR1YnNzdndqa3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MjQ1NzYsImV4cCI6MjA4MzUwMDU3Nn0.0FQcggOAijqZ3nbOaK369Yy5erTTOtby53x0DHstV9k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);