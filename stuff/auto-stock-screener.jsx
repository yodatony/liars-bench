import { useState, useEffect, useCallback } from "react";

// ── Universes ─────────────────────────────────────────────────────────────────
const OMXS30_BASE = [
  { symbol: "ALFA.ST",     name: "Alfa Laval",     market: "OMXS30" },
  { symbol: "ASSA-B.ST",   name: "Assa Abloy B",   market: "OMXS30" },
  { symbol: "ATCO-A.ST",   name: "Atlas Copco A",  market: "OMXS30" },
  { symbol: "BOL.ST",      name: "Boliden",        market: "OMXS30" },
  { symbol: "ELUX-B.ST",   name: "Electrolux B",   market: "OMXS30" },
  { symbol: "ERIC-B.ST",   name: "Ericsson B",     market: "OMXS30" },
  { symbol: "ESSITY-B.ST", name: "Essity B",       market: "OMXS30" },
  { symbol: "EVO.ST",      name: "Evolution",      market: "OMXS30" },
  { symbol: "GETI-B.ST",   name: "Getinge B",      market: "OMXS30" },
  { symbol: "HM-B.ST",     name: "H&M B",          market: "OMXS30" },
  { symbol: "HEXA-B.ST",   name: "Hexagon B",      market: "OMXS30" },
  { symbol: "INVE-B.ST",   name: "Investor B",     market: "OMXS30" },
  { symbol: "KINV-B.ST",   name: "Kinnevik B",     market: "OMXS30" },
  { symbol: "LATO-B.ST",   name: "Latour B",       market: "OMXS30" },
  { symbol: "LIFCO-B.ST",  name: "Lifco B",        market: "OMXS30" },
  { symbol: "NIBE-B.ST",   name: "NIBE B",         market: "OMXS30" },
  { symbol: "SAND.ST",     name: "Sandvik",        market: "OMXS30" },
  { symbol: "SCA-B.ST",    name: "SCA B",          market: "OMXS30" },
  { symbol: "SEB-A.ST",    name: "SEB A",          market: "OMXS30" },
  { symbol: "SKF-B.ST",    name: "SKF B",          market: "OMXS30" },
  { symbol: "SWED-A.ST",   name: "Swedbank A",     market: "OMXS30" },
  { symbol: "TELIA.ST",    name: "Telia",          market: "OMXS30" },
  { symbol: "VOLV-B.ST",   name: "Volvo B",        market: "OMXS30" },
  { symbol: "ABB.ST",      name: "ABB",            market: "OMXS30" },
  { symbol: "SINCH.ST",    name: "Sinch",          market: "OMXS30" },
  { symbol: "SOBI.ST",     name: "Sobi",           market: "OMXS30" },
  { symbol: "SAGA-B.ST",   name: "Sagax B",        market: "OMXS30" },
  { symbol: "BALD-B.ST",   name: "Balder B",       market: "OMXS30" },
  { symbol: "FABG.ST",     name: "Fabege",         market: "OMXS30" },
  { symbol: "SHB-A.ST",    name: "Handelsbanken A",market: "OMXS30" },
];
const DJIA_BASE = [
  { symbol: "AAPL", name: "Apple",             market: "DJIA" },
  { symbol: "AMGN", name: "Amgen",             market: "DJIA" },
  { symbol: "AXP",  name: "American Express",  market: "DJIA" },
  { symbol: "BA",   name: "Boeing",            market: "DJIA" },
  { symbol: "CAT",  name: "Caterpillar",       market: "DJIA" },
  { symbol: "CRM",  name: "Salesforce",        market: "DJIA" },
  { symbol: "CSCO", name: "Cisco",             market: "DJIA" },
  { symbol: "CVX",  name: "Chevron",           market: "DJIA" },
  { symbol: "DIS",  name: "Disney",            market: "DJIA" },
  { symbol: "DOW",  name: "Dow Inc.",          market: "DJIA" },
  { symbol: "GS",   name: "Goldman Sachs",     market: "DJIA" },
  { symbol: "HD",   name: "Home Depot",        market: "DJIA" },
  { symbol: "HON",  name: "Honeywell",         market: "DJIA" },
  { symbol: "IBM",  name: "IBM",               market: "DJIA" },
  { symbol: "INTC", name: "Intel",             market: "DJIA" },
  { symbol: "JNJ",  name: "Johnson & Johnson", market: "DJIA" },
  { symbol: "JPM",  name: "JPMorgan Chase",    market: "DJIA" },
  { symbol: "KO",   name: "Coca-Cola",         market: "DJIA" },
  { symbol: "MCD",  name: "McDonald's",        market: "DJIA" },
  { symbol: "MMM",  name: "3M",                market: "DJIA" },
  { symbol: "MRK",  name: "Merck",             market: "DJIA" },
  { symbol: "MSFT", name: "Microsoft",         market: "DJIA" },
  { symbol: "NKE",  name: "Nike",              market: "DJIA" },
  { symbol: "PG",   name: "Procter & Gamble",  market: "DJIA" },
  { symbol: "TRV",  name: "Travelers",         market: "DJIA" },
  { symbol: "UNH",  name: "UnitedHealth",      market: "DJIA" },
  { symbol: "V",    name: "Visa",              market: "DJIA" },
  { symbol: "VZ",   name: "Verizon",           market: "DJIA" },
  { symbol: "WBA",  name: "Walgreens Boots",   market: "DJIA" },
  { symbol: "WMT",  name: "Walmart",           market: "DJIA" },
];

