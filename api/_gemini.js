const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

async function callGemini(input, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Falta GEMINI_API_KEY en Vercel.");
  }

  const body = {
    model: GEMINI_MODEL,
    input,
    ...(options.tools ? { tools: options.tools } : {}),
    ...(options.generation_config ? { generation_config: options.generation_config } : {})
  };

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini devolvió HTTP ${response.status}.`);
  }

  if (data?.status === "failed") {
    throw new Error(data?.error?.message || "La interacción con Gemini falló.");
  }

  return data;
}

function getGeminiText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const steps = Array.isArray(data?.steps) ? data.steps : [];
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i]?.type !== "model_output") continue;
    const content = Array.isArray(steps[i]?.content) ? steps[i].content : [];
    const text = content
      .filter(part => part?.type === "text")
      .map(part => part.text || "")
      .join("")
      .trim();
    if (text) return text;
  }

  return "";
}

module.exports = { callGemini, getGeminiText };
