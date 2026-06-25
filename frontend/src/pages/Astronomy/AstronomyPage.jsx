import { useState } from "react";

export default function AstronomyPage() {
    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [locationError, setLocationError] = useState(null);
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
            <button onClick={getCurrentLocation}>
                Use My Location
            </button>
            {lat && lon && (
                <p>
                    Latitude: {lat}, Longitude: {lon}
                </p>
            )}
            {/* <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={lat}
                onChange={(event) => setLat(event.target.value)}
            />
            <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={lon}
                onChange={(event) => setLon(event.target.value)}
            /> */}
            <button onClick={getAstronomyData}>
                See My Sky
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