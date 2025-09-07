
import React from 'react';

export const Loader: React.FC = () => (
  <div className="mt-10 text-center">
    <div className="flex justify-center items-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-teal-400"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-teal-400" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-teal-400" style={{ animationDelay: '0.4s' }}></div>
    </div>
    <p className="text-slate-400 mt-4">AI is analyzing your images... this may take a moment.</p>
  </div>
);
