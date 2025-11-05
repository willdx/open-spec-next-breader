## Why
The current popup implementation is a basic placeholder that doesn't provide the functionality described in the project requirements. Users need access to document statistics, recent reading history, web content extraction, and manual markdown input directly from the extension popup.

## What Changes
- **BREAKING**: Replace the simple Main component popup with a comprehensive custom popup interface
- Add document count display from storage
- Add recent reading history with navigation to main interface
- Add web page extraction button to capture current tab content as markdown
- Add manual input button with modal dialog for markdown entry
- Improve popup styling and layout to match project design guidelines

## Impact
- Affected specs: `popup` (new capability)
- Affected code: `src/popup/index.tsx`, `src/components/Main.tsx`
- Adds new dependencies on storage API and content script communication