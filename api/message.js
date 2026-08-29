const { callGemini, getGeminiText } = require("./_gemini");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error:"Método no permitido."});

  try {
    const { channel, nombre, explicacion, servicio, precio } = req.body || {};
    if (!channel || !nombre) return res.status(400).json({error:"Faltan datos."});

    const prompt = `Escribe un mensaje comercial en español para un videógrafo freelance.
Canal: ${channel}
Destinatario: ${nombre}
Contexto: ${explicacion || "No especificado"}
Servicio: ${servicio || "No especificado"}
Precio orientativo: ${precio || "No especificado"}
Tono cercano, profesional y nada genérico. WhatsApp/Instagram: breve e informal. Email: algo más formal. LinkedIn: profesional y directo. No inventes datos de contacto.
Devuelve SOLO el mensaje.`;

    const data = await callGemini(prompt, {
      generation_config: { thinking_level: "minimal" }
    });

    const text = getGeminiText(data);
    if (!text) throw new Error("Gemini no devolvió ningún mensaje.");

    return res.status(200).json({text});
  } catch (e) {
    console.error("Film Radar message:", e);
    return res.status(500).json({error: e.message || "Error interno."});
  }
};
