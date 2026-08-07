# Workflow documentation: Market Crypto Weekly Digest
**Workflow file:** [.github/workflows/market-crypto-weekly-digest.yml](../../.github/workflows/market-crypto-weekly-digest.yml)  
**Last reviewed date:** 2026-05-01  

## Reference

### Triggers
| Trigger Type        | Description                                      |
|---------------------|--------------------------------------------------|
| workflow_dispatch    | Manual trigger for executing the workflow       |
| schedule            | Automatically triggered every Sunday at 10:49 AM (UTC) |

### Secrets
| Secret Name            | Description                                 |
|------------------------|---------------------------------------------|
| TELEGRAM_TOKEN         | Telegram bot token for authentication      |
| TELEGRAM_CHAT_ID       | Telegram chat ID to send messages to       |
| TWELVEDATA_KEY         | API key for Twelve Data services            |

### Tickers/Instruments Table
| Name    | Ticker   | Market | Own   |
|---------|----------|--------|-------|
| BTC/USD | BTC/USD  | CRYPTO | true  |
| ETH/USD | ETH/USD  | CRYPTO | true  |
| XRP/USD | XRP/USD  | CRYPTO | true  |

### Output Fields
| Field Name | Description                                            |
|------------|--------------------------------------------------------|
| Close      | Latest closing price of the cryptocurrency             |
| WeekPct    | Percentage change since the last Monday open           |
| MonthPct   | Percentage change since the last month close           |

### API/Data Sources
| API Source                | Description                                             |
|---------------------------|---------------------------------------------------------|
| Twelve Data               | Provides historical and real-time cryptocurrency prices |
| Telegram                  | Sends messages to the specified chat                    |

## How-to guides

### Trigger the Workflow Manually
1. Navigate to the GitHub repository.
2. Select the "Actions" tab at the top of the page.
3. Find the workflow named "Market Crypto Weekly Digest."
4. Click on the "Run workflow" button.
5. Confirm by clicking "Run workflow" in the dialog.

### Check the Weekly Digest
1. Wait until the scheduled time, which is every Sunday at 10:49 AM (UTC).
2. Open the Telegram chat that corresponds to the `TELEGRAM_CHAT_ID`.
3. Look for the latest message from the bot, which will include the weekly digest of cryptocurrency prices.

## Explanation

The "Market Crypto Weekly Digest" workflow was designed to automate the process of gathering cryptocurrency price data and distributing it via Telegram. Key design decisions include:

1. **Data Sources**: The workflow utilizes the Twelve Data API for both historical and real-time price data, ensuring accurate and reliable information on major cryptocurrencies such as Bitcoin, Ethereum, and XRP.

2. **Triggers**: The workflow is triggered both manually and automatically, allowing for flexibility. Manual execution is beneficial for immediate queries, while the scheduled trigger ensures regular updates without human intervention.

3. **Telegram Messaging**: The use of Telegram for sharing the digest is strategic, allowing users to receive timely updates directly in a chat format, which is more convenient than checking a website or dashboard.

4. **Error Handling**: Built-in error handling captures issues with data retrieval and provides feedback in the digest message about unavailable data, ensuring users are informed of any discrepancies.

5. **Performance Monitoring**: By reporting percentage changes from the previous Monday and the last month's closing prices, the workflow helps users quickly assess market trends.