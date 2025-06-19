import mongoose, { Schema } from "mongoose";

/**
 * @description Links a User to a Subscription plan and tracks its status.
 */
const userSubscriptionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: "Subscription",
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled', 'pending'],
            default: 'active'
        },
        paymentDetails: {
            paymentId: { type: String }, // From payment gateway
            paymentStatus: { type: String, default: "succeeded" },
            amountPaid: { type: Number }
        }
    },
    {
        timestamps: true
    }
);

// Middleware to calculate the subscription end date before saving
userSubscriptionSchema.pre('save', async function(next) {
    // Only run this logic if the document is new or the subscriptionId has been modified
    if (this.isNew || this.isModified('subscriptionId')) {
        try {
            const subscriptionPlan = await mongoose.model('Subscription').findById(this.subscriptionId);
            if (subscriptionPlan) {
                const now = new Date();
                this.startDate = now;
                // Calculate end date by adding the plan's duration to the start date
                this.endDate = new Date(now.setDate(now.getDate() + subscriptionPlan.durationInDays));
            }
        } catch (error) {
            console.error("Error fetching subscription plan to set end date:", error);
            // Pass the error to the next middleware
            return next(error); 
        }
    }
    next();
});

export const UserSubscription = mongoose.model("UserSubscription", userSubscriptionSchema);
