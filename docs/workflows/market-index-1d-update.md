# Workflow documentation: market-index-1d-update
**Workflow file:** [.github/workflows/market-index-1d-update.yml](../../.github/workflows/market-index-1d-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Authentication token for the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where messages are sent. |
| `EODHD_KEY` | API key for fetching Swedish market data from EODHD. |
| `TWELVEDATA_KEY` | API key for fetching US market data from Twelve Data. |

### Tickers and Instruments
| Name | Ticker | Market | Data Source |
| :--- | :--- | :--- | :--- |
| OMXSPI | `OMXSPI.INDX` | SE | EODHD |
| OMXS30GI | `OMXS30GI.INDX` | SE | EODHD |
| OMXS30 | `OMXS30.INDX` | SE | EODHD |
| S&P 500 (ETF) | `SPY` | US | Twelve Data |
| DJUS (ETF) | `IYY` | US | Twelve Data |
| DJI (ETF) | `DIA` | US | Twelve Data |

### API / Data Sources
| Provider | Base URL / Endpoint | Purpose |
| :--- | :--- | :--- |
| EODHD | `https://eodhd.com/api/eod/{Ticker}` | Retrieves end-of-day pricing for Swedish index instruments. |
| Twelve Data | `https://api.twelvedata.com/quote` | Retrieves quote and percentage change data for US ETF instruments. |
| Telegram Bot API | `https://api.telegram.org/bot{TOKEN}/sendMessage` | Delivers the formatted daily review message to the designated chat. |

### Output Fields
| Field Name | Description |
| :--- | :--- |
| `Name` | Display name of the index or ETF. |
| `Flag` | Regional emoji flag corresponding to the market (🇸🇪 for SE, 🇺🇸 for US). |
| `Close` | Rounded closing price for the target trading day. |
| `DayPct` | Percentage change compared to the previous trading day, formatted with a directional indicator and color emoji. |
| `Date` | The calendar date of the pricing data (`yyyy-MM-dd`). |
| `Error` | Boolean flag indicating whether data retrieval failed for the instrument. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to your repository on GitHub and click on the **Actions** tab.
2. Select the **market-index-1d-update** workflow from the sidebar list.
3. Click the **Run workflow** dropdown button on the right side.
4. Confirm by clicking the green **Run workflow** button.

### How to add a new market index or ETF
1. Open the workflow file at `.github/workflows/market-index-1d-update.yml`.
2. Locate the `$Indices` array definition inside the PowerShell script block.
3. Add a new hash table entry specifying the `Name`, `Ticker`, and `Market` (`SE` or `US`):
   ```powershell
   @{ Name = "New Index"; Ticker = "TICKER_SYMBOL"; Market = "US" }
   ```
4. Commit the changes to the workflow file.

---

## Explanation

### Design decisions and architecture

#### External Scheduling via `workflow_dispatch`
The workflow uses `workflow_dispatch` as its sole native GitHub Actions trigger, removing internal GitHub cron expressions. This decision delegates the scheduling responsibility to an external cron service (cron-job.org), avoiding GitHub Actions queue delays and potential throttling on scheduled jobs.

#### Split Data Providers
Swedish indices (`SE`) are sourced via EODHD, while US instruments (`US`) use Twelve Data. This separation ensures that each regional market is pulled from a provider best suited for its specific data feeds, optimizing reliability and format consistency.

#### Strict Date Filtering and Sorting
The script calculates the target trading date as yesterday relative to the runner's execution time in the `Europe/Stockholm` timezone. Results are strictly filtered to match this target date (`$YesterdayDate`) to prevent stale data from appearing in the report. Surviving results are then sorted in descending order by their daily percentage change (`DayPct`), highlighting top performers and laggards clearly in the Telegram notification.

#### Graceful Error Handling
Each instrument lookup is wrapped in a `try/catch` block. If an API request fails or returns insufficient data, the script captures the error flag (`$true`) rather than halting the entire pipeline. The final Telegram message formats failed lookups gracefully with an unavailable warning (`⚠️`), ensuring that partial updates are delivered even if a single data source experiences an outage.