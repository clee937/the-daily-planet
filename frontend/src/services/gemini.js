// something like this for connecting to backend service for gemini
// export async function createPost(message, token) {
//   const response = await fetch(`${BACKEND_URL}/posts`,{
//     method: "POST",
//     headers:{
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ message }),
//   });
//   if (response.status !== 201) {
//     throw new Error("Unable to create post");
//   }
//   return await response.json();

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
    if (response.status !== 200) {
        const data = await response.json();
        throw new Error(data.prompt || "Something went wrong");
    }
    const data = await response.json();
    return data.answer;
}