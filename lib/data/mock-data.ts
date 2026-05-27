export type Order = {
  orderId: string;
  customerId: string;
  customerName: string;
  items: { name: string; sku: string; qty: number; price: number }[];
  total: number;
  status: "processing" | "shipped" | "delivered" | "returned" | "cancelled";
  placedAt: string;
  estimatedDelivery: string;
  tracking?: string;
  carrier?: string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
};

export type Customer = {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  tier: "standard" | "silver" | "gold" | "platinum";
  totalSpent: number;
  totalOrders: number;
  openTickets: number;
  recentOrders: string[];
  address: string;
  flags?: string[];
};

export type Ticket = {
  ticketId: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  category: "billing" | "shipping" | "product" | "returns" | "account" | "general";
  assignedTeam?: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  sentiment?: "positive" | "neutral" | "negative" | "angry";
};

export type BillingRecord = {
  transactionId: string;
  customerId: string;
  orderId: string;
  amount: number;
  type: "charge" | "refund" | "credit" | "chargeback";
  status: "completed" | "pending" | "failed" | "disputed";
  method: string;
  date: string;
  description: string;
};

export const orders: Order[] = [
  {
    orderId: "WF-2026-88421",
    customerId: "CUST-1001",
    customerName: "Sarah Mitchell",
    items: [
      { name: "Modena Velvet Sectional Sofa", sku: "SOF-VEL-4821", qty: 1, price: 2199.99 },
      { name: "Marble Top Coffee Table", sku: "TBL-MRB-1133", qty: 1, price: 449.99 },
    ],
    total: 2649.98,
    status: "shipped",
    placedAt: "2026-05-18T14:22:00Z",
    estimatedDelivery: "2026-05-28",
    tracking: "1Z999AA10123456784",
    carrier: "UPS Freight",
    shippingAddress: "142 Elm Street, Cambridge, MA 02139",
    paymentMethod: "Visa ending 4829",
  },
  {
    orderId: "WF-2026-88305",
    customerId: "CUST-1001",
    customerName: "Sarah Mitchell",
    items: [
      { name: "Linen Throw Pillow Set (4-pack)", sku: "PIL-LIN-0098", qty: 1, price: 89.99 },
    ],
    total: 89.99,
    status: "delivered",
    placedAt: "2026-05-10T09:15:00Z",
    estimatedDelivery: "2026-05-15",
    tracking: "1Z999AA10123456700",
    carrier: "FedEx",
    shippingAddress: "142 Elm Street, Cambridge, MA 02139",
    paymentMethod: "Visa ending 4829",
  },
  {
    orderId: "WF-2026-87990",
    customerId: "CUST-1002",
    customerName: "James Park",
    items: [
      { name: "Standing Desk - Walnut 60\"", sku: "DSK-WAL-6001", qty: 1, price: 799.99 },
      { name: "Ergonomic Task Chair", sku: "CHR-ERG-3300", qty: 1, price: 549.99 },
      { name: "Monitor Arm - Dual", sku: "ACC-ARM-0221", qty: 2, price: 89.99 },
    ],
    total: 1529.96,
    status: "processing",
    placedAt: "2026-05-24T18:45:00Z",
    estimatedDelivery: "2026-06-03",
    shippingAddress: "78 Atlantic Ave, Apt 12B, Boston, MA 02110",
    paymentMethod: "Amex ending 1002",
    notes: "Customer requested white-glove delivery",
  },
  {
    orderId: "WF-2026-86201",
    customerId: "CUST-1003",
    customerName: "Maria Garcia",
    items: [
      { name: "King Platform Bed Frame - Oak", sku: "BED-OAK-7700", qty: 1, price: 1299.99 },
      { name: "King Mattress - Hybrid Firm", sku: "MAT-HYB-5500", qty: 1, price: 899.99 },
    ],
    total: 2199.98,
    status: "returned",
    placedAt: "2026-04-28T11:30:00Z",
    estimatedDelivery: "2026-05-08",
    tracking: "1Z999AA10123456799",
    carrier: "UPS Freight",
    shippingAddress: "305 Congress St, Unit 7, Boston, MA 02210",
    paymentMethod: "Mastercard ending 5567",
    notes: "Mattress arrived damaged — return initiated",
  },
  {
    orderId: "WF-2026-89100",
    customerId: "CUST-1004",
    customerName: "David Chen",
    items: [
      { name: "Outdoor Dining Set - 6 Piece", sku: "OUT-DIN-4400", qty: 1, price: 1899.99 },
    ],
    total: 1899.99,
    status: "shipped",
    placedAt: "2026-05-20T08:00:00Z",
    estimatedDelivery: "2026-05-30",
    tracking: "9400111899223100001",
    carrier: "USPS Priority Freight",
    shippingAddress: "12 Beacon Hill Rd, Brookline, MA 02445",
    paymentMethod: "PayPal (d.chen@email.com)",
  },
  {
    orderId: "WF-2026-85010",
    customerId: "CUST-1005",
    customerName: "Emily Watson",
    items: [
      { name: "Nursery Crib - Convertible", sku: "CRB-CVT-1100", qty: 1, price: 599.99 },
      { name: "Changing Table Dresser", sku: "DRS-CHG-2200", qty: 1, price: 449.99 },
      { name: "Glider Rocking Chair", sku: "CHR-GLD-8800", qty: 1, price: 379.99 },
    ],
    total: 1429.97,
    status: "cancelled",
    placedAt: "2026-05-22T20:10:00Z",
    estimatedDelivery: "2026-06-01",
    shippingAddress: "88 Summer St, Somerville, MA 02143",
    paymentMethod: "Visa ending 7734",
    notes: "Customer cancelled — found items elsewhere at lower price",
  },
];

