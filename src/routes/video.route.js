import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, togglePublicStatus, updateVideo } from "../controllers/video.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyJWT)

router
    .route("/")
    .get(getAllVideos)
    .post(upload.fields([{ name: 'videoFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), publishAVideo);

router
    .route("/:videoId")
    .get(getVideoById)
    .put(upload.fields([{ name: 'thumbnail', maxCount: 1 }]), updateVideo)
    .delete(deleteVideo)

router.route("/toggle/publish/:videoId")
    .patch(togglePublicStatus)

export default router;