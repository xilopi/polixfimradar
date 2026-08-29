# Film Radar — Vercel + Gemini

Sube todos estos archivos a la raíz del repositorio:

- index.html
- package.json
- vercel.json
- api/_gemini.js
- api/scan.js
- api/message.js

En Vercel configura la variable secreta:

`GEMINI_API_KEY`

Después de subir cambios, Vercel hará un nuevo deployment automáticamente.

La clave no debe aparecer en `index.html` ni en GitHub.
