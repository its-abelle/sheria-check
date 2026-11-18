# Deployment: web, API and mobile

## Production configuration

Use a DigitalOcean Droplet with Docker Compose and a host TLS reverse proxy. Node images use 22; PostgreSQL uses 16. The web image exports Expo as an SPA. Only the host's loopback port 8080 exposes its internal web/API proxy; the database and API have no public container port.

Copy root `.env.example` to `.env`, set a random URL-safe/alphanumeric DB password, an independent random admin token of at least 24 characters, and the exact HTTPS web origin. Do not commit `.env`. If a password contains URI-reserved characters, provide a correctly encoded database connection string rather than interpolating it directly. Native apps require `https://YOUR_DOMAIN/api/v1` at build time.

```sh
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
```

Startup applies committed migrations before listening. **Migration 002 permanently deletes the reports table and records in the selected database.** It does not purge external backup archives; apply the operator's documented retention/deletion policy to them. Historic migration 001 is preserved for upgrades and is immediately followed by removal on a new installation. Never direct this deployment at a database containing unrelated application data.

### Content import

The production image includes compiled commands and `data/`; it does not need `tsx`, TypeScript source files or a repository-relative scripts path.

```sh
docker compose -f docker-compose.prod.yml exec server npm run migrate
docker compose -f docker-compose.prod.yml exec server npm run seed
```

Seed imports the supplied source bundle as private drafts. Do this only when intentionally importing/reviewing content: rerunning it withdraws the imported published records. Review and publish through `https://YOUR_DOMAIN/admin`. Never publish a record merely because its structural validator passes. See CONTENT.md.

## TLS reverse proxy

Point the domain's DNS to the Droplet. Install host Nginx/Certbot, then use a virtual host such as:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;
    access_log off;
    error_log /dev/null crit;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Run `nginx -t`, reload Nginx, and use `certbot --nginx -d YOUR_DOMAIN` to configure TLS and renewal. Review generated logs/CDN/hosting settings: disable IP, URL/query, body and user-agent retention. Do not enable third-party identifying analytics or automatic collection of user search content. The app's privacy text must match the actual hosting configuration.

The inner proxy supports SPA refreshes such as `/law/traffic-act-2024-04-26`, forwards API/admin routes, sets browser security headers, and suppresses access logs. The API uses no-store responses and transient one-minute rate-limit keys. Production trusts one controlled proxy hop: the outer TLS proxy overwrites `X-Real-IP`, and the inner loopback-only proxy forwards it solely for rate limiting. Do not expose the API container or trust arbitrary forwarded headers. Admin Bearer credentials must only travel over HTTPS. Limit admin access operationally as needed; motorists require no account.

## Mobile builds

`client/eas.json` supplies internal preview and store production profiles. Production/preview config rejects a missing/non-HTTPS `EXPO_PUBLIC_API_URL`.

1. Link the app to the owner's Expo project using EAS CLI. Configure `EXPO_PUBLIC_API_URL=https://YOUR_DOMAIN/api/v1` in the preview and production EAS environments.
2. Verify `com.sheriacheck.app` is the intended unique Apple/Google identifier. Configure credentials through EAS; do not store service-account keys or signing files in Git.
3. Build preview binaries, then production binaries for Android and iOS, using the corresponding EAS profiles. Cloud builds consume plan resources and store accounts are required.
4. Validate search, deep links, reading long laws, text scaling, source links, sharing, HTTP errors and disconnected behavior on actual devices.
5. Complete store privacy declarations/listings and support/privacy URLs, then submit signed builds. EAS project IDs, signing credentials, account IDs and a real domain cannot be inferred from this repository.

## Backups and restore

Use encrypted restricted backup storage outside the Droplet. Schedule daily backups, retain for a documented bounded period, and test restoration regularly. Never put backups under the public web root or commit them.

```sh
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U sheria -Fc sheria_check > /secure-backups/sheria.dump
# Restore into an empty recovery database, not over the running production database:
docker compose -f docker-compose.prod.yml exec -T db createdb -U sheria sheria_restore
docker compose -f docker-compose.prod.yml exec -T db pg_restore -U sheria -d sheria_restore < /secure-backups/sheria.dump
```

Supply backup encryption, offsite destination, retention and alerting through the operator's environment. Configure a privacy-respecting external check of `/api/v1/health` and an alert on repeated failures. API readiness includes a DB ping.

## Release checks

CI runs TypeScript, meaningful tests, data structural checks, production builds, web/native exports and Docker builds. Confirm HTTPS, API health, draft invisibility, correct dates/source text, withdrawals, empty/error states, no report endpoints, browser direct links, device sharing and no identifying logs before release. JavaScript export alone is not real-device or store validation.
