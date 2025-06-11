"use client";
import React from 'react';

export default function StatCard({ title, value, subtitle, icon: IconComponent }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer font-sans">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
          {title}
        </h3>
        {IconComponent && (
          <div className="text-indigo-600">
            <IconComponent className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">
        {value}
      </div>
      <p className="text-gray-500 text-xs">
        {subtitle}
      </p>
    </div>
  );
}
