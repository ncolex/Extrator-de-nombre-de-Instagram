
import React, { useEffect, useState, useRef } from 'react';
import { ProcessedImageResult } from '../types';

interface ResultsDisplayProps {
  results: ProcessedImageResult[];
  onUpdateUsername: (imageIndex: number, usernameIndex: number, newUsername: string) => void;
  onDeleteUsername: (imageIndex: number, usernameIndex: number) => void;
}

interface EditableUsernameTagProps {
  username: string;
  onUpdate: (newUsername: string) => void;
  onDelete: () => void;
}

const EditableUsernameTag: React.FC<EditableUsernameTagProps> = ({ username, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editedUsername.trim() && editedUsername.trim() !== username) {
      onUpdate(editedUsername.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUsername(username);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editedUsername}
        onChange={(e) => setEditedUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="bg-slate-700 text-teal-200 px-3 py-1 rounded-full text-sm font-medium w-32 outline-none ring-2 ring-teal-500"
        aria-label="Edit username"
      />
    );
  }

  return (
    <div className="group relative flex items-center gap-1">
      <a
        href={`https://www.instagram.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center bg-teal-900/70 text-teal-300 hover:bg-teal-800/70 hover:text-teal-200 pl-3 pr-2 py-1 rounded-full text-sm font-medium transition-colors duration-200"
        aria-label={`View ${username} on Instagram`}
      >
        @{username}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1.5 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute -right-14">
        <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500" aria-label="Edit username">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
          </svg>
        </button>
        <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-400 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500" aria-label="Delete username">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};


const ResultCard: React.FC<{ result: ProcessedImageResult; resultIndex: number; onUpdateUsername: (...args: any[]) => void; onDeleteUsername: (...args: any[]) => void; }> = ({ result, resultIndex, onUpdateUsername, onDeleteUsername }) => {
  const imageUrl = URL.createObjectURL(result.file);

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl flex flex-col">
      <img src={imageUrl} alt={result.file.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex-grow flex flex-col gap-3">
        {result.usernames.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {result.usernames.map((username, usernameIndex) => (
              <EditableUsernameTag
                key={`${username}-${usernameIndex}`}
                username={username}
                onUpdate={(newUsername) => onUpdateUsername(resultIndex, usernameIndex, newUsername)}
                onDelete={() => onDeleteUsername(resultIndex, usernameIndex)}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No usernames found.</p>
        )}
      </div>
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onUpdateUsername, onDeleteUsername }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy All Links');
  const totalUsernames = results.reduce((acc, r) => acc + r.usernames.length, 0);

  const handleCopyAll = () => {
    if (totalUsernames === 0) return;

    const allLinks = results
      .flatMap(result => result.usernames)
      .map(username => `https://www.instagram.com/${username}`)
      .join('\n');

    navigator.clipboard.writeText(allLinks).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy All Links'), 2500);
    }).catch(err => {
      console.error('Failed to copy links: ', err);
      setCopyButtonText('Copy Failed');
      setTimeout(() => setCopyButtonText('Copy All Links'), 2500);
    });
  };

  return (
    <div className="w-full mt-10">
      <div className="mb-6 pb-4 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Results</h2>
                <p className="text-slate-400">Found <span className="font-bold text-teal-400">{totalUsernames}</span> username(s) across <span className="font-bold text-teal-400">{results.length}</span> image(s).</p>
            </div>
            {totalUsernames > 0 && (
                 <button
                    onClick={handleCopyAll}
                    className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 disabled:opacity-50 transition-all"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copyButtonText}
                </button>
            )}
        </div>
        <p className="text-xs text-slate-500 mt-3">Note: Automatic following is not possible due to Instagram's policies. Please click the links to visit and follow profiles manually.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <ResultCard
            key={index}
            result={result}
            resultIndex={index}
            onUpdateUsername={onUpdateUsername}
            onDeleteUsername={onDeleteUsername}
          />
        ))}
      </div>
    </div>
  );
};
