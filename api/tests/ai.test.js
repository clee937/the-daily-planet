const request = require("supertest");
const app = require("../app");
const JWT = require("jsonwebtoken");

jest.mock("../services/geminiService");
const { askGemini } = require("../services/geminiService");

// Generate a valid token for tests
const testToken = JWT.sign(
    { sub: "507f1f77bcf86cd799439011" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "10m" }
);

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
        .set("Authorization", `Bearer ${testToken}`)
        .send({ prompt: "How big is the sun?" });

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
        .set("Authorization", `Bearer ${testToken}`)
        .send({ prompt: "How big is the sun?" });

    // Assert
    expect(response.body.answer).toBe("The sun is very big!");
    });

    it("returns a 500 error when Gemini fails", async () => {
    // Arrange
    askGemini.mockRejectedValue(new Error("Gemini API error"));

    // Act
    const response = await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ prompt: "How big is the sun?" });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
    });

    it("calls Gemini with the prompt from the request", async () => {
    // Arrange
    askGemini.mockResolvedValue("Some answer");

    // Act
    await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ prompt: "How big is the sun?" });

    // Assert
    expect(askGemini).toHaveBeenCalledWith("How big is the sun?");
    });

    it("returns 401 when no token is provided", async () => {
    // Act - no token this time
    const response = await request(app)
        .post("/api/ai/chat")
        .send({ prompt: "How big is the sun?" });

    // Assert
    expect(response.status).toBe(401);
    });

});