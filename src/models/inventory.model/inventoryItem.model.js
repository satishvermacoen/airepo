import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for inventory items.
 * This tracks products like supplements, apparel, or equipment.
 */
const inventoryItemSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Supplements', 'Apparel', 'Equipment', 'Accessories', 'Beverages'],
            trim: true,
        },
        sku: {
            type: String,
            unique: true,
            trim: true,
            comment: "Stock Keeping Unit, a unique identifier for each item."
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        unitPrice: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        // Link to the supplier of this item
        supplier: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
        },
        // Link to the specific gym branch holding this inventory
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "GymBranch",
            required: true,
        },
        reorderLevel: {
            type: Number,
            default: 10,
            comment: "Threshold at which to reorder the item."
        },
    },
    {
        timestamps: true,
    }
);

export const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);
