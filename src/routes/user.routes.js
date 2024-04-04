import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updatePassword,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// open routes
router.route("/register").post(registerUser); // Task 1
router.route("/login").post(loginUser); // Task 1

// secured routes
router.route("/logout").post(verifyJWT, logoutUser); // Task 1

router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-user").patch(verifyJWT, updateUserDetails);
router.route("/update-password").patch(verifyJWT, updatePassword);

export default router;
