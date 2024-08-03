import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, togglePublicStatus, updateVideo } from "../controllers/video.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/video")
    .get(getAllVideos);

router.route("/publish")
    .post(upload.fields([{ name: 'videoFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), publishAVideo);
router.route("/video/:videoId")
    .get( verifyJWT, getVideoById)
    .put( verifyJWT, upload.fields([{ name: 'thumbnail', maxCount: 1 }]), updateVideo)
    .delete( verifyJWT, deleteVideo)

router.route("/video/:videoId/toggle-publish")
    .patch( verifyJWT, togglePublicStatus)

export default router;