import express from "express";
import commonRoutes from "./common/standardRoutes.js";
import adminRoutes from "./admin/standardRoutes.js";

const router = express.Router();

// Mount common routes
router.use(commonRoutes);

// Mount admin routes - these will check for admin role inside
router.use(adminRoutes);

export default router;
