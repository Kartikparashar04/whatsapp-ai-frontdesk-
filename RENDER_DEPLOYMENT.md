# Render Production Deployment & Database Persistence Guide

Render uses a virtualized container filesystem that resets on every deploy or restart. To ensure your SQLite database is **never erased**, you must attach a **Render Persistent Disk** to your service.

Here is the step-by-step guide to configure persistence on Render.

---

## Step 1: Push Changes to GitHub
Make sure the latest commit is pushed to your GitHub repository. (We have already pushed the database directory changes to your `main` branch).

---

## Step 2: Create a Web Service on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository: `whatsapp-ai-frontdesk-`.
4. Configure the service settings:
   - **Name**: `frontdesk-ai` (or your preferred name)
   - **Region**: Select a region close to your target users (e.g., Singapore for Asia, Oregon/Ohio for US).
   - **Branch**: `main`
   - **Runtime**: `Docker` (Render will automatically detect the `Dockerfile` and build both the frontend Vite assets and the backend Express server together).
   - **Instance Type**: Select **Free** (or a paid tier if you expect high traffic).

---

## Step 3: Configure Environment Variables

Scroll down to the **Environment** section (or go to **Env Groups** / **Environment** tab in the sidebar of your Web Service) and add the following variables:

| Key | Value | Note |
|---|---|---|
| `PORT` | `3000` | Render expects port 3000 |
| `GEMINI_API_KEY` | `your_gemini_api_key` | From Google AI Studio |
| `META_ACCESS_TOKEN` | `your_meta_access_token` | For WhatsApp API |
| `PHONE_NUMBER_ID` | `your_whatsapp_phone_number_id` | From Meta Developer Portal |
| `VERIFY_TOKEN` | `deskflow_verify_token_secure_99` | Same as your webhook config |
| `VITE_FIREBASE_API_KEY` | `your_firebase_api_key` | For auth verification |
| `RAZORPAY_KEY_ID` | `your_razorpay_key_id` | Optional - for SaaS payments |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_key_secret` | Optional - for SaaS payments |

---

## Step 4: Add a Persistent Disk (CRITICAL)

To make your SQLite database permanent, you must attach a persistent volume to the `/app/data` directory where the server now stores the database.

1. In the sidebar of your Render Web Service, click on **Disks**.
2. Click **Add Disk**.
3. Enter the configuration:
   - **Name**: `frontdesk-db-volume`
   - **Mount Path**: `/app/data` (This matches our backend configuration perfectly!)
   - **Size**: `1 GB` (This is completely free on Render and provides plenty of space for millions of leads and profiles).
4. Click **Save** (or **Create**).

> [!NOTE]
> When Render restarts your Web Service with the disk attached, it mounts a permanent drive at `/app/data`. The application will write the SQLite database to `/app/data/database.db` on this drive. The database will survive all restarts, crashed containers, and future code deployments!

---

## Step 5: Save Webhook Callback URL on Meta
Once your Render deployment is live:
1. Copy the Render Web Service URL (e.g. `https://frontdesk-ai.onrender.com`).
2. Go to your **Meta Developer Portal -> WhatsApp -> Configuration**.
3. Edit the Webhook configuration:
   - **Callback URL**: `https://your-service-subdomain.onrender.com/v1/webhooks`
   - **Verify Token**: `deskflow_verify_token_secure_99` (or the VERIFY_TOKEN you set in Step 3).
4. Click **Verify and Save**.
