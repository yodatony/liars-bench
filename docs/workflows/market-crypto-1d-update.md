# Workflow documentation: market-crypto-1d-update
**Workflow file:** [.github/workflows/market-crypto-1d-update.yml](../../.github/workflows/market-crypto-1d-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token used to authenticate with the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel identifier where updates are sent. |
| `TWELVEDATA_KEY` | API key required to fetch market data from Twelve Data. |

### Tickers / Instruments
| Name | Ticker | Market | Own | Source | CoinId |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | BNB/USD | CRYPTO | `false` | Twelve Data (default) | N/A |
| BTC/USD | BTC/USD | CRYPTO | `true` | Twelve Data (default) | N/A |
| ETH/USD | ETH/USD | CRYPTO | `true` | Twelve Data (default) | N/A |
| HYPE/USD | HYPE/USD | CRYPTO | `true` | COINGECKO | hyperliquid |
| SOL/USD | SOL/USD | CRYPTO | `false` | Twelve Data (default) | N/A |
| XRP/USD | XRP/USD | CRYPTO | `true` | Twelve Data (default) | N/A |

### Output Fields
| Field | Description |
| :--- | :--- |
| `Name` | The display name of the cryptocurrency pair. |
| `Flag` | Emoji market indicator (`💵` for crypto). |
| `Close` | Rounded closing price for the target date. |
| `DayPct` | Percentage change compared to the previous day's close, formatted with an indicator (🟢/🔴). |
| `Date` | The target date for the market data (`YYYY-MM-DD`). |
| `Own` | Boolean flag indicating portfolio ownership (`💼`). |
| `Error` | Boolean flag set to `true` if data retrieval fails. |

### API / Data Sources
| Source | Endpoint | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/time_series` | Fetches daily historical time series data for standard crypto tickers. |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Fetches historical price points for assets not reliably provided by Twelve Data (e.g., HYPE/USD). |
| Telegram Bot API | `https://api.telegram.org/bot{token}/sendMessage` | Delivers the formatted daily review message to the configured chat. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to your GitHub repository in a browser.
2. Click on the **Actions** tab.
3. Select the **market-crypto-1d-update** workflow from the sidebar on the left.
4. Click the **Run workflow** dropdown button and confirm by clicking **Run workflow**.

### How to add a new cryptocurrency
1. Open the workflow file at `.github/workflows/market-crypto-1d-update.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hashtable entry matching the format of existing assets:
   - For Twelve Data sources: `@{ Name = "ASSET/USD"; Ticker = "ASSET/USD"; Market = "CRYPTO"; Own = $false }`
   - For CoinGecko sources: `@{ Name = "ASSET/USD"; Ticker = "ASSET/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "coingecko-coin-id" }`
4. Commit and push your changes to the repository.

### How to configure Telegram notifications
1. Ensure your Telegram Bot Token and Chat ID are added as repository secrets under the names `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`.
2. Verify that the bot has administrative privileges or permission to send messages to the target chat ID.

---

## Explanation

### Design Decisions
- **Multi-Source Support:** While Twelve Data serves as the primary provider for standard crypto instruments, CoinGecko is integrated as an alternative source (`Source = "COINGECKO"`) to accommodate assets like Hyperliquid (`HYPE/USD`) that may not be available or fully synchronized on the primary provider.
- **Robust Error Handling:** Each asset lookup is wrapped in a `try/catch` block. If an API request fails or returns insufficient data, the script captures the error (`Error = $true`) and outputs an unavailable warning notice (`⚠️`) rather than halting the entire execution.
- **Sorted Performance Output:** Results are sorted in descending order based on percentage change (`DayPct`), allowing viewers to immediately identify the top-performing and worst-performing assets of the day.
- **Portfolio Tracking:** Assets marked with `Own = $true` are visually highlighted in the Telegram message using a briefcase emoji (`💼`), enabling quick personal portfolio performance tracking.