
import { Router } from "express";
import {
    createInventoryItem,
    getAllInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    createSupplier,
    getAllSuppliers,
    createPurchaseOrder,
    getAllPurchaseOrders,
    updatePurchaseOrderStatus,
    createSale,
    getAllSales
} from "../controllers/controllers_inventory/inventory.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Inventory Item Routes
router.route("/items")
    .post(createInventoryItem)
    .get(getAllInventoryItems);

router.route("/items/:itemId")
    .patch(updateInventoryItem)
    .delete(deleteInventoryItem);

// Supplier Routes
router.route("/suppliers")
    .post(createSupplier)
    .get(getAllSuppliers);

// Purchase Order Routes
router.route("/purchase-orders")
    .post(createPurchaseOrder)
    .get(getAllPurchaseOrders);

router.route("/purchase-orders/:orderId/status").patch(updatePurchaseOrderStatus);

// Sales Routes
router.route("/sales")
    .post(createSale)
    .get(getAllSales);

export default router;
