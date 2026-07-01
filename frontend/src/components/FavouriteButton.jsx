import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BACKEND_URL;

//user must be logged in to favourite an image
function FavouriteButton({ picture }) {
    const location = useLocation();
    const [saved, setSaved] = useState(false);  //tracking if the post has been saved, a save is in progress, and errors
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [favouriteId, setFavouriteId] = useState(null);
    const { isLoggedIn } = useOutletContext();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!isLoggedIn) {
                    setSaved(false);
                    setError(null);
                    setFavouriteId(null);
                }
            }, [isLoggedIn]);

    useEffect(() => {
    async function checkIfSaved() {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/favourites`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            const existing = data.favourites.find(
                (fav) => fav.sourceId === picture.sourceId
            );
            if (existing) {
                setSaved(true);
                setFavouriteId(existing._id);
            }
        } catch (err) {
            console.error("Could not check favourites", err);
        }
    }
    checkIfSaved();
}, [token, picture.sourceId]);

    async function handleSave() {
    if (!token) {
        setSaved(false);
        setError("You must be logged in to use this feature"); //message to non-logged in users
        return;
    }

    setSaving(true);
    setError(null);
    try {
        const res = await fetch(`${API_URL}/favourites`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, //without the token the request is rejected as unauthenticated
        },
        body: JSON.stringify({
            title: picture.title,
            imageUrl: picture.url,
            explanation: picture.explanation,
            date: picture.date,
            source: picture.source,        // source agnostic
            mediaType: picture.mediaType,
            sourceId: picture.sourceId,     //teh date or nasaId
        }),
        });

        const data = await res.json();

        if (res.status === 409) { // checks for duplicate handling. 409 returns if the item has already been favourited
            setSaved(true);       // clicking on fav button when already fav'd doesn't cause an error
            setFavouriteId(data.favourite._id); //capture id when already saved
        } else if (!res.ok) {
        throw new Error("Could not save favourite");
        } else {
        setSaved(true);
        setFavouriteId(data.favourite._id); //captrue id on a fresh save
        toast.success("Added to favourites ⭐");
        }
    } catch (err) {
    setError(err.message);
    } finally {
    setSaving(false);
    }
}

    async function handleRemove() {
        if (!favouriteId) return;

        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/favourites/${favouriteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Could not remove favourite");
            setSaved(false);
            setFavouriteId(null);
            toast.success("Removed from favourites");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

return (
    <div className="favourite">
        <button
            className="hud-button"
            onClick={saved ? handleRemove : handleSave } //toggled between save and remove
            disabled={saving} // removed || so the buttin stays clickable when saved
            data-testid="favourite-button"
        >
        {saved ? "★ Saved" : saving ? "Saving…" : "☆ Save to favourites"}
        </button>

        {error && (
            <div>
                <p style= {{ color: "red" }}>
                    {error} <Link to="/signup">Sign up</Link> or {" "}
                    <Link to="/login" state={{ from: location.pathname }}>Log in</Link>
                </p>
            </div>
        )}
        </div>
    );
}    

export default FavouriteButton;