export const customers: Customer[] = [
  {
    customerId: "CUST-1001",
    name: "Sarah Mitchell",
    email: "s.mitchell@email.com",
    phone: "(617) 555-0142",
    memberSince: "2021-03-15",
    tier: "gold",
    totalSpent: 12849.50,
    totalOrders: 18,
    openTickets: 1,
    recentOrders: ["WF-2026-88421", "WF-2026-88305"],
    address: "142 Elm Street, Cambridge, MA 02139",
  },
  {
    customerId: "CUST-1002",
    name: "James Park",
    email: "j.park@company.com",
    phone: "(617) 555-0278",
    memberSince: "2023-11-02",
    tier: "silver",
    totalSpent: 4230.00,
    totalOrders: 6,
    openTickets: 0,
    recentOrders: ["WF-2026-87990"],
    address: "78 Atlantic Ave, Apt 12B, Boston, MA 02110",
  },
  {
    customerId: "CUST-1003",
    name: "Maria Garcia",
    email: "m.garcia@email.com",
    phone: "(857) 555-0391",
    memberSince: "2022-07-20",
    tier: "gold",
    totalSpent: 9870.25,
    totalOrders: 14,
    openTickets: 2,
    recentOrders: ["WF-2026-86201"],
    address: "305 Congress St, Unit 7, Boston, MA 02210",
    flags: ["VIP — high lifetime value", "Active return case"],
  },
  {
    customerId: "CUST-1004",
    name: "David Chen",
    email: "d.chen@email.com",
    phone: "(617) 555-0455",
    memberSince: "2024-01-10",
    tier: "standard",
    totalSpent: 3200.00,
    totalOrders: 3,
    openTickets: 1,
    recentOrders: ["WF-2026-89100"],
    address: "12 Beacon Hill Rd, Brookline, MA 02445",
  },
  {
    customerId: "CUST-1005",
    name: "Emily Watson",
    email: "e.watson@email.com",
    phone: "(617) 555-0599",
    memberSince: "2025-09-01",
    tier: "standard",
    totalSpent: 1429.97,
    totalOrders: 1,
    openTickets: 1,
    recentOrders: ["WF-2026-85010"],
    address: "88 Summer St, Somerville, MA 02143",
    flags: ["New customer", "Cancelled first order — retention risk"],
  },
];

