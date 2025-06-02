import React from 'react';

const StatusPill = ({ status }) => {
  let bgColorClass = '';
  let textColorClass = '';

  switch (status.toLowerCase()) {
    case 'in progress':
      bgColorClass = 'bg-blue-100';
      textColorClass = 'text-blue-800';
      break;
    case 'pending':
      bgColorClass = 'bg-yellow-100';
      textColorClass = 'text-yellow-800';
      break;
    case 'completed':
      bgColorClass = 'bg-green-100';
      textColorClass = 'text-green-800';
      break;
    case 'blocked':
      bgColorClass = 'bg-red-100';
      textColorClass = 'text-red-800';
      break;
    default:
      bgColorClass = 'bg-gray-100';
      textColorClass = 'text-gray-800';
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColorClass} ${textColorClass}`}>
      {status}
    </span>
  );
};

export default StatusPill;