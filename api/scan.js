const { callGemini, getGeminiText } = require("./_gemini");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error:"Método no permitido."});

  try {
    const { tipo, zona } = req.body || {};
    if (!tipo || !zona) return res.status(400).json({error:"Faltan datos."});

    const prompt = `Eres el motor de Film Radar, una app para un videógrafo freelance en ${zona}.
Usa la Búsqueda de Google para encontrar oportunidades audiovisuales REALES y RECIENTES relacionadas con "${tipo}" en "${zona}".
Busca ofertas explícitas y señales indirectas de necesidad de vídeo: aperturas, lanzamientos, productos, negocios recién abiertos, eventos, conciertos, festivales, campañas, productoras, rodajes, etc.
No inventes empresas, eventos, fechas, precios ni necesidades.
Devuelve ÚNICAMENTE un array JSON válido, sin markdown:
[
 {"nombre":"...","puntuacion":85,"explicacion":"...","servicio":"...","precio":"...","fuente":"..."}
]
Máximo 4 oportunidades. Si no hay ninguna útil y verificable, devuelve [].`;

    const data = await callGemini(prompt, {
      tools: [{ type: "google_search" }],
      generation_config: { thinking_level: "minimal" }
    });

    const raw = getGeminiText(data);
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start < 0 || end < start) throw new Error("Gemini no devolvió una lista JSON.");

    let found;
    try { found = JSON.parse(raw.slice(start, end + 1)); }
    catch { throw new Error("Gemini devolvió JSON no válido."); }

    if (!Array.isArray(found)) throw new Error("Formato de resultados no válido.");

    found = found.slice(0,4).map(o => ({
      nombre: String(o?.nombre || "Oportunidad"),
      puntuacion: Math.max(0, Math.min(100, Number(o?.puntuacion) || 50)),
      explicacion: String(o?.explicacion || ""),
      servicio: String(o?.servicio || ""),
      precio: String(o?.precio || ""),
      fuente: String(o?.fuente || "")
    }));

    return res.status(200).json({text: JSON.stringify(found)});
  } catch (e) {
    console.error("Film Radar scan:", e);
    return res.status(500).json({error: e.message || "Error interno."});
  }
};
