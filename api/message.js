const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "Falta ANTHROPIC_API_KEY en las variables de entorno de Vercel."
      });
    }

    const { channel, nombre, explicacion, servicio, precio } = req.body || {};

    if (!channel || !nombre) {
      return res.status(400).json({ error: "Faltan datos para generar el mensaje." });
    }

    const systemPrompt = `Eres un asistente que escribe mensajes de contacto comercial para un videógrafo freelance.
Escribe un mensaje en español, canal: "${channel}", dirigido a: "${nombre}".
Contexto de la oportunidad: ${explicacion || "No especificado"}.
Servicio a ofrecer: ${servicio || "No especificado"}. Rango de precio orientativo: ${precio || "No especificado"}.
El tono debe ser cercano, profesional, breve y sin sonar a plantilla genérica. Adapta la longitud y formalidad al canal (WhatsApp/Instagram: muy breve e informal; Email/Propuesta: más formal y algo más largo; LinkedIn: profesional y directo; Mensaje corto: 2-3 frases).
No inventes datos de contacto ni firmes con un nombre genérico. Responde ÚNICAMENTE con el texto del mensaje, sin explicaciones ni comillas.`;

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: "Genera el mensaje." }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `Anthropic devolvió HTTP ${response.status}.`);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Film Radar /api/message:", error);
    return res.status(500).json({ error: error.message || "Error interno." });
  }
};
