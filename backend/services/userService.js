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
    email: user.email
  };
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

async function createUser({ name, email, password }) {
  if (!useLocalStore()) {
    return User.create({ name, email, password });
  }

  const db = await readDb();
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: createId(),
    name: name.trim(),
    email,
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
