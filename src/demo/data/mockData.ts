export const BUSINESS = {
  name: "Kopi Cafe",
  location: "Tiong Bahru, Singapore",
  owner: "Sarah",
  avatar: "SC",
};

export const KPI_DATA = {
  revenue: { value: 8243, prev: 7321, unit: "S$", trend: "up" },
  savings: { value: 482, prev: 407, unit: "S$", trend: "up" },
  waste: { value: 12.4, prev: 13.6, unit: "kg", trend: "down" },
  grossMargin: { value: 68.4, prev: 66.2, unit: "%", trend: "up" },
  ordersDue: { value: 7, pending: 2 },
};

export const REVENUE_SERIES = [
  { date: "7 May", value: 6200 },
  { date: "8 May", value: 5800 },
  { date: "9 May", value: 7100 },
  { date: "10 May", value: 6900 },
  { date: "11 May", value: 7800 },
  { date: "12 May", value: 7400 },
  { date: "13 May", value: 8243 },
];

export const WASTE_SERIES = [
  { day: "M", value: 14.2 },
  { day: "T", value: 11.8 },
  { day: "W", value: 13.5 },
  { day: "T", value: 15.1 },
  { day: "F", value: 12.4 },
  { day: "S", value: 10.9 },
  { day: "S", value: 12.4 },
];

export const WASTE_BREAKDOWN = [
  { name: "Dairy", value: 32 },
  { name: "Produce", value: 28 },
  { name: "Protein", value: 24 },
  { name: "Dry Goods", value: 11 },
  { name: "Others", value: 5 },
];

export const TOP_WASTE = [
  { item: "Fresh Milk", amount: 3.2, pct: 26 },
  { item: "Sourdough Bread", amount: 2.1, pct: 17 },
  { item: "Avocado", amount: 2.0, pct: 16 },
  { item: "Others", amount: 5.1, pct: 41 },
];

export const INVENTORY = [
  { id: 1, name: "Fresh Milk", category: "Dairy", supplier: "Farm Fresh SG", stock: 1.2, maxStock: 20, minStock: 5, unit: "L", daysLeft: 1, cost: 3.5, value: 4, risk: "critical", lastOrder: "5 May" },
  { id: 2, name: "Matcha Powder", category: "Dry Goods", supplier: "Uji Tea Co", stock: 800, maxStock: 2000, minStock: 500, unit: "g", daysLeft: 5, cost: 0.12, value: 96, risk: "medium", lastOrder: "1 May" },
  { id: 3, name: "Oat Milk", category: "Dairy", supplier: "Oatly SG", stock: 4.5, maxStock: 20, minStock: 5, unit: "L", daysLeft: 3, cost: 5.2, value: 23, risk: "medium", lastOrder: "3 May" },
  { id: 4, name: "Chicken Breast", category: "Protein", supplier: "Poultry Plus", stock: 1.8, maxStock: 10, minStock: 3, unit: "kg", daysLeft: 2, cost: 8.9, value: 16, risk: "high", lastOrder: "4 May" },
  { id: 5, name: "Avocado", category: "Produce", supplier: "Fresh Imports", stock: 2.3, maxStock: 15, minStock: 5, unit: "kg", daysLeft: 2, cost: 4.5, value: 10, risk: "high", lastOrder: "4 May" },
  { id: 6, name: "Heavy Cream", category: "Dairy", supplier: "Farm Fresh SG", stock: 1.1, maxStock: 10, minStock: 3, unit: "L", daysLeft: 2, cost: 6.8, value: 7, risk: "high", lastOrder: "3 May" },
  { id: 7, name: "Brown Sugar", category: "Dry Goods", supplier: "Golden Sugars", stock: 5.2, maxStock: 10, minStock: 2, unit: "kg", daysLeft: 14, cost: 1.2, value: 6, risk: "low", lastOrder: "25 Apr" },
  { id: 8, name: "Sourdough Bread", category: "Bakery", supplier: "Tiong Bahru Bakery", stock: 12, maxStock: 60, minStock: 20, unit: "loaves", daysLeft: 1, cost: 7.0, value: 84, risk: "critical", lastOrder: "5 May" },
  { id: 9, name: "Espresso Beans", category: "Dry Goods", supplier: "Common Man Coffee", stock: 3.2, maxStock: 8, minStock: 2, unit: "kg", daysLeft: 8, cost: 28.0, value: 90, risk: "low", lastOrder: "28 Apr" },
  { id: 10, name: "Eggs", category: "Protein", supplier: "Chew's Eggs", stock: 36, maxStock: 120, minStock: 30, unit: "pcs", daysLeft: 4, cost: 0.35, value: 13, risk: "medium", lastOrder: "2 May" },
];

