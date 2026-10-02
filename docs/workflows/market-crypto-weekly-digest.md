# Workflow documentation: market-crypto-weekly-digest
**Workflow file:** [.github/workflows/market-crypto-weekly-digest.yml](../../.github/workflows/market-crypto-weekly-digest.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `schedule` | Automatically runs weekly on Sundays at 05:49 UTC (`49 5 * * 0`). |
| `workflow_dispatch` | Allows manual execution of the workflow from the GitHub Actions UI. |

### Secrets
| Secret Name | Description | Required |
| :--- | :--- | :--- |
| `TELEGRAM_TOKEN` | Telegram bot API token used for authentication to deliver messages. | Yes |
| `TELEGRAM_CHAT_ID` | Telegram chat or channel ID where the weekly crypto digest is sent. | Yes |
| `TWELVEDATA_KEY` | API key for authenticating requests to Twelve Data. | Yes |

### Tickers / Instruments
| Name | Ticker | Market | Own Status | Source | CoinId / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | `BNB/USD` | CRYPTO | False | Twelve Data | - |
| BTC/USD | `BTC/USD` | CRYPTO | True | Twelve Data | - |
| ETH/USD | `ETH/USD` | CRYPTO | True | Twelve Data | - |
| HYPE/USD | `HYPE/USD` | CRYPTO | True | CoinGecko | `hyperliquid` |
| SOL/USD | `SOL/USD` | CRYPTO | True | Twelve Data | - |
| XRP/USD | `XRP/USD` | CRYPTO | True | Twelve Data | - |

### Output Fields
| Field Name | Description | Formatting / Notes |
| :--- | :--- | :--- |
| `Name` | Display name of the cryptocurrency asset. | Included in bold header. |
| `Flag` | Emoji indicator representing the asset. | Set as `💵`. |
| `Close` | Latest fetched market price. | Rounded to 2 decimal places. |
| `WeekPct` | Percentage change from Monday's open/price to the latest close. | Colored with emojis (`🟢` / `🔴`). |
| `MonthPct` | Percentage change over a 30-day lookback period. | Flat formatting (`+X%` / `X%`). |
| `SixMoPct` | Percentage change over a 6-month lookback period. | Flat formatting (`+X%` / `X%`), `N/A` for CoinGecko. |
| `YearPct` | Percentage change over a 1-year lookback period. | Flat formatting (`+X%` / `X%`), `N/A` for CoinGecko. |
| `Own` | Boolean flag indicating whether the asset is held in the portfolio. | Appends portfolio indicator (`💼`). |

### API / Data Sources
| Provider | Base URL / Endpoint | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/time_series` | Retrieves historical daily candles for performance lookback calculations. |
| Twelve Data | `https://api.twelvedata.com/price` | Retrieves real-time latest asset price. |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Retrieves market chart price points for assets not supported via Twelve Data (e.g., Hyperliquid). |
| Telegram Bot API | `https://api.telegram.org/bot{token}/sendMessage` | Delivers the formatted HTML digest message to the designated chat. |

---

## How-to guides

### How to trigger a manual digest
1. Navigate to your repository on GitHub.
2. Click on the **Actions** tab.
3. Select the **market-crypto-weekly-digest** workflow from the left sidebar.
4. Click the **Run workflow** dropdown button.
5. Confirm by clicking the green **Run workflow** button.

### How to add or modify tracked crypto assets
1. Open the workflow file located at `.github/workflows/market-crypto-weekly-digest.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hash table entry with the required properties (`Name`, `Ticker`, `Market`, `Own`), and optionally specify alternative data sources (`Source = "COINGECKO"` and `CoinId`).
4. Commit and push your changes to the repository.

---

## Explanation

### Design Decisions
- **PowerShell for Data Processing:** The entire workflow logic is executed within a single PowerShell (`pwsh`) step. This allows for complex JSON parsing, math operations, and error handling without requiring dedicated external build scripts or custom actions.
- **Dual Data Providers:** While Twelve Data serves as the primary price and historical data source, CoinGecko integration is included as a fallback/alternative provider for tokens (like `HYPE/USD`) that may not be fully indexed or supported on Twelve Data's standard tier.
- **Rate-Limit Mitigation:** A 15-second delay (`Start-Sleep -Seconds 15`) is intentionally introduced between Twelve Data API requests to prevent triggering rate-limiting errors on free or tier-restricted API keys.
- **Portfolio Tracking Indicators:** Assets marked with `Own = $true` automatically display a briefcase emoji (`💼`) in the Telegram output, allowing quick identification of personal holdings within the broader market digest.