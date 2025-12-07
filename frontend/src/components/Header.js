import React from 'react';
import Logo from './Logo';

function Header({ darkMode, setDarkMode }) {
  return (
    <header className={`shadow-lg transition-all-smooth ${
      darkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 animate-slide-in-left">
            <Logo className="w-12 h-12" darkMode={darkMode} />
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                RuangOpini
              </h1>
            
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all-smooth hover-lift ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            aria-label="Toggle dark mode"
          >
            <div className="text-xl">
              {darkMode ? '☀️' : '🌙'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
