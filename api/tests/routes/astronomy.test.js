const request = require("supertest");
const axios = require("axios");
const app = require("../../app");
const astronomyRoutes = require("../../routes/astronomy");
require("../mongodb_helper");

// VISIBLE OBJECTS ROUTE
describe("GET /api/astronomy/visible-objects", () => {
    it("returns visible objects", async () => {
        const response = await request(app)
            .get("/api/astronomy/visible-objects")
            .query({
                lat: 51.5074,
                lon: -0.1278,
                date: "2025-06-26"
            });
    
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
    });
});
