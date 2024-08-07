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
    const {userId} = req.params
    //TODO: get user playlists
})


export {
    createPlaylist,
    
}