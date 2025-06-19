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
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // The employee who processed the sale
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "User", // or "Employee" if you want to be more specific
            required: true,
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "GymBranch",
            required: true,
        },
        itemsSold: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "InventoryItem",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                pricePerItem: {
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
