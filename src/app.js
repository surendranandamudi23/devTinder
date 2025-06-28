const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
app.use(express.json());
app.post("/signup", async (req, res) => {
  const userRes = req.body;
  const user = new User(userRes);
  const result = await user.save();
  console.log(result);
  res.send("User created");
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
      res.status(404).send("User not found");
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
app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const body = req.body;
  if (!userId) {
    res.status(400).send("Please provide id");
  }
  try {
    const userUpdated = await User.findByIdAndUpdate(userId, body, {
      runValidators: true,
    });
    console.log(userUpdated);
    res.send("Updated Successfully");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});
app.use("/", (err, req, res, next) => {
  console.log(err);
  res.status(500).send(err.message);
});

connectDB()
  .then(() => {
    app.listen(3000, () => console.log("Server is running on port 3000"));
  })
  .catch((err) => console.log(err));
