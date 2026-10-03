# TaskBoard lifecycle charter

| Flow | Data | Canonical steps | Expected result |
| --- | --- | --- | --- |
| Add task | title `Plan demo`, priority High, tags `demo, qa` | Open Board, choose New task, enter fields, save | New task appears in Todo with the selected priority and tags. |
| Complete task | A known Todo task | Open task detail, mark complete, return to Board and Stats | Board and Stats agree on the completion count. |
| Edit and persistence | Existing task, Unicode tag `✨` | Edit title/tags, reload, navigate to task | Changed fields persist without corrupting other tasks. |
| Delete recovery | A demo-created task | Delete task, attempt its old route, return to Board | The app provides a clear not-found or recovery state and no ghost task remains. |

## Boundary prompts for CARBON

- Empty title, whitespace-only title, a 1-character title, a long title, emoji, and markup-shaped tag values.
- Corrupt `taskboard.state.v1` in an isolated browser profile and verify safe reset/recovery.
- Navigate directly to `#/task/does-not-exist` and ensure the route is understandable and recoverable.
