# How to store an API key safely

Keep `GEMINI_API_KEY` in a `.env` file on the server.
Never put the key in browser JavaScript or commit `.env` to git.
Load it with `dotenv` and check that it exists before calling Gemini.
