const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function sendMessage(prompt, token) {
    const response = await fetch(`${BACKEND_URL}/api/ai/chat`,{
        method: "POST",
        headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
    }
    const data = await response.json();
    return data.answer;
}