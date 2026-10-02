# Workflow documentation: market-stock-1d-update
**Workflow file:** [.github/workflows/market-stock-1d-update.yml](../../.github/workflows/market-stock-1d-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers

| Trigger | Type | Description |
| :--- | :--- | :--- |
| `workflow_dispatch` | Manual / External | Triggered externally on schedule via cron-job.org. |

### Secrets

| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token used to authenticate requests against the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID where the daily market review message is sent. |
| `EODHD_KEY` | API key for authenticating requests to the EOD Historical Data service. |
| `TWELVEDATA_KEY` | API key for authenticating requests to the Twelve Data financial API. |

### Tickers / Instruments

| Name | Ticker | Market | Own Status | Data Provider |
| :--- | :--- | :--- | :--- | :--- |
| ATCO B | `ATCO-B.ST` | SE | `true` | EODHD (`Get-EodData`) |
| LATO B | `LATO-B.ST` | SE | `false` | EODHD (`Get-EodData`) |
| INVE B | `INVE-B.ST` | SE | `true` | EODHD (`Get-EodData`) |
| VOLV B | `VOLV-B.ST` | SE | `false` | EODHD (`Get-EodData`) |
| SAAB B | `SAAB-B.ST` | SE | `false` | EODHD (`Get-EodData`) |
| SWED A | `SWED-A.ST` | SE | `false` | EODHD (`Get-EodData`) |
| SHB A | `SHB-A.ST` | SE | `false` | EODHD (`Get-EodData`) |
| SEB A | `SEB-A.ST` | SE | `true` | EODHD (`Get-EodData`) |
| EVO | `EVO.ST` | SE | `true` | EODHD (`Get-EodData`) |
| Novo B | `NOVO-B.CO` | DK | `true` | EODHD (`Get-EodData`) |
| AVGO | `AVGO` | US | `true` | Twelve Data (`Get-TwelveData`) |
| AAPL | `AAPL` | US | `false` | Twelve Data (`Get-TwelveData`) |
| MSFT | `MSFT` | US | `true` | Twelve Data (`Get-TwelveData`) |
| AMZN | `AMZN` | US | `false` | Twelve Data (`Get-TwelveData`) |
| GOOGL | `GOOGL` | US | `false` | Twelve Data (`Get-TwelveData`) |
| TSLA | `TSLA` | US | `true` | Twelve Data (`Get-TwelveData`) |
| NOW | `NOW` | US | `true` | Twelve Data (`Get-TwelveData`) |

### Output Fields

| Field Name | Description |
| :--- | :--- |
| `Name` | Display name of the stock or index. |
| `Flag` | Emoji flag representing the market region (`🇸🇪` for SE, `🇩🇰` for DK, `🇺🇸` for US). |
| `Close` | The rounded closing price for the target trading day. |
| `DayPct` | The percentage change in price compared to the previous trading day, rounded to 2 decimal places. |
| `Date` | The calendar date of the price quote (`YYYY-MM-DD`). |
| `Own` | Boolean indicator (`true`/`false`) of whether the instrument is held in the portfolio (rendered as `💼`). |
| `Error` | Boolean flag indicating if data retrieval failed for the instrument during execution. |

### API / Data Sources

| Source | Endpoint / Method | Purpose |
| :--- | :--- | :--- |
| EODHD | `https://eodhd.com/api/eod/{Ticker}` | Retrieves end-of-day pricing data for Swedish (`.ST`) and Danish (`.CO`) equities. |
| Twelve Data | `https://api.twelvedata.com/quote` | Retrieves real-time and end-of-day quote metrics for US equities. |
| Telegram Bot API | `https://api.telegram.org/bot{Token}/sendMessage` | Delivers the formatted HTML daily market digest to the designated chat ID. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to your repository on GitHub and click on the **Actions** tab.
2. Select the **market-stock-1d-update** workflow from the left sidebar.
3. Click the **Run workflow** dropdown button.
4. Select the branch and click **Run workflow** to execute it on-demand.

### How to add a new stock ticker
1. Open the workflow file at `.github/workflows/market-stock-1d-update.yml`.
2. Locate the `$Indices` array inside the PowerShell step.
3. Add a new hashtable entry with the instrument's details following this schema:
   ```powershell
   @{ Name = "DISPLAY_NAME"; Ticker = "SYMBOL"; Market = "SE"|"DK"|"US"; Own = $true|$false }
   ```
4. Commit and push your changes to the repository. Ensure the market type (`SE`, `DK`, or `US`) maps correctly to either the EODHD or Twelve Data fetch functions.

### How to configure required secrets
1. Go to your GitHub repository settings.
2. Navigate to **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add each of the required secrets (`TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, `EODHD_KEY`, `TWELVEDATA_KEY`) with their corresponding API credentials or chat identifiers.

---

## Explanation

### Design decisions and architecture

- **External Cron Triggers (`workflow_dispatch`)**: 
  The workflow relies exclusively on the `workflow_dispatch` event rather than GitHub Actions' native cron scheduler. This design decision avoids the well-documented unreliability and lag of GitHub's built-in scheduler, allowing external services like cron-job.org to execute the workflow precisely when required.

- **Split Data Providers**: 
  Nordic tickers (`.ST`, `.CO`) utilize EODHD due to reliable regional historical coverage, while US tickers rely on Twelve Data. Encapsulating fetching logic inside discrete PowerShell functions (`Get-EodData` and `Get-TwelveData`) isolates API schema differences and error handling.

- **Date Filtering & Sorting**: 
  The script calculates the target date as the previous calendar day relative to the local Europe/Stockholm time zone. Results are filtered to ensure only data matching that specific trading day is reported, and then sorted in descending order by percentage change (`DayPct`) to highlight top performers at the top of the message.

- **Resilient Error Handling**: 
  Individual ticker requests are wrapped in `try/catch` blocks. If a provider API fails or returns insufficient data for a specific instrument, the workflow catches the exception, marks the record with an error flag, and continues processing the remaining instruments rather than failing the entire run.