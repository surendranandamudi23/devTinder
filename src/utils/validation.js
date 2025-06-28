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
module.exports = { validateSignUp };
