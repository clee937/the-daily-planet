import { useState, useEffect } from "react";
import "./AstronomyPage.css";

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

    // Function to find user's CURRENT LOCATION:
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

    // Function to calculate DIRECTION of visible objects:
    const getDirection = (azimuth) => {
        const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
        return directions[Math.round(azimuth / 45) % 8];
    }

    // Function to call VISIBLE OBJECTS route:
    const getVisibleObjects = async (lat, lon) => {
        const response = await fetch(`http://localhost:3000/api/astronomy/visible-objects?lat=${lat}&lon=${lon}&date=${visibleObjectsDate}`);
        
        if (!response.ok) {
            console.error("Failed to fetch visible objects");
            return;
        }

        const data = await response.json();
        setVisibleObjects(data);
    };

    // Function to call MOON PHASE route:
    const getMoonPhase = async () => {
        if (lat === null || lon === null) {
            alert("Location is required.");
            return;
        }

        try {
            setMoonLoading(true);
            const response = await fetch(
                "http://localhost:3000/api/astronomy/moon-phase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        date: moonDate,
                        latitude: lat,
                        longitude: lon
                    })
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

    // Function to call STAR CHART route:
    const getStarChart = async () => {
        try {
            setChart(null);
            setChartLoading(true);
            const response = await fetch(
                "http://localhost:3000/api/astronomy/star-chart",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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

    return(
        <div>
            {/* VISIBLE OBJECTS */}
            <h2>✨ What`s in the Sky Tonight?</h2>
            <p className="superman"><em>`Is it a bird? Is it a plane?`</em></p>
            <p>Use your current location to discover what`s visible in the sky tonight.</p>
            <p>🔭 <em>Visible objects calculated for 22:00 local time.</em></p>
            <input
                type="date"
                value={visibleObjectsDate}
                onChange={(event) => setVisibleObjectsDate(event.target.value)}
            />
            <br></br>
            <br></br>
            <button onClick={getCurrentLocation}>Refresh Location</button>
            {lat !== null && lon !== null && (
                <p>📍 <em>Current location:</em> {`[Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}]`}</p>
            )}
            {locationError && <p>{locationError}</p>}
            {visibleObjects.length > 0 && (
                <div>
                    <ul className="astronomy-grid">
                        {visibleObjects.map((object) => (
                            <div
                            key={object.name} className="astronomy-card"
                            >
                                <h3>
                                    {object.type === "Natural Satellite" ? "🌙" : "🪐"}
                                    {" "}
                                    {object.name}
                                </h3>
                                <p className="card-details">
                                    🧭 Direction: {getDirection(object.azimuth)}
                                    {" "}
                                    ({object.azimuth.toFixed(0)}°)
                                </p>
                                <p className="card-details">
                                    ⬆️ Height: {object.altitude.toFixed(1)}° above horizon
                                </p>
                            </div>
                        ))}
                    </ul>
                </div>
            )}

            {/* MOON PHASE */}
            <h2>🌒 Moon Phase Explorer</h2>
            <p>Use your current location to see what phase the moon will be in on a day of your choice.</p>
            <input
                type="date"
                value={moonDate}
                onChange={(event) => setMoonDate(event.target.value)}
            />
            <button onClick={getMoonPhase} disabled={moonLoading}>{moonLoading ? "Fetching..." : "Explore Moon Phase"}</button>
            {moonLoading && (
                <p>🛰️ Fetching moon phase, please standby...</p>
            )}
            <br></br>
            <br></br>
            {moonImage && (
                <div>
                    <img src={moonImage} alt="Moon phase" />
                </div>
            )}

            {/* STAR CHART */}
            <h2>🌌 Constellation Explorer</h2>
            <p>Choose a constellation from the options below to view it`s star chart.</p>
            <select
                value={constellation}
                onChange={(event) => setConstellation(event.target.value)}
            >
                <option value={"uma"}>Ursa Major</option>
                <option value={"umi"}>Ursa Mainor</option>
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
            <button onClick={getStarChart} disabled={chartLoading}>{chartLoading ? "Generating..." : "Generate Star Chart"}</button>
            {chartLoading && (
                <p>🛰️ Generating star chart, please standby...</p>
            )}
            <br></br>
            <br></br>
            {chart && (
                <div>
                    <img src={chart} alt="Astronomy star chart" />
                </div>
            )}
            <br></br>
            <br></br>
        </div>
    );
}
