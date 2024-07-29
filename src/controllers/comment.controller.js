import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    try{
        //TODO: get all comments for a video
        const {videoId} = req.params
        const {page = 1, limit = 10} = req.query

        const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [{path: "owner", select: "username"}], // example popultaion
        sort: {createdAt: -1} // sort by newest first
    };

        const comments = await Comment.paginate({ video: videoId}, options);

        return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetch successfully"))

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while getting comments"
        )
    }
});

const addComment = asyncHandler(async (req, res) => {
    try{
        // TODO: add a comment to a video
        const {content, videoId} = req.body;
        const {userId} = req.user; // Assuming userId is extracted from authentication middleware

        const newComment = new Comment({
            content,
            video: videoId,
            owner: userId
        });

        const savedComment = await newComment.save();

        return res
        .status(201)
        .json(new ApiResponse(201, savedComment, "Commented added successfully"))

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while adding comment"
        )
    }

}) 

const updateComment = asyncHandler(async (req, res) => {
    try{
       // TODO: update a comment
        const { commentId } = req.params;
        const { content } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true}
        );

        if (!updatedComment) {
            throw new ApiError(404, "Comment not found");
        }

        return res
        .status(201)
        .json(new ApiResponse(201, updatedComment, "Commented updated successfully"))
        

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while updating comment"
        )
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    try{
        // TODO: delete a comment
         const { commentId } = req.params;
 
         const deletedComment = await Comment.findByIdAndDelete(commentId);
 
         if (!deletedComment) {
             throw new ApiError(404, "Comment not found");
         }
 
         return res
         .status(201)
         .json(new ApiResponse(201, {}, "Commented deleted successfully"))
         
 
     } catch (error) {
         throw new ApiError(
             500,
             "Something went wrong while deleting comment"
         )
     }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }