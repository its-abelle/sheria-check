# Visual testing: web and mobile

This guide uses a **separate local `sheria_check_demo` database**. Every populated record is labelled DEMO and is fictional: **none of its offense, penalty or judgment text is Kenyan law**. The ordinary legal corpus remains unpublished. The demo loader refuses ordinary databases, remote database hosts and production mode; production startup also refuses a `_demo` database.

Use Node 22, npm, Docker Compose, and a browser. For a physical phone, use an Expo Go version compatible with the pinned Expo SDK 57, on the same Wi-Fi as your computer. If your Expo Go version does not support that SDK, use a compatible development build or the preview-build workflow in DEPLOY.md.

## 1. Start the API with demo content

In terminal 1, from the repository root:

```sh
cd /home/abelle/sheria_check
docker compose up -d db
# Run CREATE DATABASE once. If the demo database already exists, skip this line.
docker compose exec db psql -U sheria -d postgres -c 'CREATE DATABASE sheria_check_demo'
cd server
npm ci
NODE_ENV=development DATABASE_URL=postgres://sheria:sheria_dev@localhost:5432/sheria_check_demo npm run seed:demo
PORT=4000 CORS_ORIGIN='*' ADMIN_PASSWORD=admin123 NODE_ENV=development DATABASE_URL=postgres://sheria:sheria_dev@localhost:5432/sheria_check_demo npm run dev
```

These commands explicitly override `.env` values for the demo connection and API port without editing your existing environment files. If your local PostgreSQL username/password/port differ, substitute them in **both** `DATABASE_URL` values. Do not change the database name to an ordinary application database. If port 5432 is occupied by another PostgreSQL instance, either use that instance with a newly created `_demo` database or adjust your local Docker port mapping and both connection URLs.

Expected seed message: `Loaded fictional DEMO records...`. Expected API address: `http://localhost:4000`. The loader creates the schema through migrations and inserts two demo laws, three provisions, two offenses and one fictional judgment card. Re-running it refreshes those demo records; it does not import or approve real legal content.

## 2. Open the web app

In terminal 2:

```sh
cd /home/abelle/sheria_check/client
npm ci
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1 npm run web -- --port 8081
```

Open **http://localhost:8081**. If you choose another free Expo port, use the URL printed by Expo. Keep both terminals running.

Check the following:

1. **Offenses:** the home page shows two DEMO results and two categories. Search `demo`, then `traffic`; clear the search and browse a category.
2. **Details:** open the general demo offense. Its definition uses **Demo version A**; its penalty uses **Demo version B**. The penalty's own source, section and version must appear. No real fine amount should be shown.
3. **Law reading:** follow “Read defining provision in context”, select/copy text, then browse the parent law. Try the law reader's section/phrase search.
4. **Laws:** open the Laws tab. Read both demo law entries. The separate official reference directory should link to the core real Acts on Kenya Law; those links do not mean full in-app texts have been published.
5. **Rights:** switch between Arrest, Detention, Bail & bond, Fair trial and Legal assistance. Each filter has a fictional preview provision.
6. **Judgments:** the general demo offense has a clearly fictional reference card. Its link opens the Kenya Law homepage, not an actual judgment. The traffic demo offense demonstrates the “No verified judgment references” empty state.
7. **Sharing:** use “Share official reference”. Supported browsers use sharing or clipboard; unavailable/failed sharing should show a readable message.
8. **Disclaimer/removal:** the legal-information notice remains visible. The About page explains limitations. There must be no Reporting or Insights tab/form.
9. **Direct links:** open `http://localhost:8081/offense/demo-offense`, `http://localhost:8081/law/demo-law`, and `http://localhost:8081/provision/demo-definition` directly, and refresh each.
10. **Responsive/accessibility:** use browser device emulation at 390px, 768px and desktop widths. Check scrolling, the persistent notice, long headings, keyboard Tab/Enter, and browser zoom at 200%.
11. **Connection failure/retry:** stop only the API in terminal 1 with Ctrl+C, then refresh the web app. It should show a connection error and “Try again”. Restart the API with the same command from step 1, then click “Try again”. Do not expect offline operation.

Optional: open `http://localhost:4000/admin`, use the local development token `admin123`, and inspect the demo records. Withdrawal/publication can be tested entirely within this demo database. The startup command above is for local development only; production rejects default credentials.

## 3. Test on a physical phone

Keep the same demo API running. Find your computer's Wi-Fi/LAN IPv4 address, such as `192.168.1.50`. Stop the Expo web process in terminal 2, then run:

```sh
cd /home/abelle/sheria_check/client
# Replace the example address with YOUR computer's LAN address.
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000/api/v1 npm start -- --lan
```

Scan the QR code with compatible Expo Go. The phone must use the same network. **Do not use `localhost` as the API host on a physical phone**: that points at the phone itself. If it cannot connect, open `http://YOUR_LAN_IP:4000/api/v1/health` in the phone's browser; it should report healthy. Allow local development traffic through your computer's firewall if needed, without exposing the database port to the internet.

Repeat the offense, law, rights and sharing checks. Also test native back navigation, larger OS text sizes, portrait layout and touch targets. If you change the API URL, stop and restart Expo because `EXPO_PUBLIC_` values are compiled into the client.

For an already configured Android emulator, use the host alias `http://10.0.2.2:4000/api/v1` and press `a` in Expo. For an iOS simulator on macOS, the host API can use `http://localhost:4000/api/v1`; press `i`. Signed preview/store builds require a real HTTPS API and the account/credential setup described in DEPLOY.md.

## 4. Finish

Stop Expo and the API with Ctrl+C. The demo database is separate from ordinary app data and can remain for later testing. To remove only this fictional dataset after stopping its API:

```sh
cd /home/abelle/sheria_check
docker compose exec db dropdb -U sheria sheria_check_demo
```

To inspect genuine legal content instead, follow CONTENT.md and its actual verification/publication workflow. Do not publish unverified records merely to populate the interface.
