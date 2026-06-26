const axios = require("axios");
const express = require("express");
const router = express.Router();

// VISIBLE OBJECTS route
router.get("/visible-objects", async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const date = req.query.date;

    try {
        const response = await axios.get(
            "https://api.astronomyapi.com/api/v2/bodies/positions",
            {
                auth: {
                    username: process.env.ASTRONOMY_ID,
                    password: process.env.ASTRONOMY_SECRET,
                },
                params: {
                    latitude: lat,
                    longitude: lon,
                    elevation: 0,
                    from_date: date,
                    to_date: date,
                    time: "22:00:00",
                    output: "rows",
                },
            }
        );

        const visibleObjects = response.data.data.rows
            .filter((body) => {
                const altitude = parseFloat(
                    body.positions[0].position.horizontal.altitude.degrees
                );
                return altitude > 0;
            })
            .filter((body) => body.body.id !== "sun")
            .filter((body) => body.body.id !== "earth")
            .map((body) => ({
                name: body.body.name,
                type:
                    body.body.id === "moon"
                        ? "Natural Satellite"
                        : "Planet",
                altitude: parseFloat(body.positions[0].position.horizontal.altitude.degrees),
                azimuth: parseFloat(body.positions[0].position.horizontal.azimuth.degrees)
            }));
        res.json(visibleObjects);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch visible objects" });
    }
});

// MOON PHASE route
router.post("/moon-phase", async (req, res) => {
    console.log(req.body);
    const { latitude, longitude, date } = req.body;

    try {
        const response = await axios({
            method: "POST",
            url: "https://api.astronomyapi.com/api/v2/studio/moon-phase",
            auth: {
                username: process.env.ASTRONOMY_ID,
                password: process.env.ASTRONOMY_SECRET
            },
            data: {
                format: "png",
                style: {
                    moonStyle: "default",
                    backgroundStyle: "stars"
                },
                observer: {
                    latitude,
                    longitude,
                    date
                },
                view: {
                    type: "landscape-simple",
                    orientation: "north-up"
                }
            },
        });
        res.json(response.data);

    } catch (error) {
        console.error(
            error.response
            ? error.response.data
            : error.message
        );
        res.status(500).json({ error: "Moon phase request failed" });
    }
});

// STAR CHART route
router.post("/star-chart", async (req, res) => {
    const { constellation } = req.body;

    try {
        const response = await axios({
            method: "POST",
            url: "https://api.astronomyapi.com/api/v2/studio/star-chart",
            auth: {
                username: process.env.ASTRONOMY_ID,
                password: process.env.ASTRONOMY_SECRET
            },
            data: {
                style: "default",
                observer: {
                    latitude: 51.5074,
                    longitude: -0.1278,
                    date: new Date().toISOString().split("T")[0]
                },
                view: {
                    type: "constellation",
                    parameters: {
                        constellation
                    },
                },
            },
        });
        res.json(response.data);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch visible objects" });
        // console.error("FINAL DEBUG:", error.response ? error.response.data : error.message);
        // res.status(500).json({
        //     error: error.message,
        //     details: error.response?.data
        // });
    }
});

module.exports = router;