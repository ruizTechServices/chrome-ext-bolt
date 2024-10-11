import html2canvas from 'html2canvas'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capture') {
    html2canvas(document.body).then((canvas) => {
      const screenshotUrl = canvas.toDataURL()
      sendResponse({ screenshotUrl })
    })
    return true // Indicates that the response is asynchronous
  }
})