# Omi Life Logger

Captures everything Omi hears → classifies with Claude → logs to Notion Life Log database.

## What it does
- Receives every Omi transcript via webhook
- Uses Claude to classify: Business Thought, Task, Family, Networking, Omi Dev, Idea, Urgent, Personal
- Writes to Notion `📼 Life Log` database with title, summary, raw transcript, date, category

## Railway Env Vars (set these in Railway dashboard)

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | your Anthropic API key |
| `NOTION_API_KEY` | your Notion integration token |
| `NOTION_LIFE_LOG_DB_ID` | `a3a71bfa-3525-4e98-b93a-c8f1d323f59e` |
| `SUPABASE_URL` | `https://hmnuhxhtjxgoznvzykcf.supabase.co` |
| `SUPABASE_SERVICE_KEY` | your Supabase service role key |
| `OMI_APP_SECRET` | `kawough-omi-lifelog-2026` |
| `PORT` | `3000` (Railway sets this automatically) |

## Webhook URL
After deploy: `https://your-railway-url.up.railway.app/webhook`

## Omi App Setup
- App name: Omi Life Logger
- Webhook URL: your Railway URL + `/webhook`
- Add header: `x-omi-secret: kawough-omi-lifelog-2026`
- Trigger: transcript_processed

## Notion Database
Life Log DB ID: `a3a71bfa-3525-4e98-b93a-c8f1d323f59e`
Views: Default table, 📅 By Day (calendar), 🗂️ By Category (board)
