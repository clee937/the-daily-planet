const { askGemini } = require ("../services/geminiService.js");

const User = require("../models/user");
const MESSAGE_LIMIT = 10;
const RESET_AFTER_MS = 60 * 60 * 1000; // 1 hour
async function chatWithAI(req, res) {
    try {
        const userId = req.user_id;
        const now = Date.now();
        const user = await User.findById(userId);
        // if no window has started, or the window has expired, reset
        if (!user.aiWindowStart || now - user.aiWindowStart.getTime() > RESET_AFTER_MS) {
            user.aiMessageCount = 0;
            user.aiWindowStart = new Date();
        }
        if (user.aiMessageCount >= MESSAGE_LIMIT) {
            const timeLeft = Math.ceil((RESET_AFTER_MS - (now - user.aiWindowStart.getTime())) / 60000);
            return res.status(429).json({
                message: `You've reached your message limit! Try again in ${timeLeft} minute(s). Over and out.`,
            });
        }
        const { prompt } = req.body;
        const answer = await askGemini(prompt);
        user.aiMessageCount++;
        await user.save();
        res.json({
            answer,
            messageLimit: MESSAGE_LIMIT,
            messagesUsed: user.aiMessageCount,
            messagesRemaining: MESSAGE_LIMIT - user.aiMessageCount,
            minutesUntilReset: Math.ceil((RESET_AFTER_MS - (now - user.aiWindowStart.getTime())) / 60000)
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            message: "AI request failed",
        });
    }
}

const GeminiController = {
    chatWithAI,
};

module.exports = GeminiController;