// Background script for ForReal

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "forreal-verify",
    title: "Verify with ForReal",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "forreal-verify" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "verify_selection",
      text: info.selectionText,
      position: { x: 0, y: 0 }
    }).catch(err => {
      console.error("ForReal: Could not send message to tab", err);

      // Content script isn't loaded (e.g. restricted page) - inject a fallback alert
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("ForReal: Cannot verify text on this page. Try reloading.")
      }).catch(() => {});
    });
  }
});
