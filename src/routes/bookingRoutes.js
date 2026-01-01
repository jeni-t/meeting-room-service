import express from "express";
import * as ctrl from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", ctrl.create);
router.get("/", ctrl.list);
router.post("/:id/cancel", ctrl.cancel);
router.get("/reports/utilization", ctrl.utilization); // optional
router.get("/reports/room-utilization", ctrl.utilization); // required

export default router;
