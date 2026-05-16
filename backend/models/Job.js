const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 140
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: 120
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 120
    },
    salary: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time"
    },
    workplace: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "Remote"
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 4000
    },
    requirements: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true
    }
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", company: "text", description: "text", location: "text" });
jobSchema.index({ employer: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
