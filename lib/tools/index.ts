import { tool } from "ai";
import { z } from "zod";
import {
  orders,
  customers,
  tickets,
  billingRecords,
  opsMetrics,
} from "@/lib/data/mock-data";

export const lookupOrder = tool({
  description:
    "Look up a Wayfair order by order ID. Returns order details, items, status, tracking, and shipping info.",
  inputSchema: z.object({
    orderId: z
      .string()
      .describe("Order ID, e.g. WF-2026-88421"),
  }),
  execute: async ({ orderId }) => {
    const order = orders.find(
      (o) => o.orderId.toLowerCase() === orderId.toLowerCase(),
    );
    if (!order) {
      return { error: `Order ${orderId} not found`, availableOrders: orders.map((o) => o.orderId) };
    }
    return order;
  },
});

export const lookupCustomer = tool({
  description:
    "Look up a customer by customer ID, name, or email. Returns profile, tier, spend history, and recent orders.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Customer ID (CUST-XXXX), name, or email address"),
  }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const customer = customers.find(
      (c) =>
        c.customerId.toLowerCase() === q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase() === q,
    );
    if (!customer) {
      return { error: `No customer found for "${query}"`, hint: "Try a customer ID like CUST-1001, a name, or an email" };
    }
    return customer;
  },
});

export const searchTickets = tool({
  description:
    "Search and filter support tickets. Can filter by status, priority, category, or customer. Returns matching tickets.",
  inputSchema: z.object({
    status: z
      .enum(["open", "in_progress", "waiting_customer", "resolved", "escalated", "all"])
      .optional()
      .describe("Filter by ticket status"),
    priority: z
      .enum(["low", "medium", "high", "urgent", "all"])
      .optional()
      .describe("Filter by priority"),
    category: z
      .enum(["billing", "shipping", "product", "returns", "account", "general", "all"])
      .optional()
      .describe("Filter by category"),
    customerId: z
      .string()
      .optional()
      .describe("Filter by customer ID"),
  }),
  execute: async ({ status, priority, category, customerId }) => {
    let results = [...tickets];
    if (status && status !== "all") results = results.filter((t) => t.status === status);
    if (priority && priority !== "all") results = results.filter((t) => t.priority === priority);
    if (category && category !== "all") results = results.filter((t) => t.category === category);
    if (customerId) results = results.filter((t) => t.customerId === customerId);
    return {
      count: results.length,
      tickets: results,
    };
  },
});

export const getTicketDetails = tool({
  description:
    "Get full details of a specific support ticket by ticket ID, including customer sentiment and linked order.",
  inputSchema: z.object({
    ticketId: z.string().describe("Ticket ID, e.g. TKT-40221"),
  }),
  execute: async ({ ticketId }) => {
    const ticket = tickets.find(
      (t) => t.ticketId.toLowerCase() === ticketId.toLowerCase(),
    );
    if (!ticket) {
      return { error: `Ticket ${ticketId} not found`, availableTickets: tickets.map((t) => t.ticketId) };
    }
    const customer = customers.find((c) => c.customerId === ticket.customerId);
    const order = ticket.orderId
      ? orders.find((o) => o.orderId === ticket.orderId)
      : undefined;
    return { ticket, customerContext: customer, linkedOrder: order };
  },
});

export const getBillingHistory = tool({
  description:
    "Get billing and payment history for a customer. Shows charges, refunds, credits, and disputed transactions.",
  inputSchema: z.object({
    customerId: z
      .string()
      .describe("Customer ID, e.g. CUST-1001"),
  }),
  execute: async ({ customerId }) => {
    const records = billingRecords.filter(
      (r) => r.customerId.toUpperCase() === customerId.toUpperCase(),
    );
    if (records.length === 0) {
      return { error: `No billing records for ${customerId}` };
    }
    const totalCharged = records
      .filter((r) => r.type === "charge" && r.status === "completed")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalRefunded = records
      .filter((r) => r.type === "refund" && r.status === "completed")
      .reduce((sum, r) => sum + r.amount, 0);
    const pendingRefunds = records
      .filter((r) => r.type === "refund" && r.status === "pending")
      .reduce((sum, r) => sum + r.amount, 0);
    return {
      customerId,
      records,
      summary: {
        totalCharged: Math.round(totalCharged * 100) / 100,
        totalRefunded: Math.round(totalRefunded * 100) / 100,
        pendingRefunds: Math.round(pendingRefunds * 100) / 100,
        netRevenue: Math.round((totalCharged - totalRefunded) * 100) / 100,
      },
    };
  },
});

