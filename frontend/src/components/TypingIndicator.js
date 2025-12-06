import React from 'react';

function TypingIndicator({ darkMode }) {
  return (
    <div className={`flex items-start gap-3 animate-fade-in`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
      }`}>
        <span className="text-lg">🤖</span>
      </div>
      <div className={`rounded-2xl px-4 py-3 max-w-xs ${
        darkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="flex gap-1">
          <div className={`w-2 h-2 rounded-full animate-typing ${
            darkMode ? 'bg-gray-500' : 'bg-gray-400'
          }`} style={{ animationDelay: '0s' }}></div>
          <div className={`w-2 h-2 rounded-full animate-typing ${
            darkMode ? 'bg-gray-500' : 'bg-gray-400'
          }`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`w-2 h-2 rounded-full animate-typing ${
            darkMode ? 'bg-gray-500' : 'bg-gray-400'
          }`} style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
