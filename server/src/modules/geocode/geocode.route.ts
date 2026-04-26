import { Router } from "express";
import { GeocodeController } from "./geocode.controller";
import { validate } from "../../middleware/validate.middleware";
import { forwardGeocodeSchema, reverseGeocodeSchema } from "./geocode.validation";

const router = Router();

router.post("/forward", validate(forwardGeocodeSchema), GeocodeController.forward);
router.post("/reverse", validate(reverseGeocodeSchema), GeocodeController.reverse);

export default router;
