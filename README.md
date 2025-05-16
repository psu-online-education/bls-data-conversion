# BLS Actions Prototype
## Repo setup
- https://docs.github.com/en/packages/quickstart
- https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages
- npm login --scope=@NAMESPACE --auth-type=legacy --registry=https://npm.pkg.github.com

### Repo Settings
- Settings > Actions > General > Workflow permissions
  - Enable read/write
  - Check PR creation
- Branch 
# Process
1. BLS data intake
   - (MKTG Analytics) new .xlsx file is generated
     - Option 1 (MKTGA): pushed to data-intake branch (pref. by GH client)
     - Option 2 (MKTGA, Actions): new file/version created in SharePoint, webhook triggered to pull into data-intake branch
     - Create readable diff file for json? MKTGA would like?
2. Initial conversion/validation
   - (Actions) .xlsx is converted to .json, create intake artifact
   - Filtering? Luke has some unused code in lambda. Anything else? Create an unaltered atrifact in addition.
   - total_emp: currently format as text with thousands separators -> number format (trim field for legacy?)
   - (Actions) validate .json
   - (Actions, if valid) create pull request on data-test/main branch
3. Move intake data to test
   - (WEB) review pull request
     - (if approved) .xlsx now in data-test(?)
   - what are we doing here? another round of validation? or just waiting for another pr?
4. Move test data to main
   - (Actions) another conversion/validation to create prod artifact/pages from prod .xlsx
   - prod JSON data is surfaced. Raw-ish json file and others if more formatting is needed



# GH Workflows
- On push (.xlsx file, excluding all release/ branches)
  - convert to json, create artifact, and validate
  - if data/intake or data/test branch, create pull request to data/test or main respectively
- On release creation, publish package

## Sharepoint webhook -> GitHub actions
create subscription (via http request?) (set up workflow beforehand, as it requires a response to create subscription)
use github webhooks to test
https://learn.microsoft.com/en-us/sharepoint/dev/apis/webhooks/lists/create-subscription
https://www.howtogeek.com/devops/how-to-trigger-github-actions-remotely-using-webhooks/

POST to URL: `https://api.github.com/repos/{username}/{repo}/dispatches`
will get 204 respose and action run if successful
### Workflow file
`watch` trigger? `repository-dispatch`?



npm install && npm run-script convert-xlsx
npm install @zri5004/bls-actions-prototype --registry=https://npm.pkg.github.com