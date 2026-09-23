export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "DB binding missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const row = await env.DB.prepare("SELECT payload FROM portfolio WHERE id = 1").first();
    if (!row) {
      return new Response(JSON.stringify({ error: "No portfolio found in D1" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(row.payload, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "DB binding missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await request.text();

    if (!body) {
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Insert or update record 1 using standard SQLite syntax
    await env.DB.prepare(
      "INSERT INTO portfolio (id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload"
    ).bind(body).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
