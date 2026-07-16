import { Router } from "express";
import { authController } from "./auth.controller";

const router: Router = Router();
router.post("/login", authController.loginUser);
export const authRouter = router;
