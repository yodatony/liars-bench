# Workflow documentation: market-index-1d-update
**Workflow file:** [.github/workflows/market-index-1d-update.yml](../../.github/workflows/market-index-1d-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org |

### Secrets
| Secret | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot authentication token for the Telegram API |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where the message is sent |
| `EODHD_KEY` | API key for fetching Swedish market data from EODHD |
| `TWELVEDATA_KEY` | API key for fetching US market data from Twelve Data |

### Tickers and Instruments
| Name | Ticker | Market | Data Source |
| :--- | :--- | :--- | :--- |
| OMXSPI | `OMXSPI.INDX` | SE | EODHD |
| OMXS30GI | `OMXS30GI.INDX` | SE | EODHD |
| OMXS30 | `OMXS30.INDX` | SE | EODHD |
| S&P 500 (ETF) | `SPY` | US | Twelve Data |
| DJUS (ETF) | `IYY` | US | Twelve Data |
| DJI (ETF) | `DIA` | US | Twelve Data |

### Output Fields
| Field | Description |
| :--- | :--- |
| `Name` | Display name of the index or ETF |
| `Flag` | Emoji flag representing the market region (🇸🇪 for SE, 🇺🇸 for US) |
| `Close` | Rounded closing price for the trading day |
| `DayPct` | Calculated percentage change from the previous trading day, formatted with a directional indicator (🟢/🔴) |
| `Date` | The date of the market data entry (`YYYY-MM-DD`) |

### API / Data Sources
| Source | Base URL | Purpose |
| :--- | :--- | :--- |
| EODHD | `https://eodhd.com/api/eod/` | Retrieves end-of-day historical pricing for Swedish indices |
| Twelve Data | `https://api.twelvedata.com/quote` | Retrieves real-time/end-of-day quotes for US ETFs |
| Telegram Bot API | `https://api.telegram.org/bot<TOKEN>/sendMessage` | Delivers the formatted markdown/HTML review to the specified chat |

## How-to guides

### How to trigger the workflow manually
1. Navigate to the GitHub repository in your browser.
2. Click on the **Actions** tab.
3. Select the **market-index-1d-update** workflow from the sidebar list.
4. Click the **Run workflow** dropdown button.
5. Click the green **Run workflow** button to confirm execution.

### How to add a new index or ETF
1. Open the workflow file at `.github/workflows/market-index-1d-update.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hash table entry matching the target market structure:
   - For Swedish indices using EODHD: `@{ Name = "Index Name"; Ticker = "SYMBOL.INDX"; Market = "SE" }`
   - For US instruments using Twelve Data: `@{ Name = "Index Name"; Ticker = "SYMBOL"; Market = "US" }`
4. Commit and push your changes to the repository.

### How to configure external scheduling
1. Ensure the `workflow_dispatch` trigger remains active in the workflow file.
2. Set up an external cron service (such as cron-job.org).
3. Configure the cron job to send an HTTP POST request to the GitHub REST API endpoint for triggering workflow dispatches:
   - **URL:** `https://api.github.com/repos/{owner}/{repo}/actions/workflows/market-index-1d-update.yml/dispatches`
   - **Method:** `POST`
   - **Headers:** Include a valid GitHub Personal Access Token with `repo` or `workflow` scope, along with required `Accept` and `User-Agent` headers.
   - **Body:** `{ "ref": "main" }`

## Explanation

### Design Decisions

#### Separation of Data Providers
The workflow splits data fetching between two distinct financial APIs (**EODHD** for Swedish indices and **Twelve Data** for US ETFs). This separation ensures that each market retrieves data from a provider optimized for that region's asset classes and ticker syntax, preventing cross-platform compatibility issues.

#### External Cron Triggering
The workflow relies entirely on the `workflow_dispatch` trigger, intentionally removing native GitHub Actions cron schedules. This design decision avoids the queue delays and unreliability often associated with GitHub's native scheduler, delegating execution timing to a dedicated external service (cron-job.org) for precise delivery.

#### Robust Error Handling and Filtering
Errors are isolated per instrument inside a `try/catch` block within the loop. If a specific API call fails or returns insufficient data, the script flags that specific item as unavailable (`Error = $true`) rather than failing the entire workflow run. Furthermore, results are filtered strictly by the preceding trading day's date (`$YesterdayDate`) and sorted by performance (`DayPct`) in descending order to present a clean, reliable, and up-to-date summary in Telegram.