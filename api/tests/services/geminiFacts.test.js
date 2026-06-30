const { getApod } = require("../../services/apodService");
const Apod = require("../../models/Apod");
const { generateFact } = require("../../services/geminiService");

jest.mock("../../models/Apod");
jest.mock("../../services/geminiService", () => ({
    generateFact: jest.fn(),
}));

global.fetch = jest.fn();

function mockNasaResponse() {
    global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
            date: "2026-06-29",
            title: "M82: Galaxy with a Supergalactic Wind",
            url: "http://image.jpg",
            hdurl: "http://hdimage.jpg",
            explanation: "A starburst galaxy.",
            media_type: "image",
            copyright: null,
        }),
    });
}

describe("apodService - getApod with a fact", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("generates a fact and saves it on a cache miss", async () => {
        Apod.findOne.mockResolvedValue(null);
        mockNasaResponse();
        generateFact.mockResolvedValue("A fascinating space fact.");
        Apod.findOneAndUpdate.mockResolvedValue({
            toObject: () => ({
                date: "2026-06-29",
                title: "M82: Galaxy with a Supergalactic Wind",
                fact: "A fascinating space fact.",
        }),
    });

        const result = await getApod();

        expect(generateFact).toHaveBeenCalled();
        expect(result.fact).toBe("A fascinating space fact.");
    });

    it("returns the cached APOD without calling Gemini or NASA", async () => {
        Apod.findOne.mockResolvedValue({
            toObject: () => ({
            date: "2026-06-29",
            title: "Cached Picture",
            fact: "A previously generated fact.",
        }),
    });

        const result = await getApod();

        expect(result.fact).toBe("A previously generated fact.");
        expect(generateFact).not.toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("still returns the picture if generating the fact fails", async () => {
    Apod.findOne.mockResolvedValue(null);
    mockNasaResponse();
    generateFact.mockRejectedValue(new Error("Gemini overloaded"));
    Apod.findOneAndUpdate.mockResolvedValue({
        toObject: () => ({
            date: "2026-06-29",
            title: "M82: Galaxy with a Supergalactic Wind",
            fact: null,
        }),
    });

        const result = await getApod();

        expect(result.title).toBe("M82: Galaxy with a Supergalactic Wind");
        expect(result.fact).toBeNull();
    });
});