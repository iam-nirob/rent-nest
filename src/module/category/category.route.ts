import { Router } from "express";
import { auth } from "../../middleware/auth.Middleware";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";

// Mounted at /api/categories - public
const router: Router = Router();
router.get("/", categoryController.getCategories);
export const categoryRoutes = router;

// Mounted at /api/admin/categories - admin only
const adminRouter: Router = Router();
adminRouter.post("/", auth(Role.ADMIN), categoryController.createCategory);
adminRouter.patch(
  "/:id",
  auth(Role.ADMIN),
  categoryController.updateCategory,
);
adminRouter.delete(
  "/:id",
  auth(Role.ADMIN),
  categoryController.deleteCategory,
);
export const adminCategoryRoutes = adminRouter;
