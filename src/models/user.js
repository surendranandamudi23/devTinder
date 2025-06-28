const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
function validatePassword(value) {
  const errors = [];
  if (value.length < 6) {
    errors.push("at least 6 characters");
  }
  if (!/[A-Z]/.test(value)) {
    errors.push("an uppercase letter");
  }
  if (!/\d/.test(value)) {
    errors.push("a number");
  }
  if (!/[!@#$%^&*]/.test(value)) {
    errors.push("a special character");
  }
  return errors;
}

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
      trim: true,
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
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender must be 'male', 'female', or 'others'.");
        }
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

userSchema.pre("save", function (next) {
  if (this.gender) {
    this.gender = this.gender.toLowerCase().trim();
  }

  const passwordErrors = validatePassword(this.password);
  if (passwordErrors.length > 0) {
    const err = new Error(
      `Password must contain ${passwordErrors.join(", ")}.`
    );
    return next(err);
  }

  next();
});

userSchema.methods.getJwt = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user?._id }, "SURENDRA@FIST1", {
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
