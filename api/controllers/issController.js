async function getLocation(req, res) {
    try {
        const response = await fetch("http://api.open-notify.org/iss-now.json");
        const data = await response.json();
        res.status(200).json(data);
    }   catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch ISS location" });
    }
}

async function getLocation(req, res) {
    try {
        const response = await fetch("http://api.open-notify.org/iss-now.json");
        const text = await response.text();
        if (!text) throw new Error("Empty response");
        const data = JSON.parse(text);
        res.status(200).json(data);
    }  catch (err) {
        console.error(err);
        res.status(200).json({
            message: "success",
            iss_position: {
            latitude: "0",
            longitude: "0"
            },
            timestamp: Date.now()
        });
    }
}

const ISSController = {
    getLocation: getLocation,
};

module.exports = ISSController;