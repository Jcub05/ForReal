// Background script for ForReal

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "forreal-verify",
    title: "Verify with ForReal",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "forreal-verify" && info.selectionText) {
    // Send message to content script in the active tab
    chrome.tabs.sendMessage(tab.id, {
      action: "verify_selection",
      text: info.selectionText,
      position: { x: 0, y: 0 } // We'll handle positioning in content script
    }).catch(err => {
      console.error("ForReal: Could not send message to tab", err);
      
      // If content script isn't loaded (e.g. restricted page), warn user
      // We can't alert from background, but we could inject a script
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("ForReal: Cannot verify text on this page. Try reloading.")
      }).catch(() => {});
    });
  }
});
