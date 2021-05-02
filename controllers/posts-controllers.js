const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Post = require("../models/post");
const User = require("../models/user");

const getPostByPostId = async (req, res, next) => {
  //get post id from parameters
  const postID = req.params.pid;

  let post;
  try {
    //if succeeded (no error) then the post will be the post if found, of null if not
    post = await Post.findById(postID);
  } catch (err) {
    return next(
      //there was an error contacting the server
      new HttpError("something went wrong. please try again", 500) // error in getting information from db
    );
  }

  if (!post) {
    //post was not found
    return next(
      new HttpError("could not find a post for the id provided", 404) // no post in retreived information
    );
  }

  res.json({ post: post.toObject({ getters: true }) });
};

const getPostsByUserId = async (req, res, next) => {
  //get user id from parameters
  const userID = req.params.uid;

  let UserWithPosts;
  try {
    //if succeeded (no error) then the UserWithPosts will be an array of all posts by that user
    UserWithPosts = await User.findById(userID).populate("posts");
  } catch (err) {
    //there was an error contacting the server
    return next(new HttpError("something went wrong. please try again", 500));
  }

  if (!UserWithPosts) {
    //the list of posts is null
    return next(
      new HttpError("could not find a post for the user id provided", 404)
    );
  }

  res.json({
    posts: UserWithPosts.posts.map((post) => post.toObject({ getters: true })),
  });
};

const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;

  const createdPost = new Post({
    title,
    description,
    image: req.file.path,
    likes: [],
    disLikes: [],
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};

const updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //the requested information for updating the post is invalid
    return next(new HttpError("Invalid inputs, please try again", 422));
  }

  //extract the title and description from the body
  const { title, description } = req.body;
  //extract the post id and creator from the parameters
  const postID = req.params.pid;

  let updatedPost;
  try {
    updatedPost = await Post.findById(postID);
  } catch (err) {
    //there was an error contacting the server
    return next(
      new HttpError(
        "something went wrong. post wasn't updated. please try again",
        500
      )
    );
  }

  //make sure that the user who wants to update is the same one that created the post
  if (updatedPost.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this Post!!!", 401));
  }

  if (!updatedPost) {
    return next(new HttpError("Could not find post for provided id", 404));
  }

  //updating the found post's title and description (not on server)
  updatedPost.title = title;
  updatedPost.description = description;

  try {
    //saving changes to post on server
    await updatedPost.save();
  } catch (err) {
    return next(
      //there was an error contacting the server
      new HttpError(
        "something went wrong. post wasn't updated. please try again",
        500
      )
    );
  }

  res.status(200).json({ post: updatedPost.toObject({ getters: true }) });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updatePostLikes = async (req, res, next) => {
  // const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //the requested information for updating the post is invalid
    return next(new HttpError("Invalid inputs, please try again", 422));
  }

  //extract the likes and disLikes from the body
  const { likes, disLikes, postID } = req.body;
  //extract the post id and creator from the parameters

  let updatedPost;
  try {
    updatedPost = await Post.findById(postID);
  } catch (err) {
    //there was an error contacting the server
    return next(
      new HttpError(
        "something went wrong. post wasn't updated. please try again",
        500
      )
    );
  }

  if (!updatedPost) {
    return next(new HttpError("Could not find post for provided id", 404));
  }

  //updating the found post's title and description (not on server)
  updatedPost.likes = likes;
  updatedPost.disLikes = disLikes;

  try {
    //saving changes to post on server
    await updatedPost.save();
  } catch (err) {
    return next(
      //there was an error contacting the server
      new HttpError(
        "something went wrong. post wasn't updated. please try again",
        500
      )
    );
  }

  res.status(200).json({ post: updatedPost.toObject({ getters: true }) });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deletePost = async (req, res, next) => {
  // extract the post id and creator from the parameters
  const postId = req.params.pid;

  let post;
  try {
    // finding the post and we want to
    // populate allows to refer to a document, stored in another collection and work with it
    post = await Post.findById(postId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }

  //make sure that the user who wants to delete is the same one that created the post
  if (post.creator.id !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this Post!!!", 401)
    );
  }

  if (!post) {
    //no post was found with the id of postId
    const error = new HttpError("Could not find post for this id.", 404);
    return next(error);
  }

  //getting the image's path
  const imagePath = post.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess }); // removing the post from posts
    post.creator.posts.pull(post); // remove the post from its creators posts array
    await post.creator.save({ session: sess }); // saving changes to creator
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }

  // removing the image from the database
  fs.unlink(imagePath, (err) => {
    // loging the error if there is one
    console.log(err);
  });

  res.status(200).json({ message: "Deleted post." });
};

exports.getPostByPostId = getPostByPostId;
exports.getPostsByUserId = getPostsByUserId;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.updatePostLikes = updatePostLikes;
exports.deletePost = deletePost;
