import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const options = {
    page: page,
    limit: limit,
  };

  const aggregation = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ]);

  const aggreagtionResults = await Comment.aggregatePaginate(
    aggregation,
    options
  );
  if (!aggreagtionResults) {
    throw new ApiError(404, "No comments found");
  }
  new mongoose.Types.ObjectId(videoId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, aggreagtionResults, "Comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { comment } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!content) {
    throw new ApiError(400, "Comment is required");
  }

  const createdComment = await Comment.create({
    content: comment,
    video: videoId,
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  const addedComment = await Comment.findById(createdComment._id);

  if (!addedComment) {
    throw new ApiError(500, "Failed to add comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, addComment, "Comment added succesfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { newComment } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  if (!newComment) {
    throw new ApiError(400, "New comment is");
  }

  const comment = await Comment.find({
    $and: [
      { owner: req.user._id },
      { _id: new mongoose.Types.ObjectId(commentId) },
    ],
  });

  if (!comment) {
    throw new ApiError(
      401,
      "Owner of the comment and current user are not same"
    );
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    comment._id,
    {
      $set: {
        content: newComment,
      },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Unable to update the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const comment = await Comment.find({
    $and: [
      { owner: req.user._id },
      { _id: new mongoose.Types.ObjectId(commentId) },
    ],
  });

  if (!comment) {
    throw new ApiError(
      401,
      "Owner of the comment and current user are not same"
    );
  }

  const deletedComment = await Comment.deleteOne(comment._id);
  if (deletedComment.deletedCount !== 1) {
    throw new ApiError(500, "Failed to delete the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
