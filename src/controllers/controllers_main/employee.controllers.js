
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Employee } from "../../models/employee.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const createEmployee = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        position,
        department,
        salary,
        hireDate,
        address,
        emergencyContact,
        qualifications,
        certifications
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !position) {
        throw new ApiError(400, "First name, last name, email, and position are required");
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
        throw new ApiError(409, "Employee with this email already exists");
    }

    // Handle profile picture upload
    let profilePictureUrl = "";
    if (req.file) {
        const profilePicture = await uploadOnCloudinary(req.file.path);
        if (profilePicture) {
            profilePictureUrl = profilePicture.url;
        }
    }

    const employee = await Employee.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        position,
        department,
        salary: parseFloat(salary),
        hireDate: new Date(hireDate),
        address,
        emergencyContact,
        qualifications: qualifications ? JSON.parse(qualifications) : [],
        certifications: certifications ? JSON.parse(certifications) : [],
        profilePicture: profilePictureUrl
    });

    return res.status(201).json(
        new ApiResponse(201, employee, "Employee created successfully")
    );
});

const getAllEmployees = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, department, position } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (position) filter.position = position;

    const employees = await Employee.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            employees,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Employees fetched successfully")
    );
});

const getEmployeeById = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, employee, "Employee fetched successfully")
    );
});

const updateEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const updateData = req.body;

    // Handle profile picture update
    if (req.file) {
        const profilePicture = await uploadOnCloudinary(req.file.path);
        if (profilePicture) {
            updateData.profilePicture = profilePicture.url;
        }
    }

    const employee = await Employee.findByIdAndUpdate(
        employeeId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, employee, "Employee updated successfully")
    );
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    const employee = await Employee.findByIdAndDelete(employeeId);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Employee deleted successfully")
    );
});

const updateEmployeeStatus = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'terminated'].includes(status)) {
        throw new ApiError(400, "Invalid status. Must be 'active', 'inactive', or 'terminated'");
    }

    const employee = await Employee.findByIdAndUpdate(
        employeeId,
        { status },
        { new: true }
    );

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, employee, "Employee status updated successfully")
    );
});

export {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    updateEmployeeStatus
};
