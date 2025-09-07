
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { extractUsernamesFromImage } from './services/geminiService';
import { ProcessedImageResult } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [results, setResults] = useState<ProcessedImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessImages = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const processingPromises = files.map(file => 
        extractUsernamesFromImage(file).then(usernames => ({
          file,
          usernames,
        }))
      );
      
      const processedResults = await Promise.all(processingPromises);
      setResults(processedResults);
    } catch (err) {
      console.error(err);
      let errorMessage = 'An unexpected error occurred while processing the images. Please try again.';
      if (err instanceof Error) {
          const lowerCaseMessage = err.message.toLowerCase();
          if (lowerCaseMessage.includes('api key')) {
              errorMessage = 'API Key is invalid or missing. Please ensure it is configured correctly.';
          } else {
              // Display the more specific message from the service layer
              errorMessage = err.message;
          }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateUsername = useCallback((imageIndex: number, usernameIndex: number, newUsername: string) => {
    if (!newUsername.trim()) {
      // If the new username is empty, treat it as a delete action
      handleDeleteUsername(imageIndex, usernameIndex);
      return;
    }
    setResults(currentResults => {
      const newResults = [...currentResults];
      const targetResult = { ...newResults[imageIndex] };
      const newUsernames = [...targetResult.usernames];
      newUsernames[usernameIndex] = newUsername.replace(/^@/, ''); // remove leading @ if present
      targetResult.usernames = newUsernames;
      newResults[imageIndex] = targetResult;
      return newResults;
    });
  }, []);

  const handleDeleteUsername = useCallback((imageIndex: number, usernameIndex: number) => {
    setResults(currentResults => {
      const newResults = [...currentResults];
      const targetResult = { ...newResults[imageIndex] };
      const newUsernames = [...targetResult.usernames];
      newUsernames.splice(usernameIndex, 1);
      targetResult.usernames = newUsernames;
      newResults[imageIndex] = targetResult;
      return newResults;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 bg-slate-900 font-sans">
      <Header />
      
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center">
        <ImageUploader onProcess={handleProcessImages} isLoading={isLoading} />

        {isLoading && <Loader />}
        
        {error && (
          <div className="mt-8 w-full bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <ResultsDisplay
            results={results}
            onUpdateUsername={handleUpdateUsername}
            onDeleteUsername={handleDeleteUsername}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
