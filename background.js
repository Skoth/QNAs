chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('Base.html')}, function(tab) {
    // Tab opened.
  });
});