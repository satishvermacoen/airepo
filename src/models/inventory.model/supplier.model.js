import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for suppliers of inventory items.
 * This tracks who you purchase your inventory from.
 */
const supplierSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        // Link to the gym branch this supplier is associated with
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "GymBranch",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
