# Workflow documentation: market-us-hourly-update
**Workflow file:** [.github/workflows/market-us-hourly-update.yml](../../.github/workflows/market-us-hourly-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers

| Trigger | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org. |

### Secrets

| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token used to authenticate with the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID where the market update message is sent. |
| `TWELVEDATA_KEY` | API key for authenticating requests to the Twelve Data API. |

### Tickers / Instruments

| Name | Ticker | Market | Portfolio Own (`Own`) |
| :--- | :--- | :--- | :--- |
| DJI (ETF) | DIA | US | `false` |
| DJUS (ETF) | IYY | US | `false` |
| S&P 500 (ETF) | SPY | US | `false` |
| MSFT | MSFT | US | `true` |
| NOW | NOW | US | `true` |
| TSLA | TSLA | US | `true` |
| AVGO | AVGO | US | `true` |

### API / Data Sources

| Provider | Endpoint / URL | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={TWELVEDATA_KEY}` | Fetches real-time quote data, current price, percent change, and datetime for each instrument. |
| Telegram Bot API | `https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage` | Delivers the formatted HTML market update message to the specified chat. |

### Output Fields

| Field / Variable | Description |
| :--- | :--- |
| `Current` | Rounded current price of the instrument. |
| `DayPct` | Rounded percentage change for the day. |
| `Date` | Date associated with the latest trading candle data retrieved. |
| `UsMarketOpen` | Boolean status indicating whether the US market is currently open based on CET time and weekdays. |
| `IsMarketClose` | Boolean status indicating if the current time matches the US market close schedule (22:00 CET). |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to your repository on GitHub.
2. Click on the **Actions** tab.
3. Select the **market-us-hourly-update** workflow from the left-hand sidebar.
4. Click the **Run workflow** dropdown button and confirm by clicking **Run workflow**.

### How to add a new ticker to track
1. Open the workflow file at `.github/workflows/market-us-hourly-update.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hashtable entry with the instrument's display `Name`, `Ticker`, `Market`, and whether it is part of your portfolio (`Own = $true` or `$false`):
   ```powershell
   @{ Name = "NEW"; Ticker = "NEW"; Market = "US"; Own = $true }
   ```
4. Commit and push your changes to the repository.

### How to update required secrets
1. Go to your GitHub repository settings.
2. Navigate to **Secrets and variables** > **Actions**.
3. Locate or create the required repository secrets (`TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, and `TWELVEDATA_KEY`).
4. Update their values as needed.

---

## Explanation

### Design Decisions and Reasoning

- **PowerShell Runtime (`pwsh`):** PowerShell is used as the execution shell on the `ubuntu-latest` runner because it provides robust object manipulation, clean syntax for hashtables and arrays, and native error handling via `try/catch` blocks when interfacing with REST APIs.
- **Timezone Awareness (`Europe/Stockholm`):** Market schedules and message timestamps are evaluated in Central European Time (CET) to align local monitoring schedules with US market hours correctly.
- **Holiday and Weekend Skipping:** The script extracts the trading date (`$CandleDate`) returned by the Twelve Data API and compares it against the current local date (`$TodayDate`). If trading did not occur on that day (e.g., market holidays or weekends), the workflow gracefully exits without sending an outdated or empty update.
- **Conditional Formatting:** Visual indicators (circles, arrows, and portfolio briefcases `💼`) are dynamically adjusted depending on whether the US market is currently open or closed, ensuring clear context for intraday versus closing data.
- **External Scheduling via `workflow_dispatch`:** By exposing a manual dispatch trigger rather than a native GitHub Actions cron schedule, the workflow relies on an external scheduler (cron-job.org) to handle precise timing intervals.