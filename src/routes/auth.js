const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { validateSignUp } = require("../utils/validation");
const User = require("../models/user");

authRouter.post("/signup", async (req, res) => {
  // Validate
  try {
    validateSignUp(req);

    // Encrypt
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save
    const userRes = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    };
    const user = new User(userRes);
    const result = await user.save();
    console.log(result);
    res.send("User created");
  } catch (err) {
    res.status(400).send(err?.message || "Something went wrong");
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Email and password are required");
    }
    const userRes = await User.findOne({ email });
    if (userRes) {
      const isMatch = await userRes.verifyPassword(password);
      if (isMatch) {
        // Create jwt token
        const token = await userRes.getJwt();
        res.cookie("token", token, {
          expires: new Date(Date.now() + 12 * 3600000),
        });
        res.send("Login successful");
      } else {
        res.status(400).send("Invalid credentials");
      }
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});
authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.send();
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

module.exports = { authRouter };
