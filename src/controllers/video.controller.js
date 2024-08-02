import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";



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
    const { videoFile, thumbnail } = req.files;

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

const updateVideo = asyncHandler ( async (req, res) => {
    try {
        const { videoId } = req.params;
    const { newVideo } = req.files;

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { newVideo },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError ( 400, "Something wnet wrong while updating the video")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, updatedVideo, "Video updated successfully"))
    } catch ( error ) {
        throw new ApiError(
            500,
            "Something went wrong while updating video"
        )
    }
    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo
};