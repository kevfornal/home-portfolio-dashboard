// functions/api/portfolio.js

// GET: Fetch encrypted portfolio from Cloudflare D1
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

    const row = await env.DB.prepare("SELECT payload FROM portfolio WHERE id = 1").first();
    if (!row) {
      return new Response(JSON.stringify({ error: "No portfolio found in D1" }), { status: 404 });
    }

    return new Response(row.payload, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

    const body = await request.text();

    await env.DB.prepare(
      "INSERT OR REPLACE INTO portfolio (id, payload) VALUES (1, ?)"
    ).bind(body).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
