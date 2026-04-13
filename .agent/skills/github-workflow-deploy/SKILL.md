---
name: github-workflow-deploy
description: Use when creating or updating a GitHub Actions workflow that builds the React Vite app and deploys the static dist/ output to an Ubuntu server via SCP over SSH. No Docker required.
---

# GitHub Workflow — Build & Deploy to Ubuntu (nginx)

## Overview

React Vite produces a static `dist/` folder. No server runtime or container needed — nginx on the Ubuntu server serves the files directly.

The workflow is a single job that:
1. Sets up SSH and fetches `.env` from the server
2. Installs deps and builds with `npm run build`
3. Backs up the existing `.env` on the server
4. Deploys `dist/` via SCP
5. Restores `.env` and fixes file permissions

## Step 1: Ask the User

Before writing any workflow, ask these three questions one at a time:

1. **Target environment** — staging or production?
2. **Deploy path on server** — where should `dist/` be placed? (e.g. `/var/www/my-app`)
3. **App name** — used for the workflow name (e.g. `my-app`)

Use the answers to fill in the placeholders below.

| Answer     | Branch trigger | GitHub Environment name | Deploy path       |
| ---------- | -------------- | ----------------------- | ----------------- |
| Staging    | `staging`      | `staging`               | _(user-provided)_ |
| Production | `production`   | `production`            | _(user-provided)_ |

---

## Workflow File

Place at `.github/workflows/deploy-<environment>.yml` (e.g. `deploy-staging.yml`).

Replace `<BRANCH>`, `<ENVIRONMENT>`, and `<DEPLOY_PATH>` with values from Step 1.

```yaml
name: Build and Deploy to <ENVIRONMENT> Server

on:
  push:
    branches:
      - <BRANCH>
  workflow_dispatch:

env:
  DEPLOY_PATH: <DEPLOY_PATH>

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: <ENVIRONMENT>
    permissions:
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -p ${{ secrets.SERVER_PORT || 22 }} -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts 2>/dev/null || true

      - name: Fetch .env from server
        id: fetch-env
        continue-on-error: true
        run: |
          scp -P ${{ secrets.SERVER_PORT || 22 }} -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no \
            ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:${{ env.DEPLOY_PATH }}/.env .env 2>/dev/null
          if [ -f .env ] && [ -s .env ]; then
            echo "✅ Successfully fetched .env from server"
            echo "fetched=true" >> $GITHUB_OUTPUT
          else
            echo "⚠️ Could not fetch .env from server"
            echo "fetched=false" >> $GITHUB_OUTPUT
          fi

      - name: Display .env variables (masked)
        run: |
          echo "📄 .env variables:"
          if [ -f .env ]; then
            while IFS='=' read -r key value; do
              if [ -n "$key" ] && [[ ! "$key" =~ ^# ]]; then
                echo "  $key=***"
              fi
            done < .env
          else
            echo "  No .env file found"
          fi

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: |
          if [ -f .env ]; then
            export $(grep -v '^#' .env | xargs)
          fi
          npm run build
        env:
          CI: false

      - name: Backup existing .env on server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SERVER_PORT || 22 }}
          script: |
            if [ -f ${{ env.DEPLOY_PATH }}/.env ]; then
              cp ${{ env.DEPLOY_PATH }}/.env ${{ env.DEPLOY_PATH }}/.env.backup
            fi

      - name: Prepare deployment directory on server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SERVER_PORT || 22 }}
          script: |
            mkdir -p ${{ env.DEPLOY_PATH }}
            if [ -d ${{ env.DEPLOY_PATH }}/assets ] || [ -f ${{ env.DEPLOY_PATH }}/index.html ]; then
              mkdir -p ${{ env.DEPLOY_PATH }}/.backup
              find ${{ env.DEPLOY_PATH }} -maxdepth 1 -type f ! -name '.env*' -exec mv {} ${{ env.DEPLOY_PATH }}/.backup/ \;
              find ${{ env.DEPLOY_PATH }} -maxdepth 1 -type d ! -name '.backup' ! -name '.' -exec mv {} ${{ env.DEPLOY_PATH }}/.backup/ \;
            fi

      - name: Deploy dist/ to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SERVER_PORT || 22 }}
          source: "dist/*"
          target: ${{ env.DEPLOY_PATH }}
          strip_components: 1
          rm: false

      - name: Restore .env and fix permissions
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SERVER_PORT || 22 }}
          script: |
            if [ -f ${{ env.DEPLOY_PATH }}/.env.backup ]; then
              mv ${{ env.DEPLOY_PATH }}/.env.backup ${{ env.DEPLOY_PATH }}/.env
            fi
            if [ -d ${{ env.DEPLOY_PATH }}/.backup ]; then
              rm -rf ${{ env.DEPLOY_PATH }}/.backup
            fi
            chown -R ${{ secrets.SERVER_USER }}:${{ secrets.SERVER_USER }} ${{ env.DEPLOY_PATH }}
            find ${{ env.DEPLOY_PATH }} -type f -exec chmod 644 {} \;
            find ${{ env.DEPLOY_PATH }} -type d -exec chmod 755 {} \;

      - name: Deployment complete
        run: echo "✅ Deployed successfully to ${{ env.DEPLOY_PATH }}"
```

---

## GitHub Environments & Secrets

Set up under **Settings → Environments → `<environment>` → Secrets**:

| Secret            | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `SSH_HOST`        | IP address or hostname of the server (also used as `SERVER_HOST` — pick one name and use consistently) |
| `SSH_USER`        | Linux username for SSH (also `SERVER_USER`)                    |
| `SSH_PRIVATE_KEY` | Full contents of the private SSH key                           |
| `SSH_PORT`        | SSH port — optional, defaults to `22`                          |

> Keep `.env` on the server at `<DEPLOY_PATH>/.env`. The workflow fetches it before building so env vars are baked into the Vite bundle.

---

## Server Prerequisites (one-time per environment)

### Place `.env` on the server

```bash
nano <DEPLOY_PATH>/.env
# Add all VITE_* variables the app needs
```

### nginx config

Create `/etc/nginx/sites-available/<APP_NAME>`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root <DEPLOY_PATH>;
    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and verify:

```bash
sudo ln -s /etc/nginx/sites-available/<APP_NAME> /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Adding a Second Environment Later

1. Create `deploy-production.yml`
2. Change `<BRANCH>` to `production`, `<ENVIRONMENT>` to `production`
3. Update `<DEPLOY_PATH>` to the production server path
4. Ensure `.env` exists on the production server at that path
5. Add `production` environment secrets in GitHub

---

## Common Mistakes

| Mistake                                         | Fix                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Forgetting `try_files $uri /index.html`         | SPA routes return 404 without it — always include in nginx config                |
| `.env` not present on server before first deploy | Place it manually once; workflow fetches it on every subsequent run             |
| `DEPLOY_PATH` not owned by `SERVER_USER`        | `sudo chown -R <SERVER_USER>:<SERVER_USER> <DEPLOY_PATH>` on the server          |
| `CI: false` removed from build step             | Vite warnings treated as errors in CI mode will fail the build — keep it         |
| Forgetting `environment:` on the job            | Without it, GitHub uses repo-level secrets, not environment-scoped ones          |

## File Creation

After all questions are answered and placeholders are filled in, write the workflow file:

- **`.github/workflows/deploy-<environment>.yml`** — the full workflow above with all placeholders replaced

Use the Write tool. Create the `.github/workflows/` directory if it does not exist.
