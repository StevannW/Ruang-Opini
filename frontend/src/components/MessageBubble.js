import React, { useState } from 'react';
import DetailedAnalysis from './DetailedAnalysis';

function MessageBubble({ message, darkMode }) {
  const isUser = message.role === 'user';
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'constructive':
        return darkMode 
          ? 'from-green-900/50 to-green-800/50 border-green-700/50' 
          : 'from-green-50 to-green-100 border-green-200';
      case 'neutral':
        return darkMode 
          ? 'from-blue-900/50 to-blue-800/50 border-blue-700/50' 
          : 'from-blue-50 to-blue-100 border-blue-200';
      case 'hate_speech':
        return darkMode 
          ? 'from-red-900/50 to-red-800/50 border-red-700/50' 
          : 'from-red-50 to-red-100 border-red-200';
      case 'unrelated':
        return darkMode 
          ? 'from-gray-800/50 to-gray-700/50 border-gray-600/50' 
          : 'from-gray-50 to-gray-100 border-gray-200';
      default:
        return darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200';
    }
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'constructive': return '✅';
      case 'neutral': return 'ℹ️';
      case 'hate_speech': return '⚠️';
      case 'unrelated': return '❓';
      default: return '•';
    }
  };

  const formatClassification = (classification) => {
    return classification
      ?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full animate-slide-in-up">
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start gap-3 max-w-2xl ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all-smooth hover:scale-110 ${
            isUser 
              ? darkMode ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
              : darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
          }`}>
            <span className="text-lg">{isUser ? '👤' : '🤖'}</span>
          </div>

          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 transition-all-smooth hover-lift ${
            isUser
              ? darkMode 
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
              : darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
          {/* User message with text and optional image */}
          {isUser && (
            <div>
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Uploaded content" 
                  className="rounded-lg mb-2 max-w-xs max-h-48 object-cover"
                />
              )}
              {message.text && (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
            </div>
          )}

          {/* AI Response with classification */}
          {!isUser && message.result && (
            <div className="space-y-4">
              {/* Constructive vs Destructive Percentage */}
              {message.result.final_scores && (
                <div className="space-y-3">
                  <h3 className={`text-lg font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Hasil Analisis Keseluruhan
                  </h3>
                  
                  {/* Percentage Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-xl p-4 text-center ${darkMode ? 'bg-green-900/30 border-2 border-green-700/50' : 'bg-green-50 border-2 border-green-200'}`}>
                      <div className="text-3xl mb-2">✅</div>
                      <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                        Konstruktif
                      </div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                        {message.result.final_scores.constructive_percentage.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className={`rounded-xl p-4 text-center ${darkMode ? 'bg-red-900/30 border-2 border-red-700/50' : 'bg-red-50 border-2 border-red-200'}`}>
                      <div className="text-3xl mb-2">🚫</div>
                      <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                        Destruktif
                      </div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                        {message.result.final_scores.destructive_percentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description/Explanation */}
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>{message.result.explanation}</p>
              </div>

              {/* Classification Badge */}
              {message.result.final_scores && (
                <div className="text-center">
                  <div className={`inline-block px-6 py-2 rounded-full text-base font-bold ${
                    message.result.final_scores.classification === 'Sangat Membangun' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : message.result.final_scores.classification === 'Membangun'
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                      : message.result.final_scores.classification === 'Destruktif'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  }`}>
                    {message.result.final_scores.classification}
                  </div>
                </div>
              )}

              {/* View Detailed Analysis Button */}
              {message.result.scores && (
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all-smooth hover-lift ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                  }`}
                >
                  {showDetailedAnalysis ? '📊 Sembunyikan Analisis Detail' : '📊 Lihat Analisis Detail'}
                </button>
              )}

              {/* Detailed Analysis Panel (Inside Same Bubble) */}
              {message.result.scores && showDetailedAnalysis && (
                <div className="mt-4 animate-slide-in-up">
                  <DetailedAnalysis data={message.result} darkMode={darkMode} />
                </div>
              )}

              {/* Timestamp */}
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {new Date(message.result.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Simple text response */}
          {!isUser && !message.result && message.text && (
            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {message.text}
            </p>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
