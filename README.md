# Film Radar — Vercel

## Qué se ha arreglado

- La clave de Anthropic ya no se expone en el navegador.
- El escaneo usa `/api/scan`.
- La generación de mensajes usa `/api/message`.
- Se ha eliminado `window.storage`, que no existe en una web normal de Vercel.
- El seguimiento se guarda con `localStorage`.
- Los errores del servidor ahora se muestran en pantalla.
- `/api/scan` contempla `pause_turn` de la búsqueda web de Anthropic.

## Configuración en Vercel

En **Project → Settings → Environment Variables**, crea:

`ANTHROPIC_API_KEY` = tu clave de Anthropic

Después haz un nuevo deploy.

No pongas la clave dentro de `index.html` ni la subas a GitHub.

## Estructura

- `index.html`
- `api/scan.js`
- `api/message.js`
- `package.json`
