# Workflow documentation: market-stock-weekly-digest
**Workflow file:** [.github/workflows/market-stock-weekly-digest.yml](../../.github/workflows/market-stock-weekly-digest.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers

| Trigger | Details |
|---|---|
| `schedule` | Every Sunday at 05:57 UTC |
| `workflow_dispatch` | Manual trigger from the GitHub Actions UI |

### Required Secrets

| Secret | Purpose |
|---|---|
| `TELEGRAM_TOKEN` | Bot token for the Telegram API |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID |
| `TWELVEDATA_KEY` | API key for TwelveData (US stocks) |
| `EODHD_KEY` | API key for EOD Historical Data (SE and DK stocks) |

### Tracked Instruments

| Flag | Name | Ticker | Market | Own | Data Source |
|---|---|---|---|---|---|
| 🇸🇪 | ATCO B | `ATCO-B.ST` | SE | true | EOD Historical Data |
| 🇸🇪 | LATO B | `LATO-B.ST` | SE | false | EOD Historical Data |
| 🇸🇪 | INVE B | `INVE-B.ST` | SE | true | EOD Historical Data |
| 🇸🇪 | VOLV B | `VOLV-B.ST` | SE | false | EOD Historical Data |
| 🇸🇪 | SAAB B | `SAAB-B.ST` | SE | false | EOD Historical Data |
| 🇸🇪 | SWED A | `SWED-A.ST` | SE | false | EOD Historical Data |
| 🇸🇪 | SHB A | `SHB-A.ST` | SE | false | EOD Historical Data |
| 🇸🇪 | SEB A | `SEB-A.ST` | SE | true | EOD Historical Data |
| 🇸🇪 | EVO | `EVO.ST` | SE | true | EOD Historical Data |
| 🇩🇰 | Novo B | `NOVO-B.CO` | DK | true | EOD Historical Data |
| 🇺🇸 | AVGO | `AVGO` | US | true | TwelveData |
| 🇺🇸 | AAPL | `AAPL` | US | false | TwelveData |
| 🇺🇸 | MSFT | `MSFT` | US | true | TwelveData |
| 🇺🇸 | AMZN | `AMZN` | US | false | TwelveData |
| 🇺🇸 | GOOGL | `GOOGL` | US | false | TwelveData |
| 🇺🇸 | TSLA | `TSLA` | US | true | TwelveData |
| 🇺🇸 | NOW | `NOW` | US | true | TwelveData |

### Output Fields

| Field | Description |
|---|---|
| Close | Last available daily closing price |
| WeekPct | % change vs close 5 trading days ago |
| MonthPct | % change vs close 21 trading days ago |
| SixMoPct | % change vs close 126 trading days ago |
| YearPct | % change vs close 252 trading days ago |

### Data Sources

| Market | API | Endpoint | Notes |
|---|---|---|---|
| US | TwelveData | `/time_series` | Daily candles, 253 days |
| SE / DK | EOD Historical Data | `/eod` | Daily candles, 253 days, end-of-day only |

> **Note:** SE and DK tickers use EOD Historical Data which only provides end-of-day prices on the free plan. This is appropriate for a weekly digest.

---

## How-to Guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-stock-weekly-digest**
3. Click **Run workflow** → **Run workflow**

### How to add a US or Crypto ticker

Add an entry to `$Indices`:

```powershell
@{ Name = "Tesla"; Ticker = "TSLA"; Market = "US"; Own = $true }
```

For crypto:

```powershell
@{ Name = "Ethereum"; Ticker = "ETH/USD"; Market = "CRYPTO"; Own = $false }
```

### How to add a Swedish stock

Add an entry with `Market = "SE"` and the Nasdaq Stockholm ticker (`.ST` suffix):

```powershell
@{ Name = "Ericsson B"; Ticker = "ERIC-B.ST"; Market = "SE"; Own = $false }
```

### How to add a Danish stock

Add an entry with `Market = "DK"` and the Copenhagen ticker (`.CO` suffix):

```powershell
@{ Name = "A.P. Møller"; Ticker = "MAERSK-B.CO"; Market = "DK"; Own = $false }
```

Both `SE` and `DK` are routed through `Get-SeWeeklyData` (EOD Historical Data).

### How to change the report day or time

Update the cron expression under `schedule`:

```yaml
schedule:
  - cron: '57 5 * * 0'   # 0 = Sunday, 05:57 UTC
```

---

## Explanation

### Why Novo Nordisk uses `.CO` not `.ST`

Novo Nordisk is a Danish company primarily listed on Nasdaq Copenhagen. While it trades as an ADR and on other exchanges, the `.CO` ticker (`NOVO-B.CO`) gives the native Copenhagen listing price in DKK, which is the most accurate source.

### Why SE and DK share the same data function

Both Nasdaq Stockholm and Nasdaq Copenhagen operate in the same timezone (CET/CEST), have the same trading hours, and are both served by EOD Historical Data. There is no functional difference in how their data is fetched or processed.

### Why this digest runs 1 hour after the index digest

The two workflows share the same Telegram channel. Staggering them by one hour prevents messages from arriving at the same time and keeps the output readable.

### Why TwelveData is used for Crypto

Crypto pairs like `BTC/USD` are natively supported by TwelveData and already covered by the existing API key. No additional service is needed.