const jwt = require("jsonwebtoken");

function generateToken(userId) {
  const payload = { id: userId };

  const secretKey = process.env.JWT_SECRET;

  const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });

  return token;
}

module.exports = generateToken;
