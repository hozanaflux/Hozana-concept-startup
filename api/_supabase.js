const SUPABASE_URL = process.env.SUPABASE_URL || 'https://leadvqrheziyvrwnbiio.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYWR2cXJoZXppeXZyd25iaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM0MTksImV4cCI6MjA5MzU0OTQxOX0.I-L13gdtuQnsJ4ErEb-SWWfdbMUhWOkTvSFOSkNxsD0';

function cleanSecret(value = '') {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function supabaseServiceKey() {
  return cleanSecret(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '');
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON,
  supabaseServiceKey
};
