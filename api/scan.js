const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

async function callClaude(body) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Falta ANTHROPIC_API_KEY en las variables de entorno de Vercel.");
  }

  let messages = body.messages;

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        ...body,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `Anthropic devolvió HTTP ${response.status}.`);
    }

    if (data.stop_reason === "pause_turn") {
      messages = [
        ...messages,
        { role: "assistant", content: data.content }
      ];
      continue;
    }

    return data;
  }

  throw new Error("La búsqueda web de Anthropic no terminó a tiempo.");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendError(res, 405, "Método no permitido.");
  }

  try {
    const { tipo, zona } = req.body || {};

    if (!tipo || !zona) {
      return sendError(res, 400, "Faltan tipo y zona.");
    }

    const systemPrompt = `Eres el motor de análisis de Film Radar, una app para un videógrafo freelance en ${zona}.
Busca en la web oportunidades de trabajo audiovisual reales y recientes para la categoría: "${tipo}", en la zona: "${zona}".
No busques solo anuncios explícitos de "se busca videógrafo". Detecta también señales indirectas de posible necesidad de vídeo (aperturas, lanzamientos, nuevos productos, rodajes, eventos anunciados, etc).
Devuelve ÚNICAMENTE un array JSON válido (sin texto antes ni después, sin markdown, sin backticks) con máximo 4 oportunidades, en este formato exacto:
[{"nombre":"...","puntuacion":85,"explicacion":"por qué es una oportunidad, en 1-2 frases concretas basadas en lo encontrado","servicio":"qué ofrecerle en pocas palabras","precio":"rango estimado en euros","fuente":"nombre del sitio o url de donde sale la info"}]
Si no encuentras nada útil y verificable, devuelve un array vacío [].`;

    const data = await callClaude({
      model: MODEL,
      max_tokens: 1400,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Escanea oportunidades ahora para "${tipo}" en "${zona}".`
        }
      ],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Film Radar /api/scan:", error);
    return sendError(res, 500, error.message || "Error interno.");
  }
};
