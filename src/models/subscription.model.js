import mongoose, { Schema } from "mongoose";

/**
 * @description Defines the structure for subscription plans (e.g., Gold, Silver).
 */
const subscriptionSchema = new Schema(
    {
        planName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        durationInDays: {
            type: Number,
            required: true,
            comment: "Duration of the plan in days (e.g., 30 for monthly)"
        },
        features: [
            {
                type: String,
                trim: true
            }
        ],
        planType: {
            type: String,
            enum: ['Free', 'Monthly', 'Quarterly', 'Yearly'],
            default: 'Monthly'
        },
        isActive: {
            type: Boolean,
            default: true,
            comment: "Controls if the plan is available for new subscriptions"
        }
    },
    {
        timestamps: true
    }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
