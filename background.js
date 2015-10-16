chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('Base.html')}, function(tab) {
    // Tab opened.
  });
});

chrome.runtime.onInstalled.addListener(function() {
  var id = chrome.contextMenus.create(
    {
      "title": "Create QNA",
      "contexts": ["selection"],
      "id": "contextselection"
    }
  );
});

function onClickHandler(info, tab) {
  var stxt = info.selectionText;
  var url = "https://www.google.com/search?q=" + encodeURIComponent(stxt);
  window.open(url, '_blank');
}

chrome.contextMenus.onClicked.addListener(onClickHandler);