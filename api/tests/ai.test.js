const request = require("supertest");
const app = require("../app");

jest.mock("../services/geminiService");
const { askGemini } = require("../services/geminiService");

describe("POST /api/ai/chat", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns an answer when given a question", async () => {
    // Arrange
    askGemini.mockResolvedValue("The sun is very big!");

    // Act
    const response = await request(app)
        .post("/api/ai/chat")
        .send({ question: "How big is the sun?" });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("answer");
    });

    it("returns the answer from Gemini in the response", async () => {
    // Arrange
    askGemini.mockResolvedValue("The sun is very big!");

    // Act
    const response = await request(app)
        .post("/api/ai/chat")
        .send({ question: "How big is the sun?" });

    // Assert
    expect(response.body.answer).toBe("The sun is very big!");
    });

    it("returns a 500 error when Gemini fails", async () => {
    // Arrange - simulate Gemini crashing
    askGemini.mockRejectedValue(new Error("Gemini API error"));

    // Act
    const response = await request(app)
        .post("/api/ai/chat")
        .send({ question: "How big is the sun?" });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
    });

    it("calls Gemini with the question from the request", async () => {
    // Arrange
    askGemini.mockResolvedValue("Some answer");

    // Act
    await request(app)
        .post("/api/ai/chat")
        .send({ question: "How big is the sun?" });

    // Assert - was Gemini actually called with our question?
    expect(askGemini).toHaveBeenCalledWith("How big is the sun?");
    });
});
