# Workflow documentation: market-crypto-hourly-update
**Workflow file:** [.github/workflows/market-crypto-hourly-update.yml](../../.github/workflows/market-crypto-hourly-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Telegram Bot API token used to authenticate requests to the messaging service. |
| `TELEGRAM_CHAT_ID` | Telegram chat or channel ID where the crypto market update message will be delivered. |
| `TWELVEDATA_KEY` | API key for authenticating requests to the Twelve Data platform. |

### Tickers / Instruments
| Name | Ticker | Market | Own | Source | CoinId |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | BNB/USD | CRYPTO | `false` | Twelve Data (default) | — |
| BTC/USD | BTC/USD | CRYPTO | `true` | Twelve Data (default) | — |
| ETH/USD | ETH/USD | CRYPTO | `true` | Twelve Data (default) | — |
| HYPE/USD | HYPE/USD | CRYPTO | `true` | COINGECKO | hyperliquid |
| SOL/USD | SOL/USD | CRYPTO | `true` | CRYPTO | — |
| XRP/USD | XRP/USD | CRYPTO | `true` | Twelve Data (default) | — |

*(Note: SOL/USD is configured with `Own = $false` in the script logic block).*

### Output Fields & Message Format
| Field / Component | Format / Value | Description |
| :--- | :--- | :--- |
| Header Title | `<b>CRYPTO</b> — Intraday update 📈` | Bold title identifying the report category. |
| Timestamp | `<i>YYYY-MM-DD HH:mm</i> CET` | Current date and time converted to Europe/Stockholm timezone. |
| Subheader | `<i>💵 Open 24/7 🔔</i>` | Informational status line indicating continuous crypto market operations. |
| Asset Line | `<b>[Name]</b> ([Current]) <b>[DayPct]</b> [Portfolio]` | Line item showing asset name, current price, 24-hour percentage change with colored status emojis, and an optional portfolio ownership indicator (`💼`). |
| Error Line | `<b>[Name]</b> — unavailable ⚠️`<br>`  <i>Error: [Message]</i>` | Fallback display used when price data fetching fails for a specific asset. |

### API / Data Sources
| Provider | Base URL / Endpoint | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/quote` | Primary data source for fetching real-time crypto quotes and daily price changes. |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/{id}/market_chart/range` | Secondary data source utilizing historical range charts to derive daily opening and current prices for specific assets (e.g., Hyperliquid). |
| Telegram Bot API | `https://api.telegram.org/bot{token}/sendMessage` | Delivery mechanism for posting the formatted HTML message to the configured chat. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to your GitHub repository in your web browser.
2. Click on the **Actions** tab.
3. Select the **market-crypto-hourly-update** workflow from the left sidebar.
4. Click the **Run workflow** dropdown button.
5. Confirm by clicking the green **Run workflow** button.

### How to add a new cryptocurrency ticker
1. Open the workflow file located at `.github/workflows/market-crypto-hourly-update.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hash table entry using the standard Twelve Data structure or the CoinGecko structure:
   - **For Twelve Data:**
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $true }
     ```
   - **For CoinGecko:**
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "coingecko-coin-id" }
     ```
4. Commit and push the changes to your repository.

---

## Explanation

### Design Decisions & Reasoning

* **PowerShell as a Single-Language Runtime:** 
  The entire workflow relies on PowerShell (`pwsh`) to handle data retrieval, formatting, error catching, and payload transmission. This removes the overhead of maintaining separate script files or multi-step action configurations, keeping the workflow definition self-contained and easy to inspect.

* **External Cron Trigger Strategy:** 
  Rather than relying solely on native GitHub Actions scheduled workflows (which can suffer from queuing delays or automatic suspension on inactive repositories), the workflow exposes a `workflow_dispatch` trigger optimized to be invoked externally by cron-job.org on a reliable hourly schedule.

* **Multi-Source Fallback & Flexibility:** 
  While Twelve Data serves as the primary provider for standard pairs, integrating CoinGecko support via custom data fetchers (`Get-CoinGeckoData`) ensures that newer or specialized tokens (such as `HYPE/USD`) whose tickers might not be supported on Twelve Data can still be tracked accurately using range-based market charts.

* **Timezone Localization:** 
  Timestamps are explicitly converted to the `Europe/Stockholm` timezone (`CET`/`CEST`) using Windows/Linux cross-platform compatible time zone identifiers. This guarantees that intraday updates display local market-relevant times rather than raw UTC.

* **Resilient Error Handling:** 
  Individual instrument fetch operations are wrapped in `try/catch` blocks. If an API request fails or returns an error status, the workflow catches the exception and logs an "unavailable" warning line for that specific asset without aborting the entire script, ensuring partial updates are still successfully delivered to Telegram.