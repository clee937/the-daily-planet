import { useState } from "react";
import { sendMessage } from "../services/gemini";
import { Link } from "react-router-dom";

export function Chatbot() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


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
            const answer = await sendMessage(prompt, token);
            setMessages((messages) => [...messages, { role: "rover", text: answer }]);
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
            <form onSubmit={handleSubmit}>
                <input
                    value={prompt}
                    onChange={(event) => {
                        setPrompt(event.target.value);
                        setError(null);
                    }}
                    placeholder="Ask Rover about space..."
                />
                <button type="submit" disabled={loading}>
                    Send
                </button>
            </form>
        </div>
    )
}

