const Apod = require("../models/Apod");
const { generateFact } = require("./geminiService");

const APOD_URL = "https://api.nasa.gov/planetary/apod";

function today() {
    return new Date().toISOString().slice(0, 10);
}

async function fetchFromNasa() {
    const url = `${APOD_URL}?api_key=${process.env.NASA_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA APOD responded ${res.status}`);
    const data = await res.json();
    return {
        date: data.date,
        title: data.title,
        url: data.url,
        hdurl: data.hdurl || null,
        explanation: data.explanation || null,
        mediaType: data.media_type || "image",
        copyright: data.copyright || null,
    };
}

async function getApod() {
  // True cache: if we already saved today's APOD, return it with NO external calls.
    const cached = await Apod.findOne({ date: today() });
    console.log("in the cache")
    if (cached) {
        return cached.toObject();
    }

    const fresh = await fetchFromNasa();

    let fact = null;
    try {
        fact = await generateFact(fresh.title, fresh.explanation);
    } catch (err) {
    console.error("Gemini fact failed (saving APOD without it):", err.message);
    }
    const saved = await Apod.create({ ...fresh, fact });
    return saved.toObject();
}

module.exports = { getApod };