
import React from 'react';
import type { StoryNode, StoryTree } from '../types';
import { StoryArcVisualizer } from './StoryArcVisualizer';
import { LoadingSpinner } from './LoadingSpinner';

interface StoryViewProps {
  storyTree: StoryTree;
  currentNode: StoryNode;
  choices: string[];
  onSelectChoice: (choice: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const StoryView: React.FC<StoryViewProps> = ({ storyTree, currentNode, choices, onSelectChoice, isLoading, error }) => {
  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Your Story So Far...</h2>
        <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
           <p>{currentNode.storySegment}</p>
        </div>
        
        {error && <p className="mt-6 text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">What happens next?</h3>
          {isLoading ? (
             <div className="flex items-center space-x-3 text-gray-400">
                <LoadingSpinner />
                <span>The AI is pondering your fate...</span>
             </div>
          ) : choices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => onSelectChoice(choice)}
                  className="p-4 text-left font-medium bg-gray-900 hover:bg-indigo-900/50 border border-gray-700 hover:border-indigo-600 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-900/50 rounded-lg">
                <p className="text-xl font-semibold text-gray-300">The End</p>
                <p className="text-gray-400 mt-2">You've reached a conclusion to this path. Start a new story to explore other possibilities!</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
        <h3 className="text-xl font-bold text-center text-indigo-400 mb-4">Story Arc</h3>
        <div className="w-full h-96 lg:h-full min-h-[400px]">
          <StoryArcVisualizer tree={storyTree} currentNodeId={currentNode.id} />
        </div>
      </div>
    </div>
  );
};
