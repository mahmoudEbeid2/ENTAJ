// Production entry point for hosts that need a plain Node.js startup file
// instead of running `next start` directly (e.g. cPanel's "Setup Node.js App" /
// Passenger, which requires an app that listens on process.env.PORT).
// See DEPLOY.md for the full cPanel deployment walkthrough.
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`> Ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
