function sendMessageToBackground() {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({action: 'userAction'});
    }
  }
  
  document.addEventListener('click', sendMessageToBackground);
  document.addEventListener('keydown', sendMessageToBackground);
  