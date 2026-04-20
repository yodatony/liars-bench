# Schedule Reset Workflow Documentation

**Last reviewed date:** 2026-04-19

## Reference

### Triggers
| Trigger                | Description                           |
|-----------------------|---------------------------------------|
| `workflow_dispatch`   | Allows the workflow to be manually triggered by a user. |

### Secrets
| Secret         | Description                              |
|----------------|------------------------------------------|
| N/A            | This workflow does not require any secrets. |

### Tickers/Instruments
| Ticker/Instrument | Description                |
|-------------------|----------------------------|
| N/A               | This workflow does not interact with any financial instruments. |

### Output Fields
| Output Field | Description                          |
|--------------|--------------------------------------|
| N/A          | This workflow does not produce output fields. |

### API/Data Sources
| API/Data Source | Description                             |
|-----------------|-----------------------------------------|
| N/A             | This workflow does not interact with any external APIs. |

## How-to Guides

### Manual Trigger of the Schedule Reset Workflow
1. Navigate to the "Actions" tab in your GitHub repository.
2. Locate the "schedule-reset" workflow in the list of workflows.
3. Click on the workflow to open it.
4. Click the "Run workflow" button to trigger the workflow manually.

## Explanation

The schedule-reset workflow is designed to force a reevaluation of schedules by creating an empty commit in the repository. 

### Design Decisions
- The workflow is triggered manually via `workflow_dispatch`, providing users the flexibility to trigger the reset when needed rather than on a fixed schedule.
- The workflow uses GitHub Actions to checkout the repository, configure Git, create an empty commit to ensure that changes are recognized, and then push that commit back to the repository.
- This approach was selected to help maintain the schedule without requiring any actual changes to files, simplifying the reset process.