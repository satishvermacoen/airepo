import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for tracking purchase orders made to suppliers.
 */
const purchaseOrderSchema = new Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        supplier: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "GymBranch",
            required: true,
        },
        items: [
            {
                item: {
                    type: Schema.Types.ObjectId,
                    ref: "InventoryItem",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                unitPrice: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        expectedDeliveryDate: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
