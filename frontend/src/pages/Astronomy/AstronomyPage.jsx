import { useState, useEffect } from "react";

import "./AstronomyPage.css";

export default function AstronomyPage() {
    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [visibleObjects, setVisibleObjects] = useState([]);
    const [chart, setChart] = useState(null);

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

    const getVisibleObjects = async (lat, lon) => {
        const res = await fetch(
            `http://localhost:3000/api/astronomy/visible-objects?lat=${lat}&lon=${lon}`
        );

        const data = await res.json();

        console.log("Visible objects:", data);

        setVisibleObjects(data);
    };

    const getAstronomyData = async () => {
        if (lat === null || lon === null) {
            alert("Please select your location first.");
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:3000/api/astronomy/star-chart?lat=${lat}&lon=${lon}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server Error:", errorData);
                return;
            }

            const data = await res.json();
            console.log("Success:", data);
            setChart(data.data.imageUrl);
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    return(
        <div>
            <h2>
                Visible Tonight
            </h2>
            <p>
                Use your current location to discover what`s visible in the night sky right now.
            </p>
            <button onClick={getCurrentLocation}>
                Use My Location
            </button>
            <br></br>
            <br></br>

            {visibleObjects.length > 0 && (
                <div>
                    <ul className="visible-objects-list">
                        {visibleObjects.map((object) => (
                            <li key={object.name}>
                                {object.type === "Natural Satellite" ? "🌙" : "🪐"}
                                {" "}
                                {object.name}
                                {": "}
                                {object.altitude.toFixed(1)}° above the horizon
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {lat !== null && lon !== null && (
                <p>
                    <em>Your location:</em> {`[Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}]`}
                </p>
            )}
            <button onClick={getAstronomyData}>
                Generate Star Chart
            </button>

            {locationError && <p>{locationError}</p>}

            {chart && (
                <div>
                    <h3>Your Star Chart:</h3>
                    <img src={chart} alt="Astronomy star chart" />
                </div>
            )}
        </div>
    );
}