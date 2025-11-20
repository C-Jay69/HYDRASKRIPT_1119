/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FAL_KEY: string
  readonly VITE_FISH_AUDIO_API_KEY: string
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_OPEN_ROUTER_API_KEY: string
  readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Save that file and the TypeScript errors should disappear immediately (you might not even need to restart the server).

**Once that's done:**
1. **Restart your dev server** anyway (just to be safe)
2. Open your browser and navigate to the Audiobook Studio or Book Genesis page
3. **Open the browser console** (F12 → Console tab)
4. Look for the logs:
```
   All env vars: {VITE_GEMINI_API_KEY: "AIzaSy...", ...}
   Gemini key exists? true