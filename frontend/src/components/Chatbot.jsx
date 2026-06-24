import { useState } from "react";
import { sendMessage } from "../services/gemini";
import { useNavigate } from "react-router-dom";

export function Chatbot() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
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
            // navigate("/login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
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
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Ask Rover about space..."
                />
                <button type="submit" disabled={loading}>
                    Send
                </button>
            </form>
        </div>
    )
}