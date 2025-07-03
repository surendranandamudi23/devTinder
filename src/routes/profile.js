const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const {
  validateProfileEdit,
  validatePassword,
} = require("../utils/validation");
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const userdata = req.user;
    res.json({ data: userdata });
  } catch (err) {
    res.status(500).json({ message: err?.message || "Something went wrong" });
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileEdit(req);
    const userData = req.user;
    Object.keys(req.body).forEach((key) => {
      userData[key] = req.body[key];
    });
    const result = await userData.save();
    res.json({
      message: `${userData.firstName}, your profile updated successfully`,
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err?.message || "Something went wrong" });
  }
});
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      throw new Error("Password and new password are required");
    }
    if (password === newPassword) {
      throw new Error("Password and new password should be different");
    }
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      throw new Error(
        `New password must contain ${passwordErrors.join(", ")}.`
      );
    }
    const userData = req.user;
    const isMatch = await userData.verifyPassword(password);
    if (isMatch) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userData.password = hashedPassword;
      const result = await userData.save();
      res.json({
        message: `${userData.firstName}, your password updated successfully`,
        data: result,
      });
    } else {
      throw new Error("Incorrect password");
    }
  } catch (err) {
    res.status(400).json({ message: err?.message || "Something went wrong" });
  }
});
module.exports = { profileRouter };
