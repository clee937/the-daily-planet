import { useState, useEffect } from "react";
import FavouriteButton from "./FavouriteButton";

const API_URL = import.meta.env.VITE_BACKEND_URL;

function PictureOfTheDay({token}) {
    const [apod, setApod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    async function fetchApod() {
        try {
        const res = await fetch(`${API_URL}/apod`);
        if (!res.ok) throw new Error("Could not load picture of the day");
        const data = await res.json();
        setApod(data.apod);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    }
    fetchApod();
    }, []);

    if (loading) return <p>Standby Houston, loading picture of the day...</p>;
    if (error) return <p>{error}</p>;
    if (!apod) return null;

    return (
    <section className="apod">
        <h2>{apod.title}</h2>
        <p className="apod-date">{apod.date}</p>

        {apod.mediaType === "image" ? (
        <img className="apod-image" src={apod.url} alt={apod.title} />
        ) : apod.url.endsWith(".mp4") ? (
        <video className="apod-video" src={apod.url} controls />
        ) : (
        <iframe
            className="apod-video"
            title={apod.title}
            src={apod.url}
            allowFullScreen
        />
        )}

        <p className="apod-explanation">{apod.explanation}</p>
        {apod.fact && <p className="apod-fact">{apod.fact}</p>}
        {apod.copyright && <p className="apod-credit">© {apod.copyright}</p>}

            <FavouriteButton
            picture={{
                title:apod.title,
                url:apod.url,
                explanation:apod.explanation,
                date:apod.date,
                source:"apod",
                mediaType:apod.mediaType,
                sourceId:apod.date,
            }}
            token={token}
        />
    </section>
    );
}

export default PictureOfTheDay;
