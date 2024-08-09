import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/:playlistId")
    .get(getPlaylistById)

router.route("/").post(createPlaylist)
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/user/:userId").get(getUserPlaylists);