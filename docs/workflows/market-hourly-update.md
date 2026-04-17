# market-hourly-update

> **Last reviewed:** 2026-04-17  
> **Workflow file:** [`.github/workflows/market-hourly-update.yml`](../../.github/workflows/market-hourly-update.yml)

---

## Reference

### Triggers

| Trigger | Details |
|---|---|
| `workflow_dispatch` | Manual trigger from the GitHub Actions UI |

> No automatic schedule is configured. Run manually when needed.

### Required Secrets

| Secret | Purpose |
|---|---|
| `TELEGRAM_TOKEN` | Bot token for the Telegram API |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID |
| `TWELVEDATA_KEY` | API key for TwelveData market data |

### Tracked Instruments

| Flag | Name | Ticker | Market | Data Source |
|---|---|---|---|---|
| 🇺🇸 | S&P 500 (ETF) | `SPY` | US | TwelveData |
| 🇺🇸 | DJI (ETF) | `DIA` | US | TwelveData |
| 🇺🇸 | Microsoft | `MSFT` | US | TwelveData |
| 💵 | Bitcoin is like a lottery I think | `BTC/USD` | Crypto | TwelveData |

### Output Fields

Each instrument is reported with:

| Field | Description |
|---|---|
| Current price | Latest close from daily time series |
| 1D | Change vs previous daily close |
| 1W | Change vs close 5 trading days ago |
| 1M | Change vs close 21 trading days ago |
| YTD | Change vs first trading day of current year |

### Market Hours Logic

| Market | Open hours (CET) | Weekend |
|---|---|---|
| US | Mon–Fri 15:30–22:00 | Closed |
| Crypto | 24/7 | Open |

When US market is **closed**, the 1D field uses neutral arrows (▲/▼) instead of green/red dots (🟢/🔴) to indicate the value is not a live intraday move.

---

## How-to Guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-hourly-update**
3. Click **Run workflow** → **Run workflow**

### How to add a US ticker

Add a new entry to the `$Indices` array in the workflow:

```powershell
@{ Name = "Your Name"; Ticker = "TICK"; Market = "US" }
```

### How to add a Swedish (SE) ticker

SE tickers require the `EODHD_KEY` secret and a separate data function. See the `market-index-weekly-digest` or `market-stock-weekly-digest` workflows for the `Get-SeData` implementation, and replicate the pattern here. Note that EOD Historical Data only provides end-of-day prices on the free plan — live SE prices are not available without a paid plan.

### How to change the percentage format

- **Green/red dots** format is controlled by `Fmt` function
- **Arrow** format is controlled by `FmtArrow` function
- The `$DayMarket` variable in `Get-Lines` determines which is used for 1D

---

## Explanation

### Why arrows instead of dots when the market is closed

Green/red dots imply a live, intraday price movement. When the US market is closed, the "1D" figure compares two completed daily closes — it is a historical data point, not a live signal. Arrows communicate this distinction visually.

### Why TwelveData for US/Crypto

TwelveData provides a reliable time series endpoint that covers both US equities and crypto pairs on the free plan. All tickers in this workflow are available without requiring a paid subscription.

### Why no scheduled trigger

This workflow was originally designed for manual triggering during testing. Adding a `schedule` cron trigger is the natural next step once the output format is confirmed.