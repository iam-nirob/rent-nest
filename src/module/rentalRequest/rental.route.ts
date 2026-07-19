import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { rentalController } from "./rental.controller";

const router: Router = Router();
router.post("/submit", auth, rentalController.submitRentalRequest);
export const rentalRoute = router;
