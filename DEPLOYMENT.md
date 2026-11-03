# Aven deployment: local host to server

This deployment is separate from the Laravel/MySQL Compose project. It runs:

- `aven-api`: Spring Boot API
- `aven-web`: React/Vite frontend served by Nginx
- The existing PostgreSQL container: external database, not recreated here

Do not copy the local `.env` files to the server. Create a server-only API
environment file from the example.

## 1. Prepare the local project

From the repository root:

```bash
cd /path/to/aven-web-app
npm --prefix aven-finance ci
cd aven
./mvnw test
cd ../aven-finance
npm run build
cd ..
```

The local validation commands do not start or modify Docker containers.

## 2. Choose the public domains

Use two hostnames in Nginx Proxy Manager:

```text
aven.example.com      -> aven-web:80
api.aven.example.com  -> aven-api:8080
```

Replace these examples with your real domain names.

The frontend image is built with the API URL. Set it before building:

```bash
export VITE_API_BASE_URL=https://api.aven.example.com
```

## 3. Transfer the project to the server

Commit or copy the project without secrets:

```bash
rsync -az --exclude='.env' --exclude='aven-finance/.env.local' \
  ./ user@your-server:/opt/aven-web-app/
```

Alternatively, push to a private Git repository and clone it on the server.

## 4. Inspect the existing PostgreSQL container on the server

Run these commands on the server:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker inspect <postgres-container> \
  --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | grep -E '^(POSTGRES_DB|POSTGRES_USER)='
docker inspect <postgres-container> \
  --format '{{range $name, $network := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```

Do not send or commit the PostgreSQL password.

The existing PostgreSQL database must have a separate database for Aven, for
example `aven`. Do not reuse the Laravel/MySQL database. If the PostgreSQL
container does not already have an `aven` database and user, create them using
your server's normal PostgreSQL administration process.

## 5. Create a shared Docker network

On the server, choose the network printed by the previous command. The
PostgreSQL container and Aven API must be on the same network:

```bash
docker network connect <postgres-network> <postgres-container>
```

Use that same network name when starting the Aven Compose stack:

```bash
export AVEN_DOCKER_NETWORK=<postgres-network>
```

If you prefer a dedicated network, create it and connect PostgreSQL to it:

```bash
docker network create aven-network
docker network connect aven-network <postgres-container>
export AVEN_DOCKER_NETWORK=aven-network
```

The `docker-compose.yml` file uses this existing external network. It does not
create or stop PostgreSQL, MySQL, Laravel, Nginx Proxy Manager, or any other
existing service.

## 6. Create the Spring Boot server environment

On the server:

```bash
cd /opt/aven-web-app
cp deploy/aven-api.env.example deploy/aven-api.env
chmod 600 deploy/aven-api.env
```

Edit `deploy/aven-api.env` and set:

```env
PORT=8080
DATABASE_URL=jdbc:postgresql://<postgres-container>:5432/aven
DATABASE_USERNAME=<aven-postgres-user>
DATABASE_PASSWORD=<aven-postgres-password>
DATABASE_DRIVER=org.postgresql.Driver
DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
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

The database host must be the PostgreSQL container name or network alias. Do
not use `localhost` inside the API container.

Generate a new JWT secret for production and do not reuse a development
secret.

## 7. Build and start Aven

On the server:

```bash
cd /opt/aven-web-app
export AVEN_DOCKER_NETWORK=<postgres-network>
export VITE_API_BASE_URL=https://api.aven.example.com
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 aven-api
```

The frontend is served internally on port 80. The API is served internally on
port 8080. No host ports are published because Nginx Proxy Manager reaches
both containers over the shared Docker network.

## 8. Configure Nginx Proxy Manager

Create a Proxy Host for the frontend:

```text
Domain: aven.example.com
Forward hostname/IP: aven-web
Forward port: 80
```

Create a Proxy Host for the API:

```text
Domain: api.aven.example.com
Forward hostname/IP: aven-api
Forward port: 8080
```

Enable SSL and force HTTPS for both hosts. Nginx Proxy Manager must also be
connected to the same Docker network:

```bash
docker network connect <postgres-network> nginx-proxy-manager
```

## 9. Verify the deployment

Run on the server:

```bash
docker compose ps
curl -I https://aven.example.com
curl -i https://api.aven.example.com/api/users/me
```

The API request should return `401 Unauthorized` without a token. That
confirms that the API is reachable and protected.

Register a test user through the frontend, verify the email, and then confirm
that the account list and transactions persist after restarting `aven-api`.

## 10. Updates and rollback

For an update:

```bash
cd /opt/aven-web-app
git pull
export AVEN_DOCKER_NETWORK=<postgres-network>
export VITE_API_BASE_URL=https://api.aven.example.com
docker compose build
docker compose up -d
```

Keep the previous image tags if you need to roll back. Never run
`docker compose down -v`; that can remove named data volumes if the Compose
file is later changed to manage them.

## Database note

The application currently uses Hibernate `ddl-auto=update` to create the
finance tables. Before handling real money, replace this with reviewed Flyway
migrations and set `spring.jpa.hibernate.ddl-auto=validate`.
