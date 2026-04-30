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

const MONO = "'Courier New', monospace";

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
  "BUY":      { color: "#ffffff", border: "#ffffff", bg: "transparent", text: "#ffffff" },
  "BUY MORE": { color: "#ffffff", border: "#ffffff", bg: "transparent", text: "#ffffff" },
  "HOLD":     { color: "#ffffff", border: "#ffffff", bg: "transparent", text: "#ffffff" },
  "SELL":     { color: "#000000", border: "#ffffff", bg: "#ffffff",     text: "#000000" },
  "NO BUY":   { color: "#ffffff", border: "#ffffff", bg: "transparent", text: "#ffffff" },
};
const SORT_ORDER = { "BUY": 0, "BUY MORE": 1, "HOLD": 2, "SELL": 3, "NO BUY": 4 };
const LOAD_STEPS = [
  "> checking portfolio...",
  "> fetching prices & news...",
  "> analyzing risk/reward...",
  "> calculating position sizes...",
  "> sorting results...",
];

function Divider() {
  return <div style={{ height: 2, background: "#ffffff", margin: "0" }} />;
}

function Input({ label, value, onChange, step = "any", hint }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", letterSpacing: 1 }}>{label}</span>
      <input
        type="number" step={step} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: "#000000", border: "1px solid #ffffff", borderRadius: 2, padding: "14px 16px", color: "#ffffff", fontFamily: MONO, fontSize: 20, outline: "none", width: "100%" }}
      />
      {hint && <span style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff" }}>{hint}</span>}
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
    <Modal title="// register buy" name={stock.name} onClose={onClose}>
      <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", marginBottom: 20 }}>
        available: {fmtSEK(availableSEK)}
      </div>
      {stock.suggestedShares > 0 && (
        <div style={{ background: "transparent", border: "1px solid #ffffff", borderRadius: 2, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", marginBottom: 6 }}>[ai recommends]</div>
          <div style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff" }}>
            {stock.suggestedShares} shares ≈ {fmtSEK(stock.estimatedCostSEK)}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <Input label={`> shares (ai: ${stock.suggestedShares || "n/a"})`} value={shares} onChange={setShares} step="1" />
        <Input label={`> buy price (${cur})`} value={price} onChange={setPrice} step="0.01" hint={cur === "USD" ? `≈ ${(priceN * usdSekRate).toFixed(2)} SEK/share` : ""} />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", marginBottom: 20 }}>
        total: ~{fmtSEK(costSEK)}{!ok && costSEK > availableSEK ? "  [!] exceeds budget" : ""}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Btn ghost onClick={onClose}>[cancel]</Btn>
        <Btn disabled={!ok} onClick={() => onConfirm({ shares: sharesN, buyPrice: priceN, currency: cur, costSEK })}>
          [confirm buy]
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
    <Modal title="// register sale" name={stock?.name || holding.name} onClose={onClose}>
      <div style={{ background: "transparent", border: "1px solid #ffffff", borderRadius: 2, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", marginBottom: 6 }}>[your holding]</div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff" }}>
          {holding.shares} shares @ {holding.buyPrice} {cur}  //  {holding.date}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <Input label={`> shares to sell (max ${holding.shares})`} value={shares} onChange={setShares} step="1" hint={partial ? `${holding.shares - sharesN} shares kept` : "full position sold"} />
        <Input label={`> sell price (${cur})`} value={price} onChange={setPrice} step="0.01" hint={cur === "USD" ? `≈ ${(priceN * usdSekRate).toFixed(2)} SEK/share` : ""} />
      </div>
      {ok && (
        <div style={{ background: "transparent", border: "1px solid #ffffff", borderRadius: 2, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", marginBottom: 10 }}>[result]</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { l: "revenue", v: fmtSEK(revSEK) },
              { l: "p/l sek", v: `${pnlSEK >= 0 ? "+" : ""}${fmtSEK(pnlSEK)}` },
              { l: "p/l %",   v: `${pnlPct >= 0 ? "+" : ""}${pnlPct}%` },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontFamily: MONO, fontSize: 14, color: "#ffffff", marginBottom: 4 }}>{l}</div>
                <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn ghost onClick={onClose}>[cancel]</Btn>
        <Btn red disabled={!ok} onClick={() => onConfirm({ sharesN, priceN, revSEK, pnlSEK: +pnlSEK, pnlPct: +pnlPct, partial, costSEK })}>
          [confirm sale]
        </Btn>
      </div>
    </Modal>
  );
}

// ── Shared modal shell ────────────────────────────────────────────────────────
function Modal({ title, name, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
      <div style={{ background: "#000000", border: "1px solid #ffffff", borderRadius: 2, padding: "28px 28px", width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", letterSpacing: 1, marginBottom: 6 }}>{title}</div>
        <div style={{ fontFamily: MONO, fontSize: 26, color: "#ffffff", marginBottom: 8, letterSpacing: "-0.5px" }}>{name}</div>
        <Divider />
        <div style={{ marginTop: 22 }}>{children}</div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, ghost, red }) {
  const bg     = ghost || disabled ? "transparent" : "#ffffff";
  const color  = ghost || disabled ? "#ffffff" : "#000000";
  const border = ghost || disabled ? "1px solid #ffffff" : "none";
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ flex: ghost ? 1 : 2, background: bg, color, border, borderRadius: 2, padding: "14px", fontFamily: MONO, fontWeight: 700, fontSize: 20, cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 0.5 }}>
      {children}
    </button>
  );
}

function PriceBar({ current, stop, target }) {
  if (!current || !stop || !target) return null;
  const mn = stop * 0.95, mx = target * 1.05, rng = mx - mn;
  const p = v => Math.max(0, Math.min(100, (v - mn) / rng * 100)).toFixed(1);
  return (
    <div style={{ position: "relative", height: 40 }}>
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 2, background: "#ffffff" }} />
      <div style={{ position: "absolute", top: 18, height: 2, left: `${p(stop)}%`, width: `${p(target) - p(stop)}%`, background: "#ffffff" }} />
      {[{ v: stop, sz: 8 }, { v: current, sz: 14, glow: true }, { v: target, sz: 8 }].map(({ v, sz, glow }) => (
        <div key={v} style={{ position: "absolute", left: `${p(v)}%`, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ width: sz, height: sz, borderRadius: "50%", background: "#ffffff", margin: "0 auto", marginTop: glow ? 11 : 14, boxShadow: glow ? "0 0 8px #ffffff" : "none", border: glow ? "2px solid #000000" : "none" }} />
          <div style={{ fontFamily: MONO, fontSize: 14, color: "#ffffff", marginTop: 3, whiteSpace: "nowrap" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function MiniCell({ label, value, sub }) {
  return (
    <div style={{ borderLeft: "2px solid #ffffff", paddingLeft: 12 }}>
      <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff" }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", marginTop: 3 }}>{sub}</div>}
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
    <div style={{ background: active ? meta.bg : "transparent", borderLeft: `4px solid ${meta.color}`, border: "1px solid #ffffff", borderLeft: `4px solid #ffffff`, padding: "20px 24px", display: "flex", flexDirection: "column", gap: active ? 16 : 0 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff", letterSpacing: "-0.3px" }}>{s.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff" }}>{s.market}</span>
            {s.delisted && <span style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff" }}>[off-index]</span>}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", marginTop: 4 }}>{s.symbol}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 20, color: meta.color, background: meta.bg, letterSpacing: 1, padding: meta.bg === "#ffffff" ? "2px 6px" : "0" }}>
            [{s.decision}]
          </div>
          {owned && <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff" }}>[in-portfolio]</div>}
        </div>
      </div>

      {/* Owned P/L */}
      {owned && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "14px 0", borderTop: "1px solid #ffffff", borderBottom: "1px solid #ffffff" }}>
          <MiniCell label="buy price" value={`${holding.buyPrice} ${holding.currency}`} />
          <MiniCell label="shares" value={holding.shares} />
          <MiniCell label="p/l %" value={pnlPct !== null ? `${pnlPct > 0 ? "+" : ""}${pnlPct}%` : "n/a"} />
          <MiniCell label="p/l sek" value={pnlSEK !== null ? `${pnlSEK > 0 ? "+" : ""}${pnlSEK}` : "n/a"} />
        </div>
      )}

      {/* Position sizing suggestion */}
      {active && isBuy && s.suggestedShares > 0 && (
        <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff", borderLeft: "2px solid #ffffff", paddingLeft: 14 }}>
          <span style={{ color: "#ffffff", fontSize: 16 }}>suggested: </span>
          {s.suggestedShares} shares ≈ {fmtSEK(s.estimatedCostSEK)}
          <span style={{ color: "#ffffff", fontSize: 16 }}> ({availableSEK > 0 ? Math.round((s.estimatedCostSEK || 0) / availableSEK * 100) : 0}% of capital)</span>
        </div>
      )}

      {/* Price levels */}
      {active && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <MiniCell label="stop loss" value={s.stopLoss || "n/a"} sub={downside !== null ? `${downside}%` : null} />
            <MiniCell label={`price (${s.currency || "SEK"})`} value={s.currentPrice || "n/a"} sub={s.horizon} />
            <MiniCell label="sell target" value={s.sellTarget || "n/a"} sub={upside !== null ? `+${upside}%` : null} />
          </div>
          <PriceBar current={s.currentPrice} stop={s.stopLoss} target={s.sellTarget} />
          {s.reason && <p style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", lineHeight: 1.7, margin: 0 }}>{s.reason}</p>}
        </>
      )}

      {/* Action buttons */}
      {active && (isBuy || owned) && (
        <div style={{ display: "flex", gap: 12, paddingTop: 6 }}>
          {isBuy && (
            <button onClick={() => onBuy(s)}
              style={{ flex: 1, background: "transparent", color: "#ffffff", border: "1px solid #ffffff", borderRadius: 2, padding: "12px", fontFamily: MONO, fontSize: 20, cursor: "pointer", letterSpacing: 0.5 }}>
              {s.decision === "BUY MORE" ? "[+ bought more]" : "[✓ i bought]"}
            </button>
          )}
          {owned && (
            <button onClick={() => onSell(s)}
              style={{ flex: isBuy ? 0 : 1, background: isSell ? "#ffffff" : "transparent", color: isSell ? "#000000" : "#ffffff", border: "1px solid #ffffff", borderRadius: 2, padding: "12px 18px", fontFamily: MONO, fontSize: 20, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5 }}>
              {isSell ? "[⚠ sell now]" : "[sell / part]"}
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
    <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff", padding: "28px 0" }}>
      no closed trades yet.
    </div>
  );
  const totalPnl = history.reduce((s, t) => s + (t.pnlSEK || 0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ padding: "18px 20px", background: "transparent", border: "1px solid #ffffff", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", letterSpacing: 1, marginBottom: 6 }}>[total realized p/l]</div>
          <div style={{ fontFamily: MONO, fontSize: 30, color: "#ffffff" }}>
            {totalPnl >= 0 ? "+" : ""}{fmtSEK(totalPnl)}
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff" }}>{history.length} trade{history.length !== 1 ? "s" : ""}</div>
      </div>
      {[...history].reverse().map((t, i) => (
        <div key={i} style={{ background: "transparent", border: "1px solid #ffffff", borderRadius: 2, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff" }}>{t.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", marginTop: 4 }}>{t.symbol} // {t.date}</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff" }}>
              {t.pnlSEK >= 0 ? "+" : ""}{fmtSEK(t.pnlSEK)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { l: "bought", v: `${t.buyPrice} ${t.currency}` },
              { l: "sold",   v: `${t.sellPrice} ${t.currency}` },
              { l: "shares", v: t.shares },
              { l: "p/l %",  v: `${t.pnlPct >= 0 ? "+" : ""}${t.pnlPct}%` },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontFamily: MONO, fontSize: 14, color: "#ffffff", marginBottom: 4 }}>{l}</div>
                <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff" }}>{v}</div>
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

  const confirmBuy = useCallback(async (stock, { shares, buyPrice, currency, costSEK }) => {
    const existing = holdings[stock.symbol];
    let newHolding;
    if (existing) {
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

  const confirmSell = useCallback(async (stock, { sharesN, priceN, revSEK, pnlSEK, pnlPct, partial, costSEK: soldCostSEK }) => {
    const holding = holdings[stock.symbol];
    if (!holding) return;
    const trade = {
      symbol: stock.symbol, name: holding.name,
      date: new Date().toISOString().slice(0, 10),
      shares: sharesN, buyPrice: holding.buyPrice, sellPrice: priceN,
      currency: holding.currency, pnlSEK, pnlPct,
    };
    const newHistory = [...history, trade];
    setHistory(newHistory);
    await storageSet(SK.history, newHistory);
    let newHoldings;
    if (partial) {
      const remaining = holding.shares - sharesN;
      const remainCost = (holding.costSEK || 0) - soldCostSEK;
      newHoldings = { ...holdings, [stock.symbol]: { ...holding, shares: remaining, costSEK: remainCost } };
    } else {
      newHoldings = { ...holdings };
      delete newHoldings[stock.symbol];
    }
    const spent = Object.values(newHoldings).reduce((s, h) => s + (h.costSEK || 0), 0);
    const cap = { total: INITIAL_CAPITAL + Math.max(0, history.reduce((s,t) => s + t.pnlSEK, 0) + pnlSEK), available: Math.max(0, INITIAL_CAPITAL - spent + Math.max(0, history.reduce((s,t) => s + t.pnlSEK, 0) + pnlSEK)) };
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
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#000000;font-family:'Courier New',monospace;}
        @keyframes fadeUp{from{transform:translateY(8px)}to{transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .fade{animation:fadeUp .3s ease forwards;}
        .cursor{animation:blink 1s step-end infinite;color:#ffffff;}
        input:focus{border-color:#ffffff!important;outline:none;}
        input[type=number]::-webkit-inner-spin-button{display:none;}
        ::-webkit-scrollbar{width:8px;}
        ::-webkit-scrollbar-track{background:#000000;}
        ::-webkit-scrollbar-thumb{background:#ffffff;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", padding: "48px 28px 100px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: MONO, fontWeight: 700, fontSize: "clamp(28px,5vw,48px)", color: "#ffffff", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 6 }}>
              muppet stock screener<span className="cursor">_</span>
            </h1>
            <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", marginBottom: 24 }}>
              v.3.0 -- checking omxs30+dji w/ ai-powered signals
            </div>

            {/* Capital dashboard */}
            {ready && (
              <>
                <div style={{ border: "1px solid #ffffff", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", letterSpacing: 2, padding: "12px 18px", borderBottom: "1px solid #ffffff", background: "transparent" }}>
                    capital
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "18px 18px", gap: 0 }}>
                    {[
                      { label: "initial",      val: fmtSEK(INITIAL_CAPITAL) },
                      { label: "available",    val: fmtSEK(capital.available) },
                      { label: "invested",     val: fmtSEK(invested) },
                      { label: "realized p/l", val: `${totalPnl >= 0 ? "+" : ""}${fmtSEK(totalPnl)}` },
                    ].map(({ label, val }, i) => (
                      <div key={label} style={{ borderLeft: i > 0 ? "1px solid #ffffff" : "none", paddingLeft: i > 0 ? 16 : 0 }}>
                        <div style={{ fontFamily: MONO, fontSize: 14, color: "#ffffff", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                        <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 6, border: "1px solid #ffffff", background: "transparent" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, 100 - parseFloat(pct))}%`, background: "#ffffff", transition: "width .6s ease" }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Scan button */}
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 20 }}>
            <button onClick={scan} disabled={!ready || phase === "loading"}
              style={{ background: phase === "loading" ? "transparent" : "#ffffff", color: phase === "loading" ? "#ffffff" : "#000000", border: "1px solid #ffffff", borderRadius: 2, padding: "16px 36px", fontFamily: MONO, fontWeight: 700, fontSize: 22, cursor: ready && phase !== "loading" ? "pointer" : "not-allowed", letterSpacing: 0.5 }}>
              {phase === "loading" ? "running..." : phase === "done" ? "$ scan --refresh" : "$ scan --market all →"}
            </button>
            {phase !== "loading" && <span style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff" }}>~30 sec</span>}
          </div>

          {/* Loading */}
          {phase === "loading" && (
            <div className="fade" style={{ marginBottom: 28, border: "1px solid #ffffff", borderRadius: 2, padding: "20px 24px" }}>
              <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff", marginBottom: 16 }}>
                {LOAD_STEPS[step]}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {LOAD_STEPS.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 6, border: "1px solid #ffffff", background: i <= step ? "#ffffff" : "transparent", transition: "background .4s" }} />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="fade" style={{ border: "1px solid #ffffff", borderLeft: "4px solid #ffffff", borderRadius: 2, padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff", marginBottom: 10 }}>[err] scan failed</div>
              <p style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", marginBottom: 16, lineHeight: 1.6 }}>{err}</p>
              <button onClick={scan} style={{ background: "transparent", border: "1px solid #ffffff", color: "#ffffff", borderRadius: 2, padding: "12px 24px", fontFamily: MONO, fontSize: 18, cursor: "pointer" }}>$ retry</button>
            </div>
          )}

          {/* Results */}
          {(results.length > 0 || tab === "history") && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {results.length > 0 && (
                <div style={{ display: "flex", gap: 24, fontFamily: MONO, fontSize: 18 }}>
                  {[["buy/more", buyCount], ["hold", holdCount], ["sell", sellCount]].map(([l, n]) => (
                    <span key={l} style={{ color: "#ffffff" }}>
                      <span style={{ fontSize: 22, fontWeight: 700 }}>{n}</span>
                      <span style={{ color: "#ffffff", marginLeft: 6 }}>{l}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #ffffff" }}>
                {[
                  ["all", "all"],
                  ["omxs30", "omxs30"],
                  ["djia", "djia"],
                  ["portfolio", `portfolio${Object.keys(holdings).length > 0 ? `(${Object.keys(holdings).length})` : ""}`],
                  ["history", `history${history.length > 0 ? `(${history.length})` : ""}`],
                ].map(([id, lbl]) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    background: "transparent",
                    borderBottom: `3px solid ${tab === id ? "#ffffff" : "transparent"}`,
                    borderTop: "none", borderLeft: "none", borderRight: "none",
                    color: "#ffffff",
                    padding: "12px 20px", marginBottom: -1,
                    fontFamily: MONO, fontSize: 18, cursor: "pointer",
                    letterSpacing: 0.5,
                  }}>{lbl}</button>
                ))}
              </div>

              {tab === "history" ? (
                <HistoryView history={history} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map(s => (
                    <StockCard key={s.symbol} s={s} holding={holdings[s.symbol]} availableSEK={capital.available} usdSekRate={usdSek} onBuy={setBuyModal} onSell={setSellModal} />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ fontFamily: MONO, fontSize: 20, color: "#ffffff", padding: "28px 0" }}>
                      {tab === "portfolio" ? "> no holdings -- run a scan and click [i bought]" : "> no results"}
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontFamily: MONO, fontSize: 16, color: "#ffffff", lineHeight: 2, marginTop: 8 }}>
                [!] not financial advice // ai-generated signals // trading involves risk of capital loss
              </div>
            </div>
          )}

          {/* Idle holdings */}
          {phase === "idle" && results.length === 0 && Object.keys(holdings).length > 0 && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", letterSpacing: 2, marginBottom: 8 }}>[current holdings]</div>
              {Object.entries(holdings).map(([sym, h]) => (
                <div key={sym} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #ffffff", borderLeft: "4px solid #ffffff", borderRadius: 2, padding: "18px 22px", gap: 14 }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 22, color: "#ffffff" }}>{h.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18, color: "#ffffff", marginTop: 4 }}>
                      {h.shares} shares @ {h.buyPrice} {h.currency} // {h.date} // ≈{fmtSEK(h.costSEK || 0)}
                    </div>
                  </div>
                  <button onClick={() => setSellModal({ symbol: sym, name: h.name, market: h.market })}
                    style={{ background: "transparent", border: "1px solid #ffffff", color: "#ffffff", borderRadius: 2, padding: "10px 18px", fontFamily: MONO, fontSize: 18, cursor: "pointer", flexShrink: 0 }}>
                    [sell]
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
