/**
 * Tickets router.
 *
 * Description: Maps full CRUD (list, get, create, update, delete) to the
 *   tickets controller.
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: express, ../controllers/tickets.controller
 * Inputs: none (router definition)
 * Expected output: an Express Router mounted at /tickets by the caller
 */

const express = require("express");
const controller = require("../controllers/tickets.controller");

const router = express.Router();

router.get("/", controller.getAllTickets);
router.get("/:id", controller.getTicket);
router.post("/", controller.createTicket);
router.patch("/:id", controller.updateTicket);
router.delete("/:id", controller.removeTicket);

module.exports = router;
