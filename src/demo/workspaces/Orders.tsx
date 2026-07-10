import React, { useState } from "react";
import { Plus, Search, TrendingDown, TrendingUp, CheckCircle, Clock, AlertCircle, Truck, ChevronRight, Star } from "lucide-react";

const SUPPLIERS = [
  { id: 1, name: "Farm Fresh SG", category: "Dairy", rating: 4.8, deliveryDays: "Mon/Thu", leadDays: 1, contact: "James Tan", phone: "+65 9123 4567", spend30d: 1240, savings: 0, preferred: true },
  { id: 2, name: "Uji Tea Co", category: "Beverages", rating: 4.9, deliveryDays: "Tue/Fri", leadDays: 2, contact: "Kenji Mori", phone: "+65 9234 5678", spend30d: 820, savings: 0, preferred: true },
  { id: 3, name: "Tiong Bahru Bakery", category: "Bakery", rating: 4.7, deliveryDays: "Daily", leadDays: 0, contact: "Wei Liang", phone: "+65 9345 6789", spend30d: 980, savings: 0, preferred: true },
  { id: 4, name: "Poultry Plus", category: "Protein", rating: 4.1, deliveryDays: "Mon/Wed/Fri", leadDays: 1, contact: "Ahmad Rizal", phone: "+65 9456 7890", spend30d: 640, savings: 0, preferred: false },
  { id: 5, name: "Supplier B (Alt)", category: "Dairy", rating: 4.6, deliveryDays: "Tue/Fri", leadDays: 1, contact: "Linda Koh", phone: "+65 9567 8901", spend30d: 0, savings: 28, preferred: false },
  { id: 6, name: "Golden Sugars", category: "Dry Goods", rating: 4.5, deliveryDays: "Wed", leadDays: 2, contact: "David Ong", phone: "+65 9678 9012", spend30d: 180, savings: 0, preferred: false },
];

const ORDERS = [
  { id: "PO-2025-0612", supplier: "Farm Fresh SG", items: ["Fresh Milk 20L", "Heavy Cream 5L"], total: 142.50, status: "delivered", date: "12 May", eta: null },
  { id: "PO-2025-0611", supplier: "Tiong Bahru Bakery", items: ["Sourdough 30 loaves", "Croissants 20pcs"], total: 285.00, status: "in-transit", date: "13 May", eta: "3pm today" },
  { id: "PO-2025-0610", supplier: "Uji Tea Co", items: ["Matcha Powder 2kg"], total: 96.00, status: "pending", date: "13 May", eta: "Tomorrow" },
  { id: "PO-2025-0609", supplier: "Poultry Plus", items: ["Chicken Breast 5kg", "Eggs 120pcs"], total: 352.80, status: "pending", date: "13 May", eta: "Tomorrow" },
  { id: "PO-2025-0608", supplier: "Golden Sugars", items: ["Brown Sugar 10kg"], total: 24.00, status: "delivered", date: "10 May", eta: null },
  { id: "PO-2025-0607", supplier: "Farm Fresh SG", items: ["Fresh Milk 15L", "Oat Milk 10L"], total: 114.00, status: "delivered", date: "8 May", eta: null },
];

const STATUS: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  delivered:  { label: "Delivered",  icon: CheckCircle,  class: "text-emerald-400 bg-emerald-400/10" },
  "in-transit": { label: "In Transit", icon: Truck,        class: "text-blue-400 bg-blue-400/10" },
  pending:    { label: "Pending",    icon: Clock,         class: "text-yellow-400 bg-yellow-400/10" },
  cancelled:  { label: "Cancelled", icon: AlertCircle,   class: "text-red-400 bg-red-400/10" },
};

const PRICE_COMPARE = [
  { item: "Fresh Milk (1L)", current: { name: "Farm Fresh SG", price: 3.50 }, alt: { name: "Supplier B", price: 3.22 }, saving: 8 },
  { item: "Chicken Breast (kg)", current: { name: "Poultry Plus", price: 8.90 }, alt: { name: "Poultry Direct", price: 8.45 }, saving: 5 },
  { item: "Oat Milk (1L)", current: { name: "Oatly SG", price: 5.20 }, alt: { name: "Oatside SG", price: 4.85 }, saving: 7 },
];

