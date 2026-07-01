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
    <div className="hud-panel">
        <div className="hud-panel-header">
            <span>FEED 01 · ASTRONOMY PICTURE OF THE DAY</span>
            <span className="date">{apod.date}</span>
        </div>

        {apod.mediaType === "image" ? (
            <img className="apod-image" src={apod.url} alt={apod.title} />
        ) : apod.url.endsWith(".mp4") ? (
            <video className="apod-video" src={apod.url} controls />
        ) : (
            <iframe className="apod-video" title={apod.title} src={apod.url} allowFullScreen />
        )}

        <div className="hud-panel-body">
            <h2 className="apod-title">{apod.title}</h2>
            <p className="apod-explanation">{apod.explanation}</p>
            {apod.fact && (
                <div className="rover-panel">
                    <div className="rover-label">▸ DATA INSIGHT // ROVER</div>
                    <p className="rover-fact">{apod.fact}</p>
                </div>
)}
            {apod.copyright && <p className="apod-credit">SRC: NASA/JPL · © {apod.copyright}</p>}
        
    <FavouriteButton
        picture={{
            title: apod.title,
            url: apod.url,
            explanation: apod.explanation,
            date: apod.date,
            source: "apod",
            mediaType: apod.mediaType,
            sourceId: apod.date,
        }}
        token={token}
        />
    </div>
    </div>
);
}

export default PictureOfTheDay;
