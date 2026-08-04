import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

export type PublicPlan = {
  code: string;
  name: string;
  description: string | null;
  amountPaise: number;
  currency: string;
  periodDays: number;
  petLimit: number;
};

/** Plans + whether Razorpay keys have been entered yet. */
export const getCheckoutConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ configured: boolean; keyId: string | null; plans: PublicPlan[] }> => {
    const keyId = process.env["RAZORPAY_KEY_ID"] ?? null;
    const secret = process.env["RAZORPAY_KEY_SECRET"] ?? null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("subscription_plans")
      .select("code, name, description, amount_paise, currency, period_days, pet_limit")
      .eq("is_active", true)
      .order("amount_paise", { ascending: true });

    return {
      configured: Boolean(keyId && secret),
      keyId: keyId && secret ? keyId : null,
      plans: (data ?? []).map((p) => ({
        code: p.code,
        name: p.name,
        description: p.description,
        amountPaise: p.amount_paise,
        currency: p.currency,
        periodDays: p.period_days,
        petLimit: p.pet_limit,
      })),
    };
  },
);

const orderSchema = z.object({
  planCode: z.enum(["single", "family"]),
  fullName: z.string().trim().max(120).default(""),
  email: z.string().trim().email().max(200),
  mobile: z.string().trim().max(30).default(""),
});

/** Creates a Razorpay order and records the attempt. */
export const createSubscriptionOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Payment gateway is not configured yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("code, name, amount_paise, currency, period_days")
      .eq("code", data.planCode)
      .maybeSingle();
    if (planError || !plan) throw new Error("Plan unavailable.");

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("payment_attempts")
      .insert({
        full_name: data.fullName,
        email: data.email,
        mobile: data.mobile,
        plan_code: plan.code,
        amount_paise: plan.amount_paise,
        currency: plan.currency,
        status: "created",
      })
      .select("id")
      .single();
    if (attemptError || !attempt) throw new Error("Could not start checkout.");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: plan.amount_paise,
        currency: plan.currency,
        receipt: attempt.id,
        notes: { plan: plan.code, email: data.email, mobile: data.mobile },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[razorpay] order failed", res.status, body);
      await supabaseAdmin
        .from("payment_attempts")
        .update({ status: "failed", failure_reason: `Order creation failed (${res.status})` })
        .eq("id", attempt.id);
      throw new Error("Payment gateway rejected the request. Check your Razorpay keys.");
    }

    const order = (await res.json()) as { id: string; amount: number; currency: string };
    await supabaseAdmin.from("payment_attempts").update({ razorpay_order_id: order.id }).eq("id", attempt.id);

    return {
      attemptId: attempt.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      planName: plan.name,
    };
  });

const verifySchema = z.object({
  attemptId: z.string().uuid(),
  razorpayOrderId: z.string().min(4).max(120),
  razorpayPaymentId: z.string().min(4).max(120),
  razorpaySignature: z.string().min(8).max(256),
});

/** Verifies the Razorpay signature, then activates the subscription. */
export const confirmSubscriptionPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) throw new Error("Payment gateway is not configured yet.");

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpaySignature);
    const valid = a.length === b.length && timingSafeEqual(a, b);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!valid) {
      await supabaseAdmin
        .from("payment_attempts")
        .update({ status: "failed", failure_reason: "Signature verification failed" })
        .eq("id", data.attemptId);
      throw new Error("Payment could not be verified.");
    }

    const { data: attempt } = await supabaseAdmin
      .from("payment_attempts")
      .select("id, full_name, email, mobile, plan_code")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (!attempt) throw new Error("Payment attempt not found.");

    await supabaseAdmin
      .from("payment_attempts")
      .update({ status: "paid", razorpay_payment_id: data.razorpayPaymentId, failure_reason: null })
      .eq("id", attempt.id);

    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("period_days")
      .eq("code", attempt.plan_code)
      .maybeSingle();
    const periodDays = plan?.period_days ?? 30;
    const expires = new Date(Date.now() + periodDays * 86400000).toISOString();

    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .ilike("email", attempt.email)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("subscribers")
        .update({
          full_name: attempt.full_name,
          mobile: attempt.mobile,
          plan_code: attempt.plan_code,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expires,
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("subscribers").insert({
        full_name: attempt.full_name,
        email: attempt.email,
        mobile: attempt.mobile,
        plan_code: attempt.plan_code,
        status: "active",
        expires_at: expires,
      });
    }

    return { planCode: attempt.plan_code, expiresAt: expires };
  });

const failSchema = z.object({
  attemptId: z.string().uuid(),
  reason: z.string().trim().max(300).default("Payment cancelled or failed"),
});

/** Records a failed or abandoned checkout so admins can follow up. */
export const failSubscriptionAttempt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => failSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("payment_attempts")
      .update({ status: "failed", failure_reason: data.reason })
      .eq("id", data.attemptId);
    return { ok: true };
  });
