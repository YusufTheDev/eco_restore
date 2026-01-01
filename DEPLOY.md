# Deploying to Railway

This guide outlines how to deploy the EcoRestore application to [Railway](https://railway.app/).

## Prerequisites

1.  A GitHub account with this repository pushed to it.
2.  A Railway account (you can sign up with GitHub).

## Step 1: Push to GitHub

If you haven't already, run these commands in your project folder to push your code to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

*(If you haven't connected a remote repository yet, follow GitHub's instructions to create a new repo and push to it.)*

## Step 2: Create Project on Railway

1.  Go to your Railway Dashboard.
2.  Click **New Project** > **Provision PostgreSQL**. This will create a database for your app.
3.  Once the database is created, click **New** (or "Add a service") > **GitHub Repo**.
4.  Select your `eco_restore` repository.
5.  Click **Deploy Now**. It will likely fail or build but not run correctly because we haven't set the environment variables yet. That's normal.

## Step 3: Configure Environment Variables

1.  Click on your new **`eco_restore`** service (the web app, not the database).
2.  Go to the **Variables** tab.
3.  Add the following variables:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `prod` | Sets Symfony to production mode. |
| `APP_SECRET` | *(Generate a random string)* | Security token. You can run `openssl rand -hex 16` to generate one. |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | **Crucial:** Click "Reference Variable" and select `DATABASE_URL` from your PostgreSQL service. It should look like `postgresql://...`. |
| `MESSENGER_TRANSPORT_DSN` | `doctrine://default?auto_setup=0` | Usage of Doctrine transport. |

**Optional / If using features:**
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Secret.
- `MAILER_DSN`: E.g., `smtp://user:pass@smtp.provider.com:587` if you send emails.

## Step 4: Run Migrations

The database starts empty. You need to create the tables.

1.  Once the deployment successfully builds (green checkmark), go to the **Settings** tab of your web service.
2.  Under **Deploy**, find **Start Command**.
3.  Set the **Start Command** to:
    ```bash
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration && . /assets/scripts/prestart.sh && nginx -c /etc/nginx/nginx.conf
    ```
    *Note: The exact Nginx command depends on the Nixpacks builder. If the above fails, you can leave the Start Command empty and run the migration manually:*

**Manual Migration (Safer method):**
1.  Go to the **Data** tab of your PostgreSQL service in Railway.
2.  Or simpler: Go to your Web Service > **Shell** tab (once it's running, even if it errors 500).
3.  Run:
    ```bash
    php bin/console doctrine:migrations:migrate --no-interaction
    ```

## Troubleshooting

-   **500 Error**: Check the **Logs** tab. It often means a missing environment variable or database connection issue.
-   **Database Errors**: Ensure your `DATABASE_URL` is correct and you've ran the migrations.
-   **Asset Errors**: Ensure `php bin/console asset-map:compile` ran during the build (it's in `nixpacks.toml`).

## Note on PHP Version

We have configured `composer.json` and `nixpacks.toml` to use **PHP 8.3**. This is to ensure stability with the hosting platform.
