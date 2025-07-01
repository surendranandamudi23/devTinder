const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`Please provide valid email ${value}`);
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message:
          "Gender must be 'male', 'female', or 'others'. {VALUE} is invalid",
      },
    },
    photoUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL");
        }
      },
    },
    about: {
      type: String,
      default: "This is about me",
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
userSchema.methods.getJwt = async function () {
  const user = this;
  const token = jwt.sign({ _id: user?._id }, "SURENDRA@FIST1", {
    expiresIn: "1d",
  });
  return token;
};
userSchema.methods.verifyPassword = async function (password) {
  const user = this;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
