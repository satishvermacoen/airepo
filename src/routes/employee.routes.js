
import { Router } from "express";
import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    updateEmployeeStatus
} from "../controllers/controllers_main/employee.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/")
    .post(upload.single("profilePicture"), createEmployee)
    .get(getAllEmployees);

router.route("/:employeeId")
    .get(getEmployeeById)
    .patch(upload.single("profilePicture"), updateEmployee)
    .delete(deleteEmployee);

router.route("/:employeeId/status").patch(updateEmployeeStatus);

export default router;
