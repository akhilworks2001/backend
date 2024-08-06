import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Like } from "../models/like.model.js"
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res
            .status(400)
            .json(new ApiError(400, "Invalid video ID"))
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res
            .status(404)
            .json(new ApiError(404, "Video not found"))
        }

        const existingLike = await Like.findOne({video: videoId, likedBy: userId})

        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);
            return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like remove successfully"))
        } else {
            const newLike = new Like({
                video: videoId,
                likedBy: userId
            })
            await newLike.save();
            return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Video liked successfully"))
        }
    } catch (error) {
            return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while toggling like"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params;
        const userId = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res
            .status(400)
            .json(new ApiError(400, "Invalid comment ID"))
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res
            .status(404)
            .json(new ApiError(404, "Comment not found"))
        }

        const existingLike = await Like.findOne({comment: commentId, likedBy: userId})

        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);
            return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like remove successfully"))
        } else {
            const newLike = new Like({
                comment: commentId,
                likedBy: userId
            })
            await newLike.save();
            return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Comment liked successfully"))
        }

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while toggling like"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const {tweetId} = req.params;
        const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)){
        return res
            .status(400)
            .json(new ApiError(400, "Invalid tweet ID"))
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        return res
            .status(404)
            .json(new ApiError(404, "Tweet not found"))
    }

    const existingLike = await Like.findOne({tweet: tweetId, likedBy: userId})

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like remove successfully"))
    } else {
        const newLike = new Like({
            tweet: tweetId,
            likedBy: userId
        })
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Tweet liked successfully"))
    }
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while toggling like"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid user ID"));
    }

    const likedVideos = await Like.aggregate([
        { $match: { likedBy: mongoose.Types.ObjectId(userId), video: { $exists: true } } },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'videoDetails'
            }
        },
        { $unwind: '$videoDetails' },
        {
            $lookup: {
                from: 'users',
                localField: 'videoDetails.owner',
                foreignField: '_id',
                as: 'videoDetails.ownerDetails'
            }
        },
        { $unwind: '$videoDetails.ownerDetails' },
        {
            $project: {
                _id: 0,
                video: '$videoDetails',
                owner: '$videoDetails.ownerDetails'
            }
        }
    ]);


        return res
            .status(200)
            .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching liked videos"));
    }
})



export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
}