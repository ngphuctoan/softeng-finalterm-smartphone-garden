import { Router } from "express";
import { UserController, ProfileController } from "@controllers";

const profileRoutes = Router();

profileRoutes.get("/profile",
  UserController.getMyProfile,
  ProfileController.renderProfile
);

profileRoutes.post("/profile/change-password",
  UserController.getMyProfile,
  ProfileController.validatePasswordChange,
  UserController.updateMyPassword
);

export default profileRoutes;