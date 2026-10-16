export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface Asset {
  symbol: string;
  name: string;
  color: string;
  price: number;
  change24h: number;
  history: number[];
}

export interface Holding {
  symbol: string;
  name: string;
  color: string;
  qty: number;
  price: number;
  value: number;
  change24h: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  usd: number;
  createdAt: number;
}

export interface Portfolio {
  cash: number;
  invested: number;
  total: number;
  pnl: number;
  pnlPct: number;
  holdings: Holding[];
  transactions: Transaction[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  createdAt: number;
}

export interface Stats {
  users: number;
  trades: number;
  subscribers: number;
  reviews: number;
}

export function sparkPoints(data: number[], w = 100, h = 30, pad = 2): string {
  if (!data.length) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(2)},${(h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2)).toFixed(2)}`).join(" ");
}

export function formatUsd(v: number): string {
  const abs = Math.abs(v);
  const digits = abs !== 0 && abs < 1 ? 4 : 2;
  return (v < 0 ? "-$" : "$") + abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
