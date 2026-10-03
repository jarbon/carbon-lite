# Brewtown critical-flow charter

| Flow | Data | Canonical steps | Expected result |
| --- | --- | --- | --- |
| Menu search and category | Search `latte`; select a category | Open Menu, enter the search, change the category, clear the search | Visible cards match the selected filter and no stale cards remain. |
| Contact validation | Empty values, malformed email, 9-character message | Open Contact, submit each invalid input, then correct one field at a time | Each invalid field has clear recovery guidance; valid values clear only their own error. |
| Contact persistence | `Demo Customer`, `demo@example.test`, 12+ character message | Submit valid contact form, reload page, inspect prior messages, clear history | The saved message is shown after reload and clear history removes only the local message history. |

## Boundary prompts for CARBON

- Test exactly 9, 10, and 11 message characters.
- Test non-ASCII names and an emoji in the message; preserve content as text.
- Test a valid email with a plus tag and an invalid address without a domain.
- Test the site with JavaScript disabled or `data/menu.json` unavailable; identify the user-visible recovery state.
