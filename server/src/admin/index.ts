import express from "express";
import { query } from "../db/index.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sheria Check — Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
  <div class="mx-auto max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">Sheria Check Admin</h1>
    <div id="app">
      <p class="text-gray-500">Admin panel to manage offense data. Use the API endpoints.</p>
      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <div class="rounded-lg border bg-white p-4">
          <h2 class="font-semibold">Total Offenses</h2>
          <p id="count" class="text-3xl font-bold text-primary-500">—</p>
        </div>
        <div class="rounded-lg border bg-white p-4">
          <h2 class="font-semibold">Data Version</h2>
          <p id="version" class="text-3xl font-bold text-gray-600">—</p>
        </div>
        <div class="rounded-lg border bg-white p-4">
          <h2 class="font-semibold">Last Updated</h2>
          <p id="updated" class="text-lg font-semibold text-gray-600">—</p>
        </div>
      </div>
    </div>
  </div>
  <script>
    fetch('/api/v1/status').then(r=>r.json()).then(({data}) => {
      if (!data) return;
      document.getElementById('count').textContent = data.total_offenses;
      document.getElementById('version').textContent = data.data_version;
      document.getElementById('updated').textContent = new Date(data.last_updated).toLocaleDateString();
    });
  </script>
</body>
</html>`);
});

export default router;