export const triageTicket = tool({
  description:
    "Analyze a support ticket and recommend priority, category, routing team, and suggested actions. Use this to help triage incoming tickets.",
  inputSchema: z.object({
    ticketId: z.string().describe("Ticket ID to triage"),
  }),
  execute: async ({ ticketId }) => {
    const ticket = tickets.find(
      (t) => t.ticketId.toLowerCase() === ticketId.toLowerCase(),
    );
    if (!ticket) {
      return { error: `Ticket ${ticketId} not found` };
    }
    const customer = customers.find((c) => c.customerId === ticket.customerId);
    const isHighValue = customer && customer.tier !== "standard";
    const isAngry = ticket.sentiment === "angry" || ticket.sentiment === "negative";

    const routingMap: Record<string, string> = {
      billing: "Billing & Payments",
      shipping: "Logistics & Delivery",
      product: "Product Support",
      returns: "Returns & Exchanges",
      account: "Account Services",
      general: "General Support",
    };

    let recommendedPriority = ticket.priority;
    const escalationReasons: string[] = [];

    if (isHighValue && isAngry) {
      recommendedPriority = "urgent";
      escalationReasons.push("High-value customer with negative sentiment");
    }
    if (customer?.flags?.some((f) => f.includes("retention risk"))) {
      recommendedPriority = recommendedPriority === "low" ? "high" : recommendedPriority;
      escalationReasons.push("Customer flagged as retention risk");
    }
    if (ticket.description.toLowerCase().includes("disput") || ticket.description.toLowerCase().includes("chargeback")) {
      recommendedPriority = "urgent";
      escalationReasons.push("Chargeback/dispute threat detected");
    }

    const suggestedActions: string[] = [];
    if (ticket.category === "billing" && ticket.description.toLowerCase().includes("refund")) {
      suggestedActions.push("Check refund status in billing system");
      suggestedActions.push("If refund is pending > 7 days, escalate to finance");
    }
    if (ticket.category === "shipping") {
      suggestedActions.push("Check carrier tracking for latest status");
      suggestedActions.push("Confirm estimated delivery with logistics team");
    }
    if (ticket.category === "product") {
      suggestedActions.push("Verify correct SKU was shipped");
      suggestedActions.push("Check warehouse inventory for replacement");
    }
    if (isHighValue) {
      suggestedActions.push(`Prioritize — ${customer!.tier} tier customer ($${customer!.totalSpent.toLocaleString()} lifetime spend)`);
    }

    return {
      ticketId,
      currentPriority: ticket.priority,
      recommendedPriority,
      recommendedTeam: routingMap[ticket.category] ?? "General Support",
      sentiment: ticket.sentiment,
      escalationReasons,
      suggestedActions,
      customerTier: customer?.tier ?? "unknown",
    };
  },
});

