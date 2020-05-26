/**
 * Provide a set of searches and a configuration of the storage folder.
 * search: The query to search in google mail, the mail should have an attachment (including a file extension) and should not have -label:_processed
 * baseFolder: Folder in Google Drive to which the attachment should be stored
 * withMonth: Store the file to a subfolder named with the current year/month 
 */
var searches = {
  0: {
    'search': 'from:alice@example.com has:attachment .pdf -label:_processed',
    'baseFolder': 'alice/',
    'withMonth': false
  },
  1: {
    'search': 'from:bob@example.com OR from:info@bohlhof.de subject:Gebührenabrechnung has:attachment .pdf -label:_processed',
    'baseFolder': 'example/bob/',
    'withMonth': true
  }
};

