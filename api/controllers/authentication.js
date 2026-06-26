const User = require("../models/user");
const { generateToken } = require("../lib/token");
const bcrypt = require("bcrypt");

  async function createToken(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const token = generateToken(user.id);

      return res.status(201).json({
        token,
        message: "OK",
      });
    } 
  catch (err) {
      console.error(err);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

const AuthenticationController = {
  createToken: createToken,
};

module.exports = AuthenticationController;
