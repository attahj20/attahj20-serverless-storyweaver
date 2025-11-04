
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StoryStarter } from './components/StoryStarter';
import { StoryView } from './components/StoryView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateStorySegment, generateInitialStory } from './services/geminiService';
import type { StoryNode, StoryTree, ImagePart } from './types';

type AppState = 'idle' | 'loading' | 'error' | 'storytelling';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [storyTree, setStoryTree] = useState<StoryTree | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartStory = useCallback(async (premise: string, genre: string, tone: string, image: ImagePart | null) => {
    setAppState('loading');
    setError(null);
    try {
      const { storySegment, choices } = await generateInitialStory(premise, genre, tone, image);
      const rootNode: StoryNode = {
        id: 'root',
        parentId: null,
        storySegment,
        choiceText: premise,
        children: [],
      };
      const newStoryTree: StoryTree = {
        nodes: { root: rootNode },
        choices: { root: choices },
      };
      setStoryTree(newStoryTree);
      setCurrentNodeId('root');
      setAppState('storytelling');
    } catch (err) {
      console.error(err);
      setError('Failed to start the story. Please check your API key and try again.');
      setAppState('error');
    }
  }, []);

  const handleSelectChoice = useCallback(async (choice: string) => {
    if (!storyTree || !currentNodeId) return;

    setAppState('loading');
    setError(null);
    
    // Build story history
    const history: { choice: string; segment: string }[] = [];
    let currentId: string | null = currentNodeId;
    const path = [];
    while(currentId) {
        path.unshift(storyTree.nodes[currentId]);
        currentId = storyTree.nodes[currentId].parentId;
    }
    path.forEach(node => {
        history.push({ choice: node.choiceText, segment: node.storySegment });
    });
    
    try {
      const { storySegment, choices } = await generateStorySegment(history, choice);
      const newNodeId = `node-${Object.keys(storyTree.nodes).length}`;
      const newNode: StoryNode = {
        id: newNodeId,
        parentId: currentNodeId,
        storySegment,
        choiceText: choice,
        children: [],
      };

      setStoryTree(prevTree => {
        if (!prevTree) return null;
        const newNodes = { ...prevTree.nodes, [newNodeId]: newNode };
        newNodes[currentNodeId].children.push(newNodeId);
        const newChoices = { ...prevTree.choices, [newNodeId]: choices };
        delete newChoices[currentNodeId]; 
        return { nodes: newNodes, choices: newChoices };
      });

      setCurrentNodeId(newNodeId);
      setAppState('storytelling');
    } catch (err) {
      console.error(err);
      setError('Failed to continue the story. Please try another path or restart.');
      setAppState('storytelling'); // Return to storytelling to allow another choice
    }
  }, [storyTree, currentNodeId]);

  const handleRestart = () => {
    setStoryTree(null);
    setCurrentNodeId(null);
    setError(null);
    setAppState('idle');
  };

  const currentNode = storyTree && currentNodeId ? storyTree.nodes[currentNodeId] : null;
  const currentChoices = storyTree && currentNodeId ? storyTree.choices[currentNodeId] : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header onRestart={handleRestart} showRestart={appState === 'storytelling' || appState === 'error'} />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        {appState === 'idle' && <StoryStarter onStart={handleStartStory} />}
        {appState === 'loading' && (
            <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-indigo-400 animate-pulse">Weaving your tale...</p>
            </div>
        )}
         {(appState === 'storytelling' || appState === 'error') && storyTree && currentNode && (
            <StoryView 
                storyTree={storyTree}
                currentNode={currentNode}
                choices={currentChoices || []}
                onSelectChoice={handleSelectChoice}
                isLoading={appState === 'loading'}
                error={error}
            />
        )}
         {appState === 'error' && !storyTree && (
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
                <p className="text-red-400 text-xl mb-4">{error}</p>
                <button 
                    onClick={handleRestart} 
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors"
                >
                    Try Again
                </button>
            </div>
         )}
      </main>
    </div>
  );
}
