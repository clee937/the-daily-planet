import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Chatbot } from "../../components/Chatbot";

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
        },      []);

        if (loading) return <p>Locating the ISS...</p>;
        if (error) return <p>{error}</p>;
        if (!location) return null;

        return (
            <div>
                <h1>ISS Live Tracker</h1>
                <p>Latitude: {location.latitude}</p>
                <p>Longitude: {location.longitude}</p>
                <button onClick={fetchLocation}>Refresh Location</button>

                {userLocation ? (
                    <p>📍 You are approximately {calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        location.latitude,
                        location.longitude
                    )} miles from the ISS!</p>
                ) : (
                    <p>📍 Share your location to see how far you are from the ISS!</p>
                )}

                <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={3}
                    style={{ height: "500px", width: "100%" }}
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
                <p><small>🛸 Rover's knowledge has a cutoff date and may not reflect current ISS crew or recent missions. Always verify with NASA for the latest information.</small></p>
                <Chatbot />
            </div>
    );
}

