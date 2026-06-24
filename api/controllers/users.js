const User = require("../models/user");
const { generateToken } = require("../lib/token");

function create(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  const user = new User({ email, password, username });
  user
    .save()
    .then((user) => {
      console.log("User created, id:", user._id.toString());
      const token = generateToken(user.id);
      res.status(201).json({ message: "OK", token: token });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.status(400).json({ message: "Email or username already exists" });
      } else {
        res.status(400).json({ message: "Something went wrong" });
      }
    });
  }
const UsersController = {
  create: create,
};

module.exports = UsersController;
