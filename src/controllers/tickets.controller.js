/**
 * Tickets controller.
 *
 * Description: Full CRUD for tickets - list (with optional status/email/
 *   phone filters), get by id, create, update (partial/PATCH semantics),
 *   and delete. Delete was not explicitly listed in the original request
 *   ("get tickets, update tickets, create tickets") but is included here
 *   to complete "full CRUD" as asked - flagged in the README as an
 *   addition, not something pulled from a source document.
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: ../data/blobStore
 * Inputs: Express req/res/next
 * Expected output: JSON ticket object(s) or a 404/400 error shape
 */

const {
  listTickets,
  getTicketById,
  saveTicket,
  deleteTicket,
} = require("../data/blobStore");

function generateTicketId() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `TCK-${n}`;
}

// GET /api/tickets?status=&email=&phone=
async function getAllTickets(req, res, next) {
  try {
    let tickets = await listTickets();
    const { status, email, phone } = req.query;

    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }
    if (email) {
      const targetEmail = String(email).toLowerCase();
      tickets = tickets.filter((t) => (t.requester?.email || "").toLowerCase() === targetEmail);
    }
    if (phone) {
      tickets = tickets.filter((t) => t.requester?.phone === phone);
    }

    res.json({ count: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
}

// GET /api/tickets/:id
async function getTicket(req, res, next) {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        error: { message: `No ticket found with id ${req.params.id}`, status: 404 },
      });
    }
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

// POST /api/tickets
async function createTicket(req, res, next) {
  try {
    const { subject, description, requester, assignedAgent, status } = req.body || {};

    if (
      !subject ||
      !description ||
      !requester ||
      !requester.name ||
      !requester.email ||
      !requester.phone
    ) {
      return res.status(400).json({
        error: {
          message: "subject, description, and requester {name, email, phone} are all required.",
          status: 400,
        },
      });
    }

    const now = new Date().toISOString();
    const ticket = {
      id: generateTicketId(),
      subject,
      description,
      status: status || "open",
      requester: {
        name: requester.name,
        email: requester.email,
        phone: requester.phone,
      },
      assignedAgent: assignedAgent || null,
      lastUpdate: "Ticket created.",
      createdAt: now,
      updatedAt: now,
    };

    await saveTicket(ticket);
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tickets/:id
async function updateTicket(req, res, next) {
  try {
    const existing = await getTicketById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        error: { message: `No ticket found with id ${req.params.id}`, status: 404 },
      });
    }

    const { subject, description, status, assignedAgent, lastUpdate, requester } = req.body || {};

    const updated = {
      ...existing,
      subject: subject ?? existing.subject,
      description: description ?? existing.description,
      status: status ?? existing.status,
      assignedAgent: assignedAgent ?? existing.assignedAgent,
      lastUpdate: lastUpdate ?? existing.lastUpdate,
      requester: requester ? { ...existing.requester, ...requester } : existing.requester,
      updatedAt: new Date().toISOString(),
    };

    await saveTicket(updated);
    res.json({ ticket: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tickets/:id
async function removeTicket(req, res, next) {
  try {
    const existing = await getTicketById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        error: { message: `No ticket found with id ${req.params.id}`, status: 404 },
      });
    }
    await deleteTicket(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  removeTicket,
};
