const { getApod } = require("../../services/apodService");
const { generateFact } = require("../../services/geminiServiceMin");
const Apod = require("../../models/Apod");

jest.mock("../../services/geminiServiceMin", () => ({
    generateFact: jest.fn().mockResolvedValue("a test fact"),
}));
jest.mock("../../models/Apod");

global.fetch = jest.fn();

describe("apodService - getApod", () => {
    beforeEach(() => {
    jest.resetAllMocks();
    });

    it("should return formatted data when fetch is successful", async () => {
        Apod.findOne.mockResolvedValue(null);
        Apod.create.mockResolvedValue({
            toObject: () => ({
                title: "NASA Image",
                explanation: "A photo in space",
                url: "http://image.jpg",
                hdurl: "http://hdimage.jpg",
                date: "2026-06-23",
                mediaType: "image",
                copyright: "NASA",
                fact: "a test fact",
        }),
    });

    global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
            title: "NASA Image",
            explanation: "A photo in space",
            url: "http://image.jpg",
            hdurl: "http://hdimage.jpg",
            date: "2026-06-23",
            media_type: "image",
            copyright: "NASA",
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
    });

    it("should throw an error if the fetch is unsuccessful", async () => {
        global.fetch.mockResolvedValue({ ok: false, status: 500 });
        await expect(getApod()).rejects.toThrow("NASA APOD responded 500");
    });
});