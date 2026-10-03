# Growperty — Project Rules

## Deploy workflow (required)

Before every `vercel deploy --prod` (API or Web), in this order:

1. **Commit first.** Stage and commit all pending changes — never deploy from an uncommitted working directory. The commit message must clearly state what changed (not generic messages like "update" or "fix").
2. **Push to GitHub** (`git push origin master`) right after committing, before deploying.
3. **Only then deploy.** `vercel deploy --prod` from `apps/api` for the API, from the repo root for Web (Root Directory is already set to `apps/web`).

This keeps GitHub as the source of truth for what's actually live, and gives every deploy a matching commit to roll back to if something breaks.

Reminder: `git push` does **not** auto-deploy on this project — deploying is always a separate, explicit `vercel deploy --prod` step, run only when the user asks for it.
