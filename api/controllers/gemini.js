const { askGemini } = require ("../services/geminiService.js");

async function chatWithAI(req, res) {
    try {
        const { prompt } = req.body;

        const answer = await askGemini(prompt);

        res.json({ answer });

    } catch (error) {

        res.status(500).json({
            error: error.message,
            message: "AI request failed",
        });
    }
};

const GeminiController = {
    chatWithAI,
};

module.exports = GeminiController;
