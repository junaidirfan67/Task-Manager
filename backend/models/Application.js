const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["applied", "reviewing", "interview", "offer", "rejected"],
      default: "applied",
      index: true
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    resumeSnapshot: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
