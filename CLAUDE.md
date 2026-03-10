# FS Custom Flooring — Project Instructions

## Supabase: Always Verify Project Before Database Operations

**CRITICAL:** Before running ANY database queries, creating users, or deploying edge functions via the Supabase MCP tool:

1. Run `get_project_url` and compare the returned URL against `.env.local` `NEXT_PUBLIC_SUPABASE_URL`
2. If they don't match, **STOP** — the MCP tool is connected to a different project than the app uses
3. Never assume the MCP connection matches the app's database. Always verify first.

The app uses `alihzcwyaykdtpbeqshw.supabase.co`. The MCP tool may be connected to a different project.