export const tickets: Ticket[] = [
  {
    ticketId: "TKT-40221",
    customerId: "CUST-1001",
    customerName: "Sarah Mitchell",
    subject: "Sectional sofa delivery date unclear",
    description: "I ordered a Modena Velvet Sectional on May 18th and the tracking hasn't updated in 3 days. Estimated delivery says May 28 but I need to know if that's still accurate — I took the day off work for the delivery. Can someone give me a real update?",
    status: "open",
    priority: "medium",
    category: "shipping",
    createdAt: "2026-05-25T10:30:00Z",
    updatedAt: "2026-05-25T10:30:00Z",
    orderId: "WF-2026-88421",
    sentiment: "negative",
  },
  {
    ticketId: "TKT-40198",
    customerId: "CUST-1003",
    customerName: "Maria Garcia",
    subject: "Refund not received for damaged mattress",
    description: "I returned the damaged mattress (order WF-2026-86201) over two weeks ago and still haven't received my refund of $899.99. The return was picked up on May 12th. This is unacceptable — I've been a loyal customer for years. I want my refund processed immediately or I'm disputing the charge with my bank.",
    status: "escalated",
    priority: "urgent",
    category: "billing",
    assignedTeam: "Billing Escalations",
    assignedAgent: "Tom R.",
    createdAt: "2026-05-22T16:45:00Z",
    updatedAt: "2026-05-25T09:00:00Z",
    orderId: "WF-2026-86201",
    sentiment: "angry",
  },
  {
    ticketId: "TKT-40250",
    customerId: "CUST-1003",
    customerName: "Maria Garcia",
    subject: "Bed frame assembly instructions missing",
    description: "The King Platform Bed Frame I received was missing the assembly instructions manual. I've tried finding it online but your website only has the old version. Can you send me the correct instructions for SKU BED-OAK-7700?",
    status: "open",
    priority: "low",
    category: "product",
    createdAt: "2026-05-26T08:15:00Z",
    updatedAt: "2026-05-26T08:15:00Z",
    orderId: "WF-2026-86201",
    sentiment: "neutral",
  },
  {
    ticketId: "TKT-40180",
    customerId: "CUST-1004",
    customerName: "David Chen",
    subject: "Wrong color outdoor dining set",
    description: "I ordered the outdoor dining set in 'Weathered Teak' but the tracking shows 'Espresso Brown' is being shipped. Please fix this before it arrives. I specifically chose teak to match my existing patio furniture.",
    status: "in_progress",
    priority: "high",
    category: "product",
    assignedTeam: "Fulfillment",
    assignedAgent: "Lisa M.",
    createdAt: "2026-05-23T14:20:00Z",
    updatedAt: "2026-05-25T11:30:00Z",
    orderId: "WF-2026-89100",
    sentiment: "negative",
  },
  {
    ticketId: "TKT-40260",
    customerId: "CUST-1005",
    customerName: "Emily Watson",
    subject: "Price match request — nursery set",
    description: "I just cancelled my order WF-2026-85010 because I found the same items cheaper at a competitor. Before I buy from them, would Wayfair be willing to price match? The crib is $519.99 and the dresser is $399.99 at the other store. I'd prefer to buy from you since the reviews are better.",
    status: "open",
    priority: "medium",
    category: "billing",
    createdAt: "2026-05-26T07:00:00Z",
    updatedAt: "2026-05-26T07:00:00Z",
    orderId: "WF-2026-85010",
    sentiment: "neutral",
  },
  {
    ticketId: "TKT-40105",
    customerId: "CUST-1002",
    customerName: "James Park",
    subject: "Can I add an item to my pending order?",
    description: "My order WF-2026-87990 is still processing. I'd like to add a keyboard tray accessory (ACC-KBT-0330, $59.99) to the same shipment if possible. Would rather not pay separate shipping.",
    status: "waiting_customer",
    priority: "low",
    category: "general",
    assignedTeam: "Order Management",
    assignedAgent: "Sarah K.",
    createdAt: "2026-05-25T20:00:00Z",
    updatedAt: "2026-05-26T09:00:00Z",
    orderId: "WF-2026-87990",
    sentiment: "positive",
  },
];

