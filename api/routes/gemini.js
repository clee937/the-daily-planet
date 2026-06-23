const express = require("express");

const GeminiController = require("../controllers/gemini");
const tokenChecker = require("../middleware/tokenChecker");

const router = express.Router();

router.post("/chat", GeminiController.chatWithAI);

module.exports = router;