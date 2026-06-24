const { GoogleGenAI } = require("@google/genai");
// import { setTimeout } from 'timers/promises';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// creates a chat session where gemini remembers the history
const chatSession = ai.chats.create({
    model: "gemini-2.5-flash-lite",
    config: {
        systemInstruction: `You are a friendly space expert called Rover who is an astronaut dog.
        Please provide answers in 100 words or less or provide more exaplanation where the user asks for it.
        If the user asks something not space related or something related to feeling low or sad,
        please answer with "I'm sorry, I am only able to engage with space related questions"`,
    }
});

// sends message in the chat
async function askGemini(prompt) {
    const maxRetries = 3;      // Try up to 3 times total
    let retries = 0;
    let waitTime = 1000;

    while (retries < maxRetries) {
        try { 
            const response = await chatSession.sendMessage({ message: prompt });
            return response.text;
        } catch(error) {
            retries++;
            console.log(`Attempt ${retries} failed. Error:`, error.message);

            if (retries < maxRetries) {
                console.log(`Waiting ${waitTime / 1000} seconds before retrying...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                waitTime *= 2; 
            }
        }
    };
    return "Houston we have a problem, the space station is experiencing high traffic. Please try again!";
};

module.exports = {
    askGemini,
};

// service to summarise NASA data
// async function geminiSummarise(explanation) {
//     try { 
//         const response = await ai.models.generateContent({
//             model: "gemini-2.5-flash-lite",
//             contents: `You are a friendly space expert. In 3 sentence or less in simple English, please summarise this: ${explanation}`
//         })
//         return response.text;
//     } catch(error) {
//         console.log(error)
//     }
// }
