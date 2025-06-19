import mongoose, { Schema } from "mongoose";

/**
 * @description Mongoose schema for storing employee data.
 * This improved version includes employee status, more detailed employment info, and validation.
 */
const employeeSchema = new Schema(
    {
        // Link to the main user account
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        // Link to the gym branch the employee belongs to
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "GymBranch",
            required: true,
        },
        // **NEW**: Employee status to track their current employment state
        status: {
            type: String,
            enum: ['active', 'on_leave', 'terminated'],
            default: 'active',
            required: true,
        },
        // Section: Personal Information
        personalInfo: {
            firstName: { type: String, required: true, trim: true },
            lastName: { type: String, required: true, trim: true },
            dateOfBirth: { type: Date },
            gender: { type: String, enum: ['Male', 'Female', 'Other'] },
            address: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            // **NEW**: Added validation for pincode format
            pincode: { 
                type: String, 
                trim: true,
                match: [/^[1-9][0-9]{5}$/, 'Please fill a valid pincode']
            },
            // **NEW**: Added validation for mobile number format
            mobileNo: { 
                type: String, 
                trim: true,
                match: [/^[6-9]\d{9}$/, 'Please fill a valid mobile number']
            },
            homeNo: { type: String, trim: true },
            weightKg: { type: Number },
            heightCm: { type: Number },
        },
        // Section: Professional Qualifications
        professionalQualifications: {
            hasPersonalTrainingCerts: { type: Boolean, default: false },
            hasHealthScienceDegree: { type: Boolean, default: false },
            previousWorkExperience: { type: String, trim: true },
            professionalReferences: { type: String, trim: true },
        },
        // Section: Employment Information (More Detailed)
        employmentInfo: {
            jobTitleAppliedFor: { type: String, trim: true },
            // **NEW**: The official, confirmed job title
            jobTitle: {
                type: String,
                required: true,
                enum: ['Manager', 'Head Trainer', 'Trainer', 'Front Desk', 'Housekeeping', 'Other'],
                trim: true
            },
            // **NEW**: The official date of joining
            joiningDate: {
                type: Date,
                default: Date.now,
                required: true,
            },
            // **NEW**: The actual salary details
            salary: {
                type: Number,
                required: true
            },
            availabilityForWorkDays: { type: String, trim: true },
            preferredShiftTimes: { type: String, trim: true },
            startDatePreference: { type: Date },
        },
        // Section: Emergency Contact Details
        emergencyContact: {
            fullName: { type: String, trim: true },
            relationship: { type: String, trim: true },
            phone: { type: String, trim: true },
        },
        // Section: Bank Details
        bankDetails: {
            accountNo: { type: String, trim: true },
            ifscCode: { type: String, trim: true },
            bankName: { type: String, trim: true },
        },
    },
    {
        timestamps: true
    }
);

export const Employee = mongoose.model("Employee", employeeSchema);
