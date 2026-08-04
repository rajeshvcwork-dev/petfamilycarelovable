export type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  planName: string;
  name: string;
  email: string;
  mobile: string;
  onSuccess: (res: RazorpayResponse) => void;
  onDismiss: () => void;
}) {
  const rzp = new window.Razorpay!({
    key: options.keyId,
    order_id: options.orderId,
    amount: options.amount,
    currency: options.currency,
    name: "PetCareBuddy",
    description: options.planName,
    prefill: { name: options.name, email: options.email, contact: options.mobile },
    theme: { color: "#0d9488" },
    handler: (res: RazorpayResponse) => options.onSuccess(res),
    modal: { ondismiss: () => options.onDismiss() },
  });
  rzp.open();
}
