import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middleware/not-found";
import { globalErrorHandler } from "./middleware/global-error";
import authRouter from "./modules/auth/auth.routes";
import adminRouter from "./modules/admin/admin.routes";
import serviceRouter from "./modules/service/service.routes";
import categoryRouter from "./modules/category/category.routes";
import techniciaRouter from "./modules/technician/technician.routes";
import bookingRouter from "./modules/booking/booking.routes";
import userRouter from "./modules/user/user.route";
import reviewRouter from "./modules/review/review.routes";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/services", serviceRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/technician", techniciaRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/user", userRouter);


app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
