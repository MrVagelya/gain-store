/**
 * Gain External KeyAuth fulfillment after Stripe payment.
 * Assignments are stored on the Stripe Checkout Session metadata (no KV required).
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

async function stripeRequest(stripeSecret, path, method = "GET", body = null) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function getSession(sessionId, stripeSecret) {
  const { ok, data } = await stripeRequest(stripeSecret, `checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (!ok) return { ok: false, message: data.error?.message || "Stripe error" };
  return { ok: true, session: data };
}

function productAllowed(session) {
  const product = String(session.metadata?.product || "").toLowerCase();
  if (!product) return true;
  return product === "external" || product === "bundle";
}

async function collectUsedKeys(stripeSecret, poolSet) {
  const used = new Set();
  let startingAfter = null;
  for (let page = 0; page < 20; page++) {
    const qs = new URLSearchParams({ limit: "100" });
    if (startingAfter) qs.set("starting_after", startingAfter);
    const { ok, data } = await stripeRequest(stripeSecret, `checkout/sessions?${qs}`);
    if (!ok || !data.data?.length) break;
    for (const s of data.data) {
      const k = s.metadata?.license_key;
      if (k && poolSet.has(k)) used.add(k);
    }
    if (!data.has_more) break;
    startingAfter = data.data[data.data.length - 1].id;
  }
  return used;
}

async function assignKey(sessionId, session, pool, stripeSecret) {
  const existing = session.metadata?.license_key;
  if (existing) return existing;

  const poolSet = new Set(pool);
  const used = await collectUsedKeys(stripeSecret, poolSet);
  const next = pool.find((k) => !used.has(k));
  if (!next) return null;

  const body = new URLSearchParams();
  body.set("metadata[license_key]", next);
  const meta = session.metadata || {};
  for (const [key, value] of Object.entries(meta)) {
    if (key !== "license_key") body.set(`metadata[${key}]`, String(value));
  }

  const { ok, data } = await stripeRequest(
    stripeSecret,
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
    "POST",
    body
  );
  if (!ok) return null;
  return data.metadata?.license_key || next;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "GET") {
      return json({ success: false, message: "Method not allowed" }, 405);
    }

    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (!sessionId) {
      return json({ success: false, message: "Missing session_id" }, 400);
    }

    const stripeSecret = env.STRIPE_SECRET_KEY;
    const poolRaw = env.EXTERNAL_KEYAUTH_KEYS || "";
    const pool = poolRaw.split(",").map((s) => s.trim()).filter(Boolean);

    if (!stripeSecret || !pool.length) {
      return json({ success: false, message: "Worker not configured" }, 500);
    }

    const got = await getSession(sessionId, stripeSecret);
    if (!got.ok) return json({ success: false, message: got.message }, 402);
    const session = got.session;

    if (session.payment_status !== "paid") {
      return json({ success: false, message: "Payment not completed" }, 402);
    }
    if (!productAllowed(session)) {
      return json({ success: false, message: "This checkout is not for Gain External" }, 402);
    }

    const key = await assignKey(sessionId, session, pool, stripeSecret);
    if (!key) {
      return json({ success: false, message: "No licenses left in pool" }, 503);
    }

    return json({
      success: true,
      key,
      productName: "Gain External",
      email: session.customer_details?.email || session.customer_email || "",
      emailSent: false,
    });
  },
};
