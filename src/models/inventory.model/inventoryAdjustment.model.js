import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for logging manual adjustments to inventory stock.
 */
const inventoryAdjustmentSchema = new Schema(
    {
        itemId: {
            type: Schema.Types.ObjectId,
            ref: "InventoryItem",
            required: true,
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "GymBranch",
            required: true,
        },
        // The employee making the adjustment
        adjustedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        adjustmentType: {
            type: String,
            required: true,
            enum: ['increase', 'decrease'],
        },
        quantityChanged: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            enum: ['Stock Count Correction', 'Damaged Goods', 'Expired Goods', 'Lost/Stolen', 'Other'],
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const InventoryAdjustment = mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);
