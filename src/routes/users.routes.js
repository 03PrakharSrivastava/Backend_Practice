import { Router } from "express";
import registerUser, { loginUser, logOut } from "../controllers/user.controller.js"
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(
    // this is a middleware
    upload.fields([
        {name: "avatar",
         maxCount: 1,
        },
        {name: "coverImage",
        maxCount: 1
        }
    ]),
    registerUser);

router.route('/login').post(loginUser);

// secured endpoints

// you can add any number of middlewares before going to an endpoint
router.route('/logOut').post(verifyJWT,logOut);
router.route('/refresh-token').post(refreshAccessToken);

export default router;