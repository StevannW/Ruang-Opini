import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputText]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        alert('Only JPG and PNG images are supported');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim() && !selectedImage) return;

    // Add user message
    const userMessage = {
      role: 'user',
      text: inputText,
      image: imagePreview,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const imageToSubmit = selectedImage;
    handleRemoveImage();
    
    setLoading(true);

    try {
      let response;
      
      if (imageToSubmit) {
        // Image classification
        const formData = new FormData();
        formData.append('file', imageToSubmit);
        response = await axios.post(`${API_URL}/classify_image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Text classification
        response = await axios.post(`${API_URL}/classify_text`, {
          text: userMessage.text
        });
      }

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        result: response.data,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        text: `❌ Error: ${err.response?.data?.detail || 'Failed to analyze content. Please try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'dark bg-gray-950' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      
      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {/* Messages Container */}
        <div className={`flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar ${
          darkMode ? 'custom-scrollbar-dark' : ''
        }`}>
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce-subtle">💬</div>
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Welcome to GovSense
                </h2>
                <p className={`text-sm max-w-md mx-auto ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Send a message or upload an image to analyze whether it contains constructive 
                  criticism, neutral content, hate speech, or unrelated content.
                </p>
                <div className={`flex gap-4 justify-center mt-6 text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>✅</span> Constructive
                  </div>
                  <div className="flex items-center gap-2">
                    <span>ℹ️</span> Neutral
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⚠️</span> Hate Speech
                  </div>
                  <div className="flex items-center gap-2">
                    <span>❓</span> Unrelated
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} darkMode={darkMode} />
          ))}
          
          {loading && <TypingIndicator darkMode={darkMode} />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`rounded-2xl shadow-2xl transition-all-smooth ${
          darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          {/* Image Preview */}
          {imagePreview && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 animate-scale-in">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                    flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-3 items-end">
              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center 
                  transition-all-smooth hover-lift ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Upload image"
              >
                <span className="text-xl">📎</span>
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className={`flex-1 resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
                  focus:ring-indigo-500 transition-all-smooth ${
                  darkMode
                    ? 'bg-gray-800 text-white placeholder-gray-500'
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ maxHeight: '150px' }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || (!inputText.trim() && !selectedImage)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center 
                  transition-all-smooth ${
                  loading || (!inputText.trim() && !selectedImage)
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover-lift hover-glow'
                }`}
                title="Send message"
              >
                <span className="text-xl">
                  {loading ? '⏳' : '🚀'}
                </span>
              </button>
            </div>
            
            <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Press Enter to send • Shift+Enter for new line
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={`text-center py-4 text-xs ${
        darkMode ? 'text-gray-600' : 'text-gray-500'
      }`}>
        Powered by Google Gemini AI • GovSense v1.0
      </footer>
    </div>
  );
}

export default App;
