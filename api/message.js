const { callGemini, getGeminiText } = require("./_gemini");

function errorResponse(res, status, message) {
  return res.status(status).json({ error: message });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return errorResponse(res, 405, "Método no permitido.");
  }

  try {
    const { channel, nombre, explicacion, servicio, precio } = req.body || {};

    if (!channel || !nombre) {
      return errorResponse(res, 400, "Faltan datos para generar el mensaje.");
    }

    const prompt = `Eres un asistente que escribe mensajes de contacto comercial para un videógrafo freelance.

Escribe un mensaje en español, canal: "${channel}", dirigido a: "${nombre}".
Contexto de la oportunidad: ${explicacion || "No especificado"}.
Servicio a ofrecer: ${servicio || "No especificado"}.
Rango de precio orientativo: ${precio || "No especificado"}.

El tono debe ser cercano, profesional, breve y sin sonar a plantilla genérica.
Adapta la longitud al canal:
- WhatsApp/Instagram: muy breve e informal.
- Email/Propuesta: más formal y algo más largo.
- LinkedIn: profesional y directo.
- Mensaje corto: 2-3 frases.

No inventes datos de contacto ni firmes con un nombre genérico.
Responde ÚNICAMENTE con el texto del mensaje, sin explicaciones ni comillas.`;

    const data = await callGemini({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 700
      }
    });

    const text = getGeminiText(data);

    if (!text) {
      throw new Error("Gemini no devolvió ningún mensaje.");
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Film Radar /api/message:", error);
    return errorResponse(res, 500, error.message || "Error interno.");
  }
};
