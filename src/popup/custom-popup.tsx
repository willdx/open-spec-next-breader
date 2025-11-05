import "~style.css"

function CustomPopup() {
  const handleDocumentCountClick = () => {
    alert("文档库功能待实现")
  }

  const handleLastReadClick = () => {
    alert("跳转至阅读界面功能待实现")
  }

  const handleExtractWebClick = () => {
    alert("抓取网页内容功能待实现")
  }

  const handleManualInputClick = () => {
    alert("手动输入功能待实现")
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-800 mb-2">阅读助手</h1>
        <p className="text-sm text-gray-600">清晰的结构+精简的内容</p>
      </div>

      {/* Document Statistics */}
      <div
        className="bg-blue-50 rounded-lg p-3 mb-4 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={handleDocumentCountClick}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">📚</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">文档库</p>
            <p className="text-xs text-gray-600">0个文档</p>
          </div>
        </div>
      </div>

      {/* Last Reading Record */}
      <div
        className="bg-green-50 rounded-lg p-3 mb-4 cursor-pointer hover:bg-green-100 transition-colors"
        onClick={handleLastReadClick}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">📖</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">上次阅读</p>
            <p className="text-xs text-gray-600">暂无阅读记录</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleExtractWebClick}
          className="w-full bg-purple-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-purple-600 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">🌐</span>
          抓取网页内容
        </button>

        <button
          onClick={handleManualInputClick}
          className="w-full bg-indigo-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">✏️</span>
          手动输入文档
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          v0.0.1 • 让阅读更高效
        </p>
      </div>
    </div>
  )
}

export default CustomPopup