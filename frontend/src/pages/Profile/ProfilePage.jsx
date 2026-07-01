import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, editUser, deleteUser, checkEmail } from "../../services/users";
import { toast } from "react-toastify";
import "../../Hud.css";

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

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        getUser(token)
            .then((data) => setUser(data.user))
            .catch((err) => console.error(err));
    }, [navigate, token]);

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
        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
        try {
            await editUser(token, { password });
            setMessage("Password updated successfully!");
            toast.success("Password updated successfully! ✏️")
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
            toast.success("Email updated successfully! ✏️");
        } catch (err) {
            setMessage("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsEditingEmail(false);
        }
    }

    async function handleDelete() {
        try {
            await deleteUser(token);
            localStorage.removeItem("token");
            toast.success("Account successfully deleted 👋");
            navigate("/");
        } catch (err) {
            setMessage("Could not delete account. Please try again.");
            console.error(err);
        }
    }

    return (
        <section className="profile-page">
            <h2 className="profile-title">Your Profile</h2>

            {message && <p className="profile-message">{message}</p>}

            {user && (
                <div className="profile-panel hud-panel">
                    {/* Username */}
                    <div className="profile-row">
                        <div className="profile-field-info">
                            <span className="profile-label">Username</span>
                            <span className="profile-value">{user.username}</span>
                        </div>
                    </div>

                    {/* Email */}
                    {isEditingEmail ? (
                        <div className="profile-row profile-row-editing">
                            <div className="profile-field-info profile-field-full">
                                <span className="profile-label">Email</span>
                                <span className="profile-value">{user.email}</span>
                                <form onSubmit={handleEmailEdit} className="profile-form">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="profile-input"
                                        placeholder="New email"
                                    />
                                    <div className="profile-buttons">
                                        <button type="submit" className="hud-button">Save</button>
                                        <button type="button" className="hud-button-secondary" onClick={() => {
                                            setIsEditingEmail(false);
                                            setEmail("");
                                            setMessage("");
                                        }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-row">
                            <div className="profile-field-info">
                                <span className="profile-label">Email</span>
                                <span className="profile-value">{user.email}</span>
                            </div>
                            <button className="hud-button-secondary" onClick={() => setIsEditingEmail(true)}>Edit</button>
                        </div>
                    )}

                    {/* Password */}
                    {isEditingPassword ? (
                        <div className="profile-row profile-row-editing">
                            <div className="profile-field-info profile-field-full">
                                <span className="profile-label">Password</span>
                                <span className="profile-value">🌑🌒🌓🌔🌕🌖🌗🌘🌑</span>
                                <form onSubmit={handlePasswordEdit} className="profile-form">
                                    <label htmlFor="password" className="profile-sublabel">New Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="profile-input"
                                    />
                                    <label htmlFor="confirmPassword" className="profile-sublabel">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="profile-input"
                                    />
                                    <div className="profile-buttons">
                                        <button type="submit" className="hud-button">Save</button>
                                        <button type="button" className="hud-button-secondary" onClick={() => {
                                            setIsEditingPassword(false);
                                            setPassword("");
                                            setConfirmPassword("");
                                            setMessage("");
                                        }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-row">
                            <div className="profile-field-info">
                                <span className="profile-label">Password</span>
                                <span className="profile-value">🌑🌒🌓🌔🌕🌖🌗🌘🌑</span>
                            </div>
                            <button className="hud-button-secondary" onClick={() => setIsEditingPassword(true)}>Edit</button>
                        </div>
                    )}
                </div>
            )}

            <div className="profile-danger">
                <button className="hud-button-danger" onClick={() => setShowDeleteConfirm(true)} disabled={showDeleteConfirm}>Delete Account</button>

                {showDeleteConfirm && (
                    <div className="profile-confirm">
                        <p>Are you sure you want to delete your account? You will lose your favourites.</p>
                        <div className="profile-buttons">
                            <button className="hud-button-danger" onClick={handleDelete}>Yes, delete</button>
                            <button className="hud-button-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}