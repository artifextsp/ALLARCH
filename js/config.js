const CONFIG = {
  SUPABASE_URL: 'https://yafzedieezuiyuchvuzf.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZnplZGllZXp1aXl1Y2h2dXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODU2NDksImV4cCI6MjA4NzI2MTY0OX0.DUZ8TctsBI2g3a0xrOV67bP69pxK_ujzN6nEzpJEKTM',
  API_BASE: 'https://yafzedieezuiyuchvuzf.supabase.co/rest/v1',
  STORAGE_URL: 'https://yafzedieezuiyuchvuzf.supabase.co/storage/v1',
  STORAGE_PUBLIC: 'https://yafzedieezuiyuchvuzf.supabase.co/storage/v1/object/public',
  BUCKET: 'hallazgo-fotos',
  MAX_FOTOS: 3,
  MAX_IMG_WIDTH: 1200,
  IMG_QUALITY: 0.75,
  get HEADERS() {
    return {
      'apikey': this.SUPABASE_KEY,
      'Authorization': `Bearer ${this.SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
  },
  get AUTH_HEADERS() {
    return {
      'apikey': this.SUPABASE_KEY,
      'Authorization': `Bearer ${this.SUPABASE_KEY}`
    };
  }
};
