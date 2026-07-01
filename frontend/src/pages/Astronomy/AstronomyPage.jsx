import { useState, useEffect } from "react";
import { Chatbot } from "../../components/Chatbot";
import "./AstronomyPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AstronomyPage() {
    const [locationError, setLocationError] = useState(null);
    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [visibleObjectsDate, setVisibleObjectsDate] = useState(new Date().toISOString().split("T")[0]);
    const [visibleObjects, setVisibleObjects] = useState([]);
    const [moonLoading, setMoonLoading] = useState(false);
    const [moonImage, setMoonImage] = useState(null);
    const [chart, setChart] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const [moonDate, setMoonDate] = useState(new Date().toISOString().split("T")[0]);
    const [constellation, setConstellation] = useState("uma");
    const [enlargedImage, setEnlargedImage] = useState(null);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLat(position.coords.latitude);
                setLon(position.coords.longitude);
                setLocationError(null);
            },
            (error) => {
                setLocationError(error.message);
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (lat !== null && lon !== null) {
            getVisibleObjects(lat, lon);
        }
    }, [lat, lon, visibleObjectsDate]);

    const getDirection = (azimuth) => {
        const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
        return directions[Math.round(azimuth / 45) % 8];
    }

    const getVisibleObjects = async (lat, lon) => {
        if (lat === null || lon === null) {
            alert("Location required");
            return;
        }
        const response = await fetch(`${BACKEND_URL}/api/astronomy/visible-objects?lat=${lat}&lon=${lon}&date=${visibleObjectsDate}`);
        if (!response.ok) {
            console.error("Failed to fetch visible objects");
            return;
        }
        const data = await response.json();
        setVisibleObjects(data);
    };

    const getMoonPhase = async () => {
        if (lat === null || lon === null) {
            alert("Location is required.");
            return;
        }
        try {
            setMoonLoading(true);
            const response = await fetch(
                `${BACKEND_URL}/api/astronomy/moon-phase`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: moonDate, latitude: lat, longitude: lon })
                }
            );
            const data = await response.json();
            if (!response.ok) {
                console.error(data);
                return;
            }
            setMoonImage(data.data.imageUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setMoonLoading(false);
        }
    };

    const getStarChart = async () => {
        try {
            setChart(null);
            setChartLoading(true);
            const response = await fetch(
                `${BACKEND_URL}/api/astronomy/star-chart`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ constellation })
                });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server Error:", errorData);
                return;
            }
            const data = await response.json();
            setChart(data.data.imageUrl);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setChartLoading(false);
        }
    };

    return (
        <div className="astronomy-page">
            <header className="astronomy-header">
                <h1 className="astronomy-title">🌍 Visible Objects Near You</h1>
                <p className="astronomy-intro">Use your current location to explore visible objects near you.</p>
                <button className="hud-button-secondary" onClick={getCurrentLocation}>⟳ Refresh Location</button>
                {lat !== null && lon !== null && (
                    <p className="astronomy-location">📍 Current location: [Lat: {lat.toFixed(2)}, Lon: {lon.toFixed(2)}]</p>
                )}
                {locationError && <p className="astronomy-error">{locationError}</p>}
            </header>

            <div className="astronomy-sections">
                {/* VISIBLE OBJECTS */}
                <section className="astronomy-section hud-panel">
                    <div className="hud-panel-header">
                        <span>✨ WHAT'S IN THE SKY TONIGHT?</span>
                    </div>
                    <div className="hud-panel-body">
                        <p className="astronomy-tagline">'Is it a bird? Is it a plane?'</p>
                        <p>Discover what will be visible in the night sky on a day of your choosing.</p>
                        <p className="astronomy-note">🔭 Visible objects calculated for 22:00 local time.</p>
                        <div className="astronomy-control">
                            <label htmlFor="visible-date">Select a date:</label>
                            <input id="visible-date" type="date" className="astronomy-input" value={visibleObjectsDate} onChange={(event) => setVisibleObjectsDate(event.target.value)} />
                        </div>
                        {visibleObjects.length > 0 && (
                            <ul className="astronomy-grid">
                                {visibleObjects.map((object) => (
                                    <li key={object.name} className="astronomy-card">
                                        <h3>{object.type === "Natural Satellite" ? "🌙" : "🪐"}{" "}{object.name}</h3>
                                        <p className="card-details">🧭 Direction: {getDirection(object.azimuth)} ({object.azimuth.toFixed(0)}°)</p>
                                        <p className="card-details">⬆️ Height: {object.altitude.toFixed(1)}° above horizon</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* MOON PHASE */}
                <section className="astronomy-section hud-panel">
                    <div className="hud-panel-header">
                        <span>🌒 MOON PHASE EXPLORER</span>
                    </div>
                    <div className="hud-panel-body">
                        <p>Discover what phase the Moon will be in on a day of your choosing.</p>
                        <div className="astronomy-control">
                            <label htmlFor="moon-date">Select a date:</label>
                            <input id="moon-date" type="date" className="astronomy-input" value={moonDate} onChange={(event) => setMoonDate(event.target.value)} />
                            <button className="hud-button" onClick={getMoonPhase} disabled={moonLoading}>{moonLoading ? "Fetching..." : "Explore Moon Phase"}</button>
                        </div>
                        {moonLoading && <p className="astronomy-note">🛰️ Fetching Moon phase, please standby...</p>}
                        {moonImage && (
                            <div className="astronomy-image">
                                <img src={moonImage} alt="Moon phase" onClick={() => setEnlargedImage(moonImage)} />
                            </div>
                        )}
                    </div>
                </section>

                {/* STAR CHART */}
                <section className="astronomy-section hud-panel">
                    <div className="hud-panel-header">
                        <span>🌌 CONSTELLATION EXPLORER</span>
                    </div>
                    <div className="hud-panel-body">
                        <p>Choose a constellation from the options below to view its star chart.</p>
                        <p className="astronomy-note">🔭 Star charts are generated from a fixed observation point in London, UK.</p>
                        <div className="astronomy-control">
                            <label htmlFor="constellation-select">Choose a constellation:</label>
                            <select id="constellation-select" className="astronomy-input" value={constellation} onChange={(event) => setConstellation(event.target.value)}>
                                <option value={"uma"}>Ursa Major</option>
                                <option value={"umi"}>Ursa Minor</option>
                                <option value={"ori"}>Orion</option>
                                <option value={"cas"}>Cassiopeia</option>
                                <option value={"cyg"}>Cygnus</option>
                                <option value={"leo"}>Leo</option>
                                <option value={"tau"}>Taurus</option>
                                <option value={"gem"}>Gemini</option>
                                <option value={"vir"}>Virgo</option>
                                <option value={"sco"}>Scorpius</option>
                                <option value={"sgr"}>Sagittarius</option>
                                <option value={"and"}>Andromeda</option>
                            </select>
                            <button className="hud-button" onClick={getStarChart} disabled={chartLoading}>{chartLoading ? "Generating..." : "Generate Star Chart"}</button>
                        </div>
                        {chartLoading && <p className="astronomy-note">🛰️ Generating star chart, please standby...</p>}
                        {chart && (
                            <div className="astronomy-image">
                                <img src={chart} alt="Astronomy star chart" onClick={() => setEnlargedImage(chart)} />
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <p className="astronomy-note astronomy-credit">🔭 Data provided by AstronomyAPI.</p>

            <div className="astronomy-chat">
                <Chatbot />
                <p className="astronomy-note">🛸 Rover's knowledge has a cutoff date and may not reflect current space news. Always verify with NASA for the latest information.</p>
            </div>

            {/* Enlarge modal */}
            {enlargedImage && (
                <div className="favourite-modal-overlay" onClick={() => setEnlargedImage(null)}>
                    <div className="favourite-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="favourite-modal-close" onClick={() => setEnlargedImage(null)} aria-label="Close">✕</button>
                        <img className="favourite-modal-image" src={enlargedImage} alt="Enlarged view" />
                    </div>
                </div>
            )}
        </div>
    );
}