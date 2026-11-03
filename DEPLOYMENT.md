# Aven deployment: local host to server

This stack is separate from the Laravel/MySQL stack. It creates:

- `aven-api`: Spring Boot API
- `aven-web`: React/Vite frontend served by Nginx
- `aven-postgres`: dedicated PostgreSQL 16 database

## 1. Transfer the project

On the server:

```bash
sudo mkdir -p /opt/aven-web-app
sudo chown -R "$USER":"$USER" /opt/aven-web-app
git clone https://github.com/ByteMeLol/aven-web-app.git /opt/aven-web-app
cd /opt/aven-web-app
```

Do not copy local `.env` files or secrets.

## 2. Create the Compose environment

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Set:

```env
AVEN_POSTGRES_DB=aven
AVEN_POSTGRES_USER=aven
AVEN_POSTGRES_PASSWORD=<strong-separate-postgres-password>
AVEN_DOCKER_NETWORK=aven-network
```

These credentials belong only to Aven. They are separate from the Laravel
database (`mysql`, database `2bros`).

## 3. Create the API environment

```bash
cp deploy/aven-api.env.example deploy/aven-api.env
chmod 600 deploy/aven-api.env
nano deploy/aven-api.env
```

Set the application values:

```env
PORT=8080
AVEN_JWT_SECRET=<new-production-base64-secret>
AVEN_FRONTEND_ORIGIN=https://aven.example.com
AVEN_EMAIL=<smtp-user>
AVEN_EMAIL_PASSWORD=<smtp-password>
R2_ACCOUNT_ID=<r2-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=aven-assets
R2_ENDPOINT=<r2-endpoint>
```

The Compose file supplies the PostgreSQL URL, username, and password to the
API from the root `.env`:

```text
jdbc:postgresql://aven-postgres:5432/aven
```

Do not use the Laravel MySQL credentials here.

## 4. Build and start

For the single-domain setup, leave `VITE_API_BASE_URL` empty. The frontend
will call relative `/api/...` URLs:

```bash
export VITE_API_BASE_URL=
docker compose build
docker compose up -d
docker compose ps
```

The Compose file explicitly supplies the PostgreSQL JDBC URL, driver, and
Hibernate dialect to `aven-api`. This prevents the local H2 defaults from
being selected in the container.

The PostgreSQL data is stored in the named volume `aven_postgres_data`.
Nothing in this Compose file stops or modifies the Laravel/MySQL services.

## 5. Connect Nginx Proxy Manager

Connect Nginx Proxy Manager to the Aven network:

```bash
docker network connect aven-network nginx-proxy-manager
```

If it is already connected, Docker will report that it is already attached.

Create one Proxy Host:

```text
aven.nelsonhawk.dev -> aven-web:80
```

In Nginx Proxy Manager, configure `/api` to forward to `aven-api:8080`.
Enable SSL and force HTTPS.

## 6. Verify

```bash
docker compose logs --tail=100 aven-api
curl -I https://aven.example.com
curl -i https://api.aven.example.com/api/users/me
```

The API request should return `401 Unauthorized` without a token.

## 7. Updates

```bash
cd /opt/aven-web-app
git pull
export VITE_API_BASE_URL=
docker compose build
docker compose up -d
```

Never run `docker compose down -v`; it can remove the PostgreSQL data volume.

The application currently uses Hibernate `ddl-auto=update`. Before real-money
production, replace this with reviewed Flyway migrations and use
`ddl-auto=validate`.
