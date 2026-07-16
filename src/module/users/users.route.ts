import { Router } from "express";
import { usersController } from "./users.controller";

const router: Router = Router();
router.post("/register", usersController.createUser);
router.get("/", usersController.getUser);
router.get("/:id", usersController.getUsersId);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);
export const usersRouter = router;
