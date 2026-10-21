<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Service-request decisions use an authenticated server function with a database admin-role check, stored client-facing response and event ID; email retries reuse that event ID to deduplicate sends and never include internal notes.
- WhatsApp client replies use validated click-to-chat links, not automated Business messaging, so admins control the final send without connector costs.
