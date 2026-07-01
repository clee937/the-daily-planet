import { useState, useEffect } from "react";
import { sendMessage } from "../services/gemini";
import { Link, useLocation } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function Chatbot() {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messagesRemaining, setMessagesRemaining] = useState(10);
    const [minutesUntilReset, setMinutesUntilReset] = useState(0);

    useEffect(() => {
        const fetchStatus = async () => {
            const token = localStorage.getItem("token");

            if (!token) return;

            const response = await fetch(
                `${BACKEND_URL}/api/ai/chat-status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await response.json();
            setMessagesRemaining(data.messagesRemaining);
            setMinutesUntilReset(data.minutesUntilReset);
        };

        fetchStatus();
    }, []);

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
                            <> <Link to="/signup">Sign up</Link> or <Link to="/login" state={{ from: location.pathname }}>Log in</Link></>
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
            {token && (messagesRemaining > 0 ? (
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
                <button type="submit" disabled={loading || messagesRemaining === 0}>
                    Send
                </button>
            </form>
        </div>
    )
}

