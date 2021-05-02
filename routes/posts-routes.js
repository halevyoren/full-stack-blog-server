const express = require("express");
const { check } = require("express-validator");

const postsControllers = require("../controllers/posts-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/user/:uid", postsControllers.getPostsByUserId);

router.get("/:pid", postsControllers.getPostByPostId);

// this ensures that exept for getting the posts, the user has to have a valid token (be logged in)
router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [check("title").not().isEmpty(), check("description").isLength({ min: 4 })],
  postsControllers.createPost
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 4 })],
  postsControllers.updatePost
);

// router.patch(
//   "/:pid/likesAndDisLikes",
//   // [check("likes").exists(), check("disLikes").exists(), check("postId")],
//   postsControllers.updatePostLikes
// );

router.delete("/:pid", postsControllers.deletePost);

module.exports = router;
