# Gates and recovery

Use this when a lab fails or a student missed a prior session.

## Hard gates

| Before… | You must have… |
|---------|----------------|
| Session 8 embeddings | ≥10 domain notes that can answer 5 planned test questions (your Obsidian vault **or** kit `sample-vault/`) |
| Session 9 RAG | `embeddings.json` with at least a few entries |
| Session 11 search tool | Working `retrieveRelevantChunks` from Session 9 |
| Session 13 eval | Server running; `/query` returns JSON |
| Session 15 showcase | Scored test suite (≥15 cases) + `03-Project/AI-Risk-Report.md` |

## Quick checks

```bash
# embeddings present?
node -e "import('./embeddings.json',{with:{type:'json'}}).then(m=>console.log(m.default.length)).catch(e=>console.error(e.message))"

# health (after Session 5)
curl -s http://localhost:3000/health

# RAG query
curl -s -X POST http://localhost:3000/query -H 'Content-Type: application/json' -d '{"query":"test"}'
```

## Recovery paths

**No Obsidian vault yet**  
Use the kit sample vault for Session 8:

```bash
npm run build-embeddings
# defaults to ./sample-vault — or:
VAULT_PATH=./sample-vault npm run build-embeddings
```

Then replace with your real vault notes when ready and rebuild embeddings.

**No `embeddings.json` / Session 9 blocked**  
Finish Session 8 Lab 8.3 first. Do not invent a fake RAG path.

**Gemini API down, quota, or bad key**  
The application reports a configuration or upstream error; it does not return a mock answer. Restore a valid `GEMINI_API_KEY` and retry. For a showcase, use screenshots or a screen recording of a known-good run and log the outage in your Evaluation / Risk notes.

**Session 11 cannot finish search tool**  
Ship calculator on `POST /tools` as the warm-up demo. Complete `search_knowledge_base` as Stretch / homework before showcase (showcase still requires at least one tool).

**Showcase has more than ~7 teams**  
Cut Q&A to 1–2 minutes, or run parallel rooms / poster + 4-minute demos. Instructors decide before Session 15.
