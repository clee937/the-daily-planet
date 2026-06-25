const express = require("express");
const router = express.Router();
const favouritesController = require("../controllers/favouritesController");

router.post("/", favouritesController.createFavourite);
router.get("/", favouritesController.listFavourites);
router.delete("/:id", favouritesController.deleteFavourite);

module.exports = router;