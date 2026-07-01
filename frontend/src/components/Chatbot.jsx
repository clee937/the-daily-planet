import { useState, useEffect } from "react";
import { sendMessage } from "../services/gemini";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function Chatbot() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messagesRemaining, setMessagesRemaining] = useState(10);
    const [minutesUntilReset, setMinutesUntilReset] = useState(0);
    const outletContext = useOutletContext();
    const noop = () => {};
    const setIsLoggedIn = outletContext?.setIsLoggedIn ?? noop;
    const isLoggedIn = outletContext?.isLoggedIn ?? false;

    useEffect(() => {
        const fetchStatus = async () => {
            const token = localStorage.getItem("token");

            if (!token) return;

            const response = await fetch(
                `${BACKEND_URL}/api/ai/chat-status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                toast.info(<>Your session has expired.<br/>Please log in again.</>);
                return;
            }

            const data = await response.json();
            setMessagesRemaining(data.messagesRemaining);
            setMinutesUntilReset(data.minutesUntilReset);
        };

        fetchStatus();
    }, [setIsLoggedIn]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expiresAt = payload.exp * 1000;
            const timeout = expiresAt - Date.now();

            if (timeout > 0) {
                const timer = setTimeout(() => {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    setMessagesRemaining(10);
                    setMinutesUntilReset(0);
                    toast.info(<>Your session has expired.<br/>Please log in again.</>);
                }, timeout);

                return () => clearTimeout(timer);
            }
        } catch (err) {
            console.error("Invalid token:", err);
        }
    }, [setIsLoggedIn]);

    async function handleSubmit(event) {
        event.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in to use this feature.")
            return;
        }

        //prevents empty prompts
        if (!prompt.trim()) return;

        const userMessage = { role: "user", text: prompt };
        setMessages((messages) => [...messages, userMessage]);
        setPrompt(""); // sets the value of the input back to blank
        setLoading(true);

        try {            
            const response = await sendMessage(prompt, token);
            setMessages((messages) => [...messages, { role: "rover", text: response.answer }]);
            setMessagesRemaining(response.messagesRemaining);
            setMinutesUntilReset(response.minutesUntilReset);
        } catch (err) {
            console.error(err);

            if (err.message === "You must be logged in to use this feature.") {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setMessagesRemaining(10);
                setMinutesUntilReset(0);
                toast.info(<>Your session has expired.<br/>Please log in again.</>);
                return;
            }
            setError(err.message);
            // setMessages((messages) => [...messages, { role: "rover", text: err.message }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {error && (
                <div>
                    <p style={{ color: "red" }}>
                        {error}
                        {error === "You must be logged in to use this feature." && (
                            <> <Link to="/signup">Sign up</Link> or <Link to="/login">Log in</Link></>
                        )}
                    </p>
                </div>
            )}
            <div className="message-list">
                {messages.map((message, i) => (
                <div key={i} className={`message ${message.role}`}>
                    <p>{message.role === "user" ? "You" : "Rover"}:</p> {message.text}
                </div>
                ))}
                {loading && <p>Rover is thinking... 🚀</p>}
            </div>
            {isLoggedIn && (messagesRemaining > 0 ? (
                <p><small>{messagesRemaining} of 10 messages remaining this hour.</small></p>
            ) : (
                <p className="warning"><small><strong>You've reached your hourly limit of 10 messages. Please try again in {minutesUntilReset} minute{minutesUntilReset !== 1 ? "s" : ""}.</strong></small></p>
            ))}
            <form onSubmit={handleSubmit}>
                <input
                    value={prompt}
                    onChange={(event) => {
                        setPrompt(event.target.value);
                        setError(null);
                    }}
                    placeholder="Ask Rover about space..."
                />
                <button type="submit" disabled={!isLoggedIn || loading || messagesRemaining === 0}>
                    Send
                </button>
            </form>
        </div>
    )
}

