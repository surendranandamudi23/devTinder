const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://surendranandamudi:3zQiMW0ftRtiNsyB@namastenode.4dj4k2x.mongodb.net/devTinder"
    );
    console.log("Database connected");
  } catch (error) {
    console.log(error, "error");
  }
};

module.exports = connectDB;
