import { Router } from "express";
import { usersController } from "./users.controller";

const router: Router = Router();
router.post("/register", usersController.createUser);
router.get("/", usersController.getUser);
router.get("/:id", usersController.getUsersId);
export const usersRouter = router;
