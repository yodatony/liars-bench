# Workflow documentation: Market US Hourly Update
**Workflow file:** [.github/workflows/market-us-hourly-update.yml](../../.github/workflows/market-us-hourly-update.yml)  
**Last reviewed date:** 2026-05-01

## Reference

### Triggers

| Trigger             | Description                                       |
|---------------------|---------------------------------------------------|
| workflow_dispatch    | Triggered externally on schedule via cron-job.org |

### Secrets

| Secret                 | Description                         |
|------------------------|-----------------------------------------------------------|
| TELEGRAM_TOKEN         | Token for Telegram bot authentication                      |
| TELEGRAM_CHAT_ID       | Chat ID to send messages in Telegram                       |
| TWELVEDATA_KEY         | API key for accessing Twelve Data services                 |

### Tickers/Instruments Table

| Name                 | Ticker | Market | Own  |
|----------------------|--------|--------|------|
| S&P 500 (ETF)       | SPY    | US     | No   |
| DJI (ETF)           | DIA    | US     | No   |
| Microsoft           | MSFT   | US     | Yes  |

### Output Fields

| Field         | Description                                           |
|---------------|-------------------------------------------------------|
| Current       | Current price of the ticker                           |
| DayPct        | Percentage change from the previous day               |

### API/Data Sources

| API              | Description                                  |
|------------------|----------------------------------------------|
| Twelve Data      | Used to fetch the latest stock data for indices |
| Telegram API     | Used to send messages to Telegram chat       |

## How-to guides

### Step 1: Manually Trigger the Workflow
1. Navigate to the GitHub repository where the workflow file is located.
2. Go to the "Actions" tab.
3. Find the "Market US Hourly Update" workflow in the list.
4. Click on the workflow and press the "Run Workflow" button.

### Step 2: Verify the Market Update
1. Open the Telegram application where the messages are sent.
2. Check the specified chat ID for the latest market update message.
3. Ensure the message contains the current prices and the status of the US market (Open/Closed).

### Step 3: Update Secrets if Necessary
1. Go to the repository settings in GitHub.
2. Navigate to "Secrets" under "Security."
3. Click on the secret you wish to update (e.g., `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, or `TWELVEDATA_KEY`).
4. Modify the secret's value and save the changes.

## Explanation

The "Market US Hourly Update" workflow is designed to provide timely updates on the performance of significant US market indices. It uses a combination of scheduling via `workflow_dispatch` for manual triggering and integration with Telegram to deliver updates to users directly where they can receive notifications.

The decision to utilize the Twelve Data API for stock data is based on its reliability and ease of access, allowing us to get updated market information efficiently. The messaging format used in Telegram includes current prices and percentage changes, formatted for clarity and visual appeal, using symbols to designate positive or negative movement.

The inclusion of a time zone conversion ensures that the updates are relevant to the CET time zone, which is critical for users who expect updates based on local trading times. The design aims to minimize complexity while providing essential information succinctly, making it easy for users to quickly understand the market's current status.