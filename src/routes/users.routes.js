/**
 * Users router.
 *
 * Description: Maps the four required Users lookups to their handlers.
 *   /phone/:phone and /search are declared before /:id on purpose -
 *   Express matches routes in declaration order, so if /:id came first
 *   it would swallow "phone" and "search" as literal id values.
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: express, ../controllers/users.controller
 * Inputs: none (router definition)
 * Expected output: an Express Router mounted at /users by the caller
 */

const express = require("express");
const controller = require("../controllers/users.controller");

const router = express.Router();

router.get("/phone/:phone", controller.getUsersByPhone);
router.get("/search", controller.searchUsers);
router.get("/:id", controller.getUserById);
router.get("/", controller.getAllUsers);

module.exports = router;
