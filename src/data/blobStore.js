/**
 * Netlify Blobs-backed data access layer for Users, Tickets, and Notes.
 *
 * Description (plain English): Wraps @netlify/blobs getStore() calls for
 *   three site-wide stores - "users", "tickets", and "notes" - storing one
 *   record per blob key (keyed by the record's own id) rather than one big
 *   JSON blob. This matters because Netlify Blobs uses last-write-wins per
 *   key with no concurrency control: if we stored a whole collection as a
 *   single key, two people creating tickets (or notes) around the same time
 *   could silently clobber each other's write. Per-record keys avoid that.
 *   Notes reference their parent ticket via a `ticketId` field rather than
 *   being nested inside the ticket record itself, for the same reason.
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: @netlify/blobs
 * Inputs: none directly - reads users.seed.json / tickets.seed.json once
 * Expected output: module exposing list/get/save/delete helpers for all
 *   three stores
 */

const { getStore } = require("@netlify/blobs");
const usersSeed = require("./users.seed.json");
const ticketsSeed = require("./tickets.seed.json");

const SEEDED_KEY = "__seeded__";

// Netlify normally injects Blobs credentials automatically for Functions
// running on its own infrastructure. If that automatic detection fails for
// this site, NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN (a personal access token)
// let getStore() authenticate explicitly instead.
function storeConfig(name) {
  const { NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN } = process.env;
  if (NETLIFY_SITE_ID && NETLIFY_AUTH_TOKEN) {
    return { name, siteID: NETLIFY_SITE_ID, token: NETLIFY_AUTH_TOKEN };
  }
  return name;
}

function usersStore() {
  return getStore(storeConfig("users"));
}

function ticketsStore() {
  return getStore(storeConfig("tickets"));
}

function notesStore() {
  return getStore(storeConfig("notes"));
}

async function ensureSeeded(store, seedArray) {
  const alreadySeeded = await store.get(SEEDED_KEY);
  if (alreadySeeded) return;

  for (const record of seedArray) {
    await store.setJSON(record.id, record);
  }
  await store.set(SEEDED_KEY, "true");
}

async function listRecords(store, seedArray) {
  await ensureSeeded(store, seedArray);
  const { blobs } = await store.list();
  const records = [];
  for (const { key } of blobs) {
    if (key === SEEDED_KEY) continue;
    const record = await store.get(key, { type: "json" });
    if (record) records.push(record);
  }
  return records;
}

// --- Users ---

async function listUsers() {
  return listRecords(usersStore(), usersSeed);
}

async function getUserById(id) {
  const store = usersStore();
  await ensureSeeded(store, usersSeed);
  return store.get(id, { type: "json" });
}

// --- Tickets ---

async function listTickets() {
  return listRecords(ticketsStore(), ticketsSeed);
}

async function getTicketById(id) {
  const store = ticketsStore();
  await ensureSeeded(store, ticketsSeed);
  return store.get(id, { type: "json" });
}

async function saveTicket(ticket) {
  const store = ticketsStore();
  await ensureSeeded(store, ticketsSeed);
  await store.setJSON(ticket.id, ticket);
  return ticket;
}

async function deleteTicket(id) {
  const store = ticketsStore();
  await store.delete(id);
}

// --- Notes ---

async function listNotesByTicketId(ticketId) {
  const notes = await listRecords(notesStore(), []);
  return notes.filter((note) => note.ticketId === ticketId);
}

async function saveNote(note) {
  const store = notesStore();
  await store.setJSON(note.id, note);
  return note;
}

module.exports = {
  listUsers,
  getUserById,
  listTickets,
  getTicketById,
  saveTicket,
  deleteTicket,
  listNotesByTicketId,
  saveNote,
};
