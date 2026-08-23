import { Router } from "express";
import { createService, getAllService, getSingleService } from "./serice.controller";

const serviceRouter = Router();
serviceRouter.get("/", getAllService);
serviceRouter.get("/:id", getSingleService);
serviceRouter.post("/", createService )
export default serviceRouter;
