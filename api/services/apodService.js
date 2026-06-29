const Apod = require("../models/Apod");
const { generateFact } = require("./geminiServiceMin");

const APOD_URL = "https://api.nasa.gov/planetary/apod";

// Today's date as "YYYY-MM-DD" to match NASA's date format.
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Fetch from NASA, retrying on a transient 503 (server overloaded).
async function fetchFromNasa(retries = 2) {
  const url = `${APOD_URL}?api_key=${process.env.NASA_API_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);

    if (res.ok) {
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

    // 503 = NASA temporarily overloaded. Wait and retry (1s, then 2s).
    if (res.status === 503 && attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }

    throw new Error(`NASA APOD responded ${res.status}`);
  }
}

async function getApod() {
  // 1. CHECK THE CACHE FIRST — if today's APOD is saved, return it.
  //    No NASA call, so NASA being down doesn't matter once it's cached.
  const cached = await Apod.findOne({ date: today() });
  if (cached) {
    return cached.toObject();
  }

  // 2. Cache miss — fetch from NASA (with retry on 503).
  const fresh = await fetchFromNasa();

  // 3. Generate the AI fact (defensively — a failure won't break APOD).
  let fact = null;
  try {
    fact = await generateFact(fresh.title, fresh.explanation);
  } catch (err) {
    console.error("Gemini fact failed (saving APOD without it):", err.message);
  }

  // 4. Save to cache so future requests skip NASA entirely.
  const saved = await Apod.create({ ...fresh, fact });
  return saved.toObject();
}

module.exports = { getApod };