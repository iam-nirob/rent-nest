import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { usersRouter } from "./module/users/users.route";
import { authRouter } from "./module/auth/auth.route";
const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// Common Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  res.send("Rent Nest Server");
});

app.use("/api/auth", usersRouter);
app.use("/api/auth", authRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
