/**
 * Users controller.
 *
 * Description: Implements the four required Users lookups - list all,
 *   get by ID, get by phone, and a combined search by name + phone +
 *   zipcode (all three must match). Reads through the Netlify Blobs data
 *   layer, so every handler is async and forwards errors to next().
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: ../data/blobStore
 * Inputs: Express req/res/next
 * Expected output: JSON user object(s) or a 404/400 error shape
 */

const { listUsers, getUserById } = require("../data/blobStore");

function normalizePhone(phone) {
  return String(phone || "").replace(/[\s()\-.]/g, "");
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

// GET /api/users
async function getAllUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getUserByIdHandler(req, res, next) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: { message: `No user found with id ${req.params.id}`, status: 404 },
      });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/phone/:phone
async function getUsersByPhone(req, res, next) {
  try {
    const targetPhone = normalizePhone(req.params.phone);
    const users = await listUsers();
    const matches = users.filter((u) => normalizePhone(u.phone) === targetPhone);

    if (matches.length === 0) {
      return res.status(404).json({
        error: { message: `No user found with phone ${req.params.phone}`, status: 404 },
      });
    }
    res.json({ count: matches.length, users: matches });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/search?name=&phone=&zipcode=
async function searchUsers(req, res, next) {
  try {
    const { name, phone, zipcode } = req.query;

    if (!name || !phone || !zipcode) {
      return res.status(400).json({
        error: {
          message: "name, phone, and zipcode query parameters are all required.",
          status: 400,
        },
      });
    }

    const targetName = normalizeName(name);
    const targetPhone = normalizePhone(phone);
    const targetZip = String(zipcode).trim();

    const users = await listUsers();
    const match = users.find(
      (u) =>
        normalizeName(u.fullName) === targetName &&
        normalizePhone(u.phone) === targetPhone &&
        String(u.zipcode).trim() === targetZip
    );

    if (!match) {
      return res.status(404).json({
        error: {
          message: "No user found matching the provided name, phone, and zipcode.",
          status: 404,
        },
      });
    }
    res.json({ user: match });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUserById: getUserByIdHandler,
  getUsersByPhone,
  searchUsers,
};
