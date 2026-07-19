import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { rentalController } from "./rental.controller";
import { Role } from "../../../generated/prisma/enums";

// Mounted at /api/rentals - tenant self-service
const router: Router = Router();
router.post("/", auth(Role.TENANT), rentalController.submitRentalRequest);
router.get("/", auth(Role.TENANT), rentalController.getRentalRequest);
router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  rentalController.getRentalRequestById,
);
export const rentalRoute = router;

// Mounted at /api/landlord/requests - landlord manages incoming requests
const landlordRouter: Router = Router();
landlordRouter.get(
  "/",
  auth(Role.LANDLORD),
  rentalController.getAllRentalRequests,
);
landlordRouter.patch(
  "/:id",
  auth(Role.LANDLORD),
  rentalController.updateRentalRequest,
);
export const landlordRentalRoute = landlordRouter;
