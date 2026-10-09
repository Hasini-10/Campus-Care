import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: {
      type: String,
      required: true,
      enum: ["Facilities", "Cleanliness", "Transport", "Wi-Fi / IT", "Safety", "Other"]
    },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    reporter: { type: String, required: true, trim: true, maxlength: 80 },
    status: {
      type: String,
      enum: ["Submitted", "In Progress", "Resolved"],
      default: "Submitted"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
