// functions/api/portfolio.js

// GET: Fetch encrypted portfolio from Cloudflare D1
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      "SELECT encrypted_data FROM portfolio WHERE id = 'main_portfolio'"
    ).all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ error: "No portfolio found in D1" }), { status: 404 });
    }

    return new Response(results[0].encrypted_data, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// POST: Save updated encrypted portfolio to Cloudflare D1
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const encryptedBody = await request.text();
    
    await env.DB.prepare(
      `INSERT INTO portfolio (id, encrypted_data, updated_at) 
       VALUES ('main_portfolio', ?1, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET 
         encrypted_data = ?1, 
         updated_at = CURRENT_TIMESTAMP`
    ).bind(encryptedBody).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
