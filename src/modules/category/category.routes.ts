import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { createCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory } from "./category.controller";

const categoryRouter = Router();
categoryRouter.post("/", auth(Role.ADMIN), createCategory);

categoryRouter.get("/", getAllCategories);

categoryRouter.get("/:id", getSingleCategory);

categoryRouter.patch("/:id", auth(Role.ADMIN), updateCategory);
categoryRouter.delete("/:id", auth(Role.ADMIN), deleteCategory);
export default categoryRouter;
