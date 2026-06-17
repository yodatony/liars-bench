# Workflow documentation: market-index-weekly-digest
**Workflow file:** [.github/workflows/market-index-weekly-digest.yml](../../.github/workflows/market-index-weekly-digest.yml)  
**Last reviewed date:** 2026-05-01  

---

## Reference

### Triggers

| Trigger             | Details                                    |
|---------------------|--------------------------------------------|
| `schedule`          | Every Sunday at 10:53 UTC (12:53 CET)     |
| `workflow_dispatch` | Manual trigger from the GitHub Actions UI  |

### Required Secrets

| Secret              | Purpose                                  |
|---------------------|------------------------------------------|
| `TELEGRAM_TOKEN`    | Bot token for the Telegram API          |
| `TELEGRAM_CHAT_ID`  | Target chat or channel ID                |
| `TWELVEDATA_KEY`    | API key for TwelveData (US indices)     |
| `EODHD_KEY`         | API key for EOD Historical Data (SE indices) |

### Tracked Instruments

| Flag | Name               | Ticker          | Market | Data Source           |
|------|--------------------|-----------------|--------|-----------------------|
| 🇸🇪  | OMXSPI            | `OMXSPI.INDX`   | SE     | EOD Historical Data   |
| 🇸🇪  | OMXS30            | `OMXS30.INDX`   | SE     | EOD Historical Data   |
| 🇺🇸  | S&P 500 (ETF)     | `SPY`           | US     | TwelveData            |
| 🇺🇸  | DJI (ETF)         | `DIA`           | US     | TwelveData            |

### Output Fields

| Field   | Description                                      |
|---------|--------------------------------------------------|
| Close   | Last available daily closing price               |
| WeekPct | % change vs close 5 trading days ago            |
| MonthPct | % change vs close 22 trading days ago          |

### Data Sources

| Market | API                | Endpoint                            | Notes                                       |
|--------|--------------------|-------------------------------------|---------------------------------------------|
| US     | TwelveData         | `/time_series`                      | Daily candles, 252 days                     |
| SE     | EOD Historical Data | `/eod`                             | Daily candles, 252 days, end-of-day only   |

> **Note:** EOD Historical Data on the free plan only provides end-of-day prices. SE data is always the previous day's close, never intraday. This is acceptable for a weekly digest.

---

## How-to Guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-index-weekly-digest**
3. Click **Run workflow** → **Run workflow**

### How to add a US index

Add an entry to `$Indices` and use TwelveData:

```powershell
@{ Name = "Nasdaq (ETF)"; Ticker = "QQQ"; Market = "US" }
```

### How to add a Swedish or Nordic index

Add an entry with `Market = "SE"` and an EODHD ticker:

```powershell
@{ Name = "OMXS Small Cap"; Ticker = "OMXSSC.INDX"; Market = "SE" }
```

The `Get-SeWeeklyData` function handles SE/DK/Nordic tickers automatically.

### How to change the report day or time

Update the cron expression under `schedule`:

```yaml
schedule:
  - cron: '53 10 * * 0'   # 0 = Sunday, 10:53 UTC
```

---

## Explanation

### Why two data sources

TwelveData has limited or no coverage of Nasdaq Stockholm index tickers on the free plan. EOD Historical Data covers Nordic exchanges reliably and is free for end-of-day data. US tickers remain on TwelveData since they are already configured and reliable there.

### Why OMXSPI and OMXS30 are both tracked

- **OMXS30** — The 30 most traded Swedish large caps. The headline index for Swedish market sentiment, widely referenced in financial media.
- **OMXSPI** — All listed stocks on Nasdaq Stockholm (~350 companies). Broader market view, slower moving, useful for comparing breadth vs the large-cap index.

### Why the digest runs on Sunday

Markets are closed on Sunday, so the data reflects the completed trading week (Friday's close). Running Friday evening (after US close) is an alternative if more timely results are needed.