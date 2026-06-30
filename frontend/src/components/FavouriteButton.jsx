import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

//user must be logged in to favourite an image
function FavouriteButton({ picture }) {
    const [saved, setSaved] = useState(false);  //tracking if the post has been saved, a save is in progress, and errors
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { isLoggedIn } = useOutletContext();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!isLoggedIn) {
                    setSaved(false);
                    setError(null);
                }
            }, [isLoggedIn]);

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

        if (res.status === 409) { // checks for duplicate handling. 409 returns if the item has already been favourited
            setSaved(true);       // clicking on fav button when already fav'd doesn't cause an error
        } else if (!res.ok) {
        throw new Error("Could not save favourite");
        } else {
        setSaved(true);
        }
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
            onClick={handleSave}
            disabled={saving || saved}
            data-testid="favourite-button"
        >
        {saved ? "★ Saved" : saving ? "Saving…" : "☆ Save to favourites"}
        </button>

        {error && (
            <div>
                <p style= {{ color: "red" }}>
                    {error} <Link to="/signup">Sign up</Link> or {" "}
                    <Link to="/login">Log in</Link>
                </p>
            </div>
        )}
        </div>
    );
}    

export default FavouriteButton;