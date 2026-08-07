# Workflow documentation: Market Index 1D Update
**Workflow file:** [.github/workflows/market-index-1d-update.yml](../../.github/workflows/market-index-1d-update.yml)  
**Last reviewed date:** 2026-05-01

## Reference

### Triggers
| Trigger               | Description                                   |
|-----------------------|-----------------------------------------------|
| workflow_dispatch     | Manual trigger for the workflow               |
| schedule              | Automatically runs at 03:49 AM UTC from Tuesday to Saturday |

### Secrets
| Secret Name          | Description                                     |
|----------------------|-------------------------------------------------|
| TELEGRAM_TOKEN       | Token used for Telegram bot to send messages    |
| TELEGRAM_CHAT_ID     | Chat ID of the Telegram chat to send updates    |
| EODHD_KEY            | API key for EODHD data service                   |
| TWELVEDATA_KEY       | API key for Twelve Data service                   |

### Tickers/Instruments Table
| Name              | Ticker        | Market |
|-------------------|---------------|--------|
| OMXSPI            | OMXSPI.INDX   | SE     |
| OMXS30            | OMXS30.INDX   | SE     |
| S&P 500 (ETF)     | SPY           | US     |
| DJI (ETF)         | DIA           | US     |

### Output Fields
| Field Name | Description                                    |
|------------|------------------------------------------------|
| Close      | Closing price of the index                     |
| DayPct     | Percentage change from the previous close      |
| Date       | Date of the data point                         |
| Error      | Indicates if an error occurred in data retrieval |

### API/Data Sources
| API Name        | Description                                     |
|------------------|-------------------------------------------------|
| EODHD           | Provides end-of-day historical data for stocks  |
| Twelve Data     | Provides real-time price information             |

## How-to guides

### Triggering the Workflow
1. Navigate to your GitHub repository where the workflow is defined.
2. Go to the "Actions" tab.
3. Select the "Market Index 1D Update" workflow from the list.
4. Click on the "Run workflow" button to trigger it manually.

### Inspecting the Results
1. After the workflow runs, go back to the "Actions" tab.
2. Click on the latest run of the "Market Index 1D Update" workflow.
3. Review the logs of the "send-info" job to see the messages sent to Telegram and the index updates.

### Modifying Schedule Timing
1. Access the workflow file from the repository: `.github/workflows/market-index-1d-update.yml`.
2. Locate the `schedule` section in the YAML configuration.
3. Modify the cron expression to change the timing as needed. The current setting is for 03:49 AM UTC from Tuesday to Saturday.

## Explanation

The "Market Index 1D Update" workflow is designed to automate the process of sending daily updates on selected market indices to a Telegram channel. This helps stakeholders stay informed about market movements quickly and efficiently.

### Design Decisions
- **Schedule and Triggers:** The workflow triggers both manually and on a schedule to accommodate user needs and provide flexibility.
- **Data Sources:** EODHD and Twelve Data were chosen as data sources for their reliability in providing up-to-date market information.
- **Error Handling:** The script addresses potential data retrieval errors robustly, which ensures that users receive notifications even in the event of issues with data sources.
- **Formatted Output:** The structured output format enables clear communication of market status. The use of emojis and HTML formatting improves readability in Telegram messages.