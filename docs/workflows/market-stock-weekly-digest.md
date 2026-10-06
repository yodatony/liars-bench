# Workflow documentation: market-stock-weekly-digest
**Workflow file:** [.github/workflows/market-stock-weekly-digest.yml](../../.github/workflows/market-stock-weekly-digest.yml)
**Last reviewed date:** 2026-10-06

## Intro
The `market-stock-weekly-digest` workflow fetches weekly performance metrics for a customized list of global stocks across US, Swedish, and Danish markets. It computes returns across multiple timeframes (1 week, 1 month, 6 months, and 1 year) and publishes a formatted digest message directly to a Telegram channel.

---

## Tutorials

### First-time Setup Walkthrough

To get the market stock weekly digest running in your own repository, follow these steps:

1. **Create the workflow file:**
   Create a new file in your repository at `.github/workflows/market-stock-weekly-digest.yml` and copy the workflow YAML content into it.

2. **Configure required secrets:**
   Go to your GitHub repository settings under **Settings** → **Secrets and variables** → **Actions**, and add the following repository secrets:
   - `TELEGRAM_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TWELVEDATA_KEY`
   - `EODHD_KEY`

3. **Test the workflow:**
   Navigate to the **Actions** tab in GitHub, select the **market-stock-weekly-digest** workflow, and click **Run workflow** to perform a manual test run and verify that the message arrives in your Telegram chat.

---

## How-to guides

### How to run manually

1. Go to the repository on GitHub
2. Click **Actions** → **market-stock-weekly-digest**
3. Click **Run workflow** → **Run workflow**

### How to add a US ticker

Add an entry to `$Indices` with `Market = "US"`:

```powershell
@{ Name = "Apple"; Ticker = "AAPL"; Market = "US"; Own = $false }
```

### How to add a Swedish stock

Add an entry with `Market = "SE"`, `Own = $true/$false`, and the Nasdaq Stockholm ticker (`.ST` suffix):

```powershell
@{ Name = "Ericsson B"; Ticker = "ERIC-B.ST"; Market = "SE"; Own = $false }
```

### How to add a Danish stock

Add an entry with `Market = "DK"`, `Own = $true/$false`, and the Copenhagen ticker (`.CO` suffix):

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

## Reference

### Triggers

| Trigger | Details |
|---|---|
| `workflow_dispatch` | Manual trigger from the GitHub Actions UI |
| `schedule` | Every Sunday at 05:57 UTC |

### Required Secrets

| Secret | Purpose |
|---|---|
| `TELEGRAM_TOKEN` | Bot token for the Telegram API |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID |
| `TWELVEDATA_KEY` | API key for TwelveData (US stocks) |
| `EODHD_KEY` | API key for EOD Historical Data (SE and DK stocks) |

### Tracked Instruments

| Name | Ticker | Market | Own |
|---|---|---|---|
| ATCO B | `ATCO-B.ST` | SE | True |
| LATO B | `LATO-B.ST` | SE | False |
| INVE B | `INVE-B.ST` | SE | True |
| VOLV B | `VOLV-B.ST` | SE | False |
| SAAB B | `SAAB-B.ST` | SE | False |
| SWED A | `SWED-A.ST` | SE | False |
| SHB A | `SHB-A.ST` | SE | False |
| SEB A | `SEB-A.ST` | SE | True |
| EVO | `EVO.ST` | SE | True |
| Novo B | `NOVO-B.CO` | DK | True |
| AVGO | `AVGO` | US | True |
| AAPL | `AAPL` | US | False |
| MSFT | `MSFT` | US | True |
| AMZN | `AMZN` | US | False |
| GOOGL | `GOOGL` | US | False |
| TSLA | `TSLA` | US | True |
| NOW | `NOW` | US | True |

### Output Fields

| Field | Description |
|---|---|
| Close | Last available daily closing price rounded to 2 decimal places |
| WeekPct | Percentage change vs close 5 trading days ago |
| MonthPct | Percentage change vs close 21 trading days ago |
| SixMoPct | Percentage change vs close 126 trading days ago |
| YearPct | Percentage change vs close 252 trading days ago |

### Data Sources

| Market | API | Endpoint | Notes |
|---|---|---|---|
| US | TwelveData | `/time_series` | Daily candles, interval 1day, 253 output size |
| SE / DK | EOD Historical Data | `/eod` | Daily candles, format json, order descending, limit 253 |

> **Note:** SE and DK tickers use EOD Historical Data which only provides end-of-day prices on the free plan. This is appropriate for a weekly digest.

---

## Explanation

### Why Novo Nordisk uses `.CO` not `.ST`

Novo Nordisk is a Danish company primarily listed on Nasdaq Copenhagen. While it trades as an ADR and on other exchanges, the `.CO` ticker (`NOVO-B.CO`) gives the native Copenhagen listing price in DKK, which is the most accurate source.

### Why SE and DK share the same data function

Both Nasdaq Stockholm and Nasdaq Copenhagen operate in the same timezone (CET/CEST), have the same trading hours, and are both served by EOD Historical Data. There is no functional difference in how their data is fetched or processed.

### Why this digest runs 1 hour after the index digest

The two workflows share the same Telegram channel. Staggering them by one hour prevents messages from arriving at the same time and keeps the output readable.