/**
 * Cloudflare Worker: assign pre-created KeyAuth licenses for Gain External after Stripe payment.
 *
 * Secrets (Worker settings → Variables):
 *   STRIPE_SECRET_KEY
 *   EXTERNAL_KEYAUTH_KEYS  — comma-separated KeyAuth keys (never commit these)
 *
 * Bind a KV namespace as ASSIGNMENTS (session_id → license key).
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

async function stripeSessionPaid(sessionId, stripeSecret) {
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${stripeSecret}` },
  });
  const session = await res.json();
  if (!res.ok) {
    return { ok: false, message: session.error?.message || "Stripe error" };
  }
  if (session.payment_status !== "paid") {
    return { ok: false, message: "Payment not completed" };
  }
  const meta = session.metadata || {};
  const product = String(meta.product || "").toLowerCase();
  if (product && product !== "external" && product !== "bundle") {
    return { ok: false, message: "This checkout is not for Gain External" };
  }
  return { ok: true, email: session.customer_details?.email || session.customer_email || "" };
}

async function assignKey(sessionId, pool, kv) {
  const existing = await kv.get(`assigned:${sessionId}`);
  if (existing) return existing;

  const usedRaw = await kv.get("pool:used");
  const used = usedRaw ? JSON.parse(usedRaw) : [];
  const usedSet = new Set(used);

  const next = pool.find((k) => !usedSet.has(k));
  if (!next) {
    return null;
  }

  used.push(next);
  await kv.put("pool:used", JSON.stringify(used));
  await kv.put(`assigned:${sessionId}`, next);
  return next;
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

    if (!stripeSecret || !pool.length || !env.ASSIGNMENTS) {
      return json({ success: false, message: "Worker not configured" }, 500);
    }

    const paid = await stripeSessionPaid(sessionId, stripeSecret);
    if (!paid.ok) {
      return json({ success: false, message: paid.message }, 402);
    }

    const key = await assignKey(sessionId, pool, env.ASSIGNMENTS);
    if (!key) {
      return json({ success: false, message: "No licenses left in pool" }, 503);
    }

    return json({
      success: true,
      key,
      productName: "Gain External",
      email: paid.email,
      emailSent: false,
    });
  },
};
