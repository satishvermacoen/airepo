import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for suppliers of inventory items.
 * This tracks who you purchase your inventory from.
 */
const supplierSchema = new Schema(
    {
        supplierName: {
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
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
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
