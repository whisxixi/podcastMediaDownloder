let mediaUrls = new Set();
let parsedNames = {};
let actionIntervalId;
let actionCounter = 0;
let actionMaxCount = 5;
let actionInterval = 2000;
let popupOpen = false;
let currentTabId = null;
let userActionTimeout;

// 静态表，用于存储符合条件的URL和文件名
let staticTable = {};

function resetPluginContent() {
  mediaUrls = new Set();
  parsedNames = {};
  staticTable = {}; // 重置静态表
  clearInterval(actionIntervalId);
  actionCounter = 0;
  chrome.storage.local.clear(() => {
    console.log("Plugin content and storage reset.");
    if (popupOpen) {
      notifyPopup();
    }
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    let url = details.url;
    console.log("Request started:", url);

    if (url.match(/\.mp3(\?.*)?$|\.m4a(\?.*)?$/)) {
      console.log("Media file detected on start:", url);
      mediaUrls.add(url);
      checkAndPrintCachedUrls(url);
      printMediaUrls();
      handleParsedName(url);
    }
  },
  {urls: ["<all_urls>"]}
);

chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    let url = details.url;
    console.log("Headers received for:", url);

    if (url.match(/\.mp3(\?.*)?$|\.m4a(\?.*)?$/)) {
      handleParsedName(url, details);
    }
  },
  {urls: ["<all_urls>"], types: ["media"]},
  ["responseHeaders"]
);

function printMediaUrls() {
  console.log("Current Media URLs:");
  mediaUrls.forEach(url => console.log(url));
}

function checkAndPrintCachedUrls(newUrl) {
  chrome.storage.local.get(['mediaUrls'], function(result) {
    if (result.mediaUrls) {
      let cachedUrls = new Set(result.mediaUrls);
      if (cachedUrls.has(newUrl)) {
        console.log("Cached URL detected:", newUrl);
      }
    }
  });
}

function initializeMediaUrls() {
  chrome.storage.local.get(['mediaUrls', 'parsedNames'], function(result) {
    if (result.mediaUrls) {
      mediaUrls = new Set(result.mediaUrls);
      console.log("Loaded media URLs from storage:", result.mediaUrls);
      printMediaUrls();
    } else {
      console.log("No media URLs found in storage");
    }
    if (result.parsedNames) {
      staticTable = result.parsedNames; // 将 parsedNames 加载到静态表中
      console.log("Loaded parsed names from storage:", result.parsedNames);
      printParsedNames();
    } else {
      console.log("No parsed names found in storage");
    }
  });
}

function saveMediaUrls() {
  chrome.storage.local.set({
    mediaUrls: Array.from(mediaUrls),
    parsedNames: staticTable // 将静态表保存到 parsedNames
  }, () => {
    console.log("Media URLs and parsed names saved to storage:", {
      mediaUrls: Array.from(mediaUrls),
      parsedNames: staticTable
    });
    if (popupOpen) {
      notifyPopup();
    }
  });
}

function handleParsedName(url, details) {
  let fileName = url.split('/').pop().split('?')[0];
  let fileSize = "Unknown size";
  if (details && details.responseHeaders) {
    const contentLengthHeader = details.responseHeaders.find(header => header.name.toLowerCase() === 'content-length');
    if (contentLengthHeader) {
      fileSize = (contentLengthHeader.value / (1024 * 1024)).toFixed(1) + " MB";
    }
  }
  if (!staticTable[fileName]) {
    staticTable[fileName] = { url: url, size: fileSize };
    console.log("Parsed and stored file name:", fileName, "with URL:", url, "and size:", fileSize);
    saveMediaUrls(); // 新增记录时同步静态表到存储
    notifyPopup(); // 新增记录时通知popup更新
  }
  printParsedNames();
}

function printParsedNames() {
  console.log("Parsed Names and URLs:");
  for (const [name, { url, size }] of Object.entries(staticTable)) {
    console.log(`Name: ${name}, URL: ${url}, Size: ${size}`);
  }
}

function notifyPopup() {
  chrome.runtime.sendMessage({action: 'updatePopup'}, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Popup is not open");
    } else {
      console.log("Popup updated successfully");
    }
  });
}

function startListening(tabId) {
  initializeMediaUrls();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'userAction') {
      handleUserAction(tabId);
    } else if (message.action === 'popupOpen') {
      popupOpen = true;
      sendResponse({status: 'ok'});
    } else if (message.action === 'popupClose') {
      popupOpen = false;
      sendResponse({status: 'ok'});
    }
  });

  console.log("Listening for user actions on tab", tabId);
}

function handleUserAction(tabId) {
  console.log("User action detected");
  clearTimeout(userActionTimeout); // 清除之前的 timeout
  userActionTimeout = setTimeout(() => {
    console.log("Processing user action");
    handleAction(tabId);
    actionCounter = 0;
    actionIntervalId = setInterval(() => {
      if (actionCounter < actionMaxCount) {
        console.log(`Processing user action, count: ${actionCounter + 1}`);
        handleAction(tabId);
        actionCounter++;
      } else {
        clearInterval(actionIntervalId);
        console.log("User action processing finished");
      }
    }, actionInterval);
  }, 200); // 确保每次触发计时器
}

function handleAction(tabId) {
  // 这里是具体处理逻辑，比如重新获取 media URLs
  console.log(`Handling action for tab: ${tabId}`);
  // 添加你的处理逻辑
}

function stopListening() {
  clearInterval(actionIntervalId);
  saveMediaUrls();
  console.log("Stopped listening for media URLs.");
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && currentTabId !== tabId) {
    console.log(`Tab updated: ${tab.url}`);
    resetPluginContent();
    startListening(tabId);
    currentTabId = tabId;
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  if (currentTabId !== activeInfo.tabId) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log(`Tab activated: ${tab.url}`);
      resetPluginContent();
      startListening(activeInfo.tabId);
      currentTabId = activeInfo.tabId;
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension startup");
  resetPluginContent();
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      startListening(tabs[0].id);
      currentTabId = tabs[0].id;
    }
  });
});

chrome.runtime.onSuspend.addListener(() => {
  console.log("Extension suspend");
  saveMediaUrls();
});
