const mongoose = require("mongoose");

const FavSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, 
    title: {type: String, required: true},
    imageUrl: {type: String, required: true},
    explanation: {type: String},
    date: {type: String},
    source: {type: String},
    mediaType: {type: String},
    sourceId: {type: String},
});

FavSchema.index({user: 1, sourceId: 1}, {unique: true});

module.exports = mongoose.model("Favourite", FavSchema);



