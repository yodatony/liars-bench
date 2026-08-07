# Workflow documentation: market-stock-weekly-digest
**Workflow file:** [.github/workflows/market-stock-weekly-digest.yml](../../.github/workflows/market-stock-weekly-digest.yml)  
**Last reviewed date:** 2026-05-01

---

## Reference

### Triggers

| Trigger              | Details                                 |
|----------------------|-----------------------------------------|
| `schedule`           | Every Sunday at 11:57 UTC (13:57 CEST)|
| `workflow_dispatch`  | Manual trigger from the GitHub Actions UI |

### Required Secrets

| Secret                | Purpose                                 |
|-----------------------|-----------------------------------------|
| `TELEGRAM_TOKEN`      | Bot token for the Telegram API         |
| `TELEGRAM_CHAT_ID`    | Target chat or channel ID               |
| `TWELVEDATA_KEY`      | API key for TwelveData (US stocks and Crypto) |
| `EODHD_KEY`           | API key for EOD Historical Data (SE and DK stocks) |

### Tracked Instruments

| Flag | Name               | Ticker      | Market | Data Source          |
|------|--------------------|-------------|--------|-----------------------|
| 🇸🇪  | ATCO B             | `ATCO-B.ST` | SE     | EOD Historical Data    |
| 🇸🇪  | INVE B             | `INVE-B.ST` | SE     | EOD Historical Data    |
| 🇸🇪  | VOLV B             | `VOLV-B.ST` | SE     | EOD Historical Data    |
| 🇸🇪  | SAAB B             | `SAAB-B.ST` | SE     | EOD Historical Data    |
| 🇸🇪  | SWED A             | `SWED-A.ST` | SE     | EOD Historical Data    |
| 🇸🇪  | SHB A              | `SHB-A.ST`  | SE     | EOD Historical Data    |
| 🇸🇪  | SBB B              | `SBB-B.ST`  | SE     | EOD Historical Data    |
| 🇸🇪  | SSAB B             | `SSAB-B.ST` | SE     | EOD Historical Data    |
| 🇩🇰  | Novo B             | `NOVO-B.CO` | DK     | EOD Historical Data    |
| 🇺🇸  | NVDA               | `NVDA`      | US     | TwelveData            |
| 🇺🇸  | AAPL               | `AAPL`      | US     | TwelveData            |
| 🇺🇸  | MSFT               | `MSFT`      | US     | TwelveData            |
| 🇺🇸  | AMZN               | `AMZN`      | US     | TwelveData            |
| 🇺🇸  | GOOGL              | `GOOGL`     | US     | TwelveData            |
| 🇺🇸  | TSLA               | `TSLA`      | US     | TwelveData            |

### Output Fields

| Field   | Description                              |
|---------|------------------------------------------|
| Close   | Last available daily closing price      |
| WeekPct | % change vs close 5 trading days ago    |
| MonthPct| % change vs close 21 trading days ago   |

### Data Sources

| Market    | API                  | Endpoint                   | Notes                                           |
|----------|----------------------|----------------------------|-------------------------------------------------|
| US / Crypto | TwelveData         | `/time_series`             | Daily candles, 252 days                         |
| SE / DK  | EOD Historical Data   | `/eod`                     | Daily candles, 252 days, end-of-day only       |

> **Note:** SE and DK tickers use EOD Historical Data, which only provides end-of-day prices on the free plan. This is appropriate for a weekly digest.

---

## How-to Guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-stock-weekly-digest**
3. Click **Run workflow** → **Run workflow**

### How to add a US or Crypto ticker

Add an entry to `$Indices`:

```powershell
@{ Name = "Tesla"; Ticker = "TSLA"; Market = "US" }
```

For crypto:

```powershell
@{ Name = "Ethereum"; Ticker = "ETH/USD"; Market = "CRYPTO" }
```

### How to add a Swedish stock

Add an entry with `Market = "SE"` and the Nasdaq Stockholm ticker (`.ST` suffix):

```powershell
@{ Name = "Ericsson B"; Ticker = "ERIC-B.ST"; Market = "SE" }
```

### How to add a Danish stock

Add an entry with `Market = "DK"` and the Copenhagen ticker (`.CO` suffix):

```powershell
@{ Name = "A.P. Møller"; Ticker = "MAERSK-B.CO"; Market = "DK" }
```

Both `SE` and `DK` are routed through `Get-SeWeeklyData` (EOD Historical Data).

### How to change the report day or time

Update the cron expression under `schedule`:

```yaml
schedule:
  - cron: '53 11 * * 0'   # 0 = Sunday, 11:53 UTC
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