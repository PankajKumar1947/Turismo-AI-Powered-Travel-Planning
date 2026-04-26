import { Router } from "express";
import { RecommendController } from "./recommend.controller";
import { validate } from "../../middleware/validate.middleware";
import { recommendSchema, aggregateSchema, findRoutesSchema } from "./recommend.validation";

const router = Router();

router.post("/places", validate(recommendSchema), RecommendController.getPlaces);
router.post("/routes", validate(findRoutesSchema), RecommendController.getRoutes);
router.post("/aggregate", validate(aggregateSchema), RecommendController.aggregate);

export default router;
