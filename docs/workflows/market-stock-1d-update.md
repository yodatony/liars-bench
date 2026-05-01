# Workflow documentation: Market Stock Daily Update
**Workflow file:** [.github/workflows/market-stock-1d-update.yml](../../.github/workflows/market-stock-1d-update.yml)  
**Last reviewed date:** 2026-05-01

## Reference

### Triggers

| Trigger                | Description                                         |
|-----------------------|-----------------------------------------------------|
| workflow_dispatch      | Manually triggered via the GitHub Actions interface |
| schedule              | Executes automatically on a cron schedule          |

### Secrets

| Secret               | Description                                |
|---------------------|--------------------------------------------|
| TELEGRAM_TOKEN      | Token for authenticating with Telegram API |
| TELEGRAM_CHAT_ID    | Chat ID where updates will be sent        |
| EODHD_KEY           | API key for EODHD data service            |
| TWELVEDATA_KEY      | API key for Twelve Data service            |

### Tickers/Instruments Table

| Name        | Ticker     | Market | Own   |
|-------------|------------|--------|-------|
| ATCO B     | ATCO-B.ST  | SE     | true  |
| INVE B     | INVE-B.ST  | SE     | true  |
| VOLV B     | VOLV-B.ST  | SE     | false |
| SAAB B     | SAAB-B.ST  | SE     | false |
| SWED A     | SWED-A.ST  | SE     | false |
| SHB A      | SHB-A.ST   | SE     | false |
| SBB B      | SBB-B.ST   | SE     | false |
| SSAB B     | SSAB-B.ST  | SE     | false |
| Novo B     | NOVO-B.CO  | DK     | true  |
| NVDA       | NVDA       | US     | false |
| AAPL       | AAPL       | US     | false |
| MSFT       | MSFT       | US     | true  |
| AMZN       | AMZN       | US     | false |
| GOOGL      | GOOGL      | US     | false |
| TSLA       | TSLA       | US     | false |

### Output Fields

| Field    | Description                             |
|----------|-----------------------------------------|
| Close    | Closing price of the stock on the previous day |
| DayPct   | Percentage change from the previous day's closing price |
| Date     | Date of the closing price               |
| Own      | Indicates whether the stock is owned (true/false) |
| Flag     | Country flag emoji representing the stock market |

### API/Data Sources

| Source        | Description                                |
|---------------|--------------------------------------------|
| EODHD        | End of Day historical data for stocks      |
| Twelve Data  | Real-time stock quotes and market data     |

## How-to guides

### Manually Trigger the Workflow

1. Navigate to the GitHub repository where the workflow file is located.
2. Go to the "Actions" tab.
3. Find the "Market Stock Daily Update" workflow in the list.
4. Click on the "Run workflow" button.
5. Confirm the execution by clicking the "Run workflow" button in the popup.

### Check Scheduled Runs

1. Navigate to the GitHub repository.
2. Go to the "Actions" tab.
3. Click on "Market Stock Daily Update."
4. Review the list of workflow runs to see previous runs and their statuses. Scheduled runs will appear automatically in this history.

### Update Stock List

To update the stocks being monitored in the workflow:

1. Edit the workflow file `market-stock-1d-update.yml`.
2. Locate the `Indices` array.
3. Add or update entries in the array as needed, following the existing format.
4. Commit the changes to the repository.
5. The next scheduled run will include the updated list.

## Explanation

The `market-stock-1d-update` workflow is designed to send daily updates about specific stocks to a Telegram chat. The workflow is triggered either manually or on a predefined schedule (every Tuesday to Saturday at 03:54 UTC).

### Design Decisions

1. **Scheduling**: The workflow uses a cron schedule to automate the reporting feature. This ensures stakeholders receive up-to-date information without manual intervention.
   
2. **Stock Selection**: The stocks monitored by the workflow have been carefully selected based on personal ownership and market interest. The configuration is easily adjustable in the workflow file to accommodate changes in investment strategy.

3. **Data Sources**: Two different API services are utilized to gather stock information. EODHD is used for stocks listed in SE and DK markets, while Twelve Data serves stocks in the US market. This design provides flexibility and coverage across markets.

4. **Telegram Integration**: The decision to use Telegram for notifications was made for its ease of use and wide accessibility. Messages are crafted in HTML format for better readability, using emojis to enhance user engagement.

By adhering to these design choices, the workflow meets the objective of providing timely stock updates while allowing for future enhancements based on user feedback and technological changes.