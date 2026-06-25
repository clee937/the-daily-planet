const request = require("supertest");
const app = require("../../app");

describe("GET /iss", () => {
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
});