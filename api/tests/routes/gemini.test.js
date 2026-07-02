const request = require("supertest");
const app = require("../../app");
const JWT = require("jsonwebtoken");
const User = require("../../models/user");
require("../mongodb_helper");

jest.mock("../../services/geminiService");
const { askGemini } = require("../../services/geminiService");

const testToken = JWT.sign(
    { sub: "507f1f77bcf86cd799439011" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "10m" }
);

const mockUser = {
    aiWindowStart: null,
    aiMessageCount: 0,
    save: jest.fn().mockResolvedValue(true)
};

describe("POST /api/ai/chat", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        User.findById = jest.fn().mockResolvedValue({ ...mockUser, save: jest.fn() });
    });

    it("returns an answer with status 200", async () => {
        askGemini.mockResolvedValue("The sun is very big!");

        const response = await request(app)
            .post("/api/ai/chat")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ prompt: "How big is the sun?" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("answer", "The sun is very big!");
    });

    it("increments message count after a successful message", async () => {
        askGemini.mockResolvedValue("Some answer");
        const saveMock = jest.fn().mockResolvedValue(true);
        User.findById = jest.fn().mockResolvedValue({
            ...mockUser,
            aiMessageCount: 0,
            save: saveMock
        });

        await request(app)
            .post("/api/ai/chat")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ prompt: "How big is the sun?" });

        expect(saveMock).toHaveBeenCalled();
    });

    it("returns 429 when message limit is reached", async () => {
        User.findById = jest.fn().mockResolvedValue({
            ...mockUser,
            aiMessageCount: 10,
            aiWindowStart: new Date(),
            save: jest.fn()
        });

        const response = await request(app)
            .post("/api/ai/chat")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ prompt: "How big is the sun?" });

        expect(response.status).toBe(429);
        expect(response.body.message).toMatch(/You've reached your message limit/);
    });

    it("resets message count when window has expired", async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        askGemini.mockResolvedValue("Some answer");
        User.findById = jest.fn().mockResolvedValue({
            ...mockUser,
            aiMessageCount: 10,
            aiWindowStart: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            save: saveMock
        });

        const response = await request(app)
            .post("/api/ai/chat")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ prompt: "How big is the sun?" });

        expect(response.status).toBe(200);
    });

    it("returns 401 when no token is provided", async () => {
        const response = await request(app)
            .post("/api/ai/chat")
            .send({ prompt: "How big is the sun?" });

        expect(response.status).toBe(401);
    });

    it("returns 500 when askGemini throws", async () => {
        askGemini.mockRejectedValue(new Error("Gemini failed"));

        const response = await request(app)
            .post("/api/ai/chat")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ prompt: "How big is the sun?" });

        expect(response.status).toBe(500);
    });
});

describe("GET /api/ai/chat-status", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns messages remaining and minutes until reset", async () => {
        User.findById = jest.fn().mockResolvedValue({
            ...mockUser,
            aiMessageCount: 3,
            aiWindowStart: new Date(),
            save: jest.fn()
        });

        const response = await request(app)
            .get("/api/ai/chat-status")
            .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("messagesRemaining", 7);
        expect(response.body).toHaveProperty("messagesUsed", 3);
        expect(response.body).toHaveProperty("minutesUntilReset");
    });

    it("returns minutesUntilReset of 0 when no window has started", async () => {
        User.findById = jest.fn().mockResolvedValue({
            ...mockUser,
            aiMessageCount: 0,
            aiWindowStart: null,
            save: jest.fn()
        });

        const response = await request(app)
            .get("/api/ai/chat-status")
            .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.minutesUntilReset).toBe(0);
    });

    it("resets window and returns full messages remaining when window has expired", async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        User.findById = jest.fn().mockResolvedValue({
            ...mockUser,
            aiMessageCount: 8,
            aiWindowStart: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            save: saveMock
        });

        const response = await request(app)
            .get("/api/ai/chat-status")
            .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.messagesRemaining).toBe(10);
        expect(saveMock).toHaveBeenCalled();
    });

    it("returns 401 when no token is provided", async () => {
        const response = await request(app)
            .get("/api/ai/chat-status");

        expect(response.status).toBe(401);
    });
});