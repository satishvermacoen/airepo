import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for recording sales of inventory items to users.
 */
const saleSchema = new Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // The user (member) who made the purchase
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        // The employee who processed the sale
        processedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
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
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Credit Card', 'Debit Card', 'Online'],
            default: 'Cash',
        },
    },
    {
        timestamps: true,
    }
);

export const Sale = mongoose.model("Sale", saleSchema);
