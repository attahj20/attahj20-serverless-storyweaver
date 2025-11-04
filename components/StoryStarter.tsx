
import React, { useState } from 'react';
import type { ImagePart } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { UploadIcon } from './icons';

interface StoryStarterProps {
  onStart: (premise: string, genre: string, tone: string, image: ImagePart | null) => void;
}

export const StoryStarter: React.FC<StoryStarterProps> = ({ onStart }) => {
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [tone, setTone] = useState('Adventurous');
  const [image, setImage] = useState<ImagePart | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert("File is too large. Please select an image under 2MB.");
          return;
      }
      try {
        const base64Data = await fileToBase64(file);
        const mimeType = file.type;
        setImage({ inlineData: { mimeType, data: base64Data } });
        setImagePreview(URL.createObjectURL(file));
      } catch (error) {
          console.error("Error converting file to base64", error);
          alert("Could not process the image file.");
      }
    }
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (premise.trim() && !isLoading) {
      setIsLoading(true);
      onStart(premise, genre, tone, image);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Weave Your Tale</h2>
      <p className="text-center text-gray-400 mb-8">What story shall we create today?</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="premise" className="block text-sm font-medium text-gray-300 mb-2">
            Your Story's Premise
          </label>
          <textarea
            id="premise"
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            placeholder="e.g., A robot discovers a forgotten library on Mars."
            className="w-full h-28 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-gray-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
            <select id="genre" value={genre} onChange={e => setGenre(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 transition-all text-white">
              <option>Fantasy</option>
              <option>Sci-Fi</option>
              <option>Mystery</option>
              <option>Horror</option>
              <option>Romance</option>
              <option>Comedy</option>
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
            <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 transition-all text-white">
              <option>Adventurous</option>
              <option>Suspenseful</option>
              <option>Humorous</option>
              <option>Dramatic</option>
              <option>Whimsical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Inspiration Image (Optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Image preview" className="mx-auto h-24 w-auto rounded-md" />
              ) : (
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
              )}
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
            </div>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isLoading || !premise.trim()}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? 'Starting...' : 'Start Story'}
        </button>
      </form>
    </div>
  );
};
