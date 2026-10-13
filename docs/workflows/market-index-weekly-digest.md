# Workflow documentation: market-index-weekly-digest
**Workflow file:** [.github/workflows/market-index-weekly-digest.yml](../../.github/workflows/market-index-weekly-digest.yml)

**Last reviewed date:** 2026-10-13

## Intro
The `market-index-weekly-digest` workflow fetches latest closing prices and percentage changes for key US and Swedish market indices on a weekly schedule. It computes 1-week, 1-month, 6-month, and 1-year performance metrics, formats the summary into an HTML-styled Telegram message, and delivers the digest directly to a configured chat.

## Tutorials

### Running Your First Weekly Market Digest
This tutorial walks you through setting up and running the market index weekly digest workflow for the first time.

1. **Verify Repository Secrets**: Ensure that `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, `TWELVEDATA_KEY`, and `EODHD_KEY` are configured in your GitHub repository settings under **Settings** > **Secrets and variables** > **Actions**.
2. **Trigger the Workflow Manually**: 
   - Navigate to your repository on GitHub.
   - Click the **Actions** tab.
   - Select the **market-index-weekly-digest** workflow from the left sidebar.
   - Click **Run workflow** and confirm.
3. **Verify Execution**: Watch the job run in the GitHub Actions log to ensure it completes successfully without errors.
4. **Check Output**: Open your Telegram client and verify that the formatted market digest message arrived in your configured chat or channel.

## How-to Guides

### How to run manually
1. Go to the repository on GitHub.
2. Click **Actions** → **market-index-weekly-digest**.
3. Click **Run workflow** → **Run workflow**.

### How to add a US index
Add an entry to the `$Indices` array using the TwelveData provider format:
```powershell
@{ Name = "Nasdaq (ETF)"; Ticker = "QQQ"; Market = "US" }
```

### How to add a Swedish or Nordic index
Add an entry with `Market = "SE"` and an EODHD ticker:
```powershell
@{ Name = "OMXS Small Cap"; Ticker = "OMXSSC.INDX"; Market = "SE" }
```
The `Get-SeWeeklyData` function handles SE/DK/Nordic tickers automatically via EOD Historical Data.

### How to change the report day or time
Update the cron expression under the `schedule` trigger in `.github/workflows/market-index-weekly-digest.yml`:
```yaml
schedule:
  - cron: '53 10 * * 0'   # 0 = Sunday, 10:53 UTC
```

## Reference

### Triggers

| Trigger | Details |
| :--- | :--- |
| `schedule` | Every Sunday at 05:53 UTC |
| `workflow_dispatch` | Manual trigger from the GitHub Actions UI |

### Required Secrets

| Secret | Purpose |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token for authenticating with the Telegram API |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID for message delivery |
| `TWELVEDATA_KEY` | API key for fetching US index data from TwelveData |
| `EODHD_KEY` | API key for fetching Swedish index data from EOD Historical Data |

### Tracked Instruments

| Flag | Name | Ticker | Market | Data Source |
| :--- | :--- | :--- | :--- | :--- |
| 🇸🇪 | OMXSPI | `OMXSPI.INDX` | SE | EOD Historical Data |
| 🇸🇪 | OMXS30GI | `OMXS30GI.INDX` | SE | EOD Historical Data |
| 🇸🇪 | OMXS30 | `OMXS30.INDX` | SE | EOD Historical Data |
| 🇺🇸 | S&P 500 (ETF) | `SPY` | US | TwelveData |
| 🇺🇸 | DJUS (ETF) | `IYY` | US | TwelveData |
| 🇺🇸 | DJI (ETF) | `DIA` | US | TwelveData |

### Output Fields

| Field | Description |
| :--- | :--- |
| Close | Last available daily closing price |
| WeekPct | Percentage change vs close 5 trading days ago |
| MonthPct | Percentage change vs close 21 trading days ago |
| SixMoPct | Percentage change vs close 126 trading days ago |
| YearPct | Percentage change vs close 252 trading days ago |

### Data Sources

| Market | API | Endpoint | Notes |
| :--- | :--- | :--- | :--- |
| US | TwelveData | `/time_series` | Daily candles, 252 days history |
| SE | EOD Historical Data | `/eod` | Daily candles, 252 days history, end-of-day only |

> **Note:** EOD Historical Data on the free plan provides end-of-day prices. Swedish data is always the previous day's close, which is acceptable for a weekly digest.

## Explanation

### Design Decisions and Rationale

#### Why two data sources
TwelveData has limited or no coverage of Nasdaq Stockholm index tickers on its free plan. EOD Historical Data covers Nordic exchanges reliably and provides robust end-of-day data. US tickers remain on TwelveData since they are already integrated and perform reliably there.

#### Why multiple indices are tracked
- **OMXS30 & OMXS30GI**: OMXS30 tracks the 30 most traded Swedish large caps as a headline sentiment index, while OMXS30GI accounts for gross index returns (dividends reinvested).
- **OMXSPI**: Covers all listed stocks on Nasdaq Stockholm (~350 companies), offering a broader market view to compare breadth against large-cap performance.
- **US ETFs (SPY, IYY, DIA)**: Provides a quick snapshot of US large-cap, broad-market, and price-weighted industrial sentiment alongside domestic holdings.

#### Why the digest runs on Sunday
Markets are closed on Sunday, allowing the workflow to process the fully completed trading week (Friday's close). Running just before the new week begins ensures all historical close calculations for 1W, 1M, 6M, and 1Y are stable and final.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Workflow Execution Flow
    accDescr: Visualizes how triggers initiate the PowerShell script to fetch data from APIs and deliver the digest to Telegram.

    subgraph Triggers
        A1[Schedule: Sunday 05:53 UTC]
        A2[Manual: workflow_dispatch]
    end

    subgraph Job: send-digest
        B[Initialize PowerShell & Timezone] --> C[Iterate Indices Array]
        C --> D{Market Type?}
        D -- SE --> E[Fetch EODHD API]
        D -- US --> F[Fetch TwelveData API]
        E --> G[Calculate Performance Metrics]
        F --> G
        G --> H[Sort by Weekly Return]
        H --> I[Build HTML Message Body]
        I --> J[Send via Telegram Bot API]
    end

    A1 --> B
    A2 --> B