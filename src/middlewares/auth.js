const User = require("../models/user");
const jwt = require("jsonwebtoken");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Token is not valid !");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken._id;
    const userData = await User.findById(userId);
    if (!userData) {
      throw new Error("No User found");
    }
    req.user = userData;
    next();
  } catch (err) {
    res.status(400).send("ERROR " + err?.message || "Something went wrong");
  }
};
module.exports = { userAuth };
