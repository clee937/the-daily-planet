const User = require("../models/user");

function create(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const user = new User({ email, password });
  user
    .save()
    .then((user) => {
      console.log("User created, id:", user._id.toString());
      res.status(201).json({ message: "OK" });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "Something went wrong" });
    });
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
      // pre('save') hook will hash it
    }

    await user.save();

    res.status(200).json({
      message: "User updated",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Something went wrong" });
  }
}

const UsersController = {
  create: create,
  update: update
};

module.exports = UsersController;
