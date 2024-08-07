import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from '../controllers/tweet.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route('/tweets').post(createTweet);
router.route('/tweets/user').get(getUserTweets)
router.route('/tweets/:tweetId').put(updateTweet).delete(deleteTweet);
