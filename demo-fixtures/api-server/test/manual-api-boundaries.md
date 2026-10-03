# Bookstore API boundary charter

| Request | Data | Expected result |
| --- | --- | --- |
| Unauthorized write | `POST /books` without `X-API-Key` | A clear authorization failure; database is unchanged. |
| Validation | `POST /books` with empty title, unknown genre, negative price | Stable 4xx response with actionable validation detail; no partial record. |
| Pagination | `GET /books?limit=1&offset=0`, then `offset=1` | Bounded result sets, deterministic metadata, no duplicates between sequential pages. |
| Update/delete recovery | Update a book, delete it, fetch it again | The fetched state matches each operation and missing resource is explicit. |

## Boundary prompts for CARBON

- Use `limit=0`, negative offsets, non-numeric pagination, very long query text, and duplicate IDs.
- Try malformed JSON and unexpected content type.
- Compare the auth behavior across POST, PUT, and DELETE.
