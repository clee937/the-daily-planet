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
        <div className="chat-panel">
            <div className="chat-header">
                <span className="hud-dot"></span>
                <span>ROVER // COMMS CHANNEL OPEN</span>
            </div>

            <div className="chat-body">
                {error && (
                    <p className="chat-error">
                        {error}
                        {error === "You must be logged in to use this feature." && (
                            <> <Link to="/signup">Sign up</Link> or <Link to="/login">Log in</Link></>
                        )}
                    </p>
                )}

                {messages.map((message, i) => (
                    message.role === "user" ? (
                        <div key={i} className="chat-user">
                            <span className="prompt">&gt;</span> {message.text}
                        </div>
                    ) : (
                        <div key={i} className="chat-rover">
                            <span className="name">ROVER:</span> {message.text}
                        </div>
                    )
                ))}

                {loading && <div className="chat-rover"><span className="name">ROVER:</span> thinking... 🚀</div>}
            </div>

            <form onSubmit={handleSubmit} className="chat-input">
                <span className="caret">&gt;</span>
                <input
                    value={prompt}
                    onChange={(event) => {
                        setPrompt(event.target.value);
                        setError(null);
                    }}
                    placeholder="Ask Rover about space..."
                    aria-label="Ask Rover a question"
                />
                <button type="submit" disabled={loading}>
                    Send
                </button>
            </form>
        </div>
    )
}