import { useState } from "react";

export default function AstronomyPage() {
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
    const [chart, setChart] = useState(null);

    const getAstronomyData = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/astronomy/star-chart?lat=${lat}&lon=${lon}`, {
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
            <input
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
            />
            <button onClick={getAstronomyData}>
                See My Sky
            </button>

            {chart && (
                <div>
                    <h3>Your Star Chart:</h3>
                    <img src={chart} alt="Astronomy star chart" />
                </div>
            )}
        </div>
    );
}