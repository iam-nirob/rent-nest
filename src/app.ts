import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

import { usersRouter } from "./module/users/users.route";
import { authRouter } from "./module/auth/auth.route";
import {
  landlordPropertyRoutes,
  propertyRoutes,
} from "./module/property/property.route";
import {
  adminCategoryRoutes,
  categoryRoutes,
} from "./module/category/category.route";
import {
  landlordRentalRoute,
  rentalRoute,
} from "./module/rentalRequest/rental.route";
import { paymentRoutes } from "./module/payment/payment.route";
import { reviewRoutes } from "./module/review/review.route";
import { adminRoutes } from "./module/admin/admin.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  res.send("Rent Nest Server");
});

app.use("/api/auth", usersRouter);
app.use("/api/auth", authRouter);

app.use("/api/properties", propertyRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/landlord/properties", landlordPropertyRoutes);
app.use("/api/landlord/requests", landlordRentalRoute);

app.use("/api/rentals", rentalRoute);

app.use("/api/payments", paymentRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
