"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Home, Package, Upload, Globe, ShoppingBag, Truck, Users, ReceiptText,
  Settings, Bot, Search, Bell, Calendar, Box, Wallet, TrendingUp, Plus,
  Trash2, Building2, ExternalLink, UserRound, Store, Sparkles, BarChart3,
  CreditCard, Link2, FileText, Wand2, Shield, Menu, X
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type Status = "Da Caricare" | "Online" | "Venduto" | "Da Spedire";

type Product = {
  id: number;
  name: string;
  brand: string;
  size: string;
  image: string;
  cost: number;
  price: number;
  status: Status;
};

type Client = {
  id: number;
  name: string;
  business: string;
  monthly: number;
  paid: number;
  site: string;
  status: "Venduto" | "Attivo" | "Da contattare" | "In sviluppo";
};

type Supplier = {
  id: number;
  name: string;
  type: string;
  contact: string;
  rating: number;
  notes: string;
};

type SupplierOrder = {
  id: number;
  code: string;
  supplier: string;
  products: string;
  cost: number;
  tracking: string;
  status: string;
  eta: string;
};

type Expense = {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
};

type TrendItem = {
  id: number;
  product: string;
  brand: string;
  buyPrice: number;
  avgSellPrice: number;
  demand: number;
  notes: string;
};

type VintedResult = {
  title: string;
  price: number;
  url?: string;
  image?: string;
};

type HotTrend = {
  query: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  score: number;
  status: string;
};

type TrendHistoryItem = {
  id: number;
  query: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  score: number;
  status: string;
  date: string;
};



function buildRecentActivities(
  products: Product[],
  clients: Client[],
  expenses: Expense[],
  supplierOrders: SupplierOrder[]
) {
  const activities: {
    icon: string;
    title: string;
    sub: string;
    time: string;
    color: string;
  }[] = [];

  const latestProduct = products[products.length - 1];
  if (latestProduct) {
    activities.push({
      icon: "🏷️",
      title: "Ultimo prodotto aggiornato",
      sub: latestProduct.name,
      time: "ora",
      color: latestProduct.status === "Venduto" ? "green" : "purple",
    });
  }

  const soldProduct = products.find((product) => product.status === "Venduto");
  if (soldProduct) {
    activities.push({
      icon: "📦",
      title: "Prodotto venduto",
      sub: soldProduct.name,
      time: "oggi",
      color: "green",
    });
  }

  const shippingProduct = products.find((product) => product.status === "Da Spedire");
  if (shippingProduct) {
    activities.push({
      icon: "🚚",
      title: "Ordine da spedire",
      sub: shippingProduct.name,
      time: "urgente",
      color: "orange",
    });
  }

  const latestClient = clients[clients.length - 1];
  if (latestClient) {
    activities.push({
      icon: "💼",
      title: "Cliente sito web",
      sub: `${latestClient.name} · ${latestClient.status}`,
      time: "attivo",
      color: "fuchsia",
    });
  }

  const latestExpense = expenses[expenses.length - 1];
  if (latestExpense) {
    activities.push({
      icon: "💸",
      title: "Spesa registrata",
      sub: `${latestExpense.name} · €${latestExpense.amount.toFixed(2)}`,
      time: latestExpense.date || "oggi",
      color: "blue",
    });
  }

  const latestSupplierOrder = supplierOrders[supplierOrders.length - 1];
  if (latestSupplierOrder) {
    activities.push({
      icon: "📥",
      title: "Ordine fornitore",
      sub: `${latestSupplierOrder.code} · ${latestSupplierOrder.status}`,
      time: latestSupplierOrder.eta,
      color: "emerald",
    });
  }

  return activities.slice(0, 6);
}

function buildEarningsChart(products: Product[], clients: Client[]) {
  const soldRevenue = products
    .filter((product) => product.status === "Venduto")
    .reduce((sum, product) => sum + product.price, 0);

  const clientRevenue = clients
    .filter((client) => client.status === "Attivo" || client.status === "Venduto")
    .reduce((sum, client) => sum + client.monthly + client.paid, 0);

  const total = soldRevenue + clientRevenue;

  const points = [0.08, 0.14, 0.22, 0.31, 0.44, 0.52, 0.61, 0.70, 0.77, 0.85, 0.93, 1];

  return points.map((multiplier, index) => ({
    label: ["24 Apr", "", "", "4 Mag", "", "", "14 Mag", "", "", "22 Mag", "", "24 Mag"][index],
    value: Number((total * multiplier).toFixed(2)),
  }));
}

function buildSvgPath(values: number[]) {
  const width = 598;
  const height = 205;
  const max = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = (width / Math.max(values.length - 1, 1)) * index + 10;
      const y = 220 - (value / max) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildSvgArea(path: string) {
  return `${path} L 608 240 L 10 240 Z`;
}


function getProductCategory(product: Product) {
  const text = `${product.name} ${product.brand} ${product.size}`.toLowerCase();

  if (
    text.includes("hoodie") ||
    text.includes("felpa") ||
    text.includes("sweatshirt") ||
    text.includes("fleece")
  ) {
    return "Felpe";
  }

  if (
    text.includes("pants") ||
    text.includes("pantal") ||
    text.includes("cargo") ||
    text.includes("jeans")
  ) {
    return "Pantaloni";
  }

  if (
    text.includes("jacket") ||
    text.includes("giacca") ||
    text.includes("coat") ||
    text.includes("windbreaker")
  ) {
    return "Giacche";
  }

  if (
    text.includes("t-shirt") ||
    text.includes("tshirt") ||
    text.includes("tee") ||
    text.includes("maglia")
  ) {
    return "T-Shirt";
  }

  return "Altro";
}

const categoryColors: Record<string, string> = {
  "T-Shirt": "#a855f7",
  Felpe: "#3b82f6",
  Pantaloni: "#06b6d4",
  Giacche: "#f59e0b",
  Altro: "#d946ef",
};

function buildCategoryStats(products: Product[]) {
  const soldProducts = products.filter((product) => product.status === "Venduto");
  const baseProducts = soldProducts.length > 0 ? soldProducts : products;

  const counts: Record<string, number> = {
    "T-Shirt": 0,
    Felpe: 0,
    Pantaloni: 0,
    Giacche: 0,
    Altro: 0,
  };

  baseProducts.forEach((product) => {
    counts[getProductCategory(product)] += 1;
  });

  const total = baseProducts.length;

  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    percent: total > 0 ? Math.round((count / total) * 100) : 0,
    color: categoryColors[name],
  }));
}

function getConicGradient(categories: { name: string; percent: number; color: string }[]) {
  let start = 0;

  const parts = categories.map((category) => {
    const end = start + category.percent;
    const part = `${category.color} ${start}% ${end}%`;
    start = end;
    return part;
  });

  return `conic-gradient(${parts.join(", ")})`;
}


const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Nike Tech Fleece Hoodie",
    brand: "Nike",
    size: "Nero · M",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop",
    cost: 45,
    price: 89.99,
    status: "Online",
  },
  {
    id: 2,
    name: "Stone Island Sweatshirt",
    brand: "Stone Island",
    size: "Navy · L",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=400&auto=format&fit=crop",
    cost: 55,
    price: 119.99,
    status: "Venduto",
  },
  {
    id: 3,
    name: "The North Face Jacket",
    brand: "The North Face",
    size: "Black · M",
    image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=400&auto=format&fit=crop",
    cost: 60,
    price: 129.99,
    status: "Online",
  },
  {
    id: 4,
    name: "Carhartt WIP Pants",
    brand: "Carhartt",
    size: "Beige · 32",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=400&auto=format&fit=crop",
    cost: 35,
    price: 69.99,
    status: "Da Caricare",
  },
  {
    id: 5,
    name: "Adidas Samba OG",
    brand: "Adidas",
    size: "White · 42",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop",
    cost: 40,
    price: 79.99,
    status: "Da Spedire",
  },
];

const defaultClients: Client[] = [
  { id: 1, name: "Ristorante Milano", business: "Ristorante", monthly: 150, paid: 900, site: "ristorantemilano.it", status: "Attivo" },
  { id: 2, name: "Severino Sushi", business: "Sushi Bar", monthly: 180, paid: 360, site: "severinosushi.it", status: "In sviluppo" },
  { id: 3, name: "Bar Centrale", business: "Bar", monthly: 120, paid: 240, site: "barcentrale.it", status: "Da contattare" },
];

const defaultSuppliers: Supplier[] = [
  { id: 1, name: "Alibaba Supplier", type: "Wholesale", contact: "alibaba.com", rating: 4, notes: "Buono per ordini grossi" },
  { id: 2, name: "Yupoo Seller", type: "Streetwear", contact: "yupoo link", rating: 5, notes: "Ottima qualità hoodie" },
  { id: 3, name: "Agent Warehouse", type: "Agent", contact: "dashboard agent", rating: 4, notes: "Utile per spedizioni" },
];

const defaultSupplierOrders: SupplierOrder[] = [
  { id: 1, code: "#HAUL001", supplier: "Yupoo Seller", products: "Nike Tech, Stone Island", cost: 185, tracking: "YT239842IT", status: "In transito", eta: "7 giorni" },
  { id: 2, code: "#HAUL002", supplier: "Alibaba Supplier", products: "Pantaloni cargo x8", cost: 224, tracking: "ALB88291", status: "Warehouse", eta: "12 giorni" },
];

const defaultExpenses: Expense[] = [
  { id: 1, name: "Haul Maggio", category: "Prodotti", amount: 185, date: "2025-05-24" },
  { id: 2, name: "Dominio cliente", category: "Siti Web", amount: 12, date: "2025-05-20" },
];

const defaultTrends: TrendItem[] = [
  { id: 1, product: "Tech Fleece Hoodie", brand: "Nike", buyPrice: 45, avgSellPrice: 90, demand: 8, notes: "Molto cercato, buon margine" },
  { id: 2, product: "Samba OG", brand: "Adidas", buyPrice: 40, avgSellPrice: 80, demand: 7, notes: "Sempre richieste" },
];

const imageList = defaultProducts.map((p) => p.image);

