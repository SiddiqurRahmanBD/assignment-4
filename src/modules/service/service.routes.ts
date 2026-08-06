import { Router } from "express";
import { getAllService, getSingleService } from "./serice.controller";

const serviceRouter = Router();
serviceRouter.get("/", getAllService);
serviceRouter.get("/:id", getSingleService);
export default serviceRouter;
