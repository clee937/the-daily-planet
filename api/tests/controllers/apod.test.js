const apodService = require("../../services/apodService");
const { getApod } = require("../../controllers/apodController");

jest.mock("../../services/apodService");

describe("apodController - getApod", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks()

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it("should return 200 and the apod data if successful", async () => {
        const mockData = { title: "Space Image", url: ""};
        apodService.getApod.mockResolvedValue(mockData);

        await getApod(req, res);
        
        expect(apodService.getApod).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ apod: mockData });
    });

    it("should return 502 if unsuccessful", async () => {
        apodService.getApod.mockRejectedValue(new Error("API failure"));

        await getApod(req, res);

        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch picture of the day" });
    });
});