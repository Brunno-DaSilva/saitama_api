/**
 * Notes router.
 *
 * Description: Add/list notes for a single ticket. Mounted with
 *   mergeParams so it can read the parent ticket's :id from
 *   tickets.routes.js (see "/:id/notes" there).
 * Author: NA Professional Services
 * Created: 2026-08-17
 * Dependencies: express, ../controllers/notes.controller
 * Inputs: none (router definition)
 * Expected output: an Express Router mounted at /tickets/:id/notes
 */

const express = require("express");
const controller = require("../controllers/notes.controller");

const router = express.Router({ mergeParams: true });

router.get("/", controller.getNotesForTicket);
router.post("/", controller.addNote);

module.exports = router;
