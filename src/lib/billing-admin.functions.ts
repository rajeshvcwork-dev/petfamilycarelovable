import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AdminPlan = {
  code: string;
  name: string;
  description: string | null;
  amountPaise: number;
  currency: string;
  periodDays: number;
  petLimit: number;
  trialDays: number;
  isActive: boolean;
};

export type AdminSubscriber = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  planCode: string;
  status: string;
  startedAt: string;
  expiresAt: string;
  trialEndsAt: string | null;
};

export type AdminAttempt = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  planCode: string;
  amountPaise: number;
  status: string;
  failureReason: string | null;
  orderId: string | null;
  createdAt: string;
};

function assertPasscode(passcode: string) {
  const expected = process.env["ADMIN_PASSCODE"];
  if (!expected) throw new Error("Admin passcode is not configured yet.");
  if (passcode !== expected) throw new Error("Incorrect admin passcode.");
}

const pass = z.object({ passcode: z.string().min(1).max(200) });

export const adminGetBilling = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pass.parse(data))
  .handler(async ({ data }) => {
    assertPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [plansRes, subsRes, attemptsRes] = await Promise.all([
      supabaseAdmin.from("subscription_plans").select("*").order("amount_paise", { ascending: true }),
      supabaseAdmin.from("subscribers").select("*").order("created_at", { ascending: false }).limit(200),
      supabaseAdmin.from("payment_attempts").select("*").order("created_at", { ascending: false }).limit(200),
    ]);

    const plans: AdminPlan[] = (plansRes.data ?? []).map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description,
      amountPaise: p.amount_paise,
      currency: p.currency,
      periodDays: p.period_days,
      petLimit: p.pet_limit,
      trialDays: p.trial_days,
      isActive: p.is_active,
    }));

    const subscribers: AdminSubscriber[] = (subsRes.data ?? []).map((s) => ({
      id: s.id,
      fullName: s.full_name,
      email: s.email,
      mobile: s.mobile,
      planCode: s.plan_code,
      status: s.status,
      startedAt: s.started_at,
      expiresAt: s.expires_at,
      trialEndsAt: s.trial_ends_at,
    }));

    const attempts: AdminAttempt[] = (attemptsRes.data ?? []).map((a) => ({
      id: a.id,
      fullName: a.full_name,
      email: a.email,
      mobile: a.mobile,
      planCode: a.plan_code,
      amountPaise: a.amount_paise,
      status: a.status,
      failureReason: a.failure_reason,
      orderId: a.razorpay_order_id,
      createdAt: a.created_at,
    }));

    const gateway = {
      keyIdConfigured: Boolean(process.env["RAZORPAY_KEY_ID"]),
      keySecretConfigured: Boolean(process.env["RAZORPAY_KEY_SECRET"]),
      passcodeConfigured: Boolean(process.env["ADMIN_PASSCODE"]),
    };

    return { plans, subscribers, attempts, gateway };
  });

const planSchema = pass.extend({
  code: z.enum(["single", "family"]),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  amountPaise: z.number().int().min(0).max(100000000),
  periodDays: z.number().int().min(1).max(3650),
  petLimit: z.number().int().min(1).max(50),
  trialDays: z.number().int().min(0).max(365),
  isActive: z.boolean(),
});

export const adminSavePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planSchema.parse(data))
  .handler(async ({ data }) => {
    assertPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscription_plans")
      .update({
        name: data.name,
        description: data.description ?? null,
        amount_paise: data.amountPaise,
        period_days: data.periodDays,
        pet_limit: data.petLimit,
        trial_days: data.trialDays,
        is_active: data.isActive,
      })
      .eq("code", data.code);
    if (error) throw new Error("Could not save the plan.");
    return { ok: true };
  });

const statusSchema = pass.extend({
  id: z.string().uuid(),
  status: z.enum(["active", "inactive", "trialing"]),
});

export const adminSetSubscriberStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data }) => {
    assertPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("subscribers").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update the subscription.");
    return { ok: true };
  });

const extendSchema = pass.extend({
  id: z.string().uuid(),
  days: z.number().int().min(1).max(3650),
});

export const adminExtendSubscription = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => extendSchema.parse(data))
  .handler(async ({ data }) => {
    assertPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("subscribers")
      .select("expires_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!sub) throw new Error("Subscriber not found.");
    const base = Math.max(Date.parse(sub.expires_at), Date.now());
    const next = new Date(base + data.days * 86400000).toISOString();
    const { error } = await supabaseAdmin
      .from("subscribers")
      .update({ expires_at: next, status: "active" })
      .eq("id", data.id);
    if (error) throw new Error("Could not extend the subscription.");
    return { expiresAt: next };
  });

const planChangeSchema = pass.extend({
  id: z.string().uuid(),
  planCode: z.enum(["single", "family"]),
});

export const adminSetSubscriberPlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planChangeSchema.parse(data))
  .handler(async ({ data }) => {
    assertPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscribers")
      .update({ plan_code: data.planCode })
      .eq("id", data.id);
    if (error) throw new Error("Could not change the plan.");
    return { ok: true };
  });

const trialSchema = pass.extend({
  id: z.string().uuid(),
  days: z.number().int().min(1).max(365),
});

export const adminGrantTrial = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => trialSchema.parse(data))
  .handler(async ({ data }) => {
    assertPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const trialEnds = new Date(Date.now() + data.days * 86400000).toISOString();
    const { error } = await supabaseAdmin
      .from("subscribers")
      .update({ status: "trialing", trial_ends_at: trialEnds, expires_at: trialEnds })
      .eq("id", data.id);
    if (error) throw new Error("Could not start the free trial.");
    return { trialEndsAt: trialEnds };
  });
