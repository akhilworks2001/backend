import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
        const userId = get.user?._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid user ID"));
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    const createdTweet = await Tweet.findById(tweet._id).populate('owner', 'name');

    if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while tweeing");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, createdTweet, "Tweetied Successfully"));

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while tweeting"));
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid user ID"));
        }

        const tweetsByUser = await Tweet.aggregate([
            {$match: {owner: mongoose.Types.ObjectId(userId)}},
            {$sort: { createdAt: -1 } }
        ])

        return res
            .status(200)
            .json(new ApiResponse(200, tweetsByUser, "User's tweets fetched successfully"));

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching user tweets"));
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        const {content} = req.body;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid user ID"));
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {content},
        {new : true}
    )

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
    .status(201)
    .json(new ApiResponse(201, updatedTweet, "Tweet updated successfully"))

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while updating tweets"));
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tweetId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid user ID"));
        }

        const tweetDeleted = await Tweet.findOneAndDelete(tweetId);

        if (!tweetDeleted) {
            return res
            .status(404)
            .json(new ApiError(404, "Comment not found"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet deleted successfully"));

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while deleting tweet"));
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}