import { sendMessage } from "../../src/services/gemini";
import createFetchMock from "vitest-fetch-mock";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

describe("sendMessage", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("returns data on a successful response", async () => {
        const mockResponse = { answer: "The sun is very big!" };
        fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

        const result = await sendMessage("How big is the sun?", "fake-token");

        expect(result).toEqual(mockResponse);
        expect(fetchMock).toHaveBeenCalledWith(`${BACKEND_URL}/api/ai/chat`, {
            method: "POST",
            headers: {
                Authorization: "Bearer fake-token",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: "How big is the sun?" }),
        });
    });

    it("throws an error with the backend message when response is not ok", async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({ message: "You've reached your message limit! Try again in 30 minute(s). Over and out." }),
            { status: 429 }
        );

        await expect(sendMessage("How big is the sun?", "fake-token"))
            .rejects
            .toThrow("You've reached your message limit!");
    });

    it("throws a fallback error when backend returns no message", async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

        await expect(sendMessage("How big is the sun?", "fake-token"))
            .rejects
            .toThrow("Something went wrong");
    });
});