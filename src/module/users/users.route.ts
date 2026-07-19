import { Router } from "express";
import { usersController } from "./users.controller";
import { auth } from "../../middleware/auth.Middleware";
import { Role } from "../../../generated/prisma/enums";

// Mounted at /api/auth
const router: Router = Router();
router.post("/register", usersController.createUser);
router.get(
  "/me",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  usersController.getMyProfile,
);
router.patch(
  "/me",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  usersController.updateMyProfile,
);
export const usersRouter = router;
