# Film Radar — Vercel + Gemini

Esta versión reemplaza Anthropic por Gemini API.

## Qué hace

- Busca oportunidades reales y recientes usando Gemini con Google Search.
- Genera mensajes comerciales.
- Guarda el seguimiento del CRM en `localStorage`.
- Mantiene la clave de IA fuera del navegador y de GitHub.

## Antes de desplegar

Necesitas una API key de Google AI Studio.

1. Entra en https://aistudio.google.com/apikey
2. Crea una API key.
3. En Vercel ve a:
   Project → Settings → Environment Variables
4. Crea:
   `GEMINI_API_KEY` = tu clave
5. Haz Redeploy.

No subas la clave a GitHub.

## Modelo

Usa `gemini-2.5-flash-lite`, con Google Search Grounding para que el escaneo pueda consultar información web reciente.

## Estructura

- `index.html`
- `api/_gemini.js`
- `api/scan.js`
- `api/message.js`
- `package.json`
- `README.md`
