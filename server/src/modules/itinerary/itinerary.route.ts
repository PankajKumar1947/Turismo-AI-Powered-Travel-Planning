import { Router } from "express";
import { ItineraryController } from "./itinerary.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { saveItinerarySchema } from "./itinerary.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(saveItinerarySchema), ItineraryController.save);
router.get("/", ItineraryController.getAll);
router.get("/:id", ItineraryController.getById);
router.delete("/:id", ItineraryController.delete);

export default router;
