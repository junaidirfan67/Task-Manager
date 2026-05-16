const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["candidate", "employer", "admin"],
      default: "candidate",
      index: true
    },
    skills: {
      type: [String],
      default: []
    },
    resume: {
      type: String,
      trim: true,
      default: ""
    },
    company: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ""
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 160,
      default: ""
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ""
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
