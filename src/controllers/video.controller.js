import {  uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteComment } from "./comment.controller.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        query = '', 
        sortBy = 'createdAt', 
        sortType = 'desc', 
        userId 
    } = req.query;

    const matchStage = {
        $match: {
            $and: [
                { isPublished: true },
                {
                    $or: [
                        {title: {$regex: query, $options: 'i'} },
                        {description: {$regex: query, $options: 'i'} }
                    ]
                }
            ]
        }
    };

    if (userId ) {
        matchStage.$match.$and.push({ owner: mongoose.Types.ObjectId(userId) });

    }

    const sortStage = {
        $sort: {
            [sortBy]: sortType === 'asc' ? 1 : -1
        }
    };

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const aggregateQuery = Video.aggregate([
        matchStage,
        sortStage
    ]);

    try {
        const result = await Video.aggregatePaginate(aggregateQuery, options);
        return res
        .status(200)
        .json(new ApiResponse(200, result, "All videos fecthed successfully"))
    } catch (error) {
        return res
        .status(200)
        .json(new ApiError(500, "Something went wrong while fetching the videos"))
    }

});

const publishAVideo = asyncHandler(async(req, res) => {
    const {title, description, duration} = req.body;
    const videoFile = req.files?.video[0]?.path;
    const thumbnail = req.files?.thumbnail[0]?.path;

    if (!videoFile || !thumbnail || !title || !description) {
        throw new ApiError( 400, "All fields are required" )
    };

    try {
        const videoUrl = await uploadOnCloudinary(videoFile[0].path, 'videos');
        const thumbnailUrl = await uploadOnCloudinary(thumbnail[0].path, 'thumbnails');

        const newVideo = new Video({
            videoFile: videoUrl,
            thumbnail: thumbnailUrl,
            title,
            description,
            duration,
            owner: req.user?._id
        });

        const savedVideo = await newVideo.save();

        return res
        .status(201)
        .json(new ApiResponse(201, savedVideo, "Video published successfully"))

    } catch (error) {
        return res
        .status(500)
        .json(new ApiError(500, "Something went wrong while publishing the video"))
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(validId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    try {
        const video = await Video.findById(videoId).populate('owner', 'username');

        if (!video) throw new ApiError(404, "Video not found")

        return res
        .status(200)
        .json(new ApiResponse(200, video, 'Vidoe fecthed successfully'));

    } catch (error) {
        return res
        .status(500)
        .json(new ApiError (500, 'Something went wong while fecthing the video'))
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnail = req.files?.thumbnail?.[0]?.path;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).json(new ApiError(400, "Invalid video ID"));
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json(new ApiError(404, 'Video not found'));
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;

        if (videoFile) {
            const newVideoUrl = await uploadOnCloudinary(videoFile);

            const oldVideoPublicId = video.videoFile.split('/').pop().split('.')[0];
            await deleteOnCloudinary(oldVideoPublicId);

            updateData.videoFile = newVideoUrl;
        }

        if (thumbnail) {
            const newThumbnailUrl = await uploadOnCloudinary(thumbnail);

            const oldThumbnailPublicId = video.thumbnail.split('/').pop().split('.')[0];
            await deleteOnCloudinary(oldThumbnailPublicId);

            updateData.thumbnail = newThumbnailUrl;
        }
        
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId, 
            { $set: updateData },
            { new: true }
        );

        res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, 'Something went wrong while updating the video'));
    }
});

const deleteVideo = asyncHandler (async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(validId)) {
            return res
            .status(400)
            .json(new ApiError(400, "Invalid video ID"))
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res
            .status(400)
            .json(new ApiError(404, "Video not found"))
        }

        const videoPublicId = video.videoFile.split('/').pop().split('.')[0];
        const thumbnailPublicId = video.thumbnail.split('/').pop().split('.')[0];

        await deleteOnCloudinary(videoPublicId)
        await deleteOnCloudinary(thumbnailPublicId)
        await videoId.findById(videoId);

    return res
    .status(201)
    .json(new ApiResponse(201, {}, "Video deleted successfully"))
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while deleting video"
        )
    }
})

const togglePublicStatus = asyncHandler(async(req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res
        .status(400)
        .json(new ApiError(400, "Invalid video ID"))
    }

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res
            .status(404)
            .json(new ApiError(404, "Video not found"))
        }

        video.isPublished = !video.isPublished;
        await video.save();

        return res
        .status(200)
        .json(new ApiError(200, video, "Publish status toggled succefully"))

    } catch (error) {
        return res
        .status(200)
        .json(new ApiError(500, "Something went wrong while toggling publish status"))
    }
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublicStatus
};