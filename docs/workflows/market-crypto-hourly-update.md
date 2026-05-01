# Workflow documentation: Market Crypto Hourly Update
**Workflow file:** [.github/workflows/market-crypto-hourly-update.yml](../../.github/workflows/market-crypto-hourly-update.yml)  
**Last reviewed date:** 2026-05-01

## Reference

### Triggers
| Trigger              | Description                                     |
|----------------------|-------------------------------------------------|
| `workflow_dispatch`  | Triggered externally on schedule via cron-job.org |

### Secrets
| Secret               | Description                                       |
|----------------------|---------------------------------------------------|
| `TELEGRAM_TOKEN`     | Token for authenticating with the Telegram API    |
| `TELEGRAM_CHAT_ID`   | Chat ID where the updates are sent                |
| `TWELVEDATA_KEY`     | API key for accessing Twelve Data API             |

### Tickers/Instruments Table
| Name      | Ticker    | Market  | Own  |
|-----------|-----------|---------|------|
| BTC/USD   | BTC/USD   | CRYPTO  | true |
| ETH/USD   | ETH/USD   | CRYPTO  | true |
| XRP/USD   | XRP/USD   | CRYPTO  | true |

### Output Fields
| Field       | Description                                     |
|-------------|-------------------------------------------------|
| `Current`   | Current value of the ticker                     |
| `DayPct`    | Percentage change over the day                  |

### API/Data Sources
| API                        | Description                                       |
|----------------------------|---------------------------------------------------|
| Twelve Data API            | Provides market data for cryptocurrencies          |
| Telegram API               | Sends messages to Telegram                          |

## How-to Guides

### Sending a Crypto Update
1. Ensure you have the required secrets (`TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, `TWELVEDATA_KEY`) set in your GitHub repository.
2. Access the GitHub Actions tab in your repository.
3. Find the `Market Crypto Hourly Update` workflow.
4. Click on the `Run workflow` button.
5. Wait for the job to complete, and check the logs for confirmation that the update was sent.

## Explanation

The `Market Crypto Hourly Update` workflow is designed to provide timely updates on select cryptocurrencies on an hourly basis. 

- **Design Decisions:**
  - The workflow is triggered manually but can be scheduled with external automation tools, allowing flexibility in usage.
  - Utilizing the Twelve Data API helps retrieve accurate market values for cryptocurrencies with ease due to its structured response format.
  - The Telegram API is chosen for notifications because of its ease of use and widespread adoption for direct messaging.

The choice of cryptocurrencies (BTC, ETH, XRP) reflects popular markets that users are likely to monitor. The inclusion of the `Own` flag allows easy modification of which instruments to send updates for based on the user's portfolio. 

Overall, the workflow facilitates quick, automated updates to keep users informed about market fluctuations, enhancing engagement and decision-making in trading activities.