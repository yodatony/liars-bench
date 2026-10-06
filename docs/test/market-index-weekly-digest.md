# Workflow documentation: market-index-weekly-digest
**Workflow file:** [.github/workflows/market-index-weekly-digest.yml](../../.github/workflows/market-index-weekly-digest.yml)
**Last reviewed date:** 2026-10-06

## Intro
The `market-index-weekly-digest` workflow automates the retrieval of key global and Swedish financial market index performance data on a weekly schedule. It processes closing prices and percentage changes across multiple timeframes (1-week, 1-month, 6-month, and 1-year) and formats the results into an HTML-styled digest sent directly via Telegram.

## Tutorials

### Getting Started End-to-End
Follow these steps to set up and run the market index weekly digest workflow for the first time:

1. **Configure Repository Secrets**
   Navigate to your GitHub repository's **Settings > Secrets and variables > Actions** and add the following secrets required by the workflow:
   - `TELEGRAM_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TWELVEDATA_KEY`
   - `EODHD_KEY`

2. **Verify Workflow File Location**
   Ensure the workflow file is placed at `.github/workflows/market-index-weekly-digest.yml`.

3. **Manually Trigger the Workflow**
   - Go to the **Actions** tab in your GitHub repository.
   - Select the `market-index-weekly-digest` workflow from the left sidebar.
   - Click the **Run workflow** dropdown button and trigger it on the main branch to test execution and verify that the digest message arrives in your Telegram chat.

---

## How-to guides

### How to Add or Modify Tracked Indices
To adjust the list of indexes and ETFs tracked by the digest:
1. Open `.github/workflows/market-index-weekly-digest.yml`.
2. Locate the `$Indices` array inside the PowerShell step:
   ```powershell
   $Indices = @(
       @{ Name = "OMXSPI";        Ticker = "OMXSPI.INDX"; Market = "SE" }
       @{ Name = "OMXS30GI";     Ticker = "OMXS30GI.INDX"; Market = "SE" }
       @{ Name = "OMXS30";        Ticker = "OMXS30.INDX"; Market = "SE" }
       @{ Name = "S&P 500 (ETF)"; Ticker = "SPY";         Market = "US" }
       @{ Name = "DJUS (ETF)";       Ticker = "IYY"; Market = "US" }
       @{ Name = "DJI (ETF)";     Ticker = "DIA";         Market = "US" }
   )
   ```
3. Add a new hashtable entry or modify an existing one, specifying `Name`, `Ticker`, and `Market` (`SE` for EODHD Swedish feeds, or `US` for Twelve Data feeds).
4. Commit and push your changes.

### How to Change the Execution Schedule
To modify when the weekly digest is automatically sent:
1. Open `.github/workflows/market-index-weekly-digest.yml`.
2. Locate the `schedule` cron configuration under the `on` trigger:
   ```yaml
   on:
     workflow_dispatch:
     schedule:
       - cron: '53 5 * * 0'
   ```
3. Update the cron expression to your desired schedule (note that GitHub Actions runs scheduled workflows in UTC).
4. Save and commit the changes.

---

## Reference

### Triggers
| Trigger Type | Syntax / Details | Description |
| :--- | :--- | :--- |
| `workflow_dispatch` | N/A | Allows manual execution of the workflow from the GitHub Actions UI. |
| `schedule` | `- cron: '53 5 * * 0'` | Automatically triggers the workflow every Sunday at 05:53 UTC. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Telegram Bot API token used to authenticate message delivery. |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where the digest is posted. |
| `TWELVEDATA_KEY` | API key for fetching US and international market data from Twelve Data. |
| `EODHD_KEY` | API key for fetching Swedish market data from EOD Historical Data. |

### Tickers and Instruments Table
| Name | Ticker | Market | Data Provider |
| :--- | :--- | :--- | :--- |
| `OMXSPI` | `OMXSPI.INDX` | `SE` | EODHD |
| `OMXS30GI` | `OMXS30GI.INDX` | `SE` | EODHD |
| `OMXS30` | `OMXS30.INDX` | `SE` | EODHD |
| `S&P 500 (ETF)` | `SPY` | `US` | Twelve Data |
| `DJUS (ETF)` | `IYY` | `US` | Twelve Data |
| `DJI (ETF)` | `DIA` | `US` | Twelve Data |

### Output Fields
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `Name` | String | Display name of the index or ETF. |
| `Flag` | String | Emoji flag representing the market region (`🇸🇪`, `🇺🇸`). |
| `Close` | Double | Rounded closing price of the latest trading session. |
| `WeekPct` | Double / Null | Percentage change over the trailing 5 trading days. |
| `MonthPct` | Double / Null | Percentage change over the trailing 21 trading days (~1 month). |
| `SixMoPct` | Double / Null | Percentage change over the trailing 126 trading days (~6 months). |
| `YearPct` | Double / Null | Percentage change over the trailing 252 trading days (~1 year). |
| `Error` | Boolean | True if data fetching failed for the instrument. |

### API / Data Sources
| Provider | Base URL / Endpoint | Purpose |
| :--- | :--- | :--- |
| **Twelve Data** | `https://api.twelvedata.com/time_series` | Retrieves daily historical time series data for US-market ETFs and indices. |
| **EODHD** | `https://eodhd.com/api/eod/` | Retrieves end-of-day historical prices for Swedish market indices. |
| **Telegram Bot API** | `https://api.telegram.org/bot<TOKEN>/sendMessage` | Delivers the formatted HTML digest message to the configured chat. |

---

## Explanation

### Design Decisions and Architecture
- **PowerShell Execution Environment:** The workflow utilizes PowerShell (`shell: pwsh`) running on an Ubuntu runner. This enables robust data manipulation, structured object handling (`[PSCustomObject]`), and clean error-handling blocks within a single script block.
- **Dual Data Provider Strategy:** Different markets require specialized providers to ensure accurate historical index tracking. EODHD is leveraged for specialized Swedish index feeds (`.INDX`), while Twelve Data handles standard US equity ETFs.
- **Resilient Error Isolation:** Individual index queries are wrapped in `try/catch` blocks. If a single provider or symbol request fails, the error is caught, flagged (`Error = $true`), and rendered gracefully as an unavailable notice (`⚠️`) without aborting the entire workflow run.
- **Dynamic Percentage Calculations:** Historical offsets are calculated dynamically based on available array lengths (`$N`), ensuring reliable percentage returns even if fewer trading days are returned by the APIs than expected. Results are automatically sorted in descending order by weekly percentage performance to highlight top movers.