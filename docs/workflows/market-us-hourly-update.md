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
| `TELEGRAM_TOKEN` | Authentication token for the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Identifier for the target Telegram chat or channel. |
| `TWELVEDATA_KEY` | API key used to authenticate requests to the Twelve Data API. |

### Tickers / Instruments

| Name | Ticker | Market | Own Status |
| :--- | :--- | :--- | :--- |
| DJI (ETF) | DIA | US | False |
| DJUS (ETF) | IYY | US | False |
| S&P 500 (ETF) | SPY | US | False |
| MSFT | MSFT | US | False |
| NOW | NOW | US | False |
| TSLA | TSLA | US | False |
| AVGO | AVGO | US | False |

### Output Fields

| Field Name | Source | Description |
| :--- | :--- | :--- |
| `Current` | Twelve Data API (`close`) | Rounded current or closing price of the instrument. |
| `DayPct` | Twelve Data API (`percent_change`) | Percentage change for the day, rounded to two decimal places. |
| `Date` | Twelve Data API (`datetime`) | Date of the returned quote candle, used to verify trading activity. |

### API / Data Sources

| Provider | Endpoint / URL | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/quote` | Fetches real-time or end-of-day stock and ETF quotes. |
| Telegram Bot API | `https://api.telegram.org/bot<TOKEN>/sendMessage` | Dispatches the formatted market update message to the configured chat. |

## How-to guides

### How to trigger a manual market update
1. Navigate to your repository on GitHub and click on the **Actions** tab.
2. Select the **market-us-hourly-update** workflow from the left-hand sidebar.
3. Click the **Run workflow** dropdown button.
4. Confirm by clicking the green **Run workflow** button to execute the job immediately.

### How to add a new ticker or instrument
1. Open the workflow file at `.github/workflows/market-us-hourly-update.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hashtable entry with the required properties (`Name`, `Ticker`, `Market`, and `Own`):
   ```powershell
   @{ Name = "New Asset"; Ticker = "ABC"; Market = "US"; Own = $true }
   ```
4. Save the file and commit your changes to the repository.

### How to update required secrets
1. Go to your GitHub repository's main page and click **Settings**.
2. In the left sidebar, expand **Secrets and variables** and click **Actions**.
3. Locate the secret you wish to modify (`TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, or `TWELVEDATA_KEY`) and click the **Update** or pencil icon.
4. Enter the new value and click **Update secret**.

## Explanation

### Design Decisions

- **PowerShell Runtime (`pwsh`)**: The workflow executes using PowerShell on an `ubuntu-latest` runner. This allows for complex conditional logic, robust data manipulation via hashtables and custom objects, and clean string interpolation without relying on external shell script files.
- **Timezone Awareness (`Europe/Stockholm`)**: Market open/close states and message timestamps are calculated specifically in Central European Time (CET/CEST) by explicitly converting UTC times using system timezone definitions. This ensures consistency for users regardless of the GitHub Actions runner's default UTC clock.
- **Holiday and Non-Trading Day Detection**: The script checks whether the fetched quote's date (`$CandleDate`) matches the current local date (`$TodayDate`). If there is a mismatch (indicating a market holiday or weekend closure where no new candle is generated), the workflow terminates gracefully (`exit 0`) to prevent sending stale data to Telegram.
- **Dynamic Formatting based on Market State**: Depending on whether the US market is actively open (`$UsMarketOpen`) or closed, the script dynamically switches between circular status indicators (🟢/🔴) with percentage formatting and directional arrow symbols (▲/▼). Additionally, a dedicated banner format triggers automatically at market close (`22:00 CET`).
- **Portfolio Tagging**: Instruments marked with `Own = $true` automatically append a briefcase emoji (`💼`) to the output line, allowing quick identification of owned assets within the broadcast message.