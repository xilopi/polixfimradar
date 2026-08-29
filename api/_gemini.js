const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(payload) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Falta GEMINI_API_KEY en Vercel. Añade tu clave de Google AI Studio en Settings → Environment Variables.");
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini devolvió HTTP ${response.status}.`
    );
  }

  return data;
}

function getGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim() || "";
}

module.exports = { callGemini, getGeminiText };
