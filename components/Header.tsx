
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 w-full max-w-4xl">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
          Insta-Extractor AI
        </span>
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
        Upload your images and let our AI find all the Instagram usernames for you.
      </p>
    </header>
  );
};
