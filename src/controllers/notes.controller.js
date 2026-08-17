/**
 * Notes controller.
 *
 * Description: Add/list notes attached to a ticket. Both handlers 404 if
 *   the parent ticket doesn't exist, so notes can't be created against or
 *   listed for a ticket id that isn't real.
 * Author: NA Professional Services
 * Created: 2026-08-17
 * Dependencies: ../data/blobStore
 * Inputs: Express req/res/next (req.params.id is the parent ticket id)
 * Expected output: JSON note object(s) or a 404/400 error shape
 */

const { getTicketById, listNotesByTicketId, saveNote } = require("../data/blobStore");

function generateNoteId() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `NOTE-${n}`;
}

// GET /api/tickets/:id/notes
async function getNotesForTicket(req, res, next) {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        error: { message: `No ticket found with id ${req.params.id}`, status: 404 },
      });
    }

    const notes = await listNotesByTicketId(req.params.id);
    res.json({ count: notes.length, notes });
  } catch (err) {
    next(err);
  }
}

// POST /api/tickets/:id/notes
async function addNote(req, res, next) {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        error: { message: `No ticket found with id ${req.params.id}`, status: 404 },
      });
    }

    const { text, author } = req.body || {};
    if (!text) {
      return res.status(400).json({
        error: { message: "text is required.", status: 400 },
      });
    }

    const note = {
      id: generateNoteId(),
      ticketId: req.params.id,
      text,
      author: author || null,
      createdAt: new Date().toISOString(),
    };

    await saveNote(note);
    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotesForTicket,
  addNote,
};
