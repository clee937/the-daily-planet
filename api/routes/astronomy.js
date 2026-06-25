const axios = require("axios");
const express = require("express");

const router = express.Router();

router.get("/visible-objects", async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    try {
        const today = new Date().toISOString().split("T")[0];
        const time = new Date().toTimeString().slice(0, 8);
        console.log("today:", today);
        console.log("time:", time);
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
                    from_date: today,
                    to_date: today,
                    time: time,
                    output: "rows",
                },
            }
        );
        console.log({
            latitude: lat,
            longitude: lon,
            elevation: 0,
            from_date: today,
            to_date: today,
            time: time,
            output: "rows",
        });
        console.log(JSON.stringify(response.data, null, 2));

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
                altitude: parseFloat(body.positions[0].position.horizontal.altitude.degrees)
            }));

        res.json(visibleObjects);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch visible objects" });
    }
});

router.post("/star-chart", async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid lat/lon" })
    }

    try {
        console.log("ID:", process.env.ASTRONOMY_ID);
        console.log("SECRET EXISTS:", !!process.env.ASTRONOMY_SECRET);

        const response = await axios({
            method: "POST",
            url: "https://api.astronomyapi.com/api/v2/studio/star-chart",
            
            auth: {
                username: process.env.ASTRONOMY_ID,
                password: process.env.ASTRONOMY_SECRET,
            },

            data: {
                style: "default",
                observer: {
                    latitude: lat,
                    longitude: lon,
                    date: new Date().toISOString().split("T")[0]
                },
                view: {
                    type: "constellation",
                    parameters: {
                        constellation: "uma",
                    },
                },
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("FINAL DEBUG:",
            error.response ? error.response.data : error.message
        );

        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

module.exports = router;