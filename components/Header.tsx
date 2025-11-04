
import React from 'react';

interface HeaderProps {
    onRestart: () => void;
    showRestart: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRestart, showRestart }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          Serverless StoryWeaver
        </h1>
        {showRestart && (
            <button 
                onClick={onRestart}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200"
            >
                New Story
            </button>
        )}
      </div>
    </header>
  );
};
