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
| `TELEGRAM_TOKEN` | Bot authentication token for sending messages via the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID where the daily stock update message is delivered. |
| `EODHD_KEY` | API key for fetching end-of-day market data from EODHD. |
| `TWELVEDATA_KEY` | API key for fetching real-time and quote data from Twelve Data. |

### Tickers/Instruments Table

| Name | Ticker | Market | Own Status | Data Provider |
| :--- | :--- | :--- | :--- | :--- |
| ATCO B | `ATCO-B.ST` | SE | `true` (💼) | EODHD |
| LATO B | `LATO-B.ST` | SE | `false` | EODHD |
| INVE B | `INVE-B.ST` | SE | `true` (💼) | EODHD |
| VOLV B | `VOLV-B.ST` | SE | `false` | EODHD |
| SAAB B | `SAAB-B.ST` | SE | `false` | EODHD |
| SWED A | `SWED-A.ST` | SE | `false` | EODHD |
| SHB A | `SHB-A.ST` | SE | `false` | EODHD |
| SEB A | `SEB-A.ST` | SE | `true` (💼) | EODHD |
| EVO | `EVO.ST` | SE | `true` (💼) | EODHD |
| Novo B | `NOVO-B.CO` | DK | `true` (💼) | EODHD |
| AVGO | `AVGO` | US | `true` (💼) | Twelve Data |
| AAPL | `AAPL` | US | `false` | Twelve Data |
| MSFT | `MSFT` | US | `true` (💼) | Twelve Data |
| AMZN | `AMZN` | US | `false` | Twelve Data |
| GOOGL | `GOOGL` | US | `false` | Twelve Data |
| TSLA | `TSLA` | US | `true` (💼) | Twelve Data |
| NOW | `NOW` | US | `true` (💼) | Twelve Data |

### Output Fields

| Field / Indicator | Description |
| :--- | :--- |
| `STOCK — Daily review` | Header title of the Telegram message. |
| `Previous trading day movement` | Subtitle indicating the scope of the update. |
| Flag Emoji | Regional indicator (`🇸🇪`, `🇩🇰`, `🇺🇸`) corresponding to the market. |
| Stock Name | Display name of the instrument (e.g., ATCO B, AAPL). |
| Close Price | The rounded closing price for the target trading day. |
| Day Percentage (`DayPct`) | The daily price change percentage, formatted with color emojis (`🟢` for positive/zero, `🔴` for negative). |
| Portfolio Indicator (`💼`) | Appended to items where `Own = $true`. |
| Unavailable Warning (`⚠️`) | Appended if data fetching fails for an instrument. |

### API / Data Sources

| Provider | Base URL / Endpoint | Used For |
| :--- | :--- | :--- |
| EODHD | `https://eodhd.com/api/eod/` | Nordic stocks (Sweden `SE`, Denmark `DK`). |
| Twelve Data | `https://api.twelvedata.com/quote` | US stocks (`US`). |
| Telegram Bot API | `https://api.telegram.org/bot<TOKEN>/sendMessage` | Delivering the compiled daily summary report. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to the **Actions** tab in your GitHub repository.
2. Select the **market-stock-1d-update** workflow from the sidebar.
3. Click the **Run workflow** dropdown button.
4. Confirm by clicking **Run workflow**.

### How to add a new stock ticker
1. Open `.github/workflows/market-stock-1d-update.yml`.
2. Locate the `$Indices` array inside the PowerShell step.
3. Add a new hash table entry with the required properties (`Name`, `Ticker`, `Market`, and `Own`):
   ```powershell
   @{ Name = "NEW"; Ticker = "NEW-TICKER"; Market = "US"; Own = $true }
   ```
4. Ensure the `Market` matches one of the supported routing blocks (`SE`, `DK` for EODHD; `US` for Twelve Data).
5. Commit and push the changes to the repository.

### How to configure required repository secrets
1. Go to your GitHub repository settings.
2. Navigate to **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add the following secrets required by the workflow:
   - `TELEGRAM_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `EODHD_KEY`
   - `TWELVEDATA_KEY`

---

## Explanation

### Design Decisions and Reasoning

- **PowerShell Runtime (`pwsh`) on `ubuntu-latest`**: The workflow uses PowerShell for data transformation, error handling, date math, and JSON payload construction. This provides a robust cross-platform scripting environment without requiring external custom GitHub Actions.
- **External Cron Trigger (`workflow_dispatch`)**: By relying solely on `workflow_dispatch`, external schedulers (such as cron-job.org) can invoke the workflow securely via GitHub's REST API using a Personal Access Token. This decouples scheduling constraints from GitHub's native rate limits and minute allowances.
- **Multi-Provider Data Strategy**: Different exchanges and markets have varying data availability and API strengths. Nordic equities (`SE`, `DK`) leverage EODHD for reliable end-of-day pricing, while US equities use Twelve Data for real-time quotes.
- **Date Filtering and Sorting**: The script computes the previous calendar day in the `Europe/Stockholm` timezone, filters fetched results to ensure records match that exact trading day, and sorts them in descending order by performance (`DayPct`). This guarantees that holiday or weekend gaps do not pollute the daily feed.
- **Visual Portfolios & Status Indicators**: Integrating flags, portfolio ownership tags (`💼`), and performance polarity emojis (`🟢`/`🔴`) allows quick visual scanning directly inside Telegram mobile and desktop notifications.