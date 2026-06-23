// Fetches NASA's Astronomy Picture of the Day (APOD).
// 

const APOD_URL = "https://api.nasa.gov/planetary/apod";

async function getApod() {
  const url = `${APOD_URL}?api_key=${process.env.NASA_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`NASA APOD responded ${res.status}`);
  }

  const data = await res.json();

  return {
    title: data.title,
    explanation: data.explanation,
    url: data.url,
    hdurl: data.hdurl,
    date: data.date,
    mediaType: data.media_type, // "image" or "video"
    copyright: data.copyright || null,
  };
}

module.exports = { getApod };