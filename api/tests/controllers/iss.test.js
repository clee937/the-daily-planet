const request = require("supertest");
const app = require("../../app");

describe("GET /iss", () => {
    beforeEach (() => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            text: async () => JSON.stringify({
                message: "success",
                iss_position: { latitude: "51.5074", longitude: "-0.1278" },
                timestamp: 123456789
            })
    });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("returns a 200 status", async () => {
        const response = await request(app).get("/iss");
        expect(response.status).toBe(200);
    });

    test("returns iss_position with latitude and longitude", async () => {
        const response = await request(app).get("/iss");
        expect(response.body.iss_position).toBeDefined();
        expect(response.body.iss_position.latitude).toBeDefined();
        expect(response.body.iss_position.longitude).toBeDefined();
    });

    test("returns a timestamp", async () => {
        const response = await request(app).get("/iss");
        expect(response.body.timestamp).toBeDefined();
    });

    test("returns a message field", async () => {
        const response = await request(app).get("/iss");
        expect(response.body.message).toBeDefined();
    });

    test("returns latitude as a string", async () => {
        const response = await request(app).get("/iss");
        expect(typeof response.body.iss_position.latitude).toBe("string");
    });

    test("returns longitude as a string", async () => {
        const response = await request(app).get("/iss");
        expect(typeof response.body.iss_position.longitude).toBe("string");
    });

    test("returns fallback data when ISS API is unavailable", async () => {
        // Mock fetch to simulate API being down
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error("API down"));
        
        const response = await request(app).get("/iss");
        
        expect(response.status).toBe(200);
        expect(response.body.iss_position).toBeDefined();
        expect(response.body.iss_position.latitude).toBe("0");
        expect(response.body.iss_position.longitude).toBe("0");
        expect(response.body.message).toBe("success");

        jest.restoreAllMocks();
    });
});