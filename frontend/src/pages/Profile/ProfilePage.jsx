import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, editUser, deleteUser } from "../../services/users";

export function ProfilePage() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Load user details when page opens
    useEffect(() => {
        if (!token) {
        navigate("/login");
        return;
        }
        getUser(token)
        .then((data) => setUser(data.user))
        .catch((err) => console.error(err));
    },[navigate, token]);

    async function handleEdit(event) {
    event.preventDefault();
    
    // Check passwords match before submitting
    if (password !== confirmPassword) {
        setMessage("Passwords do not match!");
        return;
    }

    try {
        await editUser(token, { email, password });
        setMessage("Details updated successfully!");
    } catch (err) {
        setMessage("Something went wrong. Please try again.");
        console.error(err);
    }
}

    async function handleDelete() {
        try {
        await deleteUser(token);
        localStorage.removeItem("token");
        navigate("/");
        } catch (err) {
        setMessage("Could not delete account. Please try again.");
        console.error(err);
        }
    }

    return (
        <>
        <h2>Your Profile</h2>

        {user && (
            <div>
            <p>Email: {user.email}</p>
            <p>Username: {user.username}</p>
            </div>
        )}

        <h3>Edit Details</h3>
        <form onSubmit={handleEdit}>
            <label htmlFor="email">New Email:</label>
            <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">New Password:</label>
            <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input type="submit" value="Update" />
        </form>

        {message && <p>{message}</p>}

        <button onClick={handleDelete}>Delete Account</button>
        </>
    );
}