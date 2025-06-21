import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
import employeeRouter from "./routes/employee.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import inventoryRouter from "./routes/inventory.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/inventory", inventoryRouter);

export { app };