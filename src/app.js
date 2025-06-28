const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const { validateSignUp } = require("./utils/validation");
const { userAuth } = require("./middlewares/auth");
app.use(express.json());
app.use(cookieParser());
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
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
app.get("/profile", userAuth, async (req, res) => {
  try {
    const userdata = req.user;
    res.send(userdata);
  } catch (err) {
    res.status(500).send(err?.message || "Something went wrong");
  }
});
app.get("/user", async (req, res) => {
  const email = req.body?.email;
  try {
    if (!email) {
      res.status(400).send("Email is required");
    }
    const userRes = await User.find({ email });
    if (userRes.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(userRes);
    }
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});
app.get("/feed", async (req, res) => {
  try {
    const userRes = await User.find({});
    if (userRes.length === 0) {
      res.status(404).send("No data found");
    } else {
      res.send(userRes);
    }
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    if (!userId) {
      res.status(400).send("Please provide id");
    }
    const userToDelete = await User.findByIdAndDelete(userId);
    console.log(userToDelete);
    res.send("User Deleted Successfully");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  if (!userId) {
    throw new Error("Please provide id");
  }
  try {
    const ALLOWED_FIELDS_TO_UPDATE = [
      "firstName",
      "lastName",
      "age",
      "photoUrl",
      "about",
      "skills",
      "gender",
    ];
    const alloweFieldsCheck = Object.keys(data).every((k) =>
      ALLOWED_FIELDS_TO_UPDATE.includes(k)
    );
    if (!alloweFieldsCheck) {
      throw new Error("Update failed, please check the input fields");
    }
    if (data?.skills?.length > 10) {
      throw new Error("Only 10 skills can be added");
    }
    const userUpdated = await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
    });
    console.log(userUpdated);
    res.send("Updated Successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err?.message || "Internal Server Error");
});

connectDB()
  .then(() => {
    app.listen(3000, () => console.log("Server is running on port 3000"));
  })
  .catch((err) => console.log(err));
