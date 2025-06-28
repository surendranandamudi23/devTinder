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

connectDB()
  .then(() => {
    app.listen(3000, () => console.log("Server is running on port 3000"));
  })
  .catch((err) => console.log(err));
