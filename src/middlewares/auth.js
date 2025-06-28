const adminAuth = (req, res, next) => {
  console.log("adminAuth");
  const token = "abc";
  if (token === "abc") {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

module.exports = adminAuth;
