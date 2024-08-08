import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const {name, description} = req.body;
        const userId = req.user?._id;

    if (!name || !description) {
        throw new ApiError(400, "name and description is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    const createdPlaylist = await playlist.save()

    if (!createdPlaylist) {
        throw new ApiError(500, "Something went wrong while creating the playlist");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, createdPlaylist, "Playlist created Successfully"));

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while creating playlist"));
    }

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const {userId} = req.user?._id
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid user ID"));
    }

    const getUserPlaylist = await Playlist.aggregate([
        {$match: {owner: mongoose.Types.ObjectId(userId)}},
        {$sort: { createdAt: -1 } }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, getUserPlaylist , "User's playlists fetched successfully"));

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching user playlists"));
    }

})

const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid playlist ID"));
        };

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res
                .status(404)
                .json(new ApiError(404, "Playlist not found"));
        };

        return res
        .status(200)
        .json(new ApiResponse(200,playlist , "User's playlist fetched successfully"));

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while fetching user playlist"));
    }
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params

        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid playlist ID"));
        };

        

    } catch (error) {
        
    }
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    
}