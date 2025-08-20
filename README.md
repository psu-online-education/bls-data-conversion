# BLS Data Conversion
This app is used by WC Online Education App Dev team to convert BLS data, provided by WC OOE/SIPO MAMR team, to machine-friendly JSON and surface that JSON to be easily accessed.

## Updating BLS data process
### (MAMR) Update Excel file
- In GitHub Desktop, clone the remote repository to local using GitHub Desktop (should only have to do this once)
- Fetch/pull most recent remote repository
- In Windows File Explorer, overwrite `World-Campus-BLS-Data-Latest.xlsx` with most recent Excel BLS data on your local repository (located by default in `Documents/GitHub/bls-data-conversion`)
- In GitHub Desktop, write a simple commit message, such as "Update BLS data", then commit the changes
- Push changes to remote repository (GH Desktop)

### (App Dev) Test/push changes to main
A PR to merge the new data into `main` will be created when new data is pushed to the `data/intake` branch. Manual merging may be required due to Excel files (unusual).

JSON files on `main` (prod data) and `data/intake` (non-prod data) are deployed automatically to the GitHub Pages site for this repository (https://psu-online-education.github.io/bls-data-conversion).

### JSON file outputs
`wc-bls-data-prospect.json` - ***USE THIS FOR WC PROSPECT DRUPAL INTEGRATION***

`wc-bls-data-raw.json` - converted data with original structure preserved; currently only used for spot-checking and testing

## GitHub Pages directory
`./docs/`
## BLS data directory
`docs/bls-data/`
