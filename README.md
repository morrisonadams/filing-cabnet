# Digital Filing Cabinet (Barebones)

A minimal Next.js + Docker starter for an in‑browser, phone‑friendly document scanner and organizer. Snap a photo of a paper, add quick tags, and store it locally (bind‑mounted volume) with optional AI‑extracted metadata and Google Drive backup.

> **Status:** skeleton implementation for you to extend. UI is intentionally simple.

## Features (today)
- 📱 Mobile‑friendly capture: file input opens your phone camera.
- 🗂️ Local persistence: files are saved to a `data/` directory and indexed in a JSON db.
- 🧠 Optional AI metadata: if `OPENAI_API_KEY` is set, the server will extract a title, category, entities, and summary from the image via OCR‑less heuristic prompt (you can upgrade to Vision later).
- ☁️ Optional Google Drive backup: scaffolding provided. Configure OAuth or Service Account to mirror uploads to Drive.

## Quickstart

```bash
# 1) Create .env
cp .env.sample .env
# Fill in what you need; app runs without OpenAI or Drive too.

# 2) Build & run
docker compose up --build

# 3) Open the app
# http://localhost:3000
```

Use it on your phone over LAN by replacing `localhost` with your machine's IP and ensuring port 3000 is reachable.

## How it works

- **/app/api/upload (POST)**: accepts `multipart/form-data` with the file (`file`) and optional `tags` text. Saves the image under `DATA_DIR/uploads/<uuid>_<origName>`. Creates/updates `DATA_DIR/records.json` with metadata. If `OPENAI_API_KEY` is present, the server asks the OpenAI API to infer metadata based on the filename and any provided tags/notes. (Upgrade path below to add real OCR/vision.)
- **/app/page.tsx**: minimal UI to capture/submit and list your docs with search.
- **/app/api/search (GET)**: naive substring search over title, tags, summary, entities.

### Data layout

```
data/
 ├─ uploads/
 │   └─ <uuid>_originalName.jpg
 └─ records.json   # array of {id, filename, path, createdAt, title, category, tags[], entities[], summary, driveFileId?}
```

## Configuring Google Drive backup (optional)

Two supported patterns (pick one):

1) **OAuth user flow** – upload to *your* Drive.
   - Populate `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `GOOGLE_REFRESH_TOKEN` in `.env`.
   - Generate a refresh token once using the `/api/google/auth-url` and `/api/google/oauth2callback` endpoints (basic scaffolding included).

2) **Service Account** – upload to a team Drive or a shared folder.
   - Put the raw JSON of your service account credentials in `GOOGLE_SERVICE_ACCOUNT_JSON` (or a path to it).
   - Share your target Drive folder with the service account email and set `GOOGLE_DRIVE_PARENT_FOLDER_ID`.

When configured, uploads will attempt a Drive mirror and store the `driveFileId` in `records.json`.

## Planned next steps (suggested roadmap)

1) **Vision OCR + robust AI metadata**
   - Use OpenAI’s Vision models or Tesseract to OCR the image, then feed text into a structured extraction prompt.
   - Store full‑text to enable precise search, dates, amounts, vendors, doc types.
2) **Proper categories & schema**
   - Create a taxonomy (e.g., Finance, Medical, Home, Insurance, Receipts, Warranties). Add user‑editable categories.
   - Track `docDate`, `amount`, `merchant`, `policyNumber`, `serialNumber` when applicable.
3) **Better search**
   - Full‑text index (e.g., Lunr/Elasticlunr in browser or server‑side MiniSearch). Add filters, sort, and tag facets.
4) **PWA + offline first**
   - Add service worker, installable app, background sync. Camera capture even when offline; sync later.
5) **Security & auth**
   - Add password/PIN or integrate with Google Sign‑In. Encrypt at rest (libsodium) for sensitive docs.
6) **Bulk import & auto‑filing**
   - Upload multiple images, auto‑merge pages. Detect duplicates with image hashing (pHash) and smart rename.
7) **Annotations & processing**
   - Crop, rotate, enhance scans. Multi‑page PDFs from image batches.
8) **Sharing & exports**
   - Export PDFs to Drive with embedded OCR text. Share links with expiring tokens.
9) **Mobile UX polish**
   - One‑tap capture, progress indicators, camera framing guides, “scan more” flow.
10) **Backups & retention**
   - Optional S3/Backblaze mirror. Retention rules and recycle bin.

## Dev notes

- This repo uses **Next.js App Router** and basic API routes. No DB; a JSON file keeps things simple.
- For Drive, the included helper detects OAuth vs Service Account based on environment variables.
- Minimal error handling; expand as you harden.

## License
MIT# filing-cabnet