// ── Storage ───────────────────────────────────────────────────────────────────
const SK = {
  holdings: "pf-v3-holdings",
  history:  "pf-v3-history",
  capital:  "pf-v3-capital",
};
const INITIAL_CAPITAL = 10000;

async function storageGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildStockList(holdings) {
  const base = [...OMXS30_BASE, ...DJIA_BASE];
  const known = new Set(base.map(s => s.symbol));
  const extras = Object.entries(holdings)
    .filter(([s]) => !known.has(s))
    .map(([sym, h]) => ({ symbol: sym, name: h.name, market: h.market, delisted: true }));
  return [...base, ...extras];
}

function fmtSEK(n) {
  return Number(n).toLocaleString("sv-SE", { maximumFractionDigits: 0 }) + " SEK";
}

// ── AI ────────────────────────────────────────────────────────────────────────
const SYSTEM = `You are a professional stock analyst focused on medium-term trading (1 month–1 year).
You analyze OMXS30 and DJIA stocks with consideration for the user's portfolio and available capital.

Use web_search to find the current price, news, and sentiment for each stock.

DECISION:
- Not owned: "BUY" or "NO BUY"
- Owned: "BUY MORE", "HOLD" or "SELL"

POSITION SIZE:
- Max 25% of available capital per new position
- DJIA: convert USD→SEK (use current rate, approx 10.5)
- Round down to whole shares
- suggestedShares: 0 if no recommendation given

Return ONLY JSON without backticks:
{
  "usdSekRate": 10.5,
  "results": [{
    "symbol": "ERIC-B.ST",
    "name": "Ericsson B",
    "market": "OMXS30",
    "decision": "BUY",
    "currentPrice": 82.5,
    "currency": "SEK",
    "stopLoss": 72.0,
    "sellTarget": 98.0,
    "horizon": "3–6 months",
    "suggestedShares": 12,
    "estimatedCostSEK": 990,
    "reason": "Max 2 sentences in English."
  }]
}
All stocks in the list must be included. stopLoss/sellTarget in the stock's currency.`;

async function runScreener(stocks, holdings, availableSEK) {
  const holdLines = Object.entries(holdings)
    .map(([s, h]) => `${s} (${h.name}): ${h.shares} shares @ ${h.buyPrice} ${h.currency}, bought ${h.date}`)
    .join("\n") || "No holdings.";
  const list = stocks.map(s => `${s.symbol} (${s.name}, ${s.market}${s.delisted ? ", OFF INDEX" : ""})`).join("\n");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `Available capital: ${availableSEK.toFixed(0)} SEK\n\nHoldings:\n${holdLines}\n\nStocks:\n${list}` }],
    }),
  });
  const data = await resp.json();
  const text = (data.content || []).map(b => b.type === "text" ? b.text : "").join("\n");
  const m = text.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Could not parse AI response");
  return JSON.parse(m[0]);
}

// ── UI ────────────────────────────────────────────────────────────────────────
const DM = {
  "BUY":      { color: "#4fffb0", border: "rgba(79,255,176,0.28)",  bg: "rgba(79,255,176,0.07)"  },
  "BUY MORE": { color: "#4fffb0", border: "rgba(79,255,176,0.28)",  bg: "rgba(79,255,176,0.07)"  },
  "HOLD":     { color: "#ffd166", border: "rgba(255,209,102,0.25)", bg: "rgba(255,209,102,0.06)" },
  "SELL":     { color: "#ff4d6d", border: "rgba(255,77,109,0.28)",  bg: "rgba(255,77,109,0.07)"  },
  "NO BUY":   { color: "#ffffff22", border: "rgba(255,255,255,0.05)", bg: "transparent"           },
};
const SORT_ORDER = { "BUY": 0, "BUY MORE": 1, "HOLD": 2, "SELL": 3, "NO BUY": 4 };
const LOAD_STEPS = ["Checking portfolio…", "Fetching prices & news…", "Analyzing risk/reward…", "Calculating position sizes…", "Sorting results…"];

