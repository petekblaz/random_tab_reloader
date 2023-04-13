const activeTabs = {};

function scheduleReload(from, to, tabId) {
  const randomTime = Math.floor(Math.random() * (to - from + 1)) + from;

  activeTabs[tabId].timeoutId = setTimeout(() => {
    chrome.tabs.reload(tabId);
  }, randomTime);

  updateCountdown(randomTime / 1000, tabId);
}

function updateCountdown(countdown, tabId) {
  if (activeTabs[tabId]?.timeoutId) {
    chrome.browserAction.setBadgeText({ text: String(Math.ceil(countdown)), tabId });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF5722", tabId });

    if (countdown > 0) {
      setTimeout(() => {
        updateCountdown(countdown - 1, tabId);
      }, 1000);
    }
  } else {
    chrome.browserAction.setBadgeText({ text: '', tabId });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    const { from, to, tabId } = request;
    if (activeTabs[tabId]) {
      clearTimeout(activeTabs[tabId].timeoutId);
    }
    activeTabs[tabId] = { from, to, timeoutId: null };
    scheduleReload(from, to, tabId);
  } else if (request.action === "stop") {
    clearTimeout(activeTabs[request.tabId].timeoutId);
    delete activeTabs[request.tabId];
    chrome.browserAction.setBadgeText({ text: '', tabId: request.tabId });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkStatus") {
    sendResponse({ isActive: !!activeTabs[request.tabId], activeTabId: request.tabId });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (activeTabs[tabId] && changeInfo.status === 'complete') {
    scheduleReload(activeTabs[tabId].from, activeTabs[tabId].to, tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabs[tabId]) {
    clearTimeout(activeTabs[tabId].timeoutId);
    delete activeTabs[tabId];
  }
});
