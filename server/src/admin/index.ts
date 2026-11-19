import { Router } from "express";
const router = Router();
router.get("/", (_req, res): void => {
  res
    .type("html")
    .send(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sheria Check — Publication</title></head><body><main><h1>Legal content publication</h1><p>Imports remain private drafts. Verify source wording, versions and reuse permissions before publishing.</p><label>Admin token <input id="token" type="password" autocomplete="off"></label><p>The token is kept only in memory and is never stored.</p><label>Content kind <select id="kind"><option>instruments</option><option>provisions</option><option>offenses</option><option>judgments</option></select></label><button id="load">Load records</button><button id="more" hidden>Next page</button><h2>Import draft JSON bundle</h2><label>Bundle JSON <textarea id="bundle" rows="10" cols="60"></textarea></label><button id="import">Import drafts</button><p id="message" role="status"></p><div id="records"></div></main><script src="/admin/app.js" defer></script></body></html>`,
    );
});
router.get("/app.js", (_req, res): void => {
  res.type("js").send(`
let cursor = 0;
const get = id => document.getElementById(id);
async function api(path, body) {
  const response = await fetch('/api/v1/admin' + path, {method: body ? 'POST' : 'GET', headers: {'Authorization': 'Bearer ' + get('token').value, 'Content-Type': 'application/json'}, ...(body ? {body: JSON.stringify(body)} : {})});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}
async function load() {
  try {
    const kind = get('kind').value;
    const result = await api('/content/' + kind + '?cursor=' + cursor);
    get('records').replaceChildren();
    get('more').hidden = !result.pagination.has_more;
    get('more').onclick = () => { cursor = result.pagination.cursor; load(); };
    for (const row of result.data) {
      const section = document.createElement('section');
      const pre = document.createElement('pre'); pre.textContent = JSON.stringify(row, null, 2); section.append(pre);
      for (const action of ['publish', 'unpublish']) {
        const button = document.createElement('button'); button.textContent = action + ' ' + row.id;
        button.onclick = async () => { try { await api('/content/' + kind + '/' + encodeURIComponent(row.id) + '/' + action, {}); get('message').textContent = 'Publication updated'; await load(); } catch (error) { get('message').textContent = error.message; } };
        section.append(button);
      }
      get('records').append(section);
    }
  } catch (error) { get('message').textContent = error.message; }
}
get('load').onclick = () => { cursor = 0; load(); };
get('import').onclick = async () => { try { await api('/content/import', JSON.parse(get('bundle').value)); get('message').textContent = 'Imported as drafts'; cursor = 0; await load(); } catch (error) { get('message').textContent = error.message; } };
`);
});
export default router;
