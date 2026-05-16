const bcrypt = require("bcryptjs");
const { useLocalStore } = require("../config/storageMode");
const User = require("../models/User");
const { createId, readDb, writeDb } = require("./localDatabase");

function getUserId(user) {
  return String(user?._id || user?.id);
}

function serializeUser(user) {
  return {
    id: getUserId(user),
    name: user.name,
    email: user.email,
    role: user.role || "candidate",
    skills: Array.isArray(user.skills) ? user.skills : [],
    resume: user.resume || "",
    company: user.company || "",
    headline: user.headline || "",
    location: user.location || ""
  };
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

async function findUserByEmail(email, options = {}) {
  if (!useLocalStore()) {
    const query = User.findOne({ email });
    return options.includePassword ? query.select("+password") : query;
  }

  const db = await readDb();
  const user = db.users.find((item) => item.email === email);

  if (!user) {
    return null;
  }

  return options.includePassword ? user : serializeUser(user);
}

async function findUserById(id) {
  if (!useLocalStore()) {
    return User.findById(id).select("-password");
  }

  const db = await readDb();
  const user = db.users.find((item) => item.id === id);
  return user ? serializeUser(user) : null;
}

async function createUser({ name, email, password, role, skills, resume, company, headline, location }) {
  const payload = {
    name: name.trim(),
    email,
    password,
    role: role || "candidate",
    skills: normalizeSkills(skills),
    resume: resume || "",
    company: company || "",
    headline: headline || "",
    location: location || ""
  };

  if (!useLocalStore()) {
    return User.create(payload);
  }

  const db = await readDb();
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: createId(),
    ...payload,
    password: passwordHash,
    createdAt: now,
    updatedAt: now
  };

  db.users.push(user);
  await writeDb(db);
  return user;
}

async function matchPassword(user, enteredPassword) {
  if (!useLocalStore()) {
    return user.matchPassword(enteredPassword);
  }

  return bcrypt.compare(enteredPassword, user.password);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getUserId,
  matchPassword,
  serializeUser
};