const menuGroups = [
  { title: "", items: [["Dashboard", Home]] },
  { title: "VINTED BUSINESS", items: [["Inventario", Package], ["Da Caricare", Upload], ["Online", Globe], ["Venduti", ShoppingBag], ["Ordini da Spedire", Truck], ["Statistiche", BarChart3]] },
  { title: "FORNITORI", items: [["Fornitori", Users], ["Ordini Fornitori", Box], ["Spese", Wallet]] },
  { title: "SITI WEB & CLIENTI", items: [["Clienti", UserRound], ["Siti Web", Building2], ["Abbonamenti", CreditCard], ["Fatture", ReceiptText]] },
  { title: "STRUMENTI AI", items: [["Generatore Descrizioni", Bot], ["Ricerca Trend", Search], ["Suggeritore Prezzi", Sparkles]] },
  { title: "IMPOSTAZIONI", items: [["Impostazioni", Settings], ["Integrazioni", Link2]] },
];


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function removeEmptyRows<T extends { id: number }>(rows: T[]) {
  return rows.filter((row) => row && row.id);
}

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function HomePage() {
  const [active, setActive] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>(() =>
    loadLS("bt-products", defaultProducts)
  );
  const [clients, setClients] = useState<Client[]>(() =>
    loadLS("bt-clients", defaultClients)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    loadLS("bt-suppliers", defaultSuppliers)
  );
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() =>
    loadLS("bt-supplier-orders", defaultSupplierOrders)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadLS("bt-expenses", defaultExpenses)
  );
  const [trends, setTrends] = useState<TrendItem[]>(() =>
    loadLS("bt-trends", defaultTrends)
  );
  const [search, setSearch] = useState("");
  const [trendSearch, setTrendSearch] = useState<string>(() =>
    loadLS("bt-trend-search", "")
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [calendarOpen, setCalendarOpen] = useState(false);
const [vintedResults, setVintedResults] = useState<VintedResult[]>([]);
  const [vintedAvgPrice, setVintedAvgPrice] = useState(0);
  const [vintedMinPrice, setVintedMinPrice] = useState(0);
  const [vintedMaxPrice, setVintedMaxPrice] = useState(0);
  const [isSearchingTrend, setIsSearchingTrend] = useState(false);
  const [trendError, setTrendError] = useState("");
  const [hotTrends, setHotTrends] = useState<HotTrend[]>([]);
  const [trendHistory, setTrendHistory] = useState<TrendHistoryItem[]>(() =>
    loadLS("bt-trend-history", [])
  );
  const [isScanningHotTrends, setIsScanningHotTrends] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState("");

  useEffect(() => {
    async function loadCloudData() {
      if (!supabase) {
        setCloudReady(true);
        return;
      }

      try {
        setCloudError("");

        const [
          productsResult,
          clientsResult,
          expensesResult,
          supplierOrdersResult,
        ] = await Promise.all([
          supabase.from("products").select("*").order("id", { ascending: true }),
          supabase.from("clients").select("*").order("id", { ascending: true }),
          supabase.from("expenses").select("*").order("id", { ascending: true }),
          supabase.from("supplier_orders").select("*").order("id", { ascending: true }),
        ]);

        if (productsResult.error) throw productsResult.error;
        if (clientsResult.error) throw clientsResult.error;
        if (expensesResult.error) throw expensesResult.error;
        if (supplierOrdersResult.error) throw supplierOrdersResult.error;

        if (productsResult.data && productsResult.data.length > 0) {
          setProducts(productsResult.data as Product[]);
        }

        if (clientsResult.data && clientsResult.data.length > 0) {
          setClients(clientsResult.data as Client[]);
        }

        if (expensesResult.data && expensesResult.data.length > 0) {
          setExpenses(expensesResult.data as Expense[]);
        }

        if (supplierOrdersResult.data && supplierOrdersResult.data.length > 0) {
          setSupplierOrders(supplierOrdersResult.data as SupplierOrder[]);
        }
      } catch (error: any) {
        setCloudError(error?.message || "Errore collegamento Supabase");
      } finally {
        setCloudReady(true);
      }
    }

    loadCloudData();
  }, []);

  async function replaceSupabaseTable(table: string, rows: any[]) {
    if (!supabase || !cloudReady) return;

    const cleanRows = removeEmptyRows(rows);

    const deleteResult = await supabase.from(table).delete().neq("id", 0);
    if (deleteResult.error) throw deleteResult.error;

    if (cleanRows.length > 0) {
      const insertResult = await supabase.from(table).insert(cleanRows);
      if (insertResult.error) throw insertResult.error;
    }
  }

  useEffect(() => {
    localStorage.setItem("bt-products", JSON.stringify(products));

    if (!cloudReady) return;
    replaceSupabaseTable("products", products).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio prodotti")
    );
  }, [products, cloudReady]);

  useEffect(() => {
    localStorage.setItem("bt-clients", JSON.stringify(clients));

    if (!cloudReady) return;
    replaceSupabaseTable("clients", clients).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio clienti")
    );
  }, [clients, cloudReady]);

  useEffect(() => {
    localStorage.setItem("bt-expenses", JSON.stringify(expenses));

    if (!cloudReady) return;
    replaceSupabaseTable("expenses", expenses).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio spese")
    );
  }, [expenses, cloudReady]);

  useEffect(() => {
    localStorage.setItem("bt-supplier-orders", JSON.stringify(supplierOrders));

    if (!cloudReady) return;
    replaceSupabaseTable("supplier_orders", supplierOrders).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio ordini fornitori")
    );
  }, [supplierOrders, cloudReady]);


  useEffect(() => {
    localStorage.setItem("bt-products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("bt-clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("bt-suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("bt-supplier-orders", JSON.stringify(supplierOrders));
  }, [supplierOrders]);

  useEffect(() => {
    localStorage.setItem("bt-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("bt-trends", JSON.stringify(trends));
  }, [trends]);

  useEffect(() => {
    localStorage.setItem("bt-trend-search", JSON.stringify(trendSearch));
  }, [trendSearch]);

  useEffect(() => {
    localStorage.setItem("bt-trend-history", JSON.stringify(trendHistory));
  }, [trendHistory]);
useEffect(() => localStorage.setItem("bt-suppliers", JSON.stringify(suppliers)), [suppliers]);
useEffect(() => localStorage.setItem("bt-trends", JSON.stringify(trends)), [trends]);

  const stats = useMemo(() => {
    const sold = products.filter((p) => p.status === "Venduto");
    const online = products.filter((p) => p.status === "Online");
    const shipping = products.filter((p) => p.status === "Da Spedire");
    const upload = products.filter((p) => p.status === "Da Caricare");
    const productRevenue = sold.reduce((a, p) => a + p.price, 0);
    const productProfit = sold.reduce((a, p) => a + p.price - p.cost, 0);

    const clientRevenue = clients
      .filter((client) => client.status === "Attivo" || client.status === "Venduto")
      .reduce((sum, client) => sum + client.monthly + client.paid, 0);

    const revenue = productRevenue + clientRevenue;
    const profit = productProfit + clientRevenue;

    const stock = products.reduce((a, p) => a + p.cost, 0);
    const supplierCost = supplierOrders.reduce((a, o) => a + o.cost, 0);
    const expenseCost = expenses.reduce((a, e) => a + e.amount, 0);

    return {
      sold,
      online,
      shipping,
      upload,
      revenue,
      profit,
      stock,
      supplierCost,
      expenseCost,
      productRevenue,
      productProfit,
      clientRevenue,
    };
  }, [products, clients, supplierOrders, expenses]);

  const categoryStats = useMemo(() => buildCategoryStats(products), [products]);
  const categoryTotal = products.filter((product) => product.status === "Venduto").length || products.length;
  const categoryConicGradient = getConicGradient(categoryStats);

  const recentActivities = useMemo(
    () => buildRecentActivities(products, clients, expenses, supplierOrders),
    [products, clients, expenses, supplierOrders]
  );

  const earningsChart = useMemo(
    () => buildEarningsChart(products, clients),
    [products, clients]
  );

  const earningsPath = buildSvgPath(earningsChart.map((point) => point.value));
  const earningsArea = buildSvgArea(earningsPath);
  const lastEarning = earningsChart[earningsChart.length - 1]?.value || 0;

  const analyticsData = useMemo(() => {
    const revenue = stats.revenue;
    const expensesTotal = stats.expenseCost + stats.supplierCost;
    const net = revenue - expensesTotal;
    const monthlyTarget = 5000;
    const targetProgress = Math.min(100, Math.max(0, (revenue / monthlyTarget) * 100));

    const topProducts = [...products]
      .sort((a, b) => (b.price - b.cost) - (a.price - a.cost))
      .slice(0, 5);

    const topClients = [...clients]
      .sort((a, b) => (b.monthly + b.paid) - (a.monthly + a.paid))
      .slice(0, 5);

    const productSales = stats.productRevenue || stats.revenue;
    const clientSales = stats.clientRevenue || 0;

    const chart = [
      { day: "Lun", revenue: revenue * 0.12, expenses: expensesTotal * 0.10 },
      { day: "Mar", revenue: revenue * 0.20, expenses: expensesTotal * 0.18 },
      { day: "Mer", revenue: revenue * 0.32, expenses: expensesTotal * 0.28 },
      { day: "Gio", revenue: revenue * 0.45, expenses: expensesTotal * 0.38 },
      { day: "Ven", revenue: revenue * 0.62, expenses: expensesTotal * 0.55 },
      { day: "Sab", revenue: revenue * 0.78, expenses: expensesTotal * 0.72 },
      { day: "Dom", revenue: revenue, expenses: expensesTotal },
    ].map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
      expenses: Number(item.expenses.toFixed(2)),
      profit: Number((item.revenue - item.expenses).toFixed(2)),
    }));

    const heatmap = Array.from({ length: 28 }, (_, index) => {
      const intensity = ((index * 7 + stats.sold.length * 13 + products.length * 5) % 100) + 8;
      return {
        id: index,
        intensity,
      };
    });

    return {
      revenue,
      expensesTotal,
      net,
      monthlyTarget,
      targetProgress,
      topProducts,
      topClients,
      productSales,
      clientSales,
      chart,
      heatmap,
    };
  }, [stats, products, clients]);

  const menuCounts: Record<string, number> = {
    Inventario: products.length,
    "Da Caricare": stats.upload.length,
    Online: stats.online.length,
    Venduti: stats.sold.length,
    "Ordini da Spedire": stats.shipping.length,
    Fornitori: suppliers.length,
    "Ordini Fornitori": supplierOrders.length,
    Spese: expenses.length,
    Clienti: clients.length,
    "Siti Web": clients.length,
  };

  function changeSection(section: string) {
    setActive(section);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const visibleProducts = products
    .filter((p) => {
      if (active === "Da Caricare") return p.status === "Da Caricare";
      if (active === "Online") return p.status === "Online";
      if (active === "Venduti") return p.status === "Venduto";
      if (active === "Ordini da Spedire") return p.status === "Da Spedire";
      return true;
    })
    .filter((p) => `${p.name} ${p.brand} ${p.size}`.toLowerCase().includes(search.toLowerCase()));

  function updateProduct(id: number, field: keyof Product, value: string) {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: field === "cost" || field === "price" ? Number(value) : value } : p));
  }

  function addProduct() {
    setProducts((prev) => [...prev, { id: Date.now(), name: "Nuovo prodotto", brand: "Brand", size: "Taglia", image: imageList[Math.floor(Math.random() * imageList.length)], cost: 0, price: 0, status: "Da Caricare" }]);
    setActive("Inventario");
  }

  async function searchVintedTrend() {
    if (!trendSearch.trim()) {
      setTrendError("Scrivi prima un prodotto da cercare.");
      return;
    }
    try {
      setIsSearchingTrend(true);
      setTrendError("");
      const response = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trendSearch }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Errore ricerca Vinted");
      const results = data.results || [];
      const count = Number(data.count || results.length || 0);
      const avgPrice = Number(data.avgPrice || 0);
      const minPrice = Number(data.minPrice || 0);
      const maxPrice = Number(data.maxPrice || 0);
      const spread = Math.max(0, maxPrice - minPrice);
      const score = Math.round(count * 8 + avgPrice * 0.7 + spread * 0.45);
      const status =
        score >= 130
          ? "🔥 Hot"
          : score >= 85
          ? "📈 Sta salendo"
          : score >= 45
          ? "🟡 Stabile"
          : "🔻 Debole";

      setVintedResults(results);
      setVintedAvgPrice(avgPrice);
      setVintedMinPrice(minPrice);
      setVintedMaxPrice(maxPrice);

      setTrendHistory((prev) => [
        {
          id: Date.now(),
          query: trendSearch,
          count,
          avgPrice,
          minPrice,
          maxPrice,
          score,
          status,
          date: new Date().toLocaleString("it-IT"),
        },
        ...prev.filter(
          (item) => item.query.toLowerCase() !== trendSearch.toLowerCase()
        ),
      ].slice(0, 20));
    } catch (error: any) {
      setTrendError(error.message || "Errore durante la ricerca.");
      setVintedResults([]);
      setVintedAvgPrice(0);
      setVintedMinPrice(0);
      setVintedMaxPrice(0);
    } finally {
      setIsSearchingTrend(false);
    }
  }


  function generateAiSuggestion() {
    const avg = vintedAvgPrice || 0;
    const buyBelow = avg * 0.55;
    const sellPrice = avg > 0 ? avg * 0.92 : 0;
    const profit = sellPrice - buyBelow;

    if (!avg) {
      return {
        title: "Cerca prima un prodotto",
        text: "Scrivi un prodotto e premi Cerca su Vinted. Poi BLACKTAG ti calcola prezzo, margine e strategia.",
        tone: "purple",
      };
    }

    if (profit >= 30) {
      return {
        title: "Trend molto interessante",
        text: `Compra sotto €${buyBelow.toFixed(2)}, prova a rivendere a €${sellPrice.toFixed(2)}. Margine stimato circa €${profit.toFixed(2)}.`,
        tone: "green",
      };
    }

    if (profit >= 15) {
      return {
        title: "Trend discreto",
        text: `Il margine c'è, ma devi comprare bene. Target acquisto: €${buyBelow.toFixed(2)}.`,
        tone: "yellow",
      };
    }

    return {
      title: "Margine basso",
      text: "Questo prodotto non sembra fortissimo ora. Cerca un brand o modello più specifico.",
      tone: "red",
    };
  }

  async function scanHotVintedTrends() {
    const keywords = [
      "nike tech fleece",
      "adidas samba",
      "stone island",
      "north face jacket",
      "carhartt cargo",
      "ralph lauren polo",
      "new balance 550",
      "nike dunk",
      "moncler jacket",
      "cp company",
    ];

    try {
      setIsScanningHotTrends(true);
      setTrendError("");

      const results = await Promise.all(
        keywords.map(async (keyword) => {
          const response = await fetch("/api/trends", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: keyword }),
          });

          const data = await response.json();

          const count = Number(data.count || 0);
          const avgPrice = Number(data.avgPrice || 0);
          const minPrice = Number(data.minPrice || 0);
          const maxPrice = Number(data.maxPrice || 0);

          const spread = Math.max(0, maxPrice - minPrice);
          const score = Math.round(count * 8 + avgPrice * 0.7 + spread * 0.45);

          const status =
            score >= 130
              ? "🔥 Hot"
              : score >= 85
              ? "📈 Sta salendo"
              : score >= 45
              ? "🟡 Stabile"
              : "🔻 Debole";

          return {
            query: keyword,
            count,
            avgPrice,
            minPrice,
            maxPrice,
            score,
            status,
          };
        })
      );

      setHotTrends(results.sort((a, b) => b.score - a.score));
    } catch (error: any) {
      setTrendError(error?.message || "Errore scansione trend");
    } finally {
      setIsScanningHotTrends(false);
    }
  }

  function addCurrentSearchToTrendManual() {
    if (!trendSearch.trim()) {
      setTrendError("Cerca prima un prodotto.");
      return;
    }

    setTrends((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: trendSearch,
        brand: trendSearch.split(" ")[0] || "Brand",
        buyPrice: Number((vintedAvgPrice * 0.55).toFixed(2)),
        avgSellPrice: Number(vintedAvgPrice.toFixed(2)),
        demand:
          vintedAvgPrice >= 80
            ? 9
            : vintedAvgPrice >= 50
            ? 7
            : vintedAvgPrice >= 25
            ? 5
            : 3,
        notes: `Auto da Vinted · range €${vintedMinPrice.toFixed(2)}-€${vintedMaxPrice.toFixed(2)}`,
      },
    ]);
  }

  function addVintedItemToInventory(item: VintedResult) {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: item.title || "Prodotto Vinted",
        brand: trendSearch.split(" ")[0] || "Brand",
        size: "Da verificare",
        image: item.image || imageList[0],
        cost: Number((Number(item.price || 0) * 0.55).toFixed(2)),
        price: Number(Number(item.price || 0).toFixed(2)),
        status: "Da Caricare",
      },
    ]);

    setActive("Inventario");
  }

  function addHotTrendToManual(item: HotTrend) {
    setTrends((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: item.query,
        brand: item.query.split(" ")[0] || "Brand",
        buyPrice: Number((item.avgPrice * 0.55).toFixed(2)),
        avgSellPrice: Number(item.avgPrice.toFixed(2)),
        demand: item.score >= 130 ? 10 : item.score >= 85 ? 8 : item.score >= 45 ? 6 : 3,
        notes: `${item.status} · score ${item.score}`,
      },
    ]);
  }


  async function uploadProductImage(productId: number, file: File) {
    if (!supabase) {
      alert("Supabase non configurato");
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error("URL immagine non generato");
      }

      updateProduct(productId, "image", data.publicUrl);
    } catch (error: any) {
      alert(error?.message || "Errore caricamento immagine");
    }
  }



  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#03040a] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-[28px] border border-white/10 bg-[#0c0e19]/90 p-8 text-center shadow-2xl shadow-black/40">
            <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600" />
            <h1 className="text-2xl font-black">
              BLACK<span className="text-fuchsia-500">TAG</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">Caricamento dashboard...</p>
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen overflow-hidden bg-[#03040a] text-white selection:bg-fuchsia-500/40 [font-feature-settings:'cv02','cv03','cv04','cv11']">
      <style jsx global>{`
        html, body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        *::-webkit-scrollbar { width: 10px; height: 10px; }
        *::-webkit-scrollbar-track { background: #05060d; }
        *::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #7c3aed, #d946ef); border-radius: 999px; border: 2px solid #05060d; }
        input, select, textarea, button {
          font-family: inherit;
        }
        input, select, textarea {
          letter-spacing: -0.01em;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_9%_0%,rgba(147,51,234,.35),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(59,130,246,.20),transparent_32%),radial-gradient(circle_at_52%_100%,rgba(217,70,239,.13),transparent_36%),linear-gradient(180deg,rgba(255,255,255,.045),transparent_58%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none fixed left-[20%] top-[-10%] h-[520px] w-[520px] rounded-full bg-purple-700/15 blur-[120px]" />
      <div className="pointer-events-none fixed right-[-12%] top-[18%] h-[560px] w-[560px] rounded-full bg-fuchsia-600/10 blur-[130px]" />

      {mobileMenu && (
        <button
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm xl:hidden"
          aria-label="Chiudi menu"
        />
      )}

      <aside className={`fixed left-0 top-0 z-40 h-screen w-[285px] border-r border-white/10 bg-[#060812]/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-transform duration-300 xl:w-[265px] xl:translate-x-0 ${
        mobileMenu ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-600/20 text-purple-300 shadow-lg shadow-purple-700/30"><Shield size={20} /></div>
          <div className="flex-1">
            <h1 className="text-2xl font-black leading-none">BLACK<span className="text-fuchsia-500">TAG</span></h1>
            <p className="mt-1 text-xs tracking-wide text-zinc-500">COMMAND CENTER</p>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 xl:hidden"
            aria-label="Chiudi menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="h-[calc(100vh-240px)] space-y-6 overflow-y-auto pr-1">
          {menuGroups.map((group) => (
            <div key={group.title || "main"}>
              {group.title && <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{group.title}</p>}
              <div className="space-y-1">
                {group.items.map(([name, Icon]: any) => (
                  <button key={name} onClick={() => changeSection(name)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active === name ? "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-lg shadow-purple-700/40 ring-1 ring-white/10" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white hover:translate-x-1"}`}>
                    <Icon size={16} />
                    <span className="flex-1">{name}</span>
                    {menuCounts[name] !== undefined && <span className="rounded-full bg-purple-700/70 px-2 py-0.5 text-xs text-purple-100 shadow shadow-purple-700/30">{menuCounts[name]}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4">
            <p className="mb-3 text-sm font-bold">AI ASSISTANT</p>
            <div className="flex items-center justify-between rounded-xl bg-black/50 px-3 py-3 text-xs text-zinc-400">Chiedi qualcosa...<Sparkles size={14} className="text-purple-400" /></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
            <div className="flex-1"><b className="text-sm">Dan</b><p className="text-xs text-zinc-500">Admin</p></div>
          </div>
        </div>
      </aside>

      <section className="relative z-10 min-h-screen p-4 pb-28 xl:ml-[265px] xl:p-7">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-white shadow-xl shadow-black/20 transition hover:border-purple-500/40 hover:bg-white/[0.08] xl:hidden"
              aria-label="Apri menu"
            >
              <Menu size={22} />
            </button>
            <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
              BLACKTAG LIVE COMMAND
            </div>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em]">👋 Bentornato, Dan</h2>
            <p className="text-sm text-zinc-400">Dashboard AI per Vinted, fornitori, clienti e trend reali.</p>
            <p className="mt-1 text-xs text-purple-300">
              Data selezionata: {new Date(selectedDate).toLocaleDateString("it-IT")}
            </p>
            <p className={`mt-1 text-xs ${cloudError ? "text-red-300" : "text-green-300"}`}>
              {supabase ? cloudError || "Cloud Supabase collegato" : "Supabase non configurato"}
            </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-xl transition focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 xl:w-[470px]">
              <Search size={16} className="text-zinc-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca prodotti, ordini, clienti..." className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500" />
            </div>
            <button className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-xl shadow-black/20 transition hover:border-purple-500/40 hover:bg-white/[0.08]"><Bell size={18} /></button>
            <CalendarPicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
            />
          </div>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Stat title="Incasso Totale" value={`€${stats.revenue.toFixed(2)}`} icon={TrendingUp} sub="+18,6% questo mese" />
          <Stat title="Profitto Reale" value={`€${stats.profit.toFixed(2)}`} icon={Wallet} sub="+22,4%" />
          <Stat title="Prodotti Online" value={stats.online.length} icon={Globe} sub="+3 nuovi" />
          <Stat title="Prodotti Venduti" value={stats.sold.length} icon={ShoppingBag} sub="+2 questa settimana" />
          <Stat title="Valore Stock" value={`€${stats.stock.toFixed(2)}`} icon={Box} sub="+5,7%" />
          <Stat title="Da Spedire" value={stats.shipping.length} icon={Truck} sub="Attenzione richiesta" warn />
        </section>

        {active === "Dashboard" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <Panel className="xl:col-span-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">Andamento Guadagni</h3>
                  <p className="text-xs text-zinc-500">Calcolato da vendite + canoni clienti</p>
                </div>
                <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
                  Ultimi 30 giorni
                </button>
              </div>

              <div className="relative h-[320px] overflow-hidden rounded-[24px] border border-purple-500/10 bg-gradient-to-b from-purple-950/40 via-[#0b0d18] to-black/20 p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(217,70,239,.26),transparent_35%)]" />
                <div className="absolute inset-x-5 top-8 space-y-[54px]">
                  {[1, 2, 3, 4].map((line) => (
                    <div key={line} className="h-px bg-white/10" />
                  ))}
                </div>

                <div className="absolute left-5 top-6 space-y-[38px] text-xs text-zinc-500">
                  <p>€1.5K</p>
                  <p>€1K</p>
                  <p>€500</p>
                  <p>€0</p>
                </div>

                <svg viewBox="0 0 620 245" className="relative z-10 ml-8 h-full w-[calc(100%-2rem)] overflow-visible">
                  <defs>
                    <linearGradient id="dashLinePremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="premiumGlow">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d={earningsPath} fill="none" stroke="#e879f9" strokeWidth="4" filter="url(#premiumGlow)" />
                  <path d={earningsArea} fill="url(#dashLinePremium)" />
                  {earningsChart.map((point, index) => {
                    const max = Math.max(...earningsChart.map((entry) => entry.value), 1);
                    const x = (598 / Math.max(earningsChart.length - 1, 1)) * index + 10;
                    const y = 220 - (point.value / max) * 205;
                    return (
                      <circle key={index} cx={x} cy={y} r="5" fill="#f5d0fe" stroke="#a855f7" strokeWidth="3" />
                    );
                  })}
                </svg>

                <div className="absolute right-12 top-24 rounded-2xl border border-purple-500/20 bg-[#0f1020]/90 p-4 shadow-xl shadow-purple-700/20 backdrop-blur">
                  <p className="text-xs text-zinc-400">22 Maggio 2025</p>
                  <p className="mt-1 text-xl font-black">€{lastEarning.toFixed(2)}</p>
                </div>

                <div className="absolute bottom-4 left-14 right-5 flex justify-between text-xs text-zinc-500">
                  {earningsChart.filter((point) => point.label).map((point) => (
                    <span key={point.label}>{point.label}</span>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel className="xl:col-span-3">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">Categorie Vendite</h3>
                  <p className="text-xs text-zinc-500">
                    Calcolate dai prodotti {stats.sold.length > 0 ? "venduti" : "in inventario"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-5">
                <div
                  className="relative grid h-52 w-52 place-items-center rounded-full shadow-2xl shadow-purple-700/30"
                  style={{ background: categoryConicGradient }}
                >
                  <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/20" />
                  <div className="relative grid h-30 w-30 place-items-center rounded-full bg-[#0d0f19] text-center ring-1 ring-white/10">
                    <div>
                      <p className="text-xs text-zinc-400">Totale</p>
                      <p className="text-4xl font-black">{categoryTotal}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3 text-sm">
                  {categoryStats.map((item) => (
                    <div key={item.name} className="flex items-center gap-3 rounded-xl bg-white/[0.035] p-2">
                      <span
                        className="h-3 w-3 rounded-full shadow-lg"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="flex-1">{item.name}</span>
                      <b>{item.percent}%</b>
                      <span className="text-xs text-zinc-500">({item.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel className="xl:col-span-4">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black">Attività Recenti</h3>
                <button className="text-sm font-bold text-fuchsia-400">Vedi tutto ›</button>
              </div>

              {recentActivities.map((activity, index) => (
                <PremiumActivity
                  key={`${activity.title}-${index}`}
                  icon={activity.icon}
                  title={activity.title}
                  sub={activity.sub}
                  time={activity.time}
                  color={activity.color}
                />
              ))}
            </Panel>

            <Panel className="xl:col-span-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black">Ultimi Prodotti</h3>
                <button onClick={() => setActive("Inventario")} className="text-sm font-bold text-fuchsia-400">Vedi tutti ›</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-1 text-left text-[13px]">
                  <thead className="text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="pb-3">Prodotto</th>
                      <th className="pb-3">Costo</th>
                      <th className="pb-3">Prezzo</th>
                      <th className="pb-3">Profitto</th>
                      <th className="pb-3">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id} className="border-t border-white/5 transition hover:bg-white/[0.025]">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" />
                            <div>
                              <p className="font-bold">{product.name}</p>
                              <p className="text-xs text-zinc-500">{product.size}</p>
                            </div>
                          </div>
                        </td>
                        <td>€{product.cost.toFixed(2)}</td>
                        <td>€{product.price.toFixed(2)}</td>
                        <td className="font-bold text-green-400">€{(product.price - product.cost).toFixed(2)}</td>
                        <td>
                          <span className={`rounded-lg px-3 py-1 text-xs ${
                            product.status === "Online"
                              ? "bg-green-500/20 text-green-300"
                              : product.status === "Venduto"
                              ? "bg-blue-500/20 text-blue-300"
                              : product.status === "Da Spedire"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel className="xl:col-span-3">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black">Ordini da Spedire</h3>
                <button onClick={() => setActive("Ordini da Spedire")} className="text-sm font-bold text-fuchsia-400">Vedi tutti ›</button>
              </div>

              <div className="space-y-3">
                {products.filter((product) => product.status === "Da Spedire").slice(0, 4).map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 transition hover:bg-white/[0.07]">
                    <img src={product.image} alt={product.name} className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{product.name}</p>
                      <p className="text-xs text-zinc-500">#BT12{46 + index}</p>
                    </div>
                    <span className="rounded-lg bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300">
                      {index + 1} giorni
                    </span>
                  </div>
                ))}

                {products.filter((product) => product.status === "Da Spedire").length === 0 && (
                  <p className="rounded-xl bg-white/[0.04] p-4 text-sm text-zinc-400">
                    Nessun ordine da spedire.
                  </p>
                )}
              </div>
            </Panel>

            <Panel className="xl:col-span-4">
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-lg font-black">AI Assistant</h3>
                <span className="rounded-lg bg-purple-600/30 px-2 py-1 text-xs font-bold text-purple-200">BETA</span>
              </div>
              <p className="mb-4 text-sm text-zinc-400">Ecco alcuni suggerimenti per te:</p>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/5 bg-purple-500/10 p-4">🔥 3 prodotti hanno alta richiesta<br /><span className="text-zinc-400">Vedi i trend del momento</span></div>
                <div className="rounded-xl border border-white/5 bg-purple-500/10 p-4">💰 Potresti aumentare i prezzi<br /><span className="text-zinc-400">+€230 potenziali di profitto</span></div>
                <div className="rounded-xl border border-white/5 bg-purple-500/10 p-4">📦 2 prodotti stanno per finire<br /><span className="text-zinc-400">Controlla lo stock dei fornitori</span></div>
              </div>
              <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-purple-700 to-fuchsia-600 py-3 text-sm font-bold shadow-lg shadow-purple-700/30">
                Apri AI Assistant →
              </button>
            </Panel>

            <div className="xl:col-span-12">
              <AnalyticsPremium analyticsData={analyticsData} />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:col-span-12 xl:grid-cols-4">
              <MiniDashboardCard title="Stock Totale" value={`${products.length} pezzi`} sub={`Valore totale: €${stats.stock.toFixed(2)}`} icon="📦" />
              <MiniDashboardCard title="Valore Inventario" value={`€${stats.stock.toFixed(2)}`} sub={`Costo medio: €${(products.length ? stats.stock / products.length : 0).toFixed(2)}`} icon="📈" />
              <MiniDashboardCard title="Miglior Prodotto" value={products[0]?.name || "Nessuno"} sub={`Profitto: €${products[0] ? (products[0].price - products[0].cost).toFixed(2) : "0.00"}`} icon="🏆" />
              <MiniDashboardCard title="Miglior Cliente" value={clients[0]?.name || "Nessuno"} sub={clients[0] ? `Canone: €${clients[0].monthly}` : "Nessun cliente"} icon="👑" />
            </div>
          </section>
        )}

        {["Inventario", "Da Caricare", "Online", "Venduti", "Ordini da Spedire"].includes(active) && (
          <ProductsTable title={active} products={visibleProducts} updateProduct={updateProduct} deleteProduct={(id: number) => setProducts((p) => p.filter((x) => x.id !== id))} addProduct={addProduct} uploadProductImage={uploadProductImage} />
        )}

        {active === "Fornitori" && <SuppliersSection suppliers={suppliers} setSuppliers={setSuppliers} />}
        {active === "Ordini Fornitori" && <SupplierOrdersSection supplierOrders={supplierOrders} setSupplierOrders={setSupplierOrders} />}
        {active === "Spese" && <ExpensesSection expenses={expenses} setExpenses={setExpenses} expenseCost={stats.expenseCost} selectedDate={selectedDate} />}
        {active === "Statistiche" && <StatsSection stats={stats} products={products} />}
        {active === "Clienti" && <ClientsSection clients={clients} setClients={setClients} />}
        {active === "Siti Web" && <SitesSection clients={clients} setClients={setClients} setActive={setActive} />}
        {active === "Generatore Descrizioni" && <DescriptionGenerator />}
        {active === "Ricerca Trend" && (
          <TrendSearchSection
            trends={trends}
            setTrends={setTrends}
            trendSearch={trendSearch}
            setTrendSearch={setTrendSearch}
            vintedResults={vintedResults}
            vintedAvgPrice={vintedAvgPrice}
            vintedMinPrice={vintedMinPrice}
            vintedMaxPrice={vintedMaxPrice}
            isSearchingTrend={isSearchingTrend}
            trendError={trendError}
            searchVintedTrend={searchVintedTrend}
            hotTrends={hotTrends}
            isScanningHotTrends={isScanningHotTrends}
            scanHotVintedTrends={scanHotVintedTrends}
            aiSuggestion={generateAiSuggestion()}
            trendHistory={trendHistory}
            setTrendHistory={setTrendHistory}
            addCurrentSearchToTrendManual={addCurrentSearchToTrendManual}
            addVintedItemToInventory={addVintedItemToInventory}
            addHotTrendToManual={addHotTrendToManual}
          />
        )}
        {active === "AI Assistant" && <AI stats={stats} big />}
        {active === "Abbonamenti" && <Empty title="Abbonamenti" text="Qui gestirai canoni mensili, rinnovi, clienti attivi e pagamenti ricorrenti." icon={CreditCard} />}
        {active === "Fatture" && <Empty title="Fatture" text="Qui metteremo pagamenti, rinnovi, canoni e fatture clienti." icon={FileText} />}
        {active === "Suggeritore Prezzi" && <Empty title="Suggeritore Prezzi" text="Qui calcoleremo prezzo consigliato, margine, profitto e prezzo minimo." icon={Sparkles} />}
        {active === "Impostazioni" && <Empty title="Impostazioni" text="Qui metteremo profilo, valuta, tema, notifiche e backup dati." icon={Settings} />}
        {active === "Integrazioni" && <Empty title="Integrazioni" text="Vercel, Supabase, Vinted e Storage immagini sono pronti. Bucket: product-images." icon={Link2} />}

        <div className="fixed bottom-4 left-4 right-4 z-30 grid grid-cols-4 gap-2 rounded-[24px] border border-white/10 bg-[#090b14]/90 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl xl:hidden">
          {[
            ["Dashboard", Home],
            ["Inventario", Package],
            ["Clienti", UserRound],
            ["Ricerca Trend", Search],
          ].map(([name, Icon]: any) => (
            <button
              key={name}
              onClick={() => changeSection(name)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold ${
                active === name
                  ? "bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white"
                  : "text-zinc-400"
              }`}
            >
              <Icon size={17} />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Panel({ children, className = "" }: any) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0e19]/78 p-5 shadow-2xl shadow-black/45 backdrop-blur-2xl transition duration-300 hover:border-purple-500/30 before:pointer-events-none before:absolute before:inset-0 before:rounded-[28px] before:bg-[linear-gradient(135deg,rgba(255,255,255,.09),transparent_34%,rgba(168,85,247,.075))] before:opacity-90 after:pointer-events-none after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent ${className}`}
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl transition group-hover:bg-fuchsia-500/15" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Stat({ title, value, icon: Icon, sub, warn = false }: any) {
  const styles =
    title.includes("Online")
      ? "from-blue-500/30 to-blue-500/5 text-blue-300 shadow-blue-500/25"
      : title.includes("Venduti")
      ? "from-green-500/30 to-green-500/5 text-green-300 shadow-green-500/25"
      : title.includes("Spedire")
      ? "from-orange-500/30 to-orange-500/5 text-orange-300 shadow-orange-500/25"
      : title.includes("Stock")
      ? "from-purple-500/30 to-purple-500/5 text-purple-300 shadow-purple-500/25"
      : "from-fuchsia-500/30 to-fuchsia-500/5 text-fuchsia-300 shadow-fuchsia-500/25";

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0d0f1a]/85 p-5 shadow-2xl shadow-black/35 transition duration-300 hover:-translate-y-1 hover:border-purple-500/45 hover:shadow-purple-950/35">
      <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_72%_16%,rgba(168,85,247,.24),transparent_38%)]" />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="relative mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-zinc-400">{title}</p>
        <div className={`rounded-2xl bg-gradient-to-br ${styles} p-3 shadow-lg transition duration-300 group-hover:scale-110`}>
          <Icon size={24} />
        </div>
      </div>

      <h3 className="relative text-3xl font-black tracking-[-0.035em]">{value}</h3>

      <p className={`relative mt-2 text-xs font-bold ${warn ? "text-yellow-400" : "text-green-400"}`}>
        ↗ {sub}
      </p>
    </div>
  );
}

function Activity({ title, sub, time }: any) {
  return <div className="mb-3 flex items-center justify-between rounded-xl bg-white/[0.04] p-4"><div><p className="text-sm font-bold">{title}</p><p className="text-xs text-zinc-400">{sub}</p></div><p className="text-xs text-zinc-500">{time}</p></div>;
}

function AI({ stats, big = false }: any) {
  return (
    <Panel className={big ? "max-w-3xl" : ""}>
      <h3 className="mb-4 font-bold">AI Assistant ✨</h3>
      <div className="space-y-3 text-sm">
        <div className="rounded-xl bg-white/[0.05] p-4">🔥 Hai {stats.online.length} prodotti online. Controlla prezzi e richieste.</div>
        <div className="rounded-xl bg-white/[0.05] p-4">💰 Profitto reale: €{stats.profit.toFixed(2)}</div>
        <div className="rounded-xl bg-white/[0.05] p-4">📦 Da spedire: {stats.shipping.length}</div>
      </div>
      <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-purple-700 to-fuchsia-600 py-3 text-sm font-bold shadow-lg shadow-purple-700/30">Apri AI Assistant →</button>
    </Panel>
  );
}

function ProductsTable({ title, products, updateProduct, deleteProduct, addProduct, uploadProductImage }: any) {
  return (
    <Panel className="xl:col-span-3">
      <div className="mb-5 flex items-center justify-between"><h3 className="font-bold">{title}</h3><button onClick={addProduct} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40 hover:bg-purple-600"><Plus size={16} /> Aggiungi Prodotto</button></div>
      <div className="overflow-x-auto"><table className="w-full border-separate border-spacing-y-1 text-left text-[13px]"><thead className="text-[11px] uppercase tracking-[0.14em] text-zinc-500"><tr><th className="pb-3">Prodotto</th><th className="pb-3">Immagine URL</th><th className="pb-3">Costo</th><th className="pb-3">Prezzo</th><th className="pb-3">Profitto</th><th className="pb-3">Stato</th><th className="pb-3">Azioni</th></tr></thead><tbody>
        {products.map((product: Product) => (
          <tr key={product.id} className="rounded-xl border-t border-white/5 transition hover:bg-white/[0.025]">
            <td className="py-3"><div className="flex items-center gap-3"><img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" /><div><input value={product.name} onChange={(e) => updateProduct(product.id, "name", e.target.value)} className="w-56 bg-transparent font-bold outline-none" /><input value={product.size} onChange={(e) => updateProduct(product.id, "size", e.target.value)} className="block w-40 bg-transparent text-xs text-zinc-500 outline-none" /></div></div></td>
            <td>
              <div className="flex min-w-[300px] flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-xs font-black shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5">
                  Carica immagine
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && uploadProductImage) {
                        uploadProductImage(product.id, file);
                      }
                    }}
                  />
                </label>

                <input
                  value={product.image}
                  onChange={(e) => updateProduct(product.id, "image", e.target.value)}
                  placeholder="Oppure incolla URL immagine"
                  className="w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[12px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </td>
            <td><input type="number" value={product.cost} onChange={(e) => updateProduct(product.id, "cost", e.target.value)} className="w-24 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td>
            <td><input type="number" value={product.price} onChange={(e) => updateProduct(product.id, "price", e.target.value)} className="w-24 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td>
            <td className="font-bold text-green-400">€{(product.price - product.cost).toFixed(2)}</td>
            <td><select value={product.status} onChange={(e) => updateProduct(product.id, "status", e.target.value)} className="rounded-2xl border border-purple-400/25 bg-gradient-to-r from-purple-700/70 to-fuchsia-700/55 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-purple-900/20 outline-none transition hover:from-purple-600/80 hover:to-fuchsia-600/70 focus:ring-2 focus:ring-purple-500/25"><option>Da Caricare</option><option>Online</option><option>Venduto</option><option>Da Spedire</option></select></td>
            <td><button onClick={() => deleteProduct(product.id)} className="rounded-lg bg-red-500/20 p-2 text-red-300 hover:bg-red-500/30"><Trash2 size={16} /></button></td>
          </tr>
        ))}
      </tbody></table></div>
    </Panel>
  );
}

function SuppliersSection({ suppliers, setSuppliers }: any) {
  return (
    <Panel>
      <div className="mb-5 flex items-center justify-between"><div><h3 className="text-xl font-black">Fornitori</h3><p className="text-sm text-zinc-400">Gestisci seller, agent, contatti e note.</p></div><button onClick={() => setSuppliers((prev: Supplier[]) => [...prev, { id: Date.now(), name: "Nuovo fornitore", type: "Tipo", contact: "link o contatto", rating: 3, notes: "" }])} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40">+ Aggiungi Fornitore</button></div>
      <div className="overflow-x-auto"><table className="w-full border-separate border-spacing-y-1 text-left text-[13px]"><thead className="text-[11px] uppercase tracking-[0.14em] text-zinc-500"><tr><th className="pb-3">Fornitore</th><th className="pb-3">Tipo</th><th className="pb-3">Contatto</th><th className="pb-3">Qualità</th><th className="pb-3">Note</th><th className="pb-3">Azioni</th></tr></thead><tbody>
        {suppliers.map((supplier: Supplier) => (
          <tr key={supplier.id} className="rounded-xl border-t border-white/5 transition hover:bg-white/[0.025]">
            {(["name", "type", "contact", "notes"] as Array<keyof Supplier>).map((field) => field !== "rating" && (
              <td key={field} className={field === "name" ? "py-4" : ""}><input value={String(supplier[field])} onChange={(e) => setSuppliers((prev: Supplier[]) => prev.map((s) => s.id === supplier.id ? { ...s, [field]: e.target.value } : s))} className={`${field === "notes" ? "w-64" : field === "contact" ? "w-56 text-purple-300" : "w-48"} rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20 ${field === "name" ? "font-bold" : ""}`} /></td>
            ))}
            <td><select value={supplier.rating} onChange={(e) => setSuppliers((prev: Supplier[]) => prev.map((s) => s.id === supplier.id ? { ...s, rating: Number(e.target.value) } : s))} className="rounded-lg bg-white/5 px-3 py-2 text-yellow-400 outline-none"><option value={1}>★☆☆☆☆</option><option value={2}>★★☆☆☆</option><option value={3}>★★★☆☆</option><option value={4}>★★★★☆</option><option value={5}>★★★★★</option></select></td>
            <td><button onClick={() => setSuppliers((prev: Supplier[]) => prev.filter((s) => s.id !== supplier.id))} className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-red-300 transition hover:bg-red-500/30">Elimina</button></td>
          </tr>
        ))}
      </tbody></table></div>
    </Panel>
  );
}

function SupplierOrdersSection({ supplierOrders, setSupplierOrders }: any) {
  return (
    <Panel>
      <div className="mb-5 flex items-center justify-between"><div><h3 className="text-xl font-black">Ordini Fornitori</h3><p className="text-sm text-zinc-400">Traccia haul, warehouse, spedizioni e costi.</p></div><button onClick={() => setSupplierOrders((prev: SupplierOrder[]) => [...prev, { id: Date.now(), code: "#HAUL", supplier: "Nuovo fornitore", products: "Prodotti", cost: 0, tracking: "Tracking", status: "Pagato", eta: "Da definire" }])} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40">+ Aggiungi Ordine</button></div>
      <EditableTable items={supplierOrders} setItems={setSupplierOrders} columns={["code", "supplier", "products", "cost", "tracking", "status", "eta"]} statusOptions={["Pagato", "Warehouse", "Spedito", "In transito", "Arrivato", "Problema"]} />
    </Panel>
  );
}

function ExpensesSection({ expenses, setExpenses, expenseCost, selectedDate }: any) {
  return (
    <Panel>
      <div className="mb-5 flex items-center justify-between"><div><h3 className="text-xl font-black">Spese</h3><p className="text-sm text-zinc-400">Registra costi prodotti, spedizioni, domini, ads e strumenti.</p></div><button onClick={() => setExpenses((prev: Expense[]) => [...prev, { id: Date.now(), name: "Nuova spesa", category: "Categoria", amount: 0, date: new Date().toISOString().slice(0,10) }])} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40">+ Aggiungi Spesa</button></div>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric title="Spese Totali" value={`€${expenseCost.toFixed(2)}`} tone="red" />
        <Metric title="Numero Spese" value={expenses.length} tone="purple" />
        <Metric title="Media Spesa" value={`€${expenses.length ? (expenseCost / expenses.length).toFixed(2) : "0.00"}`} tone="yellow" />
        <Metric
          title="Spese del giorno"
          value={`€${expenses
            .filter((expense: Expense) => expense.date === selectedDate)
            .reduce((sum: number, expense: Expense) => sum + expense.amount, 0)
            .toFixed(2)}`}
          tone="blue"
        />
      </div>
      <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-100">
        Calendario attivo: la card “Spese del giorno” usa la data selezionata in alto.
      </div>
      <EditableTable items={expenses} setItems={setExpenses} columns={["name", "category", "amount", "date"]} />
    </Panel>
  );
}

function EditableTable({ items, setItems, columns, statusOptions }: any) {
  return (
    <div className="overflow-x-auto"><table className="w-full border-separate border-spacing-y-1 text-left text-[13px]"><thead className="text-[11px] uppercase tracking-[0.14em] text-zinc-500"><tr>{columns.map((c: string) => <th key={c} className="pb-3">{c}</th>)}<th className="pb-3">Azioni</th></tr></thead><tbody>
      {items.map((row: any) => (
        <tr key={row.id} className="rounded-xl border-t border-white/5 transition hover:bg-white/[0.025]">
          {columns.map((col: string) => (
            <td key={col} className="py-4">
              {col === "status" && statusOptions ? (
                <select value={row[col]} onChange={(e) => setItems((prev: any[]) => prev.map((x) => x.id === row.id ? { ...x, [col]: e.target.value } : x))} className="rounded-2xl border border-purple-400/25 bg-gradient-to-r from-purple-700/70 to-fuchsia-700/55 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-purple-900/20 outline-none transition hover:from-purple-600/80 hover:to-fuchsia-600/70 focus:ring-2 focus:ring-purple-500/25">{statusOptions.map((o: string) => <option key={o}>{o}</option>)}</select>
              ) : (
                <input type={typeof row[col] === "number" ? "number" : col === "date" ? "date" : "text"} value={row[col]} onChange={(e) => setItems((prev: any[]) => prev.map((x) => x.id === row.id ? { ...x, [col]: typeof row[col] === "number" ? Number(e.target.value) : e.target.value } : x))} className="w-44 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" />
              )}
            </td>
          ))}
          <td><button onClick={() => setItems((prev: any[]) => prev.filter((x) => x.id !== row.id))} className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-red-300 transition hover:bg-red-500/30">Elimina</button></td>
        </tr>
      ))}
    </tbody></table></div>
  );
}

function StatsSection({ stats, products }: any) {
  const totalProducts = products.length;
  const totalRevenue = stats.revenue;
  const totalCosts = stats.stock + stats.supplierCost + stats.expenseCost;
  const netResult = stats.profit - stats.supplierCost - stats.expenseCost;
  const avgCost = totalProducts > 0 ? stats.stock / totalProducts : 0;
  const sellRate = totalProducts > 0 ? Math.round((stats.sold.length / totalProducts) * 100) : 0;

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
              ANALYTICS LIVE
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">
              Statistiche Business
            </h3>
            <p className="text-sm text-zinc-400">
              Numeri reali calcolati da inventario, vendite, fornitori e spese.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            Sell rate: <b className="text-green-400">{sellRate}%</b>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <PremiumStatCard
            title="Prodotti Totali"
            value={totalProducts}
            sub={`${stats.online.length} online · ${stats.upload.length} da caricare`}
            icon="📦"
            tone="purple"
            progress={Math.min(100, totalProducts * 8)}
          />

          <PremiumStatCard
            title="Online"
            value={stats.online.length}
            sub="Prodotti attualmente pubblicati"
            icon="🌐"
            tone="blue"
            progress={totalProducts > 0 ? (stats.online.length / totalProducts) * 100 : 0}
          />

          <PremiumStatCard
            title="Venduti"
            value={stats.sold.length}
            sub={`Incasso totale €${totalRevenue.toFixed(2)}`}
            icon="🛒"
            tone="green"
            progress={sellRate}
          />

          <PremiumStatCard
            title="Da Spedire"
            value={stats.shipping.length}
            sub={stats.shipping.length > 0 ? "Richiede attenzione" : "Tutto pulito"}
            icon="🚚"
            tone="orange"
            progress={totalProducts > 0 ? (stats.shipping.length / totalProducts) * 100 : 0}
          />

          <PremiumStatCard
            title="Profitto Reale"
            value={`€${stats.profit.toFixed(2)}`}
            sub="Prezzo vendita - costo prodotto"
            icon="💸"
            tone="green"
            progress={Math.min(100, stats.profit > 0 ? 72 : 0)}
          />

          <PremiumStatCard
            title="Valore Stock"
            value={`€${stats.stock.toFixed(2)}`}
            sub={`Costo medio €${avgCost.toFixed(2)}`}
            icon="🏷️"
            tone="purple"
            progress={Math.min(100, avgCost)}
          />

          <PremiumStatCard
            title="Costi Fornitori"
            value={`€${stats.supplierCost.toFixed(2)}`}
            sub="Somma ordini fornitori"
            icon="🏭"
            tone="yellow"
            progress={Math.min(100, stats.supplierCost / 10)}
          />

          <PremiumStatCard
            title="Spese Extra"
            value={`€${stats.expenseCost.toFixed(2)}`}
            sub="Domini, ads, tool, spedizioni"
            icon="🧾"
            tone="red"
            progress={Math.min(100, stats.expenseCost / 5)}
          />

          <PremiumStatCard
            title="Risultato Netto"
            value={`€${netResult.toFixed(2)}`}
            sub={`Ricavi - costi totali €${totalCosts.toFixed(2)}`}
            icon="⚡"
            tone={netResult >= 0 ? "green" : "red"}
            progress={Math.min(100, Math.abs(netResult))}
          />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black">Distribuzione Inventario</h4>
              <p className="text-sm text-zinc-400">Stato prodotti in tempo reale</p>
            </div>
            <div className="rounded-2xl bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-200">
              {totalProducts} pezzi
            </div>
          </div>

          <div className="space-y-4">
            <ProgressRow label="Online" value={stats.online.length} total={totalProducts} color="from-green-400 to-emerald-500" />
            <ProgressRow label="Da Caricare" value={stats.upload.length} total={totalProducts} color="from-purple-400 to-fuchsia-500" />
            <ProgressRow label="Venduti" value={stats.sold.length} total={totalProducts} color="from-blue-400 to-cyan-500" />
            <ProgressRow label="Da Spedire" value={stats.shipping.length} total={totalProducts} color="from-yellow-400 to-orange-500" />
          </div>
        </Panel>

        <Panel>
          <div className="mb-5">
            <h4 className="text-xl font-black">Performance Economica</h4>
            <p className="text-sm text-zinc-400">Controllo rapido ricavi, costi e margine netto</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FinanceBox label="Incasso totale" value={`€${totalRevenue.toFixed(2)}`} tone="green" />
            <FinanceBox label="Profitto lordo" value={`€${stats.profit.toFixed(2)}`} tone="purple" />
            <FinanceBox label="Costi totali" value={`€${totalCosts.toFixed(2)}`} tone="red" />
            <FinanceBox label="Risultato netto" value={`€${netResult.toFixed(2)}`} tone={netResult >= 0 ? "green" : "red"} />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Salute business</span>
              <b className={netResult >= 0 ? "text-green-400" : "text-red-400"}>
                {netResult >= 0 ? "Positiva" : "Da migliorare"}
              </b>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  netResult >= 0
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-red-400 to-orange-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(8, Math.abs(netResult)))}%` }}
              />
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function PremiumStatCard({ title, value, sub, icon, tone, progress }: any) {
  const tones: Record<string, string> = {
    purple: "from-purple-500/25 to-fuchsia-500/5 text-purple-200 shadow-purple-950/30",
    green: "from-green-500/25 to-emerald-500/5 text-green-200 shadow-green-950/30",
    blue: "from-blue-500/25 to-cyan-500/5 text-blue-200 shadow-blue-950/30",
    orange: "from-orange-500/25 to-yellow-500/5 text-orange-200 shadow-orange-950/30",
    yellow: "from-yellow-500/25 to-orange-500/5 text-yellow-200 shadow-yellow-950/30",
    red: "from-red-500/25 to-orange-500/5 text-red-200 shadow-red-950/30",
  };

  const bar: Record<string, string> = {
    purple: "from-purple-400 to-fuchsia-500",
    green: "from-green-400 to-emerald-500",
    blue: "from-blue-400 to-cyan-500",
    orange: "from-orange-400 to-yellow-500",
    yellow: "from-yellow-400 to-orange-500",
    red: "from-red-400 to-orange-500",
  };

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1020]/90 p-5 shadow-2xl shadow-black/35 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30">
      <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone] || tones.purple} opacity-80`} />
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-current opacity-10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-400">{title}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
            {value}
          </h2>
          <p className="mt-2 text-xs font-medium text-zinc-400">{sub}</p>
        </div>

        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl shadow-lg shadow-black/20 transition group-hover:scale-110">
          {icon}
        </div>
      </div>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar[tone] || bar.purple} shadow-lg`}
          style={{ width: `${Math.min(100, Math.max(4, progress || 0))}%` }}
        />
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total, color }: any) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-zinc-200">{label}</span>
        <span className="text-zinc-400">
          {value} · {percent}%
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg`}
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>
    </div>
  );
}

function FinanceBox({ label, value, tone }: any) {
  const cls =
    tone === "green"
      ? "border-green-500/20 bg-green-500/10 text-green-300"
      : tone === "red"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-purple-500/20 bg-purple-500/10 text-purple-300";

  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">{value}</h3>
    </div>
  );
}

function ClientsSection({ clients, setClients }: any) {
  function addClient() {
    setClients((prev: Client[]) => [
      ...prev,
      {
        id: Date.now(),
        name: "Nuovo Cliente",
        business: "Tipo attività",
        monthly: 0,
        paid: 0,
        site: "sitocliente.it",
        status: "Da contattare",
      },
    ]);
  }

  function deleteClient(id: number) {
    setClients((prev: Client[]) => prev.filter((client) => client.id !== id));
  }

  function updateClient(id: number, field: keyof Client, value: string) {
    setClients((prev: Client[]) =>
      prev.map((client) =>
        client.id === id
          ? {
              ...client,
              [field]:
                field === "monthly" || field === "paid"
                  ? Number(value)
                  : value,
            }
          : client
      )
    );
  }

  return (
    <Panel>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black">Clienti Siti Web</h3>
          <p className="text-sm text-zinc-400">
            Gestisci clienti, canone mensile, sito pagato e stato. Venduto/Attivo entrano nel guadagno.
          </p>
        </div>

        <button
          onClick={addClient}
          className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40 hover:bg-purple-600"
        >
          + Aggiungi Cliente
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {clients.map((client: Client) => (
          <div
            key={client.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
          >
            <Store className="mb-4 text-purple-400" />

            <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Nome cliente</label>
            <input
              value={client.name}
              onChange={(e) => updateClient(client.id, "name", e.target.value)}
              className="mb-3 w-full rounded-lg bg-white/5 px-3 py-2 text-lg font-black outline-none"
            />

            <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Tipo attività</label>
            <input
              value={client.business}
              onChange={(e) =>
                updateClient(client.id, "business", e.target.value)
              }
              className="mb-3 w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                  Canone mensile
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span>€</span>
                  <input
                    type="number"
                    value={client.monthly}
                    onChange={(e) =>
                      updateClient(client.id, "monthly", e.target.value)
                    }
                    className="w-full rounded-lg bg-white/5 px-3 py-2 font-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                  Sito pagato
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span>€</span>
                  <input
                    type="number"
                    value={client.paid}
                    onChange={(e) =>
                      updateClient(client.id, "paid", e.target.value)
                    }
                    className="w-full rounded-lg bg-white/5 px-3 py-2 font-black outline-none"
                  />
                </div>
              </div>
            </div>

            <label className="mt-3 block text-xs uppercase text-zinc-500">
              Sito web
            </label>
            <input
              value={client.site}
              onChange={(e) => updateClient(client.id, "site", e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-purple-200 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20"
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <select
                value={client.status}
                onChange={(e) =>
                  updateClient(client.id, "status", e.target.value)
                }
                className="rounded-lg bg-purple-700/40 px-3 py-2 text-xs outline-none"
              >
                <option>Venduto</option>
                <option>Attivo</option>
                <option>Da contattare</option>
                <option>In sviluppo</option>
              </select>

              <button
                onClick={() => deleteClient(client.id)}
                className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/30"
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SitesSection({ clients, setClients, setActive }: any) {
  return (
    <Panel>
      <h3 className="mb-5 font-bold">Siti Web Gestiti</h3>
      <div className="space-y-3">
        {clients.map((client: Client) => (
          <div key={client.id} className="grid items-center gap-4 rounded-xl bg-white/[0.04] p-4 md:grid-cols-6">
            <input value={client.site} onChange={(e) => setClients((prev: Client[]) => prev.map((c) => c.id === client.id ? { ...c, site: e.target.value } : c))} className="rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-extrabold text-zinc-50 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" />
            <span>{client.name}</span><span>Canone: €{client.monthly}</span><span>Sito pagato: €{client.paid}</span><span className="text-green-400">{client.status}</span><button onClick={() => setActive("Clienti")} className="rounded-lg bg-purple-700 px-3 py-2 text-sm hover:bg-purple-600">Gestisci</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DescriptionGenerator() {
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({ brand: "", item: "", size: "", condition: "" });
  return (
    <Panel>
      <h3 className="mb-5 text-xl font-black">Generatore Descrizioni</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.keys(form).map((key) => <input key={key} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={key} className="rounded-xl bg-white/5 px-4 py-3 outline-none" />)}
      </div>
      <button onClick={() => setDescription(`${form.brand} ${form.item}\n\n📏 Taglia: ${form.size}\n✨ Condizione: ${form.condition}\n🚚 Spedizione veloce\n📦 Contattami per info\n\n#vinted #streetwear #${form.brand.replace(" ", "")}`)} className="mt-5 rounded-xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-6 py-3 font-bold">Genera Descrizione</button>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-5 h-64 w-full rounded-2xl bg-white/5 p-4 outline-none" placeholder="La descrizione generata apparirà qui..." />
    </Panel>
  );
}

function TrendSearchSection({ trends, setTrends, trendSearch, setTrendSearch, vintedResults, vintedAvgPrice, vintedMinPrice, vintedMaxPrice, isSearchingTrend, trendError, searchVintedTrend, hotTrends, isScanningHotTrends, scanHotVintedTrends, aiSuggestion, trendHistory, setTrendHistory, addCurrentSearchToTrendManual, addVintedItemToInventory, addHotTrendToManual }: any) {
  return (
    <Panel>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div><h3 className="text-xl font-black">Ricerca Trend Reale</h3><p className="text-sm text-zinc-400">Cerca prodotti veri su Vinted e analizza prezzo medio, range e margine.</p></div>
        <button onClick={() => setTrends((prev: TrendItem[]) => [...prev, { id: Date.now(), product: "Nuovo prodotto", brand: "Brand", buyPrice: 0, avgSellPrice: 0, demand: 5, notes: "" }])} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40">+ Aggiungi Trend Manuale</button>
      </div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <input value={trendSearch} onChange={(e) => setTrendSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") searchVintedTrend(); }} placeholder="Es. nike tech fleece" className="w-full rounded-xl bg-white/5 px-4 py-3 outline-none" />
        <button onClick={searchVintedTrend} disabled={isSearchingTrend} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 font-bold shadow-lg shadow-purple-700/30 transition hover:-translate-y-0.5 hover:shadow-purple-700/50 disabled:opacity-60">{isSearchingTrend ? "Cerco..." : "Cerca su Vinted"}</button>
        <button
          onClick={addCurrentSearchToTrendManual}
          className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-zinc-100 transition hover:border-fuchsia-500/30 hover:bg-white/[0.09]"
        >
          Salva trend
        </button>
      </div>
      {trendError && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{trendError}</div>}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric title="Risultati Vinted" value={vintedResults.length} tone="purple" />
        <Metric title="Prezzo Medio" value={`€${vintedAvgPrice.toFixed(2)}`} tone="green" />
        <Metric title="Compra Sotto" value={`€${(vintedAvgPrice * 0.55).toFixed(2)}`} tone="yellow" />
        <Metric title="Range Prezzi" value={`€${vintedMinPrice.toFixed(2)} - €${vintedMaxPrice.toFixed(2)}`} tone="blue" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`rounded-[24px] border p-5 ${
          aiSuggestion?.tone === "green"
            ? "border-green-500/20 bg-green-500/10"
            : aiSuggestion?.tone === "yellow"
            ? "border-yellow-500/20 bg-yellow-500/10"
            : aiSuggestion?.tone === "red"
            ? "border-red-500/20 bg-red-500/10"
            : "border-purple-500/20 bg-purple-500/10"
        }`}>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-fuchsia-300" />
            <h4 className="font-black">AI Resell Advisor</h4>
          </div>
          <p className="text-sm font-bold">{aiSuggestion?.title}</p>
          <p className="mt-2 text-sm text-zinc-300">{aiSuggestion?.text}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Prezzo consigliato vendita</p>
          <h3 className="mt-2 text-3xl font-black text-green-300">
            €{vintedAvgPrice > 0 ? (vintedAvgPrice * 0.92).toFixed(2) : "0.00"}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">Basato sulla media Vinted rilevata.</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Margine target</p>
          <h3 className="mt-2 text-3xl font-black text-fuchsia-300">
            €{vintedAvgPrice > 0 ? ((vintedAvgPrice * 0.92) - (vintedAvgPrice * 0.55)).toFixed(2) : "0.00"}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">Se compri sotto il 55% della media.</p>
        </div>
      </div>

      <div className="mb-6 rounded-[28px] border border-purple-500/20 bg-purple-500/10 p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-xl font-black">Scanner prodotti hot Vinted</h4>
            <p className="text-sm text-zinc-400">
              Analizza più ricerche e ordina quelle con score migliore.
            </p>
          </div>

          <button
            onClick={scanHotVintedTrends}
            disabled={isScanningHotTrends}
            className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 text-sm font-black shadow-lg shadow-purple-700/30 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isScanningHotTrends ? "Scannerizzo..." : "Trova trend hot"}
          </button>
        </div>

        {hotTrends?.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {hotTrends.map((item: HotTrend) => (
              <button
                key={item.query}
                onClick={() => setTrendSearch(item.query)}
                className="rounded-2xl border border-white/10 bg-[#0d1020]/80 p-4 text-left transition hover:-translate-y-1 hover:border-fuchsia-500/30"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <b className="truncate text-sm capitalize">{item.query}</b>
                  <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px]">
                    {item.score}
                  </span>
                </div>

                <p className="text-xs text-zinc-400">{item.status}</p>
                <p className="mt-2 text-sm text-green-300">
                  Media €{item.avgPrice.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.count} risultati · range €{item.minPrice.toFixed(0)}-€{item.maxPrice.toFixed(0)}
                </p>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    addHotTrendToManual(item);
                  }}
                  className="mt-3 inline-block rounded-xl bg-purple-700/60 px-3 py-2 text-[11px] font-black text-white"
                >
                  + Trend
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {vintedResults.length > 0 && <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{vintedResults.map((item: VintedResult, index: number) => <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">{item.image && <img src={item.image} alt={item.title} className="mb-4 h-48 w-full rounded-xl object-cover" />}<h4 className="min-h-[40px] font-black">{item.title}</h4><p className="mt-2 text-2xl font-black text-green-400">€{Number(item.price).toFixed(2)}</p><p className="mt-2 text-sm text-zinc-400">Margine stimato comprando a metà prezzo: €{(Number(item.price) * 0.45).toFixed(2)}</p><div className="mt-4 flex flex-wrap gap-2">
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="inline-block rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-2 text-sm font-bold shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40 hover:bg-purple-600">Apri su Vinted</a>}
                <button
                  onClick={() => addVintedItemToInventory(item)}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-zinc-100 transition hover:bg-white/[0.09]"
                >
                  + Inventario
                </button>
              </div></div>)}</div>}
      {trendHistory?.length > 0 && (
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black">Storico ricerche</h4>
              <p className="text-sm text-zinc-400">Ultime ricerche salvate automaticamente.</p>
            </div>
            <button
              onClick={() => setTrendHistory([])}
              className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/25"
            >
              Pulisci
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {trendHistory.map((item: TrendHistoryItem) => (
              <button
                key={item.id}
                onClick={() => setTrendSearch(item.query)}
                className="rounded-2xl border border-white/10 bg-[#0d1020]/80 p-4 text-left transition hover:-translate-y-1 hover:border-fuchsia-500/30"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <b className="truncate capitalize">{item.query}</b>
                  <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px]">{item.score}</span>
                </div>
                <p className="text-xs text-zinc-400">{item.status}</p>
                <p className="mt-2 text-sm text-green-300">Media €{item.avgPrice.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">{item.date}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <h4 className="mb-3 text-lg font-black">Trend Manuali</h4>
      <EditableTrendTable trends={trends} setTrends={setTrends} />
    </Panel>
  );
}

function EditableTrendTable({ trends, setTrends }: any) {
  return <div className="overflow-x-auto"><table className="w-full border-separate border-spacing-y-1 text-left text-[13px]"><thead className="text-[11px] uppercase tracking-[0.14em] text-zinc-500"><tr><th className="pb-3">Prodotto</th><th>Brand</th><th>Costo</th><th>Vendita media</th><th>Margine</th><th>Richiesta</th><th>Trend</th><th>Note</th><th>Azioni</th></tr></thead><tbody>{trends.map((trend: TrendItem) => { const margin = trend.avgSellPrice - trend.buyPrice; const trendStatus = trend.demand >= 8 && margin >= 30 ? "Sta salendo" : trend.demand >= 5 && margin > 10 ? "Stabile" : "Debole"; return <tr key={trend.id} className="rounded-xl border-t border-white/5 transition hover:bg-white/[0.025]"><td className="py-4"><input value={trend.product} onChange={(e) => setTrends((prev: TrendItem[]) => prev.map((t) => t.id === trend.id ? { ...t, product: e.target.value } : t))} className="w-44 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-extrabold text-zinc-50 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td><td><input value={trend.brand} onChange={(e) => setTrends((prev: TrendItem[]) => prev.map((t) => t.id === trend.id ? { ...t, brand: e.target.value } : t))} className="w-28 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td><td><input type="number" value={trend.buyPrice} onChange={(e) => setTrends((prev: TrendItem[]) => prev.map((t) => t.id === trend.id ? { ...t, buyPrice: Number(e.target.value) } : t))} className="w-24 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td><td><input type="number" value={trend.avgSellPrice} onChange={(e) => setTrends((prev: TrendItem[]) => prev.map((t) => t.id === trend.id ? { ...t, avgSellPrice: Number(e.target.value) } : t))} className="w-24 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td><td className={margin > 20 ? "font-bold text-green-400" : "font-bold text-yellow-400"}>€{margin.toFixed(2)}</td><td><select value={trend.demand} onChange={(e) => setTrends((prev: TrendItem[]) => prev.map((t) => t.id === trend.id ? { ...t, demand: Number(e.target.value) } : t))} className="rounded-2xl border border-purple-400/25 bg-gradient-to-r from-purple-700/70 to-fuchsia-700/55 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-purple-900/20 outline-none transition hover:from-purple-600/80 hover:to-fuchsia-600/70 focus:ring-2 focus:ring-purple-500/25">{[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n}/10</option>)}</select></td><td><span className={`rounded-lg px-3 py-1 text-xs ${trendStatus === "Sta salendo" ? "bg-green-500/20 text-green-300" : trendStatus === "Stabile" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>{trendStatus}</span></td><td><input value={trend.notes} onChange={(e) => setTrends((prev: TrendItem[]) => prev.map((t) => t.id === trend.id ? { ...t, notes: e.target.value } : t))} className="w-56 rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-2.5 text-[13px] font-semibold text-zinc-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-purple-500/60 focus:bg-[#1b1d2b] focus:ring-2 focus:ring-purple-500/20" /></td><td><button onClick={() => setTrends((prev: TrendItem[]) => prev.filter((t) => t.id !== trend.id))} className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-red-300 transition hover:bg-red-500/30">Elimina</button></td></tr> })}</tbody></table></div>;
}

function Metric({ title, value, tone }: any) {
  const tones: any = {
    red: "border-red-500/20 bg-red-500/10 text-red-300 shadow-red-950/20",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-300 shadow-purple-950/20",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300 shadow-yellow-950/20",
    green: "border-green-500/20 bg-green-500/10 text-green-300 shadow-green-950/20",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-300 shadow-blue-950/20",
  };

  return (
    <div className={`relative overflow-hidden rounded-[24px] border p-5 shadow-xl ${tones[tone] || tones.purple}`}>
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-current opacity-10 blur-2xl" />
      <p className="relative text-xs uppercase tracking-wide text-zinc-400">{title}</p>
      <h3 className="relative mt-2 text-3xl font-black tracking-[-0.035em]">{value}</h3>
    </div>
  );
}


function PremiumActivity({ icon, title, sub, time, color }: any) {
  const colorClass =
    color === "green"
      ? "from-green-500/30 to-green-500/5 shadow-green-500/20"
      : color === "blue"
      ? "from-blue-500/30 to-blue-500/5 shadow-blue-500/20"
      : color === "fuchsia"
      ? "from-fuchsia-500/30 to-fuchsia-500/5 shadow-fuchsia-500/20"
      : color === "emerald"
      ? "from-emerald-500/30 to-emerald-500/5 shadow-emerald-500/20"
      : color === "orange"
      ? "from-orange-500/30 to-orange-500/5 shadow-orange-500/20"
      : "from-purple-500/30 to-purple-500/5 shadow-purple-500/20";

  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] p-3 transition duration-300 hover:translate-x-1 hover:border-purple-500/25 hover:bg-white/[0.07]">
      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${colorClass} shadow-lg`}>
        <span>{icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="truncate text-xs text-zinc-400">{sub}</p>
      </div>

      <p className="text-xs text-zinc-500">{time}</p>
    </div>
  );
}


function MiniDashboardCard({ title, value, sub, icon }: any) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0d0f1a]/85 p-5 shadow-2xl shadow-black/35 transition hover:-translate-y-1 hover:border-purple-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,.20),transparent_34%)] opacity-80" />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-300">{title}</p>
          <h3 className="mt-2 truncate text-2xl font-black tracking-[-0.03em]">{value}</h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{sub}</p>
        </div>

        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-purple-500/15 text-3xl shadow-lg shadow-purple-700/20 transition group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
}



function AnalyticsPremium({ analyticsData }: any) {
  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <Panel className="xl:col-span-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">
              Profitto Netto
            </p>
            <h2 className={`mt-3 text-5xl font-black tracking-[-0.06em] ${analyticsData.net >= 0 ? "text-green-400" : "text-red-400"}`}>
              €{analyticsData.net.toFixed(2)}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Entrate - uscite totali
            </p>
          </div>

          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-green-500/15 text-3xl shadow-lg shadow-green-500/20">
            💸
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-400">Obiettivo mensile</span>
            <b>{analyticsData.targetProgress.toFixed(0)}%</b>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-lime-400 shadow-lg shadow-green-500/30"
              style={{ width: `${analyticsData.targetProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Target: €{analyticsData.monthlyTarget.toFixed(0)}
          </p>
        </div>
      </Panel>

      <Panel className="xl:col-span-8">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-[-0.04em]">
              Entrate vs Uscite
            </h3>
            <p className="text-sm text-zinc-400">
              Andamento business generato dai dati reali
            </p>
          </div>

          <div className="flex gap-2 text-xs font-bold">
            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-purple-200">Entrate</span>
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-200">Uscite</span>
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.chart}>
              <defs>
                <linearGradient id="revPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  background: "#090b14",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "16px",
                  color: "white",
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#revPremium)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#expPremium)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="xl:col-span-4">
        <h3 className="mb-5 text-xl font-black">Revenue Mix</h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: "Prodotti", value: analyticsData.productSales },
              { name: "Clienti", value: analyticsData.clientSales },
              { name: "Spese", value: analyticsData.expensesTotal },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  background: "#090b14",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "16px",
                  color: "white",
                }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="xl:col-span-4">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-black">Top Prodotti</h3>
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300">
            High Profit
          </span>
        </div>

        <div className="space-y-3">
          {analyticsData.topProducts.map((product: Product, index: number) => (
            <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.035] p-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/15 text-sm font-black">
                #{index + 1}
              </div>
              <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{product.name}</p>
                <p className="text-xs text-zinc-500">{product.brand}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-green-400">€{(product.price - product.cost).toFixed(2)}</p>
                <p className="text-xs text-zinc-500">margine</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="xl:col-span-4">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-black">Top Clienti</h3>
          <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-300">
            Recurring
          </span>
        </div>

        <div className="space-y-3">
          {analyticsData.topClients.map((client: Client, index: number) => (
            <div key={client.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.035] p-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-sm font-black">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{client.name}</p>
                <p className="text-xs text-zinc-500">{client.business}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-fuchsia-300">€{(client.monthly + client.paid).toFixed(2)}</p>
                <p className="text-xs text-zinc-500">{client.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="xl:col-span-12">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-[-0.04em]">Heatmap Business</h3>
            <p className="text-sm text-zinc-400">Intensità attività business degli ultimi 28 giorni</p>
          </div>
          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-zinc-400">
            Live intensity
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 md:grid-cols-14">
          {analyticsData.heatmap.map((day: any) => (
            <div
              key={day.id}
              className="h-10 rounded-xl border border-white/5 transition hover:scale-105"
              style={{
                background:
                  day.intensity > 78
                    ? "linear-gradient(135deg,#22c55e,#a3e635)"
                    : day.intensity > 55
                    ? "linear-gradient(135deg,#a855f7,#d946ef)"
                    : day.intensity > 32
                    ? "linear-gradient(135deg,#3b82f6,#06b6d4)"
                    : "rgba(255,255,255,.05)",
                opacity: Math.min(1, Math.max(0.35, day.intensity / 100)),
              }}
            />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CalendarPicker({ selectedDate, setSelectedDate, calendarOpen, setCalendarOpen }: any) {
  const current = new Date(selectedDate);
  const year = current.getFullYear();
  const month = current.getMonth();

  const monthName = current.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function toIso(day: number) {
    const date = new Date(year, month, day);
    return date.toISOString().slice(0, 10);
  }

  function changeMonth(offset: number) {
    const date = new Date(year, month + offset, 1);
    setSelectedDate(date.toISOString().slice(0, 10));
  }

  function goToday() {
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setCalendarOpen(false);
  }

  return (
    <div className="relative hidden xl:block">
      <button
        onClick={() => setCalendarOpen((value: boolean) => !value)}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm shadow-xl shadow-black/20 transition hover:border-purple-500/40 hover:bg-white/[0.08]"
      >
        <Calendar size={16} />
        <span>
          {new Date(selectedDate).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </button>

      {calendarOpen && (
        <div className="absolute right-0 top-14 z-50 w-[330px] overflow-hidden rounded-[26px] border border-purple-500/25 bg-[#0b0d18]/95 p-4 shadow-2xl shadow-purple-950/60 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(168,85,247,.22),transparent_38%)]" />

          <div className="relative mb-4 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05] transition hover:bg-purple-600/30"
            >
              ‹
            </button>

            <div className="text-center">
              <p className="text-sm font-black capitalize">{monthName}</p>
              <p className="text-xs text-zinc-500">Seleziona una data</p>
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05] transition hover:bg-purple-600/30"
            >
              ›
            </button>
          </div>

          <div className="relative grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-zinc-500">
            {["lu", "ma", "me", "gi", "ve", "sa", "do"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) return <div key={index} />;

              const iso = toIso(day);
              const selected = iso === selectedDate;
              const today = iso === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={iso}
                  onClick={() => {
                    setSelectedDate(iso);
                    setCalendarOpen(false);
                  }}
                  className={`h-10 rounded-xl text-sm font-bold transition ${
                    selected
                      ? "bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-lg shadow-purple-700/40"
                      : today
                      ? "border border-purple-500/40 bg-purple-500/10 text-purple-200"
                      : "bg-white/[0.035] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <button
              onClick={goToday}
              className="rounded-xl bg-white/[0.06] px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/[0.1]"
            >
              Oggi
            </button>

            <button
              onClick={() => setCalendarOpen(false)}
              className="rounded-xl bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/25"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ title, text, icon: Icon }: any) {
  return <Panel><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-300"><Icon size={24} /></div><h3 className="mb-2 text-xl font-black">{title}</h3><p className="max-w-2xl text-zinc-400">{text}</p></Panel>;
}

function InfoRow({ label, value }: any) {
  return <div className="mb-3 flex items-center justify-between rounded-xl bg-white/[0.04] p-4"><span className="text-zinc-400">{label}</span><b>{value}</b></div>;
}
