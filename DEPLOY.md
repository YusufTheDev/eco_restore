# Deploying to Render & Neon (Free Alternative)

Since Railway's free trial has ended, here is how to host your app completely for free using **Render** (for the web app) and **Neon** (for the database).

## Prerequisites

1.  GitHub account with this repository.
2.  [Neon Account](https://neon.tech/) (for the Database).
3.  [Render Account](https://render.com/) (for the Web App).

## Step 1: Create Database on Neon

1.  Log in to Neon and create a **New Project**.
2.  Name it `eco_restore`.
3.  Once created, it will show you a **Connection String** (e.g., `postgresql://...`).
    -   **Important:** Make sure "Pooled connection" is checked if available, or just copy the direct string.
    -   Copy this string. You will need it later.

## Step 2: Push Changes to GitHub

Commit the `Dockerfile` I just created:

```bash
git add .
git commit -m "Add Dockerfile for Render"
git push origin deploy
```

## Step 3: Create Web Service on Render

1.  Log in to Render/Dashboard.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`eco_restore`).
4.  **Configuration:**
    -   **Name:** `eco-restore` (or similar).
    -   **Region:** Choose one close to you (e.g., `Ohio (US East)`).
    -   **Branch:** `deploy` (or `main` if you merged it).
    -   **Runtime:** **Docker** (This is important! Do not select PHP).
    -   **Instance Type:** **Free**.
5.  **Environment Variables:**
    Scroll down to "Environment Variables" and add these:
    
    | Key | Value |
    | :--- | :--- |
    | `APP_ENV` | `prod` |
    | `APP_SECRET` | *(Random String)* |
    | `DATABASE_URL` | *(Paste your Neon connection string here)* |
    | `MESSENGER_TRANSPORT_DSN` | `doctrine://default?auto_setup=0` |

6.  Click **Create Web Service**.

## Step 4: Run Migrations

Render uses Docker, so we can't easily run a "Start Command" like in Railway to migrate every time. Instead, we can run it once via the Shell or add it to a script.

**Easiest Way (via Render Shell):**
1.  Wait for the deployment to finish (it might take a few minutes).
2.  If it says "Live", go to the **Shell** tab in the Render dashboard for your service.
3.  Run:
    ```bash
    php bin/console doctrine:migrations:migrate --no-interaction
    ```

## Comparison to Railway

| Feature | Railway | Render + Neon |
| :--- | :--- | :--- |
| **Cost** | Paid (after trial) | **Free** (Web sleeps, DB is free) |
| **Speed** | Fast | Slower start (50s cold start) |
| **DB** | ephemeral on trial | **Persistent** (Neon is great) |

**Note:** The "Free" web service on Render spins down after 15 minutes of inactivity. When you visit it again, it will take about a minute to load. This is normal for the free tier.
