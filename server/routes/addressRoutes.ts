
import { Router } from "express";
import { AddressController } from "../controllers/addressController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", AddressController.getAddresses);
router.post("/", AddressController.createAddress);
router.put("/:id", AddressController.updateAddress);
router.delete("/:id", AddressController.deleteAddress);

export default router;
