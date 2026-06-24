const express = require("express");

const UsersController = require("../controllers/users");

const router = express.Router();

router.post("/", UsersController.create);
router.patch("/:id", UsersController.update)

module.exports = router;
