// ConfigurationCard.jsx (or .js)
import React from 'react';
import { Edit, Trash2, Settings } from 'lucide-react'; // Assuming lucide-react is installed

const ConfigurationCard = ({
  configuration,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            {configuration.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            configuration.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {configuration.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-500">
            Configuration Items: {configuration.items.length}
          </p>
          <p className="text-sm text-gray-500">
            Created: {new Date(configuration.createdAt).toLocaleDateString()}
          </p>

          {configuration.items.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Sample Keys:</p>
              <div className="flex flex-wrap gap-1">
                {configuration.items.slice(0, 3).map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700"
                  >
                    {item.key}
                  </span>
                ))}
                {configuration.items.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700">
                    +{configuration.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(configuration)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onToggleStatus(configuration.id)}
            className={`px-3 py-2 text-sm rounded-md border ${
              configuration.isActive
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "border-blue-300 text-blue-700 hover:bg-blue-50"
            } transition-colors`}
          >
            {configuration.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => onDelete(configuration.id)}
            className="p-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationCard;