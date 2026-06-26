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

async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: "Something went wrong"
    });
  }
}

async function update(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.email) {
      user.email = req.body.email;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.body.username) {
      user.username = req.body.username
    }
    await user.save();

    res.status(200).json({
      message: "User updated",
      password: res.password
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Something went wrong" });
  }
}

async function destroy(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    console.log("DELETE ID:", req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted",
      deletedUser: user
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Something went wrong" });
  }
}

const UsersController = {
  create,
  update,
  destroy,
  getUser
};

module.exports = UsersController;
