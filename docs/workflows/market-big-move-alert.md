# Workflow documentation: market-big-move-alert
**Workflow file:** [.github/workflows/market-big-move-alert.yml](../../.github/workflows/market-big-move-alert.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers

| Trigger | Details |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org |

### Required Secrets

| Secret | Purpose |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token for the Telegram API |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID |
| `TWELVEDATA_KEY` | API key for TwelveData market data |

### Alert Threshold

| Variable | Value | Meaning |
| :--- | :--- | :--- |
| `$Threshold` | `3` | Minimum absolute % move from previous close to trigger an alert |

### Tracked Instruments

| Name | Ticker | Market | Own |
| :--- | :--- | :--- | :--- |
| AAPL | `AAPL` | US | `false` |
| AMZN | `AMZN` | US | `false` |
| GOOGL | `GOOGL` | US | `false` |
| MSFT | `MSFT` | US | `true` |
| AVGO | `AVGO` | US | `true` |
| TSLA | `TSLA` | US | `true` |
| NOW | `NOW` | US | `true` |

### API / Data Sources

| Source | Endpoint / Method | Purpose |
| :--- | :--- | :--- |
| TwelveData | `https://api.twelvedata.com/quote` (GET) | Fetches real-time quote data, percent change, and close price |
| Telegram | `https://api.telegram.org/bot<TOKEN>/sendMessage` (POST) | Sends formatted HTML alert messages to the configured chat |

## How-to Guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-big-move-alert**
3. Click **Run workflow** → **Run workflow**

### How to change the alert threshold

Find and update `$Threshold` at the top of the `run` block:

```powershell
$Threshold  = 3   # Change this value
```

### How to add a ticker

Add a new entry to the `$Indices` array:

```powershell
@{ Name = "TICKER"; Ticker = "TICKER"; Market = "US"; Own = $false }
```

### How to add a scheduled trigger

Add a `schedule` block under `on:`:

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '*/30 15-22 * * 1-5'   # Every 30 min during US market hours (UTC)
```

## Explanation

### Why the market hours check exists

Calling TwelveData's `/quote` endpoint outside market hours would return stale data (previous day's close vs previous day's close = 0%). The filter prevents false negatives and unnecessary API calls.

### Why US and Crypto are treated differently

US equities have defined trading sessions. Crypto trades continuously with no session boundaries, so it should always be monitored regardless of time or day.

### Why `[math]::Abs($Pct)` is used

The threshold check uses the absolute value so that both rallies (+3%) and selloffs (-3%) trigger an alert equally. The sign only affects the display emoji (🟢 for positive, 🔴 for negative).