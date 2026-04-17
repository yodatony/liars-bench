# market-big-move-alert

> **Last reviewed:** 2026-04-17
> **Workflow file:** [`.github/workflows/market-big-move-alert.yml`](../../.github/workflows/market-big-move-alert.yml)

---

## Reference

### Triggers

| Trigger | Details |
|---|---|
| `workflow_dispatch` | Manual trigger from the GitHub Actions UI |

> Intended to be triggered on a schedule during market hours. No `schedule` cron is currently configured.

### Required Secrets

| Secret | Purpose |
|---|---|
| `TELEGRAM_TOKEN` | Bot token for the Telegram API |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID |
| `TWELVEDATA_KEY` | API key for TwelveData market data |

### Alert Threshold

| Variable | Value | Meaning |
|---|---|---|
| `$Threshold` | `2.0` | Minimum absolute % move from previous close to trigger an alert |

### Tracked Instruments

| Flag | Name | Ticker | Market |
|---|---|---|---|
| 🇺🇸 | NVIDIA | `NVDA` | US |
| 🇺🇸 | Apple | `AAPL` | US |
| 🇺🇸 | Microsoft | `MSFT` | US |
| 🇺🇸 | Amazon | `AMZN` | US |
| 🇺🇸 | Google | `GOOGL` | US |
| 🇺🇸 | Berkshire | `BRK.B` | US |
| 🇺🇸 | Walmart | `WMT` | US |
| 💵 | Bitcoin | `BTC/USD` | Crypto |

### Market Hours Filtering

US stocks are only checked during active market hours. Tickers outside their market window are silently skipped — no API call is made and no alert fires.

| Market | Checked during (CET) | Weekends |
|---|---|---|
| US | Mon–Fri 15:30–22:00 | Skipped |
| Crypto | 24/7 | Always checked |

### API Endpoint

Uses TwelveData `/quote` endpoint — returns real-time `percent_change` from the previous close.

---

## How-to Guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-big-move-alert**
3. Click **Run workflow** → **Run workflow**

### How to change the alert threshold

Find and update `$Threshold` at the top of the `run` block:

```powershell
$Threshold = 2.0   # Change this value
```

### How to add a ticker

Add a new entry to `$Indices`:

```powershell
@{ Name = "Your Name"; Ticker = "TICK"; Market = "US" }
```

For crypto, use `Market = "CRYPTO"` to bypass the market hours filter.

### How to add a scheduled trigger

Add a `schedule` block under `on:`:

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '*/30 15-22 * * 1-5'   # Every 30 min during US market hours (UTC)
```

---

## Explanation

### Why the market hours check exists

Calling TwelveData's `/quote` endpoint outside market hours would return stale data (previous day's close vs previous day's close = 0%). The filter prevents false negatives and unnecessary API calls.

### Why US and Crypto are treated differently

US equities have defined trading sessions. Crypto trades continuously with no session boundaries, so it should always be monitored regardless of time or day.

### Why `[math]::Abs($Pct)` is used

The threshold check uses the absolute value so that both rallies (+2%) and selloffs (-2%) trigger an alert equally. The sign only affects the display emoji (🟢 for positive, 🔴 for negative).
