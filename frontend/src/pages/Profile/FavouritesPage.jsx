import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export function FavouritesPage() {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
    async function fetchFavourites() {
        try {
        const res = await fetch(`${API_URL}/favourites`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load your favourites...🚀");
        const data = await res.json();
        setFavourites(data.favourites);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    }
    fetchFavourites();
    }, [token]);

    async function handleRemove(id) {
    try {
        const res = await fetch(`${API_URL}/favourites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not remove favourite...🚀");
        setFavourites((current) => current.filter((fav) => fav._id !== id));
    } catch (err) {
        setError(err.message);
    }
    }

    if (loading) return <p>Loading your favourites…</p>;
    if (error) return <p>{error}</p>;

    if (favourites.length === 0) {
    return (
        <section className="favourites-page">
        <h2>My Favourites</h2>
        <p>There are no saved pictures yet... 🚀 </p>
        </section>
    );
    }

    return (
    <section className="favourites-page">
        <h2>My Favourites</h2>
        <div className="favourites-grid">
        {favourites.map((fav) => (
            <div className="favourite-card" key={fav._id}>
            <img className="favourite-image" src={fav.imageUrl} alt={fav.title} />
            <p className="favourite-title">{fav.title}</p>
            <button
                className="favourite-remove"
                onClick={() => handleRemove(fav._id)}
                data-testid="remove-favourite"
            >
                Remove
            </button>
            </div>
        ))}
        </div>
    </section>
    );
}