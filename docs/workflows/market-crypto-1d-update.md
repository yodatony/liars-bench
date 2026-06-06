# Workflow documentation: Market Crypto Daily Update
**Workflow file:** [.github/workflows/market-crypto-1d-update.yml](../../.github/workflows/market-crypto-1d-update.yml)  
**Last reviewed date:** 2026-05-01  

## Reference

### Triggers

| Trigger Type        | Description                             |
|---------------------|-----------------------------------------|
| `workflow_dispatch` | Manual trigger for the workflow.       |
| `schedule`          | Cron schedule for automatic execution. |

### Secrets

| Secret Name         | Description                             |
|---------------------|-----------------------------------------|
| `TELEGRAM_TOKEN`    | Token for the Telegram Bot API.        |
| `TELEGRAM_CHAT_ID`  | Chat ID for sending messages on Telegram. |
| `TWELVEDATA_KEY`    | API key for accessing Twelve Data API. |

### Tickers/Instruments Table

| Name        | Ticker    | Market | Own  |
|-------------|-----------|--------|------|
| BTC/USD     | BTC/USD   | CRYPTO | true |
| ETH/USD     | ETH/USD   | CRYPTO | true |
| XRP/USD     | XRP/USD   | CRYPTO | true |

### Output Fields

| Output Field | Description                                                   |
|--------------|---------------------------------------------------------------|
| `Name`       | Name of the crypto instrument.                                |
| `Flag`       | Symbol indicating the market type.                           |
| `Close`      | Closing price of the instrument for the previous day.       |
| `DayPct`     | Percentage change in closing price compared to the previous close. |
| `Date`       | Date of the closing price.                                   |
| `Own`        | Indicates whether the user owns this cryptocurrency.         |
| `Error`      | Indicates if there was an error in fetching data.            |

### API/Data Sources

| API                      | Description                                                     |
|--------------------------|---------------------------------------------------------------|
| Twelve Data              | Provides historical data about cryptocurrencies via REST API.|
| Telegram API             | Used to send daily update messages to a specific chat.       |

## How-to Guides

### Sending a Manual Update

1. Go to the Actions tab in your GitHub repository.
2. Locate the workflow named "market-crypto-1d-update."
3. Click on the workflow to access its details.
4. Press the "Run workflow" button on the right side.
5. Confirm your action to trigger a manual update.

### Understanding Daily Updates

1. The workflow runs daily based on the scheduled cron job at 3:44 AM UTC.
2. It compiles data for BTC, ETH, and XRP from the Twelve Data API.
3. Results include the closing price, daily percentage change, and a visual representation in Telegram.

## Explanation

The "market-crypto-1d-update" workflow is designed to automate the process of gathering and distributing daily cryptocurrency updates via Telegram. The decision to use the Twelve Data API was based on its reliable access to real-time cryptocurrency data, ensuring users receive accurate and timely information.

The approach includes using secrets to keep sensitive information secure while allowing for dynamic interactions with both the Telegram API and the Twelve Data API. The output is formatted for clarity and ease of reading, providing immediate insights into market trends.

The choice to have a scheduled job along with a manual trigger enhances flexibility, giving users the ability to receive updates either on a fixed schedule or on-demand. This combination caters to varying user needs, ensuring that both casual users and those requiring timely market analysis can benefit from the workflow.