const axios = require("axios");
const express = require("express");

const router = express.Router();

router.post("/star-chart", async (req, res) => {
    const lat = parseFloat(req.query.lat)
    const lon = parseFloat(req.query.lon)

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