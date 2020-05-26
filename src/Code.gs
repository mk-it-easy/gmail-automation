/**
 * Returns the ID of the path starting from the parentFolder
 *
 * folderIt: Iterator over folders
 * path: Path to the folder
 * parentFolder: Starting point
 * 
 * returns: the folder ID of the path
 */
function getFolderId(folderIt, path, parentFolder){
  var splittedPath = path.split("/");
  while(folderIt.hasNext()) {
    var folder = folderIt.next();
    var folderName = folder.getName();
    if (folderName.toLowerCase() == splittedPath[0].toLowerCase()) {
      if (splittedPath.length > 1) {
        return getFolderId(folder.getFolders(), splittedPath.slice(1).join("/"), folder);
      } else 
        return folder.getId();
    }
  }
  
  folder = parentFolder.createFolder(splittedPath[0]);
  if (splittedPath.length > 1) {
    Logger.log(folder);
    getFolderId(folder.getFolders(), splittedPath.slice(1).join("/"), folder);
  } else {
    Logger.log(folder);
    return folder.getId();
  }
}

/**
 * Returns the ID of the specified path releative to google drive root folder
 * 
 * path: path relative to google drive root
 */ 
function getFolderIdFromRoot(path) {
  return getFolderId(DriveApp.getRootFolder().getFolders(), path, DriveApp.getRootFolder());
}

/**
 * Saves a file to the specified folder.
 * 
 * file: the file blob to be stored.
 * id: the ID of the folder to which the file should be saved.
 */
function saveToDrive(file, id) {
  var folder = DriveApp.getFolderById(id);
  var fileExists = folder.getFilesByName(file.getName()).hasNext();
  
  var fileName = file.getName();
  var it = folder.getFilesByName(file.getName());
  
  folder.getFilesByName(file.getName())
  if (!fileExists) {
    folder.createFile(file);
    Logger.log("File: " + file.getName());
  }
}

/**
 * Scans a message for attachments and saves it
 * in the folder specified
 * 
 * message: the message to be scanned
 * folderId: the folder to which the attachment should be saved
 */
function processMessage(message, folderId) {
  var body = message.getBody();
  var attachments = message.getAttachments();
  
  for (var i = 0; i < attachments.length; i++) {
    Logger.log(attachments[i].getContentType());
    if(attachments[i].getContentType() == "application/pdf" || attachments[i].getContentType() == "application/octet-stream") {
      saveToDrive(attachments[i], folderId);
    }
  }
    
  var label = GmailApp.getUserLabelByName("_processed");
  if (label == null) {
    label = GmailApp.createLabel("_processed");
  }
  message.getThread().addLabel(label)
}

/**
 * Find all Messages in Inbox with label "Rechnung/kassenzettel".
 * Each message is scanned for attachments.
 * The attachment will be downloaded and saved to the google drive folder for the 
 * current month.
 * 
 * Usage: run this function on a daily base.
 */
function processMails() {
  
  for (var queryProp in searches) {
    var query = searches[queryProp];
    var messagesResult = GmailApp.search(query.search);
  
    var count = 0;
    for (var i = 0; i < messagesResult.length; i++) {
      var messages = messagesResult[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];
        if (message != null) {
          var folderId = folderName(message, query.baseFolder, query.withMonth);
          processMessage(message, folderId);
          message.markRead();
          message.getThread().moveToArchive();
          count++;
        }
      }
    }
    Logger.log("messages processed (" + query.baseFolder + "): " + count);
  }
}

/**
 * Returns the ID of the folder for the current year / month in subdirectory Rechnungen/Hosteurope
 */
function folderName(message, baseFolder, withMonth) {
  var date = message.getDate();
  var folderName = baseFolder + date.getFullYear()  
  if (withMonth) {
    folderName += "/" + (date.getMonth() + 1);
  }
  Logger.log(folderName + "\n");
  return getFolderIdFromRoot(folderName);
}

/**
* Move all label:_processed mails older than 3 years to trash
 */
function cleanupMails() {
  var messagesResult = GmailApp.search('label:_processed older_than:3y');
  var count = 0;
  for (var i = 0; i < messagesResult.length; i++) {
    var messages = messagesResult[i].getMessages();  
    for (var j = 0; j < messages.length; j++) {
      Logger.log("Moved to trash: " + messages[j].getSubject() + " " + messages[j].getDate());
      messages[j].moveToTrash();
    }
  }
}

