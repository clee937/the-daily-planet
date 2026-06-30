const express = require("express");

const GeminiController = require("../controllers/gemini");
const tokenChecker = require("../middleware/tokenChecker");
const User = require("../models/user");

const router = express.Router();
const MESSAGE_LIMIT = 10;
const RESET_AFTER_MS = 60 * 60 * 1000;

router.post("/chat", tokenChecker, GeminiController.chatWithAI);

router.get("/chat-status", tokenChecker, async (req, res) => {
    const user = await User.findById(req.user_id);

    const now = Date.now();

    if (user.aiWindowStart && now - user.aiWindowStart.getTime() > RESET_AFTER_MS) {
        user.aiMessageCount = 0;
        user.aiWindowStart = new Date();
        await user.save();
    }

    let minutesUntilReset = 0;

    if (user.aiWindowStart) {
        minutesUntilReset = Math.ceil(
            (RESET_AFTER_MS - (now - user.aiWindowStart.getTime())) / 60000
        );
        if (minutesUntilReset < 0) {
            minutesUntilReset = 0;
        }
    }

    res.json({
        messagesUsed: user.aiMessageCount,
        messagesRemaining: MESSAGE_LIMIT - user.aiMessageCount,
        minutesUntilReset
    });
});

module.exports = router;