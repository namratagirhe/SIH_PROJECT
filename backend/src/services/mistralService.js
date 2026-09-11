/**
 * Mistral AI Service for DairyGuard Platform
 * Interacts with Mistral AI Chat Completions API.
 * Provides answers to any general questions asked by the user, while retaining
 * rich domain expertise in cattle feed, silage quality, animal health, and platform features.
 */

const https = require("https");

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";

const GENERAL_SYSTEM_PROMPT = `
You are DairyGuard AI Assistant — a helpful, smart, and friendly AI assistant.
You can answer ANY question asked by the user, whether it is about daily life, general topics, agriculture, cattle feed, silage quality testing, forage preservation, dairy animal health (mastitis, bovine care), or DairyGuard platform support.

Always format your response with clean markdown, clear bullet points, emojis, and helpful explanations. Respond in the requested language (English, Hindi, or Marathi).
`.trim();

/**
 * Intelligent HA Fallback Engine for questions when API Key is pending / offline
 */
function getHAFallbackResponse(message, lang = "en") {
  const lowerMsg = (message || "").toLowerCase();

  // Specific domain handling
  if (lowerMsg.includes("silage") || lowerMsg.includes("quality") || lowerMsg.includes("साइलेज") || lowerMsg.includes("चारा") || lowerMsg.includes("feed")) {
    if (lang === "hi") {
      return `🌱 **साइलेज गुणवत्ता जांच गाइड:**\n\n- 🟢 **उत्तम (GOOD):** जैतून हरा या सुनहरा पीला रंग, हल्की मीठी सुंगध (pH 3.8-4.2), 60-70% नमी।\n- 🟡 **मध्यम (MODERATE):** सिरके जैसी गंध।\n- 🔴 **खराब (POOR):** फफूंद के सफेद धब्बे, दुर्गंध।\n\n💡 **सलाह:** ऐप में 📷 **'चारे की जांच करें'** पर फोटो अपलोड करें!`;
    }
    if (lang === "mr") {
      return `🌱 **सायलेज गुणवत्ता तपासणी मार्गदर्शक:**\n\n- 🟢 **उत्तम (GOOD):** हिरवा/सोनेरी रंग, गोड सुगंध, 60-70% ओलसरपणा.\n- 🔴 **खराब (POOR):** बुरशीचे डाग, दुर्गंधी.\n\n💡 **सल्ला:** ॲपमध्ये 📷 **'चारा तपासा'** वर फोटो अपलोड करा!`;
    }
    return `🌱 **Silage Quality Testing Guide:**\n\n- 🟢 **GOOD Quality:** Olive green/golden yellow, fruity aroma (pH 3.8-4.2), 60-70% moisture.\n- 🔴 **POOR Quality:** Dark mold spots, foul smell.\n\n💡 **Tip:** Upload a photo under 📷 **'Test Feed & Silage'** for instant AI screening!`;
  }

  // General questions fallback handling
  if (lang === "hi") {
    return `🤖 **डेयरीगार्ड AI असिस्टेंट:**\n\nमैंने आपका प्रश्न देखा: "${message}".\n\nमैं एक बहुमुखी AI असिस्टेंट हूँ! आप मुझसे कृषि, चारा, पशु स्वास्थ्य, तकनीक या किसी भी विषय पर प्रश्न पूछ सकते हैं।`;
  }
  if (lang === "mr") {
    return `🤖 **डेअरीगार्ड AI असिस्टंट:**\n\nमी तुमचा प्रश्न पाहिला: "${message}".\n\nमी एक एआय असिस्टंट आहे! तुम्ही मला शेती, चारा, आरोग्य किंवा कोणत्याही विषयावर प्रश्न विचारू शकता.`;
  }

  return `🤖 **DairyGuard AI Assistant:**\n\nI received your query: "${message}".\n\nI am ready to assist you with any topic — agricultural advice, cattle feed testing, general knowledge, technology, or platform guidance!`;
}

class MistralAIService {
  /**
   * Send user prompt to Mistral AI API
   */
  async generateResponse(userMessage, lang = "en") {
    if (!MISTRAL_API_KEY) {
      console.log("[Mistral AI] MISTRAL_API_KEY not set in env. Using HA fallback response.");
      return getHAFallbackResponse(userMessage, lang);
    }

    const payloadString = JSON.stringify({
      model: MISTRAL_MODEL,
      messages: [
        { role: "system", content: `${GENERAL_SYSTEM_PROMPT}\nCurrent language preference: ${lang}` },
        { role: "user", content: userMessage }
      ],
      temperature: 0.5,
      max_tokens: 700
    });

    return new Promise((resolve) => {
      const options = {
        hostname: "api.mistral.ai",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`,
          "Content-Length": Buffer.byteLength(payloadString)
        },
        timeout: 8000
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode === 200) {
              const data = JSON.parse(body);
              const reply = data.choices?.[0]?.message?.content;
              if (reply) {
                resolve(reply);
                return;
              }
            }
            console.warn("[Mistral AI Error]", res.statusCode, body);
            resolve(getHAFallbackResponse(userMessage, lang));
          } catch (e) {
            resolve(getHAFallbackResponse(userMessage, lang));
          }
        });
      });

      req.on("error", (err) => {
        console.warn("[Mistral AI Network Warning]", err.message);
        resolve(getHAFallbackResponse(userMessage, lang));
      });

      req.on("timeout", () => {
        req.destroy();
        resolve(getHAFallbackResponse(userMessage, lang));
      });

      req.write(payloadString);
      req.end();
    });
  }
}

module.exports = new MistralAIService();
