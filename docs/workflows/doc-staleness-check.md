# Workflow documentation: doc-staleness-check
**Workflow file:** `.github/workflows/doc-staleness-check.yml`  
**Last reviewed date:** 2026-04-21

## Reference

### Triggers

| Trigger Type       | Schedule Expression  |
|---------------------|---------------------|
| Manual Trigger      | `workflow_dispatch` |
| Scheduled Trigger    | `55 2 1 * *` (1st of every month at 02:55 UTC) |

### Secrets

| Secret Name        | Purpose                   |
|--------------------|---------------------------|
| `GITHUB_TOKEN`     | Provides access to GitHub API for actions like creating PRs and accessing repository content. |

### Tickers/Instruments Table

| No. | Ticker     | Description               |
|-----|------------|---------------------------|
| N/A | N/A        | The workflow does not operate on specific financial instruments. |

### Output Fields

| Field               | Description                                       |
|---------------------|---------------------------------------------------|
| `PR Title`          | Title of the pull request created for documentation updates. |
| `Doc Last Changed`  | Date of the last commit for the documentation file. |
| `Workflow Last Changed` | Date of the last commit for the workflow file. |
| `Is Stale`          | Boolean value indicating if the documentation is stale compared to the workflow file. |

### API/Data Sources

- GitHub API (for repository actions and pull request management).
- GitHub Models API (for generating updates to the documentation).

## How-to guides

### Creating or Updating Documentation

1. **Trigger the Workflow**:
   - Manually trigger the workflow using the GitHub Actions interface or wait for the scheduled trigger.
   
2. **Check for Staleness**:
   - The workflow checks the last commit dates of the `.github/workflows/doc-staleness-check.yml` file and its corresponding documentation file in `docs/workflows/`.

3. **Create/Update Documentation**:
   - If the workflow file has a newer commit than the documentation file, a new branch is created, and the documentation is generated and committed to the repository.

4. **Review and Merge the Pull Request**:
   - Review the automatically generated pull request that the workflow creates, then merge it to incorporate the updated documentation.

### Reviewing the PR

1. Open the pull request created by the workflow.
2. Review the changes against the workflow file.
3. Ensure that the documentation accurately reflects the current workflow.
4. Merge the PR if everything looks correct.

## Explanation

The `doc-staleness-check` workflow is designed to ensure that documentation remains up-to-date with the corresponding workflow files within the repository. By checking the commit history, the workflow automatically identifies when the workflow files are updated and generates or modifies documentation accordingly. It leverages the GitHub Models API to assist in updating documentation content while maintaining the integrity and accuracy of the workflows.

The workflow operates on a defined schedule and supports manual triggering. It utilizes GitHub Actions' permissions to interact with the repository contents and create pull requests. This structured approach helps to keep the documentation relevant, reduces manual overhead for maintainers, and improves overall repository quality.

## Recent commits to the workflow since the doc was last updated

- ed40991 bug fix
- e6ff82e changed prompt slightly