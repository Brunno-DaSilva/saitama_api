# Saitama Capital Mock API

A mock **Users** and **Tickets** CRUD API for the Saitama Capital capstone track, built to be
called from a Cognigy voice agent's HTTP Request Nodes. Deployed as **Netlify Functions**
(Express via `serverless-http`), with **Netlify Blobs** for persistence.

## Why this architecture

- Netlify Functions are stateless serverless invocations - there's no persistent local disk to
  write a JSON file to. Data is stored in **Netlify Blobs** instead, one blob per record
  (keyed by the record's own `id`), so concurrent writes from multiple testers don't clobber
  each other the way one big "whole collection" blob would (Blobs is last-write-wins per key).
- CORS is enabled defensively but isn't actually the thing that matters here: Cognigy's HTTP
  Request Node calls this API server-side, not from a browser, so CORS was never going to block
  it. CORS only matters if something running in a browser calls this API directly.
- API key auth (`X-API-Key` header) is **on by default** once you set `API_KEY` - this will be a
  public internet-facing endpoint holding synthetic PII (name/phone/zip) and allowing ticket
  create/update/delete, so it should not be left open.

## Project structure

```
saitama-api/
├── netlify.toml                  # Functions + rewrite config
├── package.json
├── .env.example
├── public/index.html             # placeholder - this deploy has no frontend
├── netlify/functions/api.js      # single Function - Express wrapped w/ serverless-http
└── src/
    ├── data/
    │   ├── blobStore.js           # Netlify Blobs access layer
    │   ├── users.seed.json        # 5 sample users
    │   └── tickets.seed.json      # 2 sample tickets
    ├── middleware/
    │   ├── apiKeyAuth.js
    │   └── errorHandler.js
    ├── controllers/
    │   ├── users.controller.js
    │   └── tickets.controller.js
    └── routes/
        ├── users.routes.js
        └── tickets.routes.js
```

## Deploy to Netlify

1. Install the CLI and log in (one-time):
   ```
   npm install -g netlify-cli
   netlify login
   ```
2. From this project directory:
   ```
   npm install
   netlify init
   ```
   Follow the prompts to create a new site (or connect a GitHub repo for auto-deploy on push -
   recommended, since manual `netlify deploy --prod` re-runs also cost deploy credits either way,
   so batch your changes rather than deploying after every small edit).
3. Set the API key as an environment variable on the site (**do this before your first deploy**):
   ```
   netlify env:set API_KEY "<generate a real random secret>"
   ```
4. Deploy:
   ```
   netlify deploy --prod
   ```
5. Your base URL will be something like `https://<your-site-name>.netlify.app`. The API is
   available under `/api/...` (e.g. `https://<your-site-name>.netlify.app/api/health`).

### Local testing before you deploy

```
netlify dev
```
This runs the Function locally (with a local sandboxed Blobs store - separate from production
data) at `http://localhost:8888/api/...`. Test everything here first; every `netlify deploy --prod`
costs credits, so don't burn them on iteration.

## Endpoint reference

All endpoints below are prefixed with `/api`. Send `X-API-Key: <your API_KEY>` on every request
except `/health`.

### Users

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get a user by ID |
| GET | `/users/phone/:phone` | Get user(s) by phone number |
| GET | `/users/search?name=&phone=&zipcode=` | Get a user matching all three fields |

### Tickets (full CRUD)

| Method | Path | Description |
|---|---|---|
| GET | `/tickets` | List tickets (optional `?status=&email=&phone=` filters) |
| GET | `/tickets/:id` | Get a ticket by ID |
| POST | `/tickets` | Create a ticket |
| PATCH | `/tickets/:id` | Update a ticket |
| DELETE | `/tickets/:id` | Delete a ticket |

> **Note:** the original spec listed get/create/update - `DELETE` was added to complete "full
> CRUD" as requested. Flagging it here since it wasn't explicitly asked for by name.

`POST /tickets` body shape:
```json
{
  "subject": "Stolen Credit Card Report",
  "description": "Card lost at the gym.",
  "requester": { "name": "John Doe", "email": "john.doe@example.com", "phone": "+15551234567" }
}
```

## Using this from Cognigy

In the HTTP Request Node:
- URL: `https://<your-site-name>.netlify.app/api/tickets` (etc.)
- Header: `X-API-Key: <your API_KEY>`
- No CORS configuration needed on the Cognigy side - the request happens server-side.

## Seed data

13 sample users (Star Wars characters) and 2 sample tickets are seeded automatically into Blobs
the first time each store is read (idempotent - won't re-seed on every cold start). See
`src/data/*.seed.json` for the exact values - e.g. `Darth Maul` / `+15550001011` / `11011` for
testing the Users search endpoint, or `Han Solo` / `+15550001002` for the phone lookup.
