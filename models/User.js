import mongoose from "mongoose";

const userSchema = new mongoose.Schema( {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: [ "admin", "employee" ], required: true },
    profileImage: { type: String },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
}, { timestamps: true } );
const User = mongoose.model( "User", userSchema )

export default User;