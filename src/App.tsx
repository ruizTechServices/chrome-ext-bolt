import React, { useState, useEffect } from 'react'

interface Screenshot {
  id: string;
  url: string;
  timestamp: number;
}

function App() {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [savedScreenshots, setSavedScreenshots] = useState<Screenshot[]>([])

  useEffect(() => {
    loadSavedScreenshots()
  }, [])

  const loadSavedScreenshots = () => {
    chrome.storage.local.get(['screenshots'], (result) => {
      if (result.screenshots) {
        setSavedScreenshots(result.screenshots)
      }
    })
  }

  const captureScreenshot = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'capture' }, (response) => {
          if (response && response.screenshotUrl) {
            setScreenshotUrl(response.screenshotUrl)
          }
        })
      }
    })
  }

  const saveScreenshot = () => {
    if (screenshotUrl) {
      const newScreenshot: Screenshot = {
        id: Date.now().toString(),
        url: screenshotUrl,
        timestamp: Date.now()
      }
      const updatedScreenshots = [...savedScreenshots, newScreenshot]
      chrome.storage.local.set({ screenshots: updatedScreenshots }, () => {
        setSavedScreenshots(updatedScreenshots)
        setScreenshotUrl(null)
      })
    }
  }

  const deleteScreenshot = (id: string) => {
    const updatedScreenshots = savedScreenshots.filter(screenshot => screenshot.id !== id)
    chrome.storage.local.set({ screenshots: updatedScreenshots }, () => {
      setSavedScreenshots(updatedScreenshots)
    })
  }

  return (
    <div className="w-96 p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Snipping Tool</h1>
      <button 
        onClick={captureScreenshot}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Capture Screenshot
      </button>
      {screenshotUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Screenshot Preview:</h2>
          <img src={screenshotUrl} alt="Captured Screenshot" className="max-w-full border border-gray-300 rounded" />
          <button 
            onClick={saveScreenshot}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Screenshot
          </button>
        </div>
      )}
      <h2 className="text-xl font-semibold mt-4 mb-2">Saved Screenshots:</h2>
      <div className="space-y-2">
        {savedScreenshots.map((screenshot) => (
          <div key={screenshot.id} className="flex items-center justify-between bg-white p-2 rounded shadow">
            <img src={screenshot.url} alt="Saved Screenshot" className="w-16 h-16 object-cover rounded" />
            <span className="text-sm text-gray-600">{new Date(screenshot.timestamp).toLocaleString()}</span>
            <button 
              onClick={() => deleteScreenshot(screenshot.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App