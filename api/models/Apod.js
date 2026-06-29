const mongoose = require("mongoose");

const apodSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    hdurl: { type: String, default: null },
    explanation: { type: String, default: null },
    mediaType: { type: String, default: "image" },
    fact: { type: String, default: null },
    copyright: { type: String, default: null },
});

module.exports = mongoose.model("Apod", apodSchema);