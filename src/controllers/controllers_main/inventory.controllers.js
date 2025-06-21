
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { InventoryItem } from "../../models/inventory.model/inventoryItem.model.js";
import { Supplier } from "../../models/inventory.model/supplier.model.js";
import { PurchaseOrder } from "../../models/inventory.model/purchaseOrder.model.js";
import { Sale } from "../../models/inventory.model/sale.model.js";
import { InventoryAdjustment } from "../../models/inventory.model/inventoryAdjustment.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Inventory Item Controllers
const createInventoryItem = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        category,
        sku,
        quantity,
        unitPrice,
        reorderLevel,
        supplier
    } = req.body;

    if (!name || !category || !sku || quantity === undefined || !unitPrice) {
        throw new ApiError(400, "Name, category, SKU, quantity, and unit price are required");
    }

    // Check if SKU already exists
    const existingItem = await InventoryItem.findOne({ sku });
    if (existingItem) {
        throw new ApiError(409, "Item with this SKU already exists");
    }

    const inventoryItem = await InventoryItem.create({
        name,
        description,
        category,
        sku,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        reorderLevel: parseInt(reorderLevel) || 0,
        supplier
    });

    return res.status(201).json(
        new ApiResponse(201, inventoryItem, "Inventory item created successfully")
    );
});

const getAllInventoryItems = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, lowStock } = req.query;

    const filter = {};
    if (category) filter.category = category;

    let items;
    if (lowStock === 'true') {
        items = await InventoryItem.find({
            ...filter,
            $expr: { $lte: ["$quantity", "$reorderLevel"] }
        })
        .populate('supplier')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
    } else {
        items = await InventoryItem.find(filter)
        .populate('supplier')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
    }

    const total = await InventoryItem.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Inventory items fetched successfully")
    );
});

const updateInventoryItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const updateData = req.body;

    const item = await InventoryItem.findByIdAndUpdate(
        itemId,
        updateData,
        { new: true, runValidators: true }
    ).populate('supplier');

    if (!item) {
        throw new ApiError(404, "Inventory item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Inventory item updated successfully")
    );
});

const deleteInventoryItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const item = await InventoryItem.findByIdAndDelete(itemId);
    if (!item) {
        throw new ApiError(404, "Inventory item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Inventory item deleted successfully")
    );
});

// Supplier Controllers
const createSupplier = asyncHandler(async (req, res) => {
    const { name, contactPerson, email, phone, address } = req.body;

    if (!name || !contactPerson || !email) {
        throw new ApiError(400, "Name, contact person, and email are required");
    }

    const supplier = await Supplier.create({
        name,
        contactPerson,
        email,
        phone,
        address
    });

    return res.status(201).json(
        new ApiResponse(201, supplier, "Supplier created successfully")
    );
});

const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({ status: 'active' }).sort({ name: 1 });

    return res.status(200).json(
        new ApiResponse(200, suppliers, "Suppliers fetched successfully")
    );
});

// Purchase Order Controllers
const createPurchaseOrder = asyncHandler(async (req, res) => {
    const { supplier, items, expectedDeliveryDate } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Supplier and items are required");
    }

    let totalAmount = 0;
    for (const item of items) {
        totalAmount += item.quantity * item.unitPrice;
    }

    const purchaseOrder = await PurchaseOrder.create({
        supplier,
        items,
        totalAmount,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined
    });

    return res.status(201).json(
        new ApiResponse(201, purchaseOrder, "Purchase order created successfully")
    );
});

const getAllPurchaseOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const orders = await PurchaseOrder.find(filter)
        .populate('supplier')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await PurchaseOrder.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Purchase orders fetched successfully")
    );
});

const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const order = await PurchaseOrder.findByIdAndUpdate(
        orderId,
        { status, ...(status === 'delivered' && { deliveredAt: new Date() }) },
        { new: true }
    ).populate('supplier');

    if (!order) {
        throw new ApiError(404, "Purchase order not found");
    }

    // If delivered, update inventory quantities
    if (status === 'delivered') {
        for (const item of order.items) {
            await InventoryItem.findByIdAndUpdate(
                item.item,
                { $inc: { quantity: item.quantity } }
            );
        }
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Purchase order status updated successfully")
    );
});

// Sale Controllers
const createSale = asyncHandler(async (req, res) => {
    const { customer, items, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items are required");
    }

    let totalAmount = 0;
    
    // Validate inventory and calculate total
    for (const saleItem of items) {
        const inventoryItem = await InventoryItem.findById(saleItem.item);
        if (!inventoryItem) {
            throw new ApiError(404, `Inventory item not found: ${saleItem.item}`);
        }
        if (inventoryItem.quantity < saleItem.quantity) {
            throw new ApiError(400, `Insufficient stock for ${inventoryItem.name}`);
        }
        totalAmount += saleItem.quantity * saleItem.unitPrice;
    }

    const sale = await Sale.create({
        customer,
        items,
        totalAmount,
        paymentMethod
    });

    // Update inventory quantities
    for (const saleItem of items) {
        await InventoryItem.findByIdAndUpdate(
            saleItem.item,
            { $inc: { quantity: -saleItem.quantity } }
        );
    }

    return res.status(201).json(
        new ApiResponse(201, sale, "Sale created successfully")
    );
});

const getAllSales = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const sales = await Sale.find(filter)
        .populate('items.item')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Sale.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            sales,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Sales fetched successfully")
    );
});

export {
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
};
