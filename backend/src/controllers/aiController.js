const mistralService = require("../services/mistralService");

/**
 * AI Assistant Chat Endpoint (POST /api/ai/chat)
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, lang } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please provide a valid question message." });
    }

    const reply = await mistralService.generateResponse(message.trim(), lang || "en");

    return res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[AI Chat Controller Error]", err);
    return res.status(500).json({ error: "Failed to generate AI response", message: err.message });
  }
};
