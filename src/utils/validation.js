const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || firstName?.length < 4 || firstName?.length > 50) {
    throw new Error("Enter a valid first name");
  } else if (!lastName || lastName?.length < 2 || lastName?.length > 50) {
    throw new Error("Enter a valid last name");
  } else if (!email || !validator.isEmail(email)) {
    throw new Error("Enter a valid email");
  } else if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Enter a valid password");
  }
};
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
const validateProfileEdit = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "about",
    "skills",
    "age",
    "gender",
    "photoUrl",
  ];
  const isValid = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );
  if (!isValid) {
    throw new Error("Invalid edit fields");
  }
  const { about, skills, age, gender, photoUrl } = req.body;
  if (about && about?.length > 1000) {
    throw new Error("About should be less than 1000 characters");
  }
  if (skills && skills?.length > 10) {
    throw new Error("Skills should be less than 10");
  }
  if (age && (age < 18 || age > 100)) {
    throw new Error("Age should be between 18 and 100");
  }
  if (gender && !["male", "female", "others"].includes(gender)) {
    throw new Error("Gender must be 'male', 'female', or 'others'.");
  }
  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Enter a valid URL");
  }
};
module.exports = { validateSignUp, validateProfileEdit, validatePassword };
