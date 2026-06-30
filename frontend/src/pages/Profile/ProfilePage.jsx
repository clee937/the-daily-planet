import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, editUser, deleteUser, checkEmail } from "../../services/users";

export function ProfilePage() {
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

    async function handlePasswordEdit(event) {
        event.preventDefault();
        if (password.length < 8) {
            setMessage("Password must be at least 8 characters!");
            return;
        }

        if (!/[!@#$%^&*]/.test(password)) {
            setMessage("Password must contain at least one special character (! @ # $ % ^ & *)");
            return;
        }

        // Check passwords match before submitting
        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
        try {
            await editUser(token, { password });
            setMessage("Password updated successfully!");
        } catch (err) {
            setMessage("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsEditingPassword(false);
        }
    }

    async function handleEmailEdit(event) {
        event.preventDefault();
        
        try {
            const isTaken = await checkEmail(email);
            if (isTaken) {
                setMessage("This email is already taken!");
                return;
            }
            await editUser(token, { email });
            setUser((prev) => ({ ...prev, email }));
            setMessage("Email updated successfully!");
        } catch (err) {
            setMessage("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsEditingEmail(false);
        }
    }

    async function handleDelete() {
        // need a warning to show (not an alert but an inline error message)
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

            {message && <p>{message}</p>}

            {user && (
                <div>
                    <p>Username: {user.username}</p>

                    {/* Email field */}
                    <div>
                        {isEditingEmail ? (
                            <>
                                <p>Email: {user.email}</p>
                                <form onSubmit={handleEmailEdit}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => {
                                        setIsEditingEmail(false);
                                        setEmail("");
                                        setMessage("");
                                    }}>Cancel</button>
                                </form>
                            </>
                        ) : (
                            <>
                                <p>Email: {user.email}</p>
                                <button onClick={() => setIsEditingEmail(true)}>Edit</button>
                            </>
                        )}
                    </div>

                    {/* Password field */}
                    <div>
                        {isEditingPassword ? (
                            <>
                                <p>Password: 🌑🌒🌓🌔🌕🌖🌗🌘🌑</p>
                                <form onSubmit={handlePasswordEdit}>
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
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => {
                                        setIsEditingPassword(false);
                                        setPassword("");
                                        setConfirmPassword("");
                                        setMessage("");
                                    }}>Cancel</button>
                                </form>
                            </>
                        ) : (
                            <>
                                <p>Password:  🌑🌒🌓🌔🌕🌖🌗🌘🌑</p>
                                <button onClick={() => setIsEditingPassword(true)}>Edit</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <button onClick={() => setShowDeleteConfirm(true)} disabled={showDeleteConfirm}>Delete Account</button>

            {showDeleteConfirm && (
                <div>
                    <p>Are you sure you want to delete your account? You will lose your APOD favourites.</p>
                    <button onClick={handleDelete}>Yes</button>
                    <button onClick={() => setShowDeleteConfirm(false)}>No</button>
                </div>
            )}
        </>
    );
}
