const express = require("express");

const UsersController = require("../controllers/users");

const router = express.Router();

router.post("/", UsersController.create);
router.get("/check-email", UsersController.checkEmail);
router.patch("/:id", UsersController.update);
router.delete("/:id", UsersController.destroy);
router.get("/:id", UsersController.getUser);


module.exports = router;
