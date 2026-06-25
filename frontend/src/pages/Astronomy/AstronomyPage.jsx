import { useState, useEffect } from "react";
import "./AstronomyPage.css";

export default function AstronomyPage() {
    const [locationError, setLocationError] = useState(null);
    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [visibleObjects, setVisibleObjects] = useState([]);
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
        if (lat !== null && lon !== null) {
            getVisibleObjects(lat, lon);
        }
    }, [lat, lon]);

    // Function to calculate DIRECTION of visible objects:
    const getDirection = (azimuth) => {
        const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
        return directions[Math.round(azimuth / 45) % 8];
    }

    // Function to call VISIBLE OBJECTS route:
    const getVisibleObjects = async (lat, lon) => {
        const response = await fetch(`http://localhost:3000/api/astronomy/visible-objects?lat=${lat}&lon=${lon}&date=${selectedDate}`);
        const data = await response.json();
        setVisibleObjects(data);
    };

    // Function to call STAR CHART route:
    const getAstronomyData = async () => {

        try {
            setChart(null);
            setLoading(true);
            const response = await fetch(
                `http://localhost:3000/api/astronomy/star-chart`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({constellation})
                });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server Error:", errorData);
                return;
            }

            const data = await response.json();
            console.log("Success:", data);
            setChart(data.data.imageUrl);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div>
            {/* VISIBLE OBJECTS */}
            <h2>🌙 What`s in the Sky?</h2>
            <p>Use your current location to discover what`s visible in the night sky on a day of your choosing.</p>
            <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
            />
            <button onClick={getCurrentLocation}>Use My Location</button>
            <br></br>
            <br></br>
            {lat !== null && lon !== null && (
                <p><em>Your location:</em> {`[Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}]`}</p>
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

            {/* STAR CHART */}
            <h2>✨ Browse Star Charts</h2>
            <p>Choose a constellation from the options below to view it`s star chart.</p>
            <select
                value={constellation}
                onChange={(event) => setConstellation(event.target.value)}
            >
                <option value={"uma"}>Usra Major</option>
                <option value={"ori"}>Orion</option>
                <option value={"cas"}>Cassiopeia</option>
                <option value={"cyg"}>Cygnus</option>
                <option value={"leo"}>Leo</option>
            </select>
            <button onClick={getAstronomyData} disabled={loading}>{loading ? "Generating..." : "Generate Star Chart"}</button>
            {loading && (
                <p>🌌 Generating star chart, please standby...</p>
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