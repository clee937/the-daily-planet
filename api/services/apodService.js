const Apod = require("../models/Apod");
const { generateFact } = require("./geminiService");

const APOD_URL = "https://api.nasa.gov/planetary/apod";

async function fetchFromNasa() {
  const url = `${APOD_URL}?api_key=${process.env.NASA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`NASA APOD responded ${res.status}`);
  }
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
  const fresh = await fetchFromNasa();
  const cached = await Apod.findOne({ date: fresh.date });

  if (cached && cached.fact) {
    return cached.toObject();
  }

  let fact = null;
  try {
    console.log("in the try")
    fact = await generateFact(fresh.title, fresh.explanation);
  } catch (err) {
    console.error("Gemini fact generation failed (saving APOD without fact):", err.message);
  }

  const saved = await Apod.create({ ...fresh, fact });
  return saved.toObject();
}

module.exports = { getApod };