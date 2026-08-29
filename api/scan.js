const { callGemini, getGeminiText } = require("./_gemini");

function errorResponse(res, status, message) {
  return res.status(status).json({ error: message });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return errorResponse(res, 405, "Método no permitido.");
  }

  try {
    const { tipo, zona } = req.body || {};

    if (!tipo || !zona) {
      return errorResponse(res, 400, "Faltan el tipo de oportunidad y la zona.");
    }

    const prompt = `Eres el motor de análisis de Film Radar, una app para un videógrafo freelance en ${zona}.

Busca en la web oportunidades de trabajo audiovisual reales y recientes para la categoría: "${tipo}", en la zona: "${zona}".

No busques solo anuncios explícitos de "se busca videógrafo". Detecta también señales indirectas de posible necesidad de vídeo: aperturas, lanzamientos, nuevos productos, restaurantes o tiendas recién abiertos, eventos anunciados, conciertos, festivales, campañas, productoras, rodajes, etc.

Prioriza oportunidades que tengan una señal web reciente y verificable. No inventes empresas, eventos, fechas, precios ni necesidades.

Devuelve ÚNICAMENTE un array JSON válido, sin markdown, sin backticks y sin texto antes o después.

Formato exacto:
[
  {
    "nombre": "...",
    "puntuacion": 85,
    "explicacion": "Por qué es una oportunidad, en 1-2 frases concretas basadas en lo encontrado.",
    "servicio": "Qué ofrecerle en pocas palabras.",
    "precio": "Rango estimado en euros.",
    "fuente": "Nombre del sitio o URL de donde sale la información."
  }
]

Máximo 4 oportunidades. Si no encuentras nada útil y verificable, devuelve [].`;

    const data = await callGemini({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      tools: [
        {
          google_search: {}
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1600
      }
    });

    const raw = getGeminiText(data);
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");

    if (start === -1 || end === -1 || end < start) {
      throw new Error("Gemini no devolvió el formato de resultados esperado.");
    }

    let found;
    try {
      found = JSON.parse(raw.slice(start, end + 1));
    } catch {
      throw new Error("La respuesta de Gemini no era un JSON válido.");
    }

    if (!Array.isArray(found)) {
      throw new Error("La respuesta de Gemini no era una lista de oportunidades.");
    }

    found = found.slice(0, 4).map(o => ({
      nombre: String(o?.nombre || "Oportunidad"),
      puntuacion: Number.isFinite(Number(o?.puntuacion))
        ? Math.max(0, Math.min(100, Number(o.puntuacion)))
        : 50,
      explicacion: String(o?.explicacion || ""),
      servicio: String(o?.servicio || ""),
      precio: String(o?.precio || ""),
      fuente: String(o?.fuente || "")
    }));

    return res.status(200).json({
      text: JSON.stringify(found)
    });

  } catch (error) {
    console.error("Film Radar /api/scan:", error);
    return errorResponse(res, 500, error.message || "Error interno.");
  }
};
