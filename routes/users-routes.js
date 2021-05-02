const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersControllers.retrieveAllUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 4 }),
  ],
  usersControllers.signup
);

router.post(
  "/login",
  check("email").normalizeEmail().isEmail(),
  usersControllers.login
);

module.exports = router;
