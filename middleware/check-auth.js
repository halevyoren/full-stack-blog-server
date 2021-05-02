const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

// getting the token of the loggen in user and passing it though req.userData
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    // checking if there is a token
    const token = req.headers.authorization.split(" ")[1]; // Autherization: 'Bearer TOKEN'
    if (!token) {
      const error = new HttpError("Authentication failed!", 403);
      return next(error);
    }
    // checking if token is valid
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    // extracting data from token and attavhing it to the request
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};
