import {Router} from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateAvatarAndCoverImage, getUserChannelProfile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/update-details").post(verifyJWT, updateAccountDetails)
router.route("/update-avatar-cover-images").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    verifyJWT, updateAvatarAndCoverImage);
router.route("/channel-profile").post(verifyJWT, getUserChannelProfile)


    
export default router