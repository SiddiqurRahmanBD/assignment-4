import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { createReview, deleteReview, getAllReviews } from "./review.controller";

const reviewRouter = Router();
reviewRouter.post("/", auth(Role.CUSTOMER), createReview);
reviewRouter.get("", getAllReviews);
reviewRouter.delete("/:id", auth(Role.CUSTOMER, Role.ADMIN), deleteReview);
export default reviewRouter;
