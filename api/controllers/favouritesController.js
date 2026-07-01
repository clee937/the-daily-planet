const Favourite = require ("../models/Favourite");

function getUserId(req) {
    return req.user_id;
}

async function createFavourite(req, res) {
    const userId = getUserId(req); //moed outside try block
    try {
        const { title, imageUrl, explanation, date, source, mediaType, sourceId } = req.body;

        if(!title || !imageUrl || !sourceId) {
            return res.status(400).json({ error: "title, imageUrl and sourceId are required"});
        }
    
        const favourite = await Favourite.create({
            user: userId,
            title,
            imageUrl,
            explanation,
            date,
            source,
            mediaType,
            sourceId,
        });

        res.status(201).json({ favourite });
    } catch (err) {
        if (err.code === 11000) {
            const existing = await Favourite.findOne({ user: userId, sourceId: req.body.sourceId });
            return res.status(409).json({ error: "Already in your favourites", favourite: existing });
        }
        console.error("createFavourite error", err.message);
        res.status(500).json({ error: "Could not save favourite" });
    }
}


async function listFavourites(req, res) {
    try {
        const userId = getUserId(req);
        const favourites = await Favourite.find({ user: userId });
        res.status(200).json({ favourites });
    } catch (err) {
        console.error("listFavourites error:", err.message);
        res.status(500).json({ error: "Could not load favourites"});
    }
}

async function deleteFavourite(req, res) {
    try {
        const userId = getUserId(req);
        const deleted = await Favourite.findOneAndDelete({ _id: req.params.id, user: userId,}); //users can only delete their own favs

        if (!deleted) {
            return res.status(404).json({ error: "Favourite not found" });
        }
        res.status(200).json({ message: "Removed from Favourites "});
    } catch (err) {
        console.error("deleteFavourite error:", err.message);
        res.status(500).json({ error: "Could not remove favourite"});
    }
}

module.exports = { createFavourite, listFavourites, deleteFavourite };