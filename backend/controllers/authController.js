const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const {
  createUser,
  findUserByEmail,
  getUserId,
  matchPassword,
  serializeUser
} = require("../services/userService");

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await createUser({ name, email: normalizedEmail, password });

  res.status(201).json({
    user: serializeUser(user),
    token: createToken(getUserId(user))
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await findUserByEmail(normalizedEmail, { includePassword: true });

  if (!user || !(await matchPassword(user, password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    user: serializeUser(user),
    token: createToken(getUserId(user))
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
