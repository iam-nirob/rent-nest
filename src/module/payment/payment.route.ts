import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

// Mounted at /api/payments
const router: Router = Router();
router.post("/create", auth(Role.TENANT), paymentController.createPayment);
router.post(
  "/confirm",
  auth(Role.TENANT),
  paymentController.confirmPayment,
);
// SSLCommerz calls this server-to-server without auth headers
router.post("/ipn/sslcommerz", paymentController.sslcommerzIpn);
router.get(
  "/",
  auth(Role.TENANT),
  paymentController.getMyPayments,
);
router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentController.getPaymentById,
);
export const paymentRoutes = router;
