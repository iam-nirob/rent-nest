import { Router } from "express";
import { usersController } from "./users.controller";

const router: Router = Router();
router.post("/register", usersController.createUser);
export const usersRouter = router;
