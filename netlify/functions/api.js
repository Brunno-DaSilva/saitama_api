/**
 * Single Netlify Function - Express app wrapped with serverless-http.
 *
 * Description: Mounts the Users and Tickets routers under /api, guarded by
 *   apiKeyAuth (except /api/health, which is intentionally unauthenticated
 *   so it can be used as an uptime check).
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: express, cors, morgan, serverless-http, ../../src/*
 * Inputs: Lambda-style event/context from Netlify's Functions runtime
 * Expected output: Express app response proxied back through serverless-http
 */

const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const morgan = require("morgan");

const apiKeyAuth = require("../../src/middleware/apiKeyAuth");
const { notFoundHandler, errorHandler } = require("../../src/middleware/errorHandler");
const usersRoutes = require("../../src/routes/users.routes");
const ticketsRoutes = require("../../src/routes/tickets.routes");

const app = express();

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

const api = express.Router();

api.get("/health", (req, res) => res.json({ status: "ok" }));

api.use(apiKeyAuth);
api.use("/users", usersRoutes);
api.use("/tickets", ticketsRoutes);

app.use("/api", api);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports.handler = serverless(app);