export const billingRecords: BillingRecord[] = [
  { transactionId: "TXN-90001", customerId: "CUST-1001", orderId: "WF-2026-88421", amount: 2649.98, type: "charge", status: "completed", method: "Visa ending 4829", date: "2026-05-18T14:22:00Z", description: "Order payment — Modena Sectional + Coffee Table" },
  { transactionId: "TXN-90002", customerId: "CUST-1001", orderId: "WF-2026-88305", amount: 89.99, type: "charge", status: "completed", method: "Visa ending 4829", date: "2026-05-10T09:15:00Z", description: "Order payment — Linen Throw Pillow Set" },
  { transactionId: "TXN-90003", customerId: "CUST-1002", orderId: "WF-2026-87990", amount: 1529.96, type: "charge", status: "pending", method: "Amex ending 1002", date: "2026-05-24T18:45:00Z", description: "Order payment — Standing Desk + Chair + Monitor Arms" },
  { transactionId: "TXN-90004", customerId: "CUST-1003", orderId: "WF-2026-86201", amount: 2199.98, type: "charge", status: "completed", method: "Mastercard ending 5567", date: "2026-04-28T11:30:00Z", description: "Order payment — King Bed Frame + Mattress" },
  { transactionId: "TXN-90005", customerId: "CUST-1003", orderId: "WF-2026-86201", amount: 899.99, type: "refund", status: "pending", method: "Mastercard ending 5567", date: "2026-05-14T10:00:00Z", description: "Refund for damaged mattress — return received May 12" },
  { transactionId: "TXN-90006", customerId: "CUST-1004", orderId: "WF-2026-89100", amount: 1899.99, type: "charge", status: "completed", method: "PayPal (d.chen@email.com)", date: "2026-05-20T08:00:00Z", description: "Order payment — Outdoor Dining Set" },
  { transactionId: "TXN-90007", customerId: "CUST-1005", orderId: "WF-2026-85010", amount: 1429.97, type: "charge", status: "completed", method: "Visa ending 7734", date: "2026-05-22T20:10:00Z", description: "Order payment — Nursery Set (Crib + Dresser + Glider)" },
  { transactionId: "TXN-90008", customerId: "CUST-1005", orderId: "WF-2026-85010", amount: 1429.97, type: "refund", status: "completed", method: "Visa ending 7734", date: "2026-05-23T12:00:00Z", description: "Full refund — order cancelled by customer" },
];

export const opsMetrics = {
  period: "2026-05-19 to 2026-05-25",
  revenue: {
    gross: 11_420_000,
    net: 10_890_000,
    refunds: 530_000,
    avgOrderValue: 287.50,
    ordersPlaced: 39_720,
  },
  support: {
    totalTickets: 4812,
    openTickets: 1203,
    avgResolutionTimeHrs: 18.4,
    csat: 4.2,
    escalationRate: 0.08,
    topCategories: [
      { category: "Shipping", count: 1685, pct: 35 },
      { category: "Billing/Refunds", count: 1060, pct: 22 },
      { category: "Product Issues", count: 914, pct: 19 },
      { category: "Returns", count: 722, pct: 15 },
      { category: "Account/General", count: 431, pct: 9 },
    ],
  },
  finance: {
    accountsReceivable: 3_200_000,
    accountsPayable: 5_800_000,
    chargebackRate: 0.012,
    refundRate: 0.046,
    paymentFailureRate: 0.023,
    topRefundReasons: [
      { reason: "Damaged in transit", count: 312, amount: 189_000 },
      { reason: "Wrong item shipped", count: 198, amount: 134_000 },
      { reason: "Customer changed mind", count: 287, amount: 112_000 },
      { reason: "Late delivery", count: 156, amount: 95_000 },
    ],
  },
  operations: {
    fulfillmentRate: 0.94,
    onTimeDeliveryRate: 0.87,
    returnRate: 0.11,
    avgShipDays: 4.2,
    warehouseUtilization: 0.78,
    carrierBreakdown: [
      { carrier: "UPS Freight", pct: 42, onTime: 0.89 },
      { carrier: "FedEx", pct: 31, onTime: 0.91 },
      { carrier: "USPS Priority Freight", pct: 15, onTime: 0.82 },
      { carrier: "Regional LTL", pct: 12, onTime: 0.76 },
    ],
  },
};
