<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Shipping changes

- **Always commit** completed work after finishing a task (unless the user says not to).
- **Always deploy to prod** after committing user-facing changes. Do not leave deploys for the user unless they opt out.

## Production deploy (Railway)

This app is **not** deployed via `git push`. There is no required git remote for prod.

- **Platform:** Railway CLI (`railway`)
- **Project:** `coach-tracking` (already linked in this workspace)
- **Environment:** `production`
- **Service:** `web`
- **Prod URL:** https://web-production-5df48.up.railway.app

### Deploy command

```bash
railway up --service web
```

### After deploy

1. Confirm the upload/build started (Railway prints a build logs URL).
2. Poll `railway status` until `web` is **Online** and the deployment ID has updated (not stuck on "Building").
3. Report the prod URL and deployment status to the user.

### Notes

- Prefer `railway up --service web` over plain `railway up` so the correct service is targeted.
- Do not invent a GitHub remote or run `git push origin` for prod unless the user explicitly sets one up.
- Schema/SQL migrations are separate from app deploys; only run them when the change requires DB updates and the user expects that.
