const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const fromUnit = document.getElementById("from-unit");
const toUnit = document.getElementById("to-unit");

function convertToMilliseconds(value, unit) {
  switch (unit) {
    case "seconds":
      return value * 1000;
    case "minutes":
      return value * 1000 * 60;
    case "hours":
      return value * 1000 * 60 * 60;
    default:
      return value * 1000;
  }
}

function checkStatusAndUpdateUI() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.runtime.sendMessage({ action: "checkStatus", tabId: tab.id }, (response) => {
      if (response.isActive && response.activeTabId === tab.id) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
      } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    });
  });
}

startBtn.addEventListener("click", () => {
  const from = convertToMilliseconds(parseInt(fromInput.value), fromUnit.value);
  const to = convertToMilliseconds(parseInt(toInput.value), toUnit.value);

  if (from > 0 && to > 0 && to >= from) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.runtime.sendMessage({ action: "start", from, to, tabId: tab.id });
      checkStatusAndUpdateUI();
    });
  } else {
    alert("Please enter valid 'from' and 'to' values.");
  }
});

stopBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.runtime.sendMessage({ action: "stop", tabId: tab.id });
    checkStatusAndUpdateUI();
  });
});

window.addEventListener("DOMContentLoaded", checkStatusAndUpdateUI);
