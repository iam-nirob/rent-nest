import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

// Mounted at /api/admin - admin only
const router: Router = Router();
router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  adminController.updateUserStatus,
);
router.get(
  "/properties",
  auth(Role.ADMIN),
  adminController.getAllProperties,
);
router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentals);
export const adminRoutes = router;
