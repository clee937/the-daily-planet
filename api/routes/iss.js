const express = require("express");
const router = express.Router();
const ISSController = require("../controllers/issController");

router.get("/", ISSController.getLocation);

module.exports = router;