function Input({ label, value, onChange, step = "any", hint }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff38", letterSpacing: 1 }}>{label}</span>
      <input
        type="number" step={step} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: 14, outline: "none", width: "100%" }}
      />
      {hint && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff28" }}>{hint}</span>}
    </label>
  );
}

// ── BUY MODAL ─────────────────────────────────────────────────────────────────
function BuyModal({ stock, availableSEK, usdSekRate, onConfirm, onClose }) {
  const cur = stock.currency || (stock.market === "DJIA" ? "USD" : "SEK");
  const [shares, setShares] = useState(String(stock.suggestedShares || 1));
  const [price,  setPrice]  = useState(String(stock.currentPrice || ""));

  const sharesN = Math.max(0, parseInt(shares) || 0);
  const priceN  = parseFloat(price) || 0;
  const costSEK = cur === "USD" ? priceN * sharesN * usdSekRate : priceN * sharesN;
  const ok = sharesN >= 1 && priceN > 0 && costSEK <= availableSEK;

  return (
    <Modal title="REGISTER BUY" name={stock.name} onClose={onClose}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#4fffb050", marginBottom: 16 }}>
        Available: {fmtSEK(availableSEK)}
      </div>
      {stock.suggestedShares > 0 && (
        <div style={{ background: "rgba(79,255,176,0.07)", border: "1px solid rgba(79,255,176,0.2)", borderRadius: 9, padding: "10px 13px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#4fffb060", marginBottom: 3 }}>AI RECOMMENDS</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#4fffb0" }}>
            {stock.suggestedShares} shares ≈ {fmtSEK(stock.estimatedCostSEK)}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <Input label={`SHARES (AI: ${stock.suggestedShares || "—"})`} value={shares} onChange={setShares} step="1" />
        <Input label={`BUY PRICE (${cur})`} value={price} onChange={setPrice} step="0.01" hint={cur === "USD" ? `≈ ${(priceN * usdSekRate).toFixed(2)} SEK/share` : ""} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: ok ? "#4fffb0" : "#ff4d6d" }}>
          Total: ~{fmtSEK(costSEK)}{!ok && costSEK > availableSEK ? " ⚠ exceeds budget" : ""}
        </span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn ghost onClick={onClose}>Cancel</Btn>
        <Btn disabled={!ok} onClick={() => onConfirm({ shares: sharesN, buyPrice: priceN, currency: cur, costSEK })}>
          ✓ Confirm buy
        </Btn>
      </div>
    </Modal>
  );
}

