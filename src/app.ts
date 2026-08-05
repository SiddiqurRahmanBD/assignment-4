import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middleware/not-found";
import { globalErrorHandler } from "./middleware/global-error";
import authRouter from "./modules/auth/auth.routes";
import adminRouter from "./modules/admin/admin.routes";


const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter)


app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
