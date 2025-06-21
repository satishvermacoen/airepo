
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Subscription } from "../../models/subscription.model.js";
import { UserSubscription } from "../../models/userSubscription.model.js";
import { User } from "../../models/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Subscription Plan Controllers
const createSubscriptionPlan = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        duration,
        features,
        maxMembers,
        isActive
    } = req.body;

    if (!name || !price || !duration) {
        throw new ApiError(400, "Name, price, and duration are required");
    }

    const subscription = await Subscription.create({
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        features: features || [],
        maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
        isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json(
        new ApiResponse(201, subscription, "Subscription plan created successfully")
    );
});

const getAllSubscriptionPlans = asyncHandler(async (req, res) => {
    const { activeOnly = 'true' } = req.query;

    const filter = {};
    if (activeOnly === 'true') {
        filter.isActive = true;
    }

    const subscriptions = await Subscription.find(filter).sort({ price: 1 });

    return res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscription plans fetched successfully")
    );
});

const getSubscriptionPlanById = asyncHandler(async (req, res) => {
    const { planId } = req.params;

    const subscription = await Subscription.findById(planId);
    if (!subscription) {
        throw new ApiError(404, "Subscription plan not found");
    }

    return res.status(200).json(
        new ApiResponse(200, subscription, "Subscription plan fetched successfully")
    );
});

const updateSubscriptionPlan = asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const updateData = req.body;

    if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
    }
    if (updateData.duration) {
        updateData.duration = parseInt(updateData.duration);
    }
    if (updateData.maxMembers) {
        updateData.maxMembers = parseInt(updateData.maxMembers);
    }

    const subscription = await Subscription.findByIdAndUpdate(
        planId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!subscription) {
        throw new ApiError(404, "Subscription plan not found");
    }

    return res.status(200).json(
        new ApiResponse(200, subscription, "Subscription plan updated successfully")
    );
});

const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
    const { planId } = req.params;

    // Check if any users are currently subscribed to this plan
    const activeSubscriptions = await UserSubscription.countDocuments({
        subscription: planId,
        status: 'active'
    });

    if (activeSubscriptions > 0) {
        throw new ApiError(400, "Cannot delete subscription plan with active users");
    }

    const subscription = await Subscription.findByIdAndDelete(planId);
    if (!subscription) {
        throw new ApiError(404, "Subscription plan not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Subscription plan deleted successfully")
    );
});

// User Subscription Controllers
const subscribeUser = asyncHandler(async (req, res) => {
    const { userId, subscriptionId, paymentMethod, discountAmount = 0 } = req.body;

    if (!userId || !subscriptionId) {
        throw new ApiError(400, "User ID and subscription ID are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if subscription plan exists
    const subscriptionPlan = await Subscription.findById(subscriptionId);
    if (!subscriptionPlan || !subscriptionPlan.isActive) {
        throw new ApiError(404, "Subscription plan not found or inactive");
    }

    // Check if user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({
        user: userId,
        status: 'active'
    });

    if (existingSubscription) {
        throw new ApiError(400, "User already has an active subscription");
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + subscriptionPlan.duration);

    const finalAmount = Math.max(0, subscriptionPlan.price - discountAmount);

    const userSubscription = await UserSubscription.create({
        user: userId,
        subscription: subscriptionId,
        startDate,
        endDate,
        status: 'active',
        paymentMethod,
        amountPaid: finalAmount,
        discountAmount
    });

    // Update user's subscription reference
    await User.findByIdAndUpdate(userId, {
        userSubscription: userSubscription._id
    });

    const populatedSubscription = await UserSubscription.findById(userSubscription._id)
        .populate('user', 'fullName email username')
        .populate('subscription');

    return res.status(201).json(
        new ApiResponse(201, populatedSubscription, "User subscribed successfully")
    );
});

const getAllUserSubscriptions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, expired } = req.query;

    const filter = {};
    if (status) filter.status = status;
    
    if (expired === 'true') {
        filter.endDate = { $lt: new Date() };
        filter.status = 'active';
    }

    const subscriptions = await UserSubscription.find(filter)
        .populate('user', 'fullName email username')
        .populate('subscription')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await UserSubscription.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            subscriptions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "User subscriptions fetched successfully")
    );
});

const getUserSubscription = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const userSubscription = await UserSubscription.findOne({
        user: userId,
        status: 'active'
    })
    .populate('subscription')
    .populate('user', 'fullName email username');

    if (!userSubscription) {
        throw new ApiError(404, "No active subscription found for this user");
    }

    return res.status(200).json(
        new ApiResponse(200, userSubscription, "User subscription fetched successfully")
    );
});

const renewSubscription = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params;
    const { paymentMethod, discountAmount = 0 } = req.body;

    const userSubscription = await UserSubscription.findById(subscriptionId)
        .populate('subscription');

    if (!userSubscription) {
        throw new ApiError(404, "User subscription not found");
    }

    // Calculate new dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + userSubscription.subscription.duration);

    const finalAmount = Math.max(0, userSubscription.subscription.price - discountAmount);

    const updatedSubscription = await UserSubscription.findByIdAndUpdate(
        subscriptionId,
        {
            startDate,
            endDate,
            status: 'active',
            paymentMethod,
            amountPaid: finalAmount,
            discountAmount,
            renewalCount: userSubscription.renewalCount + 1
        },
        { new: true }
    )
    .populate('user', 'fullName email username')
    .populate('subscription');

    return res.status(200).json(
        new ApiResponse(200, updatedSubscription, "Subscription renewed successfully")
    );
});

const cancelSubscription = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const userSubscription = await UserSubscription.findByIdAndUpdate(
        subscriptionId,
        { 
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date()
        },
        { new: true }
    )
    .populate('user', 'fullName email username')
    .populate('subscription');

    if (!userSubscription) {
        throw new ApiError(404, "User subscription not found");
    }

    // Remove subscription reference from user
    await User.findByIdAndUpdate(userSubscription.user._id, {
        $unset: { userSubscription: 1 }
    });

    return res.status(200).json(
        new ApiResponse(200, userSubscription, "Subscription cancelled successfully")
    );
});

const getSubscriptionStats = asyncHandler(async (req, res) => {
    const totalActive = await UserSubscription.countDocuments({ status: 'active' });
    const totalExpired = await UserSubscription.countDocuments({ 
        status: 'active',
        endDate: { $lt: new Date() }
    });
    const totalCancelled = await UserSubscription.countDocuments({ status: 'cancelled' });
    
    const monthlyRevenue = await UserSubscription.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setDate(1))
                }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountPaid" }
            }
        }
    ]);

    const stats = {
        totalActive,
        totalExpired,
        totalCancelled,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Subscription statistics fetched successfully")
    );
});

export {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    subscribeUser,
    getAllUserSubscriptions,
    getUserSubscription,
    renewSubscription,
    cancelSubscription,
    getSubscriptionStats
};
