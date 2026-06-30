const { getApod } = require("../../services/apodService");
const { generateFact } = require("../../services/geminiService");
const Apod = require("../../models/Apod");

jest.mock("../../services/geminiService", () => ({
    generateFact: jest.fn().mockResolvedValue("a test fact"),
    askGemini: jest.fn().mockResolvedValue("a test answer"),
}));
jest.mock("../../models/Apod");

global.fetch = jest.fn();

describe("apodService - getApod", () => {
    beforeEach(() => {
    jest.resetAllMocks();
    });

    it("should return formatted data when fetch is successful", async () => {
        Apod.findOneAndUpdate.mockResolvedValue({
            toObject: () => ({
                date: "2026-06-23",
                title: "NASA Image",
                explanation: "A photo in space",
                url: "http://image.jpg",
                hdurl: "http://hdimage.jpg",
                mediaType: "image",
                copyright: "NASA",
                fact: "A fascinating space fact.",
    }),
});

    global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
                date: "2026-06-23",
                title: "NASA Image",
                explanation: "A photo in space",
                url: "http://image.jpg",
                hdurl: "http://hdimage.jpg",
                mediaType: "image",
                copyright: "NASA",
                fact: "A fascinating space fact.",
        }),
    });

    const data = await getApod();

    expect(data.title).toBe("NASA Image");
    expect(data.explanation).toBe("A photo in space");
    expect(data.url).toBe("http://image.jpg");
    expect(data.hdurl).toBe("http://hdimage.jpg");
    expect(data.mediaType).toBe("image");
    expect(data.copyright).toBe("NASA");
    expect(global.fetch).toHaveBeenCalled();
    expect(data.fact).toBe("A fascinating space fact.");
    });

    it("should throw an error if the fetch is unsuccessful", async () => {
        global.fetch.mockResolvedValue({ ok: false, status: 500 });
        await expect(getApod()).rejects.toThrow("NASA APOD responded 500");
    });
});