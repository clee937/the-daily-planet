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

const ISSController = {
    getLocation: getLocation,
};

module.exports = ISSController;