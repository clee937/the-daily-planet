const request = require("supertest");
const axios = require("axios");
const app = require("../../app");
require("../mongodb_helper");

jest.mock("axios");

// VISIBLE OBJECTS route
describe("GET /api/astronomy/visible-objects", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  it("returns visible objects with status code 200", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          rows: [
            {
              body: {
                id: "moon",
                name: "Moon"
              },
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
        date: "2026-06-29"
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

  it("filters out objects below the horizon", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          rows: [
            {
              body: {
                id: "moon",
                name: "Moon"
              },
              positions: [
                {
                  position: {
                    horizontal: {
                      altitude: { degrees: "-5" },
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
        date: "2026-06-29"
      });

    expect(response.body).toEqual([]);
  });

  it("filters out the sun", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          rows: [
            {
              body: {
                id: "sun",
                name: "Sun"
              },
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
        date: "2026-06-29"
      });

    expect(response.body).toEqual([]);
  });

  it("classifies planets correctly", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          rows: [
            {
              body: {
                id: "mars",
                name: "Mars"
              },
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
        date: "2026-06-29"
      });

    expect(response.body).toEqual([
      {
        name: "Mars",
        type: "Planet",
        altitude: 45,
        azimuth: 120
      }
    ]);
  });

  it("returns status code 500 if AstronomyAPI request fails", async () => {
    axios.get.mockResolvedValue(new Error("API failure"));

    const response = await request(app)
      .get("/api/astronomy/visible-objects")
      .query({
        lat: 51.5074,
        lon: -0.1278,
        date: "2026-06-29"
      });
    
    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "Failed to fetch visible objects"
    });
  });

  it("returns satus code 400 when required fields are missing", async () => {
    const response = await request(app)
      .get("/api/astronomy/visible-objects");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Missing or invalid parameters"
    });
  });
});

// MOON PHASE route
describe("POST /api/astronomy/moon-phase", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns moon phase image with status code 200", async () => {
    axios.mockResolvedValue({
      data: {
        data: {
          imageUrl: "https://example.com/moon.png"
        }
      }
    });

    const response = await request(app)
      .post("/api/astronomy/moon-phase")
      .send({
        latitude: 51.5074,
        longitude: -0.1278,
        date: "2026-06-29"
      });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        data: {
          imageUrl: "https://example.com/moon.png"
        }
      });
  });

  it("returns status code 500 if AstronomyAPI request fails", async () => {
    axios.mockRejectedValue(new Error("API failure"));

    const response = await request(app)
      .post("/api/astronomy/moon-phase")
      .send({
        latitude: 51.5074,
        longitude: -0.1278,
        date: "2026-06-29"
      });
    
    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "Moon phase request failed"
    });
  });

  it("returns status code 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/astronomy/moon-phase")
      .send({});
    
    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Latitude, longitude and date are required"
    });
  });

  it("sends correct data to AstronomyAPI", async () => {
    axios.mockResolvedValue({
      data: {
        data: {
          imageUrl: "https://example.com/moon.png"
        }
      }
    });

    await request(app)
      .post("/api/astronomy/moon-phase")
      .send({
        latitude: 51.5074,
        longitude: -0.1278,
        date: "2026-06-29"
      });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "https://api.astronomyapi.com/api/v2/studio/moon-phase"
      })
    );
  });
});

// STAR CHART route
describe("POST /api/astronomy/star-chart", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns star chart image with status code 200", async () => {
    axios.mockResolvedValue({
      data: {
        data: {
          imageUrl: "https://example.com/star-chart.png"
        }
      }
    });

    const response = await request(app)
      .post("/api/astronomy/star-chart")
      .send({
        constellation: "uma"
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      data: {
        imageUrl: "https://example.com/star-chart.png"
      }
    });
  });

  it("returns status code 500 if AstronomyAPI fails", async () => {
    axios.mockRejectedValue(new Error("API failure"));

    const response = await request(app)
      .post("/api/astronomy/star-chart")
      .send({
        constellation: "uma"
      });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "Star chart request failed"
    });
  });

  it("returns status code 400 when required fields are missing", async () => {
    axios.mockRejectedValue(new Error("API failure"));

    const response = await request(app)
      .post("/api/astronomy/star-chart")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Constellation is required"
    });
  });

  it("sends correct data to AstronomyAPI", async () => {
    axios.mockResolvedValue({
      data: {
        data: {
          imageUrl: "https://example.com/star-chart.png"
        }
      }
    });

    await request(app)
      .post("/api/astronomy/star-chart")
      .send({
        constellation: "uma"
      });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "https://api.astronomyapi.com/api/v2/studio/star-chart"
      })
    );
  });
});