export const draftResponse = tool({
  description:
    "Draft a professional customer service response for a ticket. Generates an empathetic, actionable reply based on ticket context, order details, and customer history.",
  inputSchema: z.object({
    ticketId: z.string().describe("Ticket ID to respond to"),
    tone: z
      .enum(["empathetic", "professional", "urgent"])
      .optional()
      .describe("Tone of the response"),
    includeCompensation: z
      .boolean()
      .optional()
      .describe("Whether to offer compensation or goodwill gesture"),
  }),
  execute: async ({ ticketId, tone = "empathetic", includeCompensation = false }) => {
    const ticket = tickets.find(
      (t) => t.ticketId.toLowerCase() === ticketId.toLowerCase(),
    );
    if (!ticket) {
      return { error: `Ticket ${ticketId} not found` };
    }
    const customer = customers.find((c) => c.customerId === ticket.customerId);
    const order = ticket.orderId
      ? orders.find((o) => o.orderId === ticket.orderId)
      : undefined;

    const greeting = `Hi ${customer?.name.split(" ")[0] ?? "there"},`;
    const signoff = "Best regards,\nWayfair Customer Care";

    let body = "";

    if (ticket.category === "shipping") {
      body = `Thank you for reaching out about your order ${order?.orderId ?? ""}. I completely understand the frustration of not having clear delivery updates, especially when you've planned around a specific date.\n\nI've checked your shipment (tracking: ${order?.tracking ?? "N/A"}) with ${order?.carrier ?? "the carrier"}, and your estimated delivery of ${order?.estimatedDelivery ?? "the original date"} is still on track. I'll flag this shipment for priority monitoring so we can notify you immediately if anything changes.\n\nIf the delivery window needs to shift, we'll let you know at least 24 hours in advance so you can adjust your schedule.`;
    } else if (ticket.category === "billing") {
      const pendingRefund = billingRecords.find(
        (r) =>
          r.customerId === ticket.customerId &&
          r.orderId === ticket.orderId &&
          r.type === "refund" &&
          r.status === "pending",
      );
      body = pendingRefund
        ? `Thank you for your patience regarding the refund for order ${order?.orderId ?? ""}. I can see that a refund of $${pendingRefund.amount.toFixed(2)} was initiated on ${new Date(pendingRefund.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.\n\nI've escalated this to our finance team to expedite processing. Refunds typically take 5-10 business days, but given the delay, I'm pushing for this to be completed within 48 hours. You'll receive a confirmation email once the refund hits your ${pendingRefund.method}.`
        : `Thank you for contacting us about your billing concern. I'm looking into this now and will have an update for you shortly.`;
    } else if (ticket.category === "product") {
      body = `Thank you for letting us know about this issue with your order ${order?.orderId ?? ""}. I sincerely apologize for the inconvenience.\n\nI've flagged this with our fulfillment team and we're working on getting this resolved as quickly as possible. I'll follow up within 24 hours with a concrete resolution — whether that's a replacement shipment or another solution that works for you.`;
    } else {
      body = `Thank you for reaching out. I've reviewed your request and I want to make sure we get this handled correctly for you.\n\nI'm looking into the details now and will have a response for you shortly. In the meantime, if you have any additional information to share, please don't hesitate to reply to this ticket.`;
    }

    let compensation = "";
    if (includeCompensation) {
      const isHighValue = customer && (customer.tier === "gold" || customer.tier === "platinum");
      compensation = isHighValue
        ? `\n\nAs a valued ${customer!.tier} member, I'd also like to offer you a $50 store credit as a gesture of goodwill for the inconvenience. This has been applied to your account automatically.`
        : `\n\nI'd also like to offer you 15% off your next order as an apology for the inconvenience. I've sent a promo code to your email.`;
    }

    const tonePrefix =
      tone === "urgent"
        ? "I understand this is urgent and I'm treating it as a top priority. "
        : tone === "empathetic"
          ? "I appreciate you taking the time to write in, and I want you to know we take this seriously. "
          : "";

    return {
      ticketId,
      draft: `${greeting}\n\n${tonePrefix}${body}${compensation}\n\n${signoff}`,
      tone,
      includesCompensation: includeCompensation,
      note: "This is a draft — review and personalize before sending.",
    };
  },
});

export const getOpsMetrics = tool({
  description:
    "Get operational and financial metrics for the current week. Includes revenue, support ticket stats, finance KPIs, and logistics performance.",
  inputSchema: z.object({
    section: z
      .enum(["all", "revenue", "support", "finance", "operations"])
      .optional()
      .describe("Which metrics section to return"),
  }),
  execute: async ({ section = "all" }) => {
    if (section === "all") return opsMetrics;
    return { period: opsMetrics.period, [section]: opsMetrics[section as keyof typeof opsMetrics] };
  },
});

export const calculate = tool({
  description: "Evaluate a basic math expression (numbers and + - * / parentheses)",
  inputSchema: z.object({
    expression: z
      .string()
      .describe("Math expression, e.g. (17 * 23) + 4"),
  }),
  execute: async ({ expression }) => {
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
    if (!sanitized.trim()) {
      return { error: "Invalid expression" };
    }
    const result = Function(`"use strict"; return (${sanitized})`)();
    return { expression, result };
  },
});

export const chatTools = {
  lookupOrder,
  lookupCustomer,
  getTicketDetails,
  getBillingHistory,
  calculate,
};

export const agentTools = {
  lookupOrder,
  lookupCustomer,
  searchTickets,
  getTicketDetails,
  getBillingHistory,
  triageTicket,
  draftResponse,
  getOpsMetrics,
  calculate,
};
