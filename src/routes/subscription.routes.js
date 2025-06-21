
import { Router } from "express";
import {
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
} from "../controllers/controllers_main/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Subscription Plan Routes
router.route("/plans")
    .post(verifyJWT, createSubscriptionPlan)
    .get(getAllSubscriptionPlans);

router.route("/plans/:planId")
    .get(getSubscriptionPlanById)
    .patch(verifyJWT, updateSubscriptionPlan)
    .delete(verifyJWT, deleteSubscriptionPlan);

// User Subscription Routes
router.route("/user-subscriptions")
    .post(verifyJWT, subscribeUser)
    .get(verifyJWT, getAllUserSubscriptions);

router.route("/user-subscriptions/:userId").get(verifyJWT, getUserSubscription);
router.route("/user-subscriptions/:subscriptionId/renew").patch(verifyJWT, renewSubscription);
router.route("/user-subscriptions/:subscriptionId/cancel").patch(verifyJWT, cancelSubscription);
router.route("/stats").get(verifyJWT, getSubscriptionStats);

export default router;