export default function Orders() {
  const [tab, setTab] = useState<"orders" | "suppliers" | "compare">("orders");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = ORDERS.filter(o => {
    const matchQ = o.id.toLowerCase().includes(query.toLowerCase()) || o.supplier.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === "all" || o.status === statusFilter;
    return matchQ && matchS;
  });

  const totalSpend = ORDERS.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const pending = ORDERS.filter(o => o.status === "pending").length;
  const inTransit = ORDERS.filter(o => o.status === "in-transit").length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold">Orders & Suppliers</h2>
          <p className="text-white/40 text-xs mt-0.5">Purchase orders, supplier management & price comparison</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={14} />
          New Purchase Order
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "30-Day Spend", value: `S$ ${totalSpend.toFixed(0)}`, sub: "4 suppliers", color: "text-white" },
          { label: "Pending Orders", value: pending, sub: "Awaiting confirmation", color: "text-yellow-400" },
          { label: "In Transit", value: inTransit, sub: "Expected today/tomorrow", color: "text-blue-400" },
          { label: "Potential Savings", value: "S$ 128/mo", sub: "Switch 2 suppliers", color: "text-emerald-400" },
        ].map(k => (
          <div key={k.label} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1.5">{k.label}</div>
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-white/30 text-xs mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/4 p-1 rounded-xl w-fit">
        {(["orders", "suppliers", "compare"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`capitalize text-xs px-4 py-2 rounded-lg font-medium transition-all
              ${tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            {t === "compare" ? "Price Compare" : t === "orders" ? "Purchase Orders" : "Suppliers"}
          </button>
        ))}
      </div>

      {/* Purchase Orders tab */}
      {tab === "orders" && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex-1 max-w-xs">
              <Search size={13} className="text-white/30" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search orders..."
                className="bg-transparent text-white/70 text-xs outline-none w-full placeholder-white/25"
              />
            </div>
            <div className="flex gap-1.5">
              {["all", "pending", "in-transit", "delivered"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`capitalize text-xs px-3 py-1.5 rounded-lg transition-all
                    ${statusFilter === s ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  {s === "in-transit" ? "In Transit" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-[#1A1A1A] border border-white/6 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-white/30 text-xs font-medium">
              <div className="col-span-2">PO Number</div>
              <div className="col-span-3">Supplier</div>
              <div className="col-span-3">Items</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2">Status</div>
            </div>
            {filteredOrders.map(o => {
              const st = STATUS[o.status];
              return (
                <div key={o.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/3 transition-all cursor-pointer border-b border-white/3 last:border-0 group">
                  <div className="col-span-2 text-white/60 text-xs font-mono">{o.id}</div>
                  <div className="col-span-3 text-white/80 text-xs font-medium">{o.supplier}</div>
                  <div className="col-span-3">
                    <div className="text-white/50 text-xs truncate">{o.items[0]}</div>
                    {o.items.length > 1 && <div className="text-white/30 text-xs">+{o.items.length - 1} more</div>}
                  </div>
                  <div className="col-span-1 text-white/70 text-xs font-semibold">S${o.total.toFixed(2)}</div>
                  <div className="col-span-1 text-white/40 text-xs">{o.date}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-medium ${st.class}`}>
                      <st.icon size={10} />
                      {st.label}
                    </span>
                    {o.eta && <span className="text-white/30 text-[10px]">{o.eta}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suppliers tab */}
      {tab === "suppliers" && (
        <div className="grid grid-cols-3 gap-3">
          {SUPPLIERS.map(s => (
            <div key={s.id} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5 hover:border-white/12 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg font-bold text-white/60 flex-shrink-0">
                  {s.name[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  {s.preferred && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-medium">
                      Preferred
                    </span>
                  )}
                  {s.savings > 0 && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-medium">
                      Alt supplier
                    </span>
                  )}
                </div>
              </div>

              <div className="text-white/80 text-sm font-semibold mb-0.5">{s.name}</div>
              <div className="text-white/40 text-xs mb-3">{s.category}</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white/70 font-medium">{s.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Delivery</span>
                  <span className="text-white/60">{s.deliveryDays}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Lead time</span>
                  <span className="text-white/60">{s.leadDays === 0 ? "Same day" : `${s.leadDays}d`}</span>
                </div>
                {s.spend30d > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">30-day spend</span>
                    <span className="text-white/70 font-medium">S$ {s.spend30d}</span>
                  </div>
                )}
                {s.savings > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Potential saving</span>
                    <span className="text-emerald-400 font-medium">S$ {s.savings}/wk</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-white/30 text-xs">{s.contact}</span>
                <button className="text-emerald-400 text-xs font-medium hover:text-emerald-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Order <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Compare tab */}
      {tab === "compare" && (
        <div className="space-y-3">
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 flex items-center gap-3">
            <TrendingDown size={16} className="text-blue-400 flex-shrink-0" />
            <p className="text-white/60 text-xs leading-relaxed">
              AI detected <span className="text-white/80 font-medium">3 items</span> where switching suppliers saves you money.
              Combined monthly savings: <span className="text-emerald-400 font-semibold">S$ 128.40</span>
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-white/6 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-white/30 text-xs font-medium">
              <div className="col-span-3">Item</div>
              <div className="col-span-3">Current Supplier</div>
              <div className="col-span-3">Alternative Supplier</div>
              <div className="col-span-2">Saving</div>
              <div className="col-span-1">Action</div>
            </div>
            {PRICE_COMPARE.map(p => (
              <div key={p.item} className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-white/3 last:border-0 hover:bg-white/3 transition-all">
                <div className="col-span-3 text-white/70 text-xs font-medium">{p.item}</div>
                <div className="col-span-3">
                  <div className="text-white/50 text-xs">{p.current.name}</div>
                  <div className="text-white/70 text-xs font-semibold mt-0.5">S$ {p.current.price.toFixed(2)}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-white/50 text-xs">{p.alt.name}</div>
                  <div className="text-emerald-400 text-xs font-semibold mt-0.5">S$ {p.alt.price.toFixed(2)}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <TrendingDown size={11} />
                    -{p.saving}% cheaper
                  </div>
                </div>
                <div className="col-span-1">
                  <button className="text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors">
                    Switch →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Annual savings if you switch all 3", value: "S$ 1,540", icon: "💰", color: "emerald" },
              { title: "Items needing price renegotiation", value: "2 suppliers", icon: "🤝", color: "blue" },
              { title: "Avg delivery time, best vs current", value: "0.5 days faster", icon: "⚡", color: "yellow" },
            ].map(c => (
              <div key={c.title} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="text-white/40 text-xs mb-1.5">{c.title}</div>
                <div className={`font-bold text-base ${c.color === "emerald" ? "text-emerald-400" : c.color === "blue" ? "text-blue-400" : "text-yellow-400"}`}>
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
