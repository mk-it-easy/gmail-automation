# gmail-automation

The script stores automatically attachments of emails to google drive.

## Usage

Put `Code.gs` and `Searches.example.gs` into a Google Apps Script project. Adapt `Searches.example.gs` to fit your needs.

Set a timed trigger for the function `processMails` to run the script periodically.

A second trigger can be added for the function `cleanupMails`. This will clean up mails with the label `_processed` after three years.