export const MENU_ITEMS = [
  { id: 1, name: "Iced Matcha Latte", margin: "high", popularity: "high", marginPerServe: 1.42, action: "Promote", trend: "up", img: "🍵" },
  { id: 2, name: "Truffle Pasta", margin: "high", popularity: "med", marginPerServe: 1.28, action: "Promote", trend: "up", img: "🍝" },
  { id: 3, name: "Chicken Sandwich", margin: "low", popularity: "low", marginPerServe: -0.85, action: "Consider removing", trend: "down", img: "🥪" },
  { id: 4, name: "Cold Brew", margin: "high", popularity: "high", marginPerServe: 2.10, action: "Promote", trend: "up", img: "☕" },
  { id: 5, name: "Avocado Toast", margin: "med", popularity: "med", marginPerServe: 0.65, action: "Optimise", trend: "flat", img: "🥑" },
];

export const TASKS = [
  { id: 1, title: "Review supplier proposals", due: "today", urgent: true },
  { id: 2, title: "Approve purchase order", due: "today", urgent: true },
  { id: 3, title: "Update weekend specials", due: "tomorrow", urgent: false },
  { id: 4, title: "Staff roster for Saturday", due: "tomorrow", urgent: false },
  { id: 5, title: "Reply to GrabFood partnership email", due: "Fri", urgent: false },
];

export const AI_MESSAGES = [
  {
    agent: "Admin Agent",
    time: "10:21 AM",
    message: "Created Purchase Order #PO-2025-0609 for Fresh Milk, Bread, and 3 more items.",
    action: "View PO",
    sub: "PO #PO-2025-0609\nTotal: S$352.80",
  },
  {
    agent: "Supply Agent",
    time: "10:22 AM",
    message: "Supplier B for Fresh Milk is 8% cheaper than your current supplier.",
    action: "View comparison",
    sub: "Supplier Comparison\nPotential savings: S$28.40",
  },
  {
    agent: "Menu Agent",
    time: "10:23 AM",
    message: "Milk usage increasing due to Iced Matcha Latte popularity. Recommend increasing order by 12%.",
    action: null,
    sub: null,
  },
  {
    agent: "Admin Agent",
    time: "10:25 AM",
    message: "Weekend foot traffic forecast: +22% vs last weekend. Consider prepping extra matcha and oat milk.",
    action: "Adjust inventory",
    sub: null,
  },
];

export const NOTIFICATIONS = [
  { id: 1, icon: "🔔", text: "Fresh Milk stock will run out tomorrow", time: "2m ago", read: false, type: "critical" },
  { id: 2, icon: "📈", text: "Revenue exceeded daily projection by 12.6%", time: "15m ago", read: false, type: "success" },
  { id: 3, icon: "🚨", text: "Waste increased 8.7% vs yesterday", time: "1h ago", read: false, type: "warning" },
  { id: 4, icon: "💰", text: "Supplier B reduced chicken prices by 5%", time: "2h ago", read: true, type: "info" },
  { id: 5, icon: "🤖", text: "AI generated 3 new menu recommendations", time: "3h ago", read: true, type: "info" },
];

// Heatmap: 7 days × 12 hours = 84 cells
const DAY_MULTIPLIERS = [0.75, 0.80, 0.85, 0.90, 1.0, 1.35, 1.25];
const HOUR_MULTIPLIERS = [0.5, 0.9, 0.85, 1.1, 1.4, 1.45, 1.0, 0.7, 0.6, 0.8, 1.2, 1.15];
export const HEATMAP_DATA = Array.from({ length: 84 }, (_, i) => {
  const dayIdx = Math.floor(i / 12);
  const hourIdx = i % 12;
  const base = 300;
  const rawRevenue = base * DAY_MULTIPLIERS[dayIdx] * HOUR_MULTIPLIERS[hourIdx] + (Math.random() * 60 - 20);
  const revenue = Math.max(0, Math.round(rawRevenue));
  const value = Math.round((revenue / 600) * 100);
  return { value: Math.min(100, value), revenue, orders: Math.round(revenue / 10) };
});

export const FINANCE_SCENARIOS = [
  { icon: "🏪", event: "Weekend Pop-Up @ VivoCity", date: "17 May 2025", impact: 2800 },
  { icon: "🎋", event: "Matcha Festival @ Gardens by the Bay", date: "24 May 2025", impact: 4200 },
  { icon: "💸", event: "GST Registration Due", date: "31 May 2025", impact: -1200 },
];

export const SOCIAL_POSTS = [
  {
    id: 1,
    platform: "Instagram",
    caption: "☀️ Weekend matcha drop at VivoCity! Our ceremonial grade matcha is sourced directly from Uji, Japan ✨ Come find us at Level 2 this Saturday — limited cups available",
    status: "scheduled",
    scheduledFor: "Sat 17 May, 10:00 AM",
  },
  {
    id: 2,
    platform: "TikTok",
    caption: "POV: You find the best matcha latte in Singapore hidden in Tiong Bahru 🍵✨ Come visit us this weekend!",
    status: "draft",
    scheduledFor: "—",
  },
  {
    id: 3,
    platform: "Instagram",
    caption: "🌿 Did you know? Our matcha is shade-grown for 3 weeks before harvest, creating that deep umami flavor you taste in every sip.",
    status: "published",
    scheduledFor: "Mon 12 May",
  },
];