// ── SELL MODAL ────────────────────────────────────────────────────────────────
function SellModal({ stock, holding, usdSekRate, onConfirm, onClose }) {
  const [shares, setShares] = useState(String(holding.shares));
  const [price,  setPrice]  = useState(String(holding.buyPrice));

  const sharesN   = Math.min(Math.max(0, parseInt(shares) || 0), holding.shares);
  const priceN    = parseFloat(price) || 0;
  const cur       = holding.currency;
  const revSEK    = cur === "USD" ? priceN * sharesN * usdSekRate : priceN * sharesN;
  const costSEK   = (holding.costSEK || 0) * (sharesN / holding.shares);
  const pnlSEK    = revSEK - costSEK;
  const pnlPct    = costSEK > 0 ? (pnlSEK / costSEK * 100).toFixed(1) : "0.0";
  const partial   = sharesN < holding.shares;
  const ok = sharesN >= 1 && priceN > 0;

  return (
    <Modal title="REGISTER SALE" name={stock?.name || holding.name} onClose={onClose}>
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: "10px 13px", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff30", marginBottom: 3 }}>YOUR HOLDING</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>
          {holding.shares} shares @ {holding.buyPrice} {cur} ({holding.date})
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <Input label={`SHARES TO SELL (max ${holding.shares})`} value={shares} onChange={setShares} step="1" hint={partial ? `${holding.shares - sharesN} shares kept` : "Full position sold"} />
        <Input label={`SELL PRICE (${cur})`} value={price} onChange={setPrice} step="0.01" hint={cur === "USD" ? `≈ ${(priceN * usdSekRate).toFixed(2)} SEK/share` : ""} />
      </div>
      {ok && (
        <div style={{ background: pnlSEK >= 0 ? "rgba(79,255,176,0.07)" : "rgba(255,77,109,0.07)", border: `1px solid ${pnlSEK >= 0 ? "rgba(79,255,176,0.2)" : "rgba(255,77,109,0.2)"}`, borderRadius: 9, padding: "10px 13px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff40", marginBottom: 4 }}>RESULT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { l: "REVENUE", v: fmtSEK(revSEK), c: "#fff" },
              { l: "P/L SEK", v: `${pnlSEK >= 0 ? "+" : ""}${fmtSEK(pnlSEK)}`, c: pnlSEK >= 0 ? "#4fffb0" : "#ff4d6d" },
              { l: "P/L %", v: `${pnlPct >= 0 ? "+" : ""}${pnlPct}%`, c: pnlSEK >= 0 ? "#4fffb0" : "#ff4d6d" },
            ].map(({ l, v, c }) => (
              <div key={l}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "#ffffff30", marginBottom: 2 }}>{l}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn ghost onClick={onClose}>Cancel</Btn>
        <Btn red disabled={!ok} onClick={() => onConfirm({ sharesN, priceN, revSEK, pnlSEK: +pnlSEK, pnlPct: +pnlPct, partial, costSEK })}>
          Confirm sale
        </Btn>
      </div>
    </Modal>
  );
}

// ── Shared modal shell ────────────────────────────────────────────────────────
function Modal({ title, name, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "26px 24px", width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#ffffff35", letterSpacing: 2, marginBottom: 5 }}>{title}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: "#fff", marginBottom: 18 }}>{name}</div>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, ghost, red }) {
  const bg = ghost ? "transparent" : red ? (disabled ? "rgba(255,77,109,0.15)" : "#ff4d6d") : (disabled ? "rgba(79,255,176,0.15)" : "#4fffb0");
  const color = ghost ? "#ffffff45" : red ? (disabled ? "#ff4d6d60" : "#07090e") : (disabled ? "#4fffb060" : "#07090e");
  const border = ghost ? "1px solid rgba(255,255,255,0.1)" : "none";
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ flex: ghost ? 1 : 2, background: bg, color, border, borderRadius: 9, padding: "11px", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function PriceBar({ current, stop, target }) {
  if (!current || !stop || !target) return null;
  const mn = stop * 0.95, mx = target * 1.05, rng = mx - mn;
  const p = v => Math.max(0, Math.min(100, (v - mn) / rng * 100)).toFixed(1);
  return (
    <div style={{ position: "relative", height: 32 }}>
      <div style={{ position: "absolute", top: 15, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 2 }} />
      <div style={{ position: "absolute", top: 15, height: 2, left: `${p(stop)}%`, width: `${p(target) - p(stop)}%`, background: "linear-gradient(90deg,#ff4d6d55,#4fffb055)", borderRadius: 2 }} />
      {[{ v: stop, c: "#ff4d6d", sz: 6 }, { v: current, c: "#fff", sz: 10, glow: true }, { v: target, c: "#4fffb0", sz: 6 }].map(({ v, c, sz, glow }) => (
        <div key={v} style={{ position: "absolute", left: `${p(v)}%`, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ width: sz, height: sz, borderRadius: "50%", background: c, margin: "0 auto", marginTop: glow ? 10 : 12, boxShadow: glow ? `0 0 8px ${c}88` : "none", border: glow ? "2px solid #07090e" : "none" }} />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: c, marginTop: 2, whiteSpace: "nowrap" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function MiniCell({ label, value, sub, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: color ? color + "65" : "#ffffff28", letterSpacing: 1, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: color || "#fff" }}>{value}</div>
      {sub && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: color ? color + "55" : "#ffffff22", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StockCard({ s, holding, availableSEK, usdSekRate, onBuy, onSell }) {
  const meta  = DM[s.decision] || DM["NO BUY"];
  const owned = !!holding;
  const active = s.decision !== "NO BUY";
  const isBuy  = s.decision === "BUY" || s.decision === "BUY MORE";
  const isSell = s.decision === "SELL";
  const upside  = s.currentPrice && s.sellTarget ? Math.round((s.sellTarget  - s.currentPrice) / s.currentPrice * 100) : null;
  const downside = s.currentPrice && s.stopLoss  ? Math.round((s.stopLoss   - s.currentPrice) / s.currentPrice * 100) : null;
  const pnlPct  = owned && s.currentPrice ? ((s.currentPrice - holding.buyPrice) / holding.buyPrice * 100).toFixed(1) : null;
  const pnlSEK  = owned && s.currentPrice ? ((s.currentPrice - holding.buyPrice) * holding.shares * (holding.currency === "USD" ? usdSekRate : 1)).toFixed(0) : null;

  return (
    <div style={{ background: active ? meta.bg : "rgba(255,255,255,0.015)", border: `1px solid ${meta.border}`, borderRadius: 14, padding: "17px 19px", display: "flex", flexDirection: "column", gap: active ? 11 : 0 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: active ? "#fff" : "#ffffff35", letterSpacing: "-0.3px" }}>{s.name}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "#ffffff1a", background: "rgba(255,255,255,0.04)", padding: "2px 5px", borderRadius: 3 }}>{s.market}</span>
            {s.delisted && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "#ffd16670", background: "rgba(255,209,102,0.07)", padding: "2px 5px", borderRadius: 3 }}>OFF INDEX</span>}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff1a", marginTop: 1 }}>{s.symbol}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <div style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${meta.color}`, background: meta.bg, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: meta.color, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
            {s.decision}
          </div>
          {owned && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "#ffd16675", background: "rgba(255,209,102,0.06)", border: "1px solid rgba(255,209,102,0.15)", borderRadius: 4, padding: "2px 7px" }}>IN PORTFOLIO</div>}
        </div>
      </div>

      {/* Owned P/L */}
      {owned && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, padding: "9px", background: "rgba(255,209,102,0.04)", borderRadius: 9, border: "1px solid rgba(255,209,102,0.1)" }}>
          <MiniCell label="BUY PRICE" value={`${holding.buyPrice} ${holding.currency}`} />
          <MiniCell label="SHARES" value={holding.shares} />
          <MiniCell label="P/L %" value={pnlPct !== null ? `${pnlPct > 0 ? "+" : ""}${pnlPct}%` : "—"} color={pnlPct > 0 ? "#4fffb0" : pnlPct < 0 ? "#ff4d6d" : "#fff"} />
          <MiniCell label="P/L SEK" value={pnlSEK !== null ? `${pnlSEK > 0 ? "+" : ""}${pnlSEK}` : "—"} color={pnlSEK > 0 ? "#4fffb0" : pnlSEK < 0 ? "#ff4d6d" : "#fff"} />
        </div>
      )}

      {/* Position sizing suggestion */}
      {active && isBuy && s.suggestedShares > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(79,255,176,0.05)", borderRadius: 9, border: "1px solid rgba(79,255,176,0.14)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "#4fffb055", letterSpacing: 1, marginBottom: 2 }}>SUGGESTED POSITION</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#4fffb0" }}>
              {s.suggestedShares} shares <span style={{ fontWeight: 400, fontSize: 11, color: "#4fffb060" }}>≈ {fmtSEK(s.estimatedCostSEK)}</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#4fffb045" }}>
            {availableSEK > 0 ? Math.round((s.estimatedCostSEK || 0) / availableSEK * 100) : 0}% of capital
          </div>
        </div>
      )}

      {/* Price levels */}
      {active && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <MiniCell label="STOP LOSS" value={s.stopLoss || "—"} sub={downside !== null ? `${downside}%` : null} color="#ff4d6d" />
            <MiniCell label={`PRICE (${s.currency || "SEK"})`} value={s.currentPrice || "—"} sub={s.horizon} />
            <MiniCell label="SELL TARGET" value={s.sellTarget || "—"} sub={upside !== null ? `+${upside}%` : null} color="#4fffb0" />
          </div>
          <PriceBar current={s.currentPrice} stop={s.stopLoss} target={s.sellTarget} />
          {s.reason && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#ffffffa0", lineHeight: 1.65, margin: 0 }}>{s.reason}</p>}
        </>
      )}

      {/* Action buttons */}
      {active && (isBuy || owned) && (
        <div style={{ display: "flex", gap: 8 }}>
          {isBuy && (
            <button onClick={() => onBuy(s)}
              style={{ flex: 1, background: "#4fffb0", color: "#07090e", border: "none", borderRadius: 8, padding: "9px", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              {s.decision === "BUY MORE" ? "+ Bought more" : "✓ I bought"}
            </button>
          )}
          {owned && (
            <button onClick={() => onSell(s)}
              style={{ flex: isBuy ? 0 : 1, background: isSell ? "#ff4d6d" : "rgba(255,77,109,0.1)", color: isSell ? "#07090e" : "#ff4d6d", border: isSell ? "none" : "1px solid rgba(255,77,109,0.22)", borderRadius: 8, padding: "9px 14px", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
              {isSell ? "⚠ Sell now" : "Sell / Part"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── History view ──────────────────────────────────────────────────────────────
function HistoryView({ history }) {
  if (!history.length) return (
    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#ffffff20", padding: "20px 0" }}>No closed trades yet.</div>
  );
  const totalPnl = history.reduce((s, t) => s + (t.pnlSEK || 0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff30", letterSpacing: 1, marginBottom: 2 }}>TOTAL REALIZED P/L</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: totalPnl >= 0 ? "#4fffb0" : "#ff4d6d" }}>
            {totalPnl >= 0 ? "+" : ""}{fmtSEK(totalPnl)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#ffffff25" }}>{history.length} trade{history.length !== 1 ? "s" : ""}</div>
      </div>
      {[...history].reverse().map((t, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 11, padding: "13px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>{t.name}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff25", marginTop: 1 }}>{t.symbol} • {t.date}</div>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: t.pnlSEK >= 0 ? "#4fffb0" : "#ff4d6d" }}>
              {t.pnlSEK >= 0 ? "+" : ""}{fmtSEK(t.pnlSEK)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {[
              { l: "BOUGHT", v: `${t.buyPrice} ${t.currency}` },
              { l: "SOLD",   v: `${t.sellPrice} ${t.currency}` },
              { l: "SHARES", v: t.shares },
              { l: "P/L %",  v: `${t.pnlPct >= 0 ? "+" : ""}${t.pnlPct}%`, c: t.pnlPct >= 0 ? "#4fffb0" : "#ff4d6d" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: "6px 8px" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "#ffffff25", marginBottom: 2 }}>{l}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: c || "#fff" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,    setPhase]    = useState("idle");
  const [results,  setResults]  = useState([]);
  const [holdings, setHoldings] = useState({});
  const [history,  setHistory]  = useState([]);
  const [capital,  setCapital]  = useState({ total: INITIAL_CAPITAL, available: INITIAL_CAPITAL });
  const [step,     setStep]     = useState(0);
  const [err,      setErr]      = useState("");
  const [buyModal, setBuyModal] = useState(null);
  const [sellModal,setSellModal]= useState(null);
  const [tab,      setTab]      = useState("all");
  const [ready,    setReady]    = useState(false);
  const [usdSek,   setUsdSek]   = useState(10.5);

  useEffect(() => {
    Promise.all([storageGet(SK.holdings), storageGet(SK.history), storageGet(SK.capital)]).then(([h, hist, cap]) => {
      if (h)    setHoldings(h);
      if (hist) setHistory(hist);
      setCapital(cap || { total: INITIAL_CAPITAL, available: INITIAL_CAPITAL });
      setReady(true);
    });
  }, []);

  const updateCapital = useCallback((newHoldings) => {
    const spent = Object.values(newHoldings).reduce((s, h) => s + (h.costSEK || 0), 0);
    const cap = { total: INITIAL_CAPITAL, available: Math.max(0, INITIAL_CAPITAL - spent) };
    setCapital(cap);
    storageSet(SK.capital, cap);
    return cap;
  }, []);

  // ── Confirm buy ──
  const confirmBuy = useCallback(async (stock, { shares, buyPrice, currency, costSEK }) => {
    const existing = holdings[stock.symbol];
    let newHolding;
    if (existing) {
      // Average down / add to position
      const totalShares = existing.shares + shares;
      const totalCost   = (existing.costSEK || 0) + costSEK;
      const avgPrice    = currency === "USD"
        ? (existing.buyPrice * existing.shares + buyPrice * shares) / totalShares
        : totalCost / totalShares;
      newHolding = { ...existing, shares: totalShares, buyPrice: +avgPrice.toFixed(4), costSEK: totalCost };
    } else {
      newHolding = { shares, buyPrice, currency, costSEK, date: new Date().toISOString().slice(0, 10), name: stock.name, market: stock.market };
    }
    const updated = { ...holdings, [stock.symbol]: newHolding };
    setHoldings(updated);
    await storageSet(SK.holdings, updated);
    updateCapital(updated);
    setBuyModal(null);
  }, [holdings, updateCapital]);

  // ── Confirm sell ──
  const confirmSell = useCallback(async (stock, { sharesN, priceN, revSEK, pnlSEK, pnlPct, partial, costSEK: soldCostSEK }) => {
    const holding = holdings[stock.symbol];
    if (!holding) return;

    // Log trade
    const trade = {
      symbol: stock.symbol, name: holding.name,
      date: new Date().toISOString().slice(0, 10),
      shares: sharesN, buyPrice: holding.buyPrice, sellPrice: priceN,
      currency: holding.currency, pnlSEK, pnlPct,
    };
    const newHistory = [...history, trade];
    setHistory(newHistory);
    await storageSet(SK.history, newHistory);

    // Update or remove holding
    let newHoldings;
    if (partial) {
      const remaining = holding.shares - sharesN;
      const remainCost = (holding.costSEK || 0) - soldCostSEK;
      newHoldings = { ...holdings, [stock.symbol]: { ...holding, shares: remaining, costSEK: remainCost } };
    } else {
      newHoldings = { ...holdings };
      delete newHoldings[stock.symbol];
    }

    // Capital: return proceeds (capped at what was spent to avoid inflation)
    const returnedSEK = Math.min(revSEK, (holding.costSEK || 0));
    const profitSEK   = pnlSEK > 0 ? pnlSEK : 0;
    const newAvail    = Math.min(INITIAL_CAPITAL, capital.available + returnedSEK + profitSEK);
    const spent       = Object.values(newHoldings).reduce((s, h) => s + (h.costSEK || 0), 0);
    const cap         = { total: INITIAL_CAPITAL + Math.max(0, history.reduce((s,t) => s + t.pnlSEK, 0) + pnlSEK), available: Math.max(0, INITIAL_CAPITAL - spent + Math.max(0, history.reduce((s,t) => s + t.pnlSEK, 0) + pnlSEK)) };
    setCapital(cap);
    await storageSet(SK.capital, cap);

    setHoldings(newHoldings);
    await storageSet(SK.holdings, newHoldings);
    setSellModal(null);
  }, [holdings, history, capital]);

  const scan = useCallback(async () => {
    setPhase("loading"); setResults([]); setErr(""); setStep(0);
    const iv = setInterval(() => setStep(i => Math.min(i + 1, LOAD_STEPS.length - 1)), 4000);
    try {
      const stocks = buildStockList(holdings);
      const data   = await runScreener(stocks, holdings, capital.available);
      clearInterval(iv);
      if (data.usdSekRate) setUsdSek(data.usdSekRate);
      const sorted = [...(data.results || [])].sort((a, b) => (SORT_ORDER[a.decision] ?? 9) - (SORT_ORDER[b.decision] ?? 9));
      setResults(sorted);
      setPhase("done");
    } catch (e) {
      clearInterval(iv);
      setErr(e.message);
      setPhase("error");
    }
  }, [holdings, capital]);

  const filtered = results.filter(r => {
    if (tab === "omxs30") return r.market === "OMXS30";
    if (tab === "djia")   return r.market === "DJIA";
    if (tab === "portfolio") return !!holdings[r.symbol];
    if (tab === "history") return false;
    return true;
  });

  const buyCount  = results.filter(r => r.decision === "BUY" || r.decision === "BUY MORE").length;
  const holdCount = results.filter(r => r.decision === "HOLD").length;
  const sellCount = results.filter(r => r.decision === "SELL").length;
  const totalPnl  = history.reduce((s, t) => s + (t.pnlSEK || 0), 0);
  const invested  = Object.values(holdings).reduce((s, h) => s + (h.costSEK || 0), 0);
  const pct       = capital.total > 0 ? (capital.available / capital.total * 100).toFixed(0) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#07090e;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gl{0%,100%{opacity:.4}50%{opacity:1}}
        .fade{animation:fadeUp .4s ease forwards;}
        .pulse{animation:gl 1.8s ease infinite;}
        input:focus{border-color:rgba(79,255,176,0.4)!important;}
        input[type=number]::-webkit-inner-spin-button{opacity:.3;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#07090e", padding: "40px 20px 80px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 4, color: "#4fffb028", marginBottom: 12 }}>OMXS30 + DJIA • 1 MONTH – 1 YEAR</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(28px,7vw,52px)", color: "#fff", letterSpacing: "-2.5px", lineHeight: 1, marginBottom: 20 }}>
              BUY or<br /><span style={{ color: "#4fffb0" }}>not.</span>
            </h1>

            {/* Capital dashboard */}
            {ready && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "14px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, marginBottom: 8 }}>
                  {[
                    { label: "INITIAL CAPITAL", val: fmtSEK(INITIAL_CAPITAL), color: "#ffffff60" },
                    { label: "AVAILABLE",        val: fmtSEK(capital.available), color: "#4fffb0" },
                    { label: "INVESTED",         val: fmtSEK(invested), color: "#ffd166" },
                    { label: "REALIZED P/L",     val: `${totalPnl >= 0 ? "+" : ""}${fmtSEK(totalPnl)}`, color: totalPnl >= 0 ? "#4fffb0" : "#ff4d6d" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: color + "60", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color, lineHeight: 1.2 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, 100 - parseFloat(pct))}%`, background: "linear-gradient(90deg,#ffd166,#ff4d6d)", borderRadius: 2, transition: "width .6s ease" }} />
                </div>
              </>
            )}
          </div>

          {/* Scan button */}
          <div style={{ marginBottom: 24 }}>
            <button onClick={scan} disabled={!ready || phase === "loading"}
              style={{ background: phase === "loading" ? "rgba(79,255,176,0.12)" : "#4fffb0", color: phase === "loading" ? "#4fffb0" : "#07090e", border: phase === "loading" ? "1px solid #4fffb033" : "none", borderRadius: 12, padding: "15px 36px", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, cursor: ready && phase !== "loading" ? "pointer" : "not-allowed", boxShadow: phase !== "loading" ? "0 0 30px rgba(79,255,176,0.18)" : "none" }}>
              {phase === "loading" ? "Analyzing…" : phase === "done" ? "🔄 Scan again" : "Scan OMXS30 + DJIA →"}
            </button>
            {phase !== "loading" && <span style={{ marginLeft: 14, fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#ffffff18" }}>60+ stocks • ~30 sec</span>}
          </div>

          {/* Loading */}
          {phase === "loading" && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 16, height: 16, border: "2px solid #4fffb0", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                <span className="pulse" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{LOAD_STEPS[step]}</span>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {LOAD_STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 2, borderRadius: 1, background: i <= step ? "#4fffb0" : "rgba(255,255,255,0.07)", transition: "background .4s" }} />)}
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="fade" style={{ background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#ff4d6d", marginBottom: 6 }}>Failed</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#ff4d6d70", marginBottom: 10 }}>{err}</p>
              <button onClick={scan} style={{ background: "transparent", border: "1px solid rgba(255,77,109,0.3)", color: "#ff4d6d", borderRadius: 8, padding: "8px 18px", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Try again</button>
            </div>
          )}

          {/* Results */}
          {(results.length > 0 || tab === "history") && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {results.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[["BUY/MORE", buyCount, "#4fffb0"], ["HOLD", holdCount, "#ffd166"], ["SELL", sellCount, "#ff4d6d"]].map(([l, n, c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, background: `${c}10`, border: `1px solid ${c}28`, borderRadius: 20, padding: "4px 11px" }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: c }}>{n}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: `${c}75` }}>{l}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[
                  ["all", "All"],
                  ["omxs30", "OMXS30"],
                  ["djia", "DJIA"],
                  ["portfolio", `Portfolio${Object.keys(holdings).length > 0 ? ` (${Object.keys(holdings).length})` : ""}`],
                  ["history", `History${history.length > 0 ? ` (${history.length})` : ""}`],
                ].map(([id, lbl]) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    background: tab === id ? "rgba(79,255,176,0.1)" : "transparent",
                    border: `1px solid ${tab === id ? "rgba(79,255,176,0.32)" : "rgba(255,255,255,0.07)"}`,
                    color: tab === id ? "#4fffb0" : "#ffffff32",
                    borderRadius: 7, padding: "6px 12px",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer",
                  }}>{lbl}</button>
                ))}
              </div>

              {/* History tab */}
              {tab === "history" ? (
                <HistoryView history={history} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map(s => (
                    <StockCard
                      key={s.symbol} s={s}
                      holding={holdings[s.symbol]}
                      availableSEK={capital.available}
                      usdSekRate={usdSek}
                      onBuy={setBuyModal}
                      onSell={setSellModal}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#ffffff20", padding: "20px 0" }}>
                      {tab === "portfolio" ? "No stocks in portfolio — run a scan and click 'I bought'." : "No results."}
                    </div>
                  )}
                </div>
              )}

              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff13", lineHeight: 2, marginTop: 8 }}>
                ⚠ NOT FINANCIAL ADVICE. AI-generated signals based on web search. Position sizes are suggestions. Trading involves risk of capital loss.
              </p>
            </div>
          )}

          {/* Idle holdings */}
          {phase === "idle" && results.length === 0 && Object.keys(holdings).length > 0 && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffd16645", letterSpacing: 2, marginBottom: 4 }}>CURRENT HOLDINGS</div>
              {Object.entries(holdings).map(([sym, h]) => (
                <div key={sym} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,209,102,0.04)", border: "1px solid rgba(255,209,102,0.1)", borderRadius: 10, padding: "11px 15px", gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>{h.name}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#ffffff28", marginTop: 1 }}>
                      {h.shares} shares @ {h.buyPrice} {h.currency} • {h.date} • ≈{fmtSEK(h.costSEK || 0)}
                    </div>
                  </div>
                  <button onClick={() => setSellModal({ symbol: sym, name: h.name, market: h.market })}
                    style={{ background: "transparent", border: "1px solid rgba(255,77,109,0.18)", color: "#ff4d6d65", borderRadius: 7, padding: "5px 10px", fontFamily: "'Space Mono',monospace", fontSize: 8, cursor: "pointer", flexShrink: 0 }}>
                    Sell
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {buyModal  && <BuyModal  stock={buyModal}  availableSEK={capital.available} usdSekRate={usdSek} onConfirm={d => confirmBuy(buyModal, d)}   onClose={() => setBuyModal(null)}  />}
      {sellModal && <SellModal stock={sellModal} holding={holdings[sellModal.symbol]} usdSekRate={usdSek} onConfirm={d => confirmSell(sellModal, d)} onClose={() => setSellModal(null)} />}
    </>
  );
}
