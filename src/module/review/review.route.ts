import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { Role } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";

// Mounted at /api/reviews
const router: Router = Router();
router.post("/", auth(Role.TENANT), reviewController.createReview);
export const reviewRoutes = router;
