document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({action: 'popupOpen'}, (response) => {
    if (response && response.status === 'ok') {
      loadParsedNames();
      fetchPageTitle();
    }
  });

  window.addEventListener('unload', () => {
    chrome.runtime.sendMessage({action: 'popupClose'});
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updatePopup') {
      loadParsedNames(); // 重新加载解析的名称
    }
  });
});

function fetchPageTitle() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => document.querySelector('h1')?.innerText || 'No Title'
    }, (results) => {
      if (results && results[0]) {
        document.getElementById('pageTitle').innerText = results[0].result;
      }
    });
  });
}

function loadParsedNames() {
  console.log('--------loadParsedNames--------');
  chrome.storage.local.get(['parsedNames'], function(result) {
    const fileList = document.getElementById('fileList');
    console.log('Loading parsed names from storage:', result.parsedNames);
    if (result.parsedNames) {
      for (const [name, { url, size }] of Object.entries(result.parsedNames)) {
        if (!document.getElementById(name)) {
          const listItem = document.createElement('li');
          listItem.id = name;
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = `${name} (${size})`;

          const downloadButton = document.createElement('button');
          console.log('--------createElement button--------');
          downloadButton.textContent = 'Download';

          listItem.appendChild(nameSpan);
          listItem.appendChild(downloadButton);
          fileList.appendChild(listItem);

          console.log(`Added download button for ${name}`);

          downloadButton.addEventListener('click', (event) => {
            console.log('-------- button click listener--------');
            event.preventDefault(); // 防止默认行为，避免页面刷新
            console.log(`Download button clicked for ${name}`);
            if (downloadButton.textContent === 'Done') {
              window.close(); // 关闭插件界面
            } else {
              downloadButton.disabled = true;
              downloadButton.textContent = 'Preparing...';
              console.log(`Button text set to "Preparing..." for ${name}`);

              chrome.downloads.download({ url: url, filename: name }, (downloadId) => {
                if (downloadId) {
                  console.log(`Download started for ${name}, downloadId: ${downloadId}`);
                  downloadButton.textContent = 'Downloading...';
                  console.log(`Button text set to "Downloading..." for ${name}`);
                  const onChanged = function(delta) {
                    console.log(`delta.id: ${delta.id}`);
                    console.log(`downloadId: ${downloadId}`);
                    if (delta.id === downloadId) {
                      if (delta.state && delta.state.current === 'in_progress') {
                        downloadButton.textContent = 'Downloading...';
                        console.log(`Button text set to "Downloading..." for ${name}`);
                      }
                      if (delta.state && delta.state.current === 'complete') {
                        downloadButton.textContent = 'Done';
                        downloadButton.disabled = false;
                        console.log(`Button text set to "Done" for ${name}`);
                        chrome.downloads.onChanged.removeListener(onChanged);
                      }
                      if (delta.state && delta.state.current === 'interrupted') {
                        downloadButton.textContent = 'Failed';
                        downloadButton.disabled = false;
                        console.log(`Button text set to "Failed" for ${name}`);
                        chrome.downloads.onChanged.removeListener(onChanged);
                      }
                    }
                  };
                  chrome.downloads.onChanged.addListener(onChanged);
                } else {
                  downloadButton.textContent = 'Failed';
                  downloadButton.disabled = false;
                  console.log(`Download failed for ${name}`);
                }
              });
            }
          });
        }
      }
    } else {
      fileList.textContent = 'No podcast media files found. You may try refresh page.';
      console.log('No media files found in storage.');
    }
  });
}
