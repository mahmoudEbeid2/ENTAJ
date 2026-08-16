# Deploying to cPanel (Node.js App / Passenger)

This app is Next.js 15 + MySQL (Drizzle) + local disk file storage. cPanel runs
Node apps under **Passenger**, which needs a plain startup file listening on
`process.env.PORT` — that's what `server.js` at the repo root is for.

Repo-specific things that make this deploy different from a generic Next.js
guide (read this before starting):

- **`bcrypt` and `sharp` are native modules.** They must be installed/compiled
  *on the server*, matching its OS/architecture. Never upload a `node_modules`
  folder built on your Windows machine — it will crash on the Linux server.
- **`/storage/**` contents are git-ignored** (see `.gitignore` — only
  `.gitkeep` placeholders are tracked). The actual product/page images
  currently in `storage/` will **not** come through a Git-based deploy. Upload
  them separately (File Manager or FTP/SFTP).
- **`.env` is git-ignored.** Environment variables must be set through
  cPanel's Node.js App UI (or you manually create `.env` on the server).
- **`STORAGE_ROOT` is resolved from `process.cwd()`** (see
  `lib/storage/upload-service.ts`), which Passenger sets to the Application
  Root. So `storage/` must live directly under the Application Root and be
  writable by the app (admin uploads write into it at runtime).

## 1. Prepare the code for upload

Don't upload `node_modules/` or `.next/` — build those on the server. If using
Git Version Control in cPanel, push this repo to a reachable remote; otherwise
zip the project (excluding `node_modules`, `.next`) for File Manager upload.

## 2. Create the Node.js app in cPanel

cPanel → **Setup Node.js App** → Create Application:

- **Node.js version**: 20.x or newer (see `engines` in `package.json`)
- **Application mode**: Production
- **Application root**: e.g. `enta` (a folder under your home directory)
- **Application URL**: your domain or subdomain
- **Application startup file**: `server.js`

Click Create. cPanel will show a command to "Enter to the virtual
environment" — use that (or the Terminal app) for the commands below so they
run with the correct Node/npm version.

## 3. Get the code onto the server

- **Git**: use cPanel's Git Version Control to clone/pull into the Application
  root, or `git pull` from the SSH/virtual-env terminal.
- **Zip upload**: upload via File Manager into the Application root and
  extract.

Then upload the real contents of `storage/` (product photos, page images,
icons, etc.) separately — via File Manager or FTP/SFTP — since they're not in
Git. Preserve the existing folder structure (`storage/products`,
`storage/pages`, `storage/categories`, `storage/settings`).

## 4. Install dependencies and build (on the server)

From the Node app's "Run NPM Install" button, or in its virtual-env terminal:

```bash
npm install
npm run build
```

Building here (not on Windows) is what makes `bcrypt`/`sharp` work correctly.

## 5. Set environment variables

In the Node.js App page, add each variable from `.env.example`:

```
DATABASE_URL=mysql://<cpanel_db_user>:<password>@localhost:3306/<cpanel_db_name>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=<initial admin email>
ADMIN_PASSWORD=<initial admin password>
RESEND_API_KEY=<your Resend key>
CONTACT_NOTIFICATION_EMAIL=info@entaj.co
EMAIL_FROM=ENTAJ <no-reply@entaj.co>
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
STORAGE_ROOT=storage
STORAGE_MAX_UPLOAD_MB=5
```

(`MYSQL_ROOT_PASSWORD`/`MYSQL_DATABASE`/`MYSQL_USER`/`MYSQL_PASSWORD`/`DB_PORT`
in `.env.example` are for the local Docker MySQL only — not needed here, since
`DATABASE_URL` already carries the connection info.)

## 6. Create the MySQL database

cPanel → **MySQL Databases**: create a database and a user, add the user to
the database with all privileges. cPanel typically prefixes both names with
your cPanel username (e.g. `cpaneluser_entaj`). Use those in `DATABASE_URL`.

Then, from the virtual-env terminal:

```bash
npm run db:migrate
npm run db:seed   # creates the initial admin from ADMIN_EMAIL/ADMIN_PASSWORD — run once
```

## 7. Start it

Back on the Node.js App page, click **Restart**. Open the Application URL and
confirm the homepage and `/divisions` (product images) load, then log into
`/admin/login` with the seeded admin account.

## 8. After future code changes

Pull/upload the new code, then in the virtual-env terminal:

```bash
npm install   # only if dependencies changed
npm run build
```

...and click **Restart** on the Node.js App page again. Passenger doesn't
pick up changes until restarted.

## Troubleshooting

- **App won't start / 503**: check the Node app's error log (linked from the
  Setup Node.js App page). A stale `.next` from a previous failed build or a
  missing env var are the usual causes.
- **bcrypt/sharp errors on start** (`invalid ELF header`, etc.): dependencies
  were installed on the wrong platform — delete `node_modules` on the server
  and re-run `npm install` there.
- **Product/page images 404**: the real files under `storage/` weren't
  uploaded (git-ignored, see step 3), or `STORAGE_ROOT`/permissions are wrong.
- **Login/JWT issues**: `JWT_SECRET` not set or changed after users logged in.
