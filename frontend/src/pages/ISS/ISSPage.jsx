import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Chatbot } from "../../components/Chatbot";
import "../../Hud.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

export function ISSPage() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const fetchLocation = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await fetch(`${BACKEND_URL}/iss`);
            const data = await response.json();
            setLocation(data.iss_position);
        }   catch (err) {
            setError("Failed to fetch ISS location");
        }   finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocation();
        const interval = setInterval(() => fetchLocation(false), 10000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                console.error("Could not get user location", err);
            }
        );

        return () => clearInterval(interval);
    }, []);

    if (loading) return <p className="iss-status">Locating the ISS...</p>;
    if (error) return <p className="iss-status">{error}</p>;
    if (!location) return null;

    return (
        <div className="iss-page">
            <header className="iss-header">
                <h1 className="iss-title">🛰️ International Space Station Tracker</h1>
                <p className="iss-intro">Follow the ISS in real time and see how far it is from your location.</p>
            </header>
            <div className="iss-main">
                <div className="hud-panel iss-tracker">
                    <div className="hud-panel-header">
                        <span>FEED 02 · ISS LIVE TRACKER</span>
                        <span className="date">● LIVE</span>
                    </div>

                    <div className="hud-panel-body">
                        <div className="telemetry-panel">
                            <div className="telemetry-row">
                                <span>LATITUDE</span>
                                <span className="value">{location.latitude}</span>
                            </div>
                            <div className="telemetry-row">
                                <span>LONGITUDE</span>
                                <span className="value">{location.longitude}</span>
                            </div>
                            {userLocation ? (
                                <div className="telemetry-row">
                                    <span>DISTANCE FROM YOU</span>
                                    <span className="value signal">
                                        {calculateDistance(
                                            userLocation.latitude,
                                            userLocation.longitude,
                                            location.latitude,
                                            location.longitude
                                        )} mi
                                    </span>
                                </div>
                            ) : (
                                <p className="iss-location-prompt">
                                    📍 Share your location to see how far you are from the ISS!
                                </p>
                            )}
                        </div>

                        <button className="hud-button" onClick={fetchLocation}>
                            ⟳ Refresh Location
                        </button>

<div className="iss-map">
                            <MapContainer
                                center={[location.latitude, location.longitude]}
                                zoom={3}
                                style={{ height: "400px", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="© OpenStreetMap contributors"
                                />
                                <Marker position={[location.latitude, location.longitude]}>
                                    <Popup>The ISS is here! 🛸</Popup>
                                </Marker>
                                {userLocation && (
                                    <Marker position={[userLocation.latitude, userLocation.longitude]}>
                                        <Popup>You are here! 📍</Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                <div className="hud-sidebar">
                    <Chatbot />
                    <p className="iss-disclaimer">
                        🛸 Rover's knowledge has a cutoff date and may not reflect current ISS crew or recent missions. Always verify with NASA for the latest information.
                    </p>
                </div>
            </div>
        </div>
    );
}