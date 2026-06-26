const { askGemini } = require("../services/geminiService");

// Mock the entire @google/genai package instead
jest.mock("@google/genai", () => {
    const mockSendMessage = jest.fn();
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({
            chats: {
                create: jest.fn().mockReturnValue({
                sendMessage: mockSendMessage,
                }),
            },
        })),
        HarmCategory: {
            HARM_CATEGORY_HATE_SPEECH: "HARM_CATEGORY_HATE_SPEECH",
            HARM_CATEGORY_HARASSMENT: "HARM_CATEGORY_HARASSMENT",
            HARM_CATEGORY_SEXUALLY_EXPLICIT: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            HARM_CATEGORY_DANGEROUS_CONTENT: "HARM_CATEGORY_DANGEROUS_CONTENT",
        },
            HarmBlockThreshold: {
                BLOCK_LOW_AND_ABOVE: "BLOCK_LOW_AND_ABOVE",
            },
        mockSendMessage,
    };
});

const { mockSendMessage } = require("@google/genai");

describe("askGemini service", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers(); // makes setTimeout instant
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("returns the response text when Gemini succeeds", async () => {
        // Arrange
        mockSendMessage.mockResolvedValue({ text: "The sun is very big!" });

        // Act
        const result = await askGemini("How big is the sun?");

        // Assert
        expect(result).toBe("The sun is very big!");
    });

    it("returns Houston message when all retries fail", async () => {
        // Arrange - fail every time
        mockSendMessage.mockRejectedValue(new Error("API unavailable"));

        // Act
        const promise = askGemini("How big is the sun?");
        await jest.runAllTimersAsync(); // skip the waiting
        const result = await promise;

        // Assert
        expect(result).toBe(
        "Houston we have a problem, the space station is experiencing high traffic. Please try again!"
        );
    });

    it("retries the correct number of times before giving up", async () => {
        // Arrange - always fail
        mockSendMessage.mockRejectedValue(new Error("API unavailable"));

        // Act
        const promise = askGemini("How big is the sun?");
        await jest.runAllTimersAsync();
        await promise;

        // Assert - should have tried 3 times (maxRetries)
        expect(mockSendMessage).toHaveBeenCalledTimes(3);
    });

});