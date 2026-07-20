import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";

const router: Router = Router();
router.get("/", propertyController.getProperties);
router.get("/:id", propertyController.getPropertyById);
export const propertyRoutes = router;

const landlordRouter: Router = Router();
landlordRouter.get(
  "/",
  auth(Role.LANDLORD),
  propertyController.getMyProperties,
);
landlordRouter.post(
  "/",
  auth(Role.LANDLORD),
  propertyController.createProperty,
);
landlordRouter.put(
  "/:id",
  auth(Role.LANDLORD),
  propertyController.updateProperty,
);
landlordRouter.delete(
  "/:id",
  auth(Role.LANDLORD),
  propertyController.deleteProperty,
);
export const landlordPropertyRoutes = landlordRouter;
