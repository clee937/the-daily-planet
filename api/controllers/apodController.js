const apodService = require("../services/apodService");

async function getApod(req, res) {
  try {
    const apod = await apodService.getApod();
    res.status(200).json({ apod });
  } catch (err) {
    console.error("getApod error:", err.message);
    res.status(502).json({ error: "Failed to fetch picture of the day" });
  }
}

module.exports = { getApod };