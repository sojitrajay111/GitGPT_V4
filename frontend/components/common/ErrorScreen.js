import React from 'react';
import { ShieldAlert, ArrowLeftCircle } from 'lucide-react';

const ErrorScreen = ({ title, message, errorDetails, onGoBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-900 to-red-800 p-4">
      <div className="text-center bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-700 max-w-md w-full">
        <ShieldAlert size={44} className="mx-auto mb-3 text-red-400" />
        <h1 className="text-xl md:text-2xl font-semibold mb-2 text-white">
          {title}
        </h1>
        <p className="text-sm md:text-base mb-3 text-gray-300">
          {message}
        </p>
        {errorDetails && (
          <p className="mt-2 text-xs font-mono bg-red-900/50 p-2 rounded border border-red-800 text-red-200 overflow-x-auto">
            Error: {errorDetails}
          </p>
        )}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="mt-5 flex items-center mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm md:text-base font-medium shadow-md transition-all"
          >
            <ArrowLeftCircle size={18} className="mr-1.5" /> Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
