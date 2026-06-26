const request = require("supertest");
const axios = require("axios");
const app = require("../../app");
require("../mongodb_helper");

jest.mock("axios");

// VISIBLE OBJECTS ROUTE
describe("GET /api/astronomy/visible-objects", () => {
  it("returns visible objects", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          rows: [
            {
              body: { id: "moon", name: "Moon", },
              positions: [
                {
                  position: {
                    horizontal: {
                      altitude: { degrees: "45" },
                      azimuth: { degrees: "120" },
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    });

    const response = await request(app)
    .get("/api/astronomy/visible-objects")
            .query({
                lat: 51.5074,
                lon: -0.1278,
                date: "2025-06-26"
            });        

        expect(response.status).toBe(200);

        expect(response.body).toEqual([
          {
            name: "Moon",
            type: "Natural Satellite",
            altitude: 45,
            azimuth: 120
          }
        ]);
    });
});
