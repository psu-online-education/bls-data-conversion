# MAMR BLS Data Surfacing Prototype

## Creating a package
Creating a new release will also create/update the package

## Updating BLS data
### (MAMR) Update Excel file
- Clone remote repository to local
- Fetch/pull most recent remote changes
- Overwrite `World-Campus-BLS-Data-Latest.xlsx` with most recent BLS data on the local repository (overwriting prefered to editing).
- Commit and push changes to remote repository

### (App Dev) Test/push changes to main
A PR will be created when new data is pushed to the `data/intake` branch. Manual merging may be required due to Excel files. JSON files with the new data are located on the most recent release page for testing.

## XLSX Converison / Validation Package

## GitHub Pages
`docs/`
## BLS Data Folder
`docs/bls-data/`
