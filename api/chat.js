export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY no configurada" });

  try {
    const { messages, system } = req.body;
    const contents = [];
    contents.push({ role: "user", parts: [{ text: system + "\n\nResponde al siguiente mensaje:" }] });
    contents.push({ role: "model", parts: [{ text: "Entendido. Soy Eco y sigo todas las reglas." }] });
    for (const m of messages) {
      contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 250, temperature: 0.7 } }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "Error" });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
