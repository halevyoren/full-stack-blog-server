const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const retrieveAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // exclude password from users
  } catch (err) {
    //there was an error contacting the server
    return next(new HttpError("Fetching users failed, please try again.", 500));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //the requested information for creating a user is invalid
    return next(new HttpError("Invalid inputs, please try again", 422));
  }

  //extract the name, email and password from the body
  const { name, email, password } = req.body;

  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    //there was an error contacting the server to retrieve a user
    return next(HttpError("Somthing went wrong, couldn't create user", 500));
  }
  if (hasUser) {
    //there is already a user registered with the same email
    return next(
      new HttpError(
        "Could not create user, A user with this mail already exists",
        422
      )
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, Please try again", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    posts: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    //there was an error contacting the server to save a user
    const error = new HttpError("Failed to create user, please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Failed to create user, please try again", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token }); //201 is a convention for a creation
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //the requested information for logging in a user is invalid
    return next(new HttpError("Invalid email, please try again", 422));
  }

  //extract the email and password from the body
  const { email, password } = req.body;

  let foundUser;
  try {
    foundUser = await User.findOne({ email: email });
  } catch (err) {
    //there was an error contacting the server to find the user
    return next(HttpError("Somthing went wrong, couldn't create user", 500));
  }

  if (!foundUser) {
    //ether a user with that email was not found or the password is incorrect
    return next(
      new HttpError("Could not find a user with those credentials", 403)
    );
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, foundUser.password);
  } catch (error) {
    return next(new HttpError("Could not log in, Please try again", 500));
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Could not find a user with those credentials", 403)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not log in, Please try again", 500));
  }

  console.log("id is: " + foundUser.id);

  res.status(201).json({
    userId: foundUser.id,
    email: foundUser.email,
    token,
  });
};

exports.retrieveAllUsers = retrieveAllUsers;
exports.signup = signup;
exports.login = login;
