'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Pencil,
  Image as ImageIcon,
  Building,
  Hash,
  Link as LinkIcon,
  Info, // Still useful for the "Company Details" title.
} from 'lucide-react';

const companyTypes = ['Private', 'Public', 'Non-Profit', 'Government', 'Startup'];

export default function CompanyDetailPage() {
  // State to track if company data has been successfully saved at least once.
  // This controls whether to show the initial form or the company details card.
  const [isDataSaved, setIsDataSaved] = useState(false);

  // State to control whether the form is in 'edit' mode (inputs enabled) or 'view' mode (inputs disabled).
  // Starts true to show the form for initial data entry.
  const [isEditing, setIsEditing] = useState(true);

  // Main state holding the current company data being displayed or edited.
  // Re-added the description field.
  const [company, setCompany] = useState({
    name: '',
    logo: null,
    logoUrl: '', // URL for displaying the logo (either blob or static)
    url: '',
    type: '',
    number: '',
    description: '', // Re-added: Description field
  });

  // Stores the last successfully saved company data. Used to revert changes on 'Cancel'.
  const [originalCompany, setOriginalCompany] = useState(company);

  // Ref for the hidden file input element, allowing programmatic clicks.
  const fileInputRef = useRef(null);

  // Effect hook to clean up the object URL created for image previews.
  // This prevents memory leaks by revoking blob URLs when they are no longer needed.
  useEffect(() => {
    return () => {
      // Revoke the object URL if it's a blob URL and differs from the last saved logo URL.
      if (company.logoUrl && company.logoUrl.startsWith('blob:') && company.logoUrl !== originalCompany.logoUrl) {
        URL.revokeObjectURL(company.logoUrl);
      }
    };
  }, [company.logoUrl, originalCompany.logoUrl]); // Dependencies: re-run if logoUrl or originalLogoUrl changes

  // Handles changes for all text and select input fields.
  const handleChange = (field, value) => {
    setCompany({ ...company, [field]: value });
  };

  // Handles changes for the company logo file input.
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return; // If no file is selected, do nothing.

    // Basic file size validation.
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    // Update company state with the file object and a URL for preview.
    setCompany({
      ...company,
      logo: file,
      logoUrl: URL.createObjectURL(file), // Create a temporary URL for immediate display
    });
  };

  // Handles the 'Save' action.
  const handleSave = () => {
    // Basic form validation for required fields.
    // Updated validation to include description check.
    if (!company.name || !company.url || !company.type || !company.number || !company.description) {
      alert('Please fill in all required company details before saving.');
      return;
    }

    // Set data as saved, switch to view mode, and update the original data.
    setIsDataSaved(true);
    setIsEditing(false);
    setOriginalCompany(company); // Crucial: store the current company state as the new 'original'

    // In a real application, you would send the `company` object to your backend API here.
    // console.log('Saved Data:', company);

    // Optionally, display a success message to the user.
    // For example: toast.success('Company details saved!');
  };

  // Handles the 'Cancel' action.
  const handleCancel = () => {
    if (!isDataSaved) {
      // If data was never saved (first time filling the form), clear the form and stay in edit mode.
      // Cleared description from reset.
      setCompany({ name: '', logo: null, logoUrl: '', url: '', type: '', number: '', description: '' });
      setIsEditing(true); // Keep the empty form visible
    } else {
      // If data was previously saved, revert to the original data and switch to view mode.
      setIsEditing(false); // Go back to viewing the card
      setCompany(originalCompany); // Revert all changes
      // If a new logo was selected but not saved, revoke its object URL to free memory.
      if (company.logoUrl && company.logoUrl.startsWith('blob:') && company.logoUrl !== originalCompany.logoUrl) {
        URL.revokeObjectURL(company.logoUrl);
      }
    }
  };

  // Programmatically clicks the hidden file input when the logo area is clicked.
  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
      {!isDataSaved || isEditing ? (
        // Renders the Company Details Form (for initial entry or editing)
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8 border border-gray-200 w-full animate-fade-in-up">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
            {isDataSaved ? 'Edit Company Details' : 'Add New Company Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Company Logo Section */}
            <div className="md:col-span-2 flex flex-col items-center mb-6">
              <label htmlFor="company-logo-upload" className="block text-sm font-semibold text-gray-700 mb-2">
                Company Logo
              </label>
              <div
                className={`relative w-32 h-32 rounded-full flex items-center justify-center border-2 ${
                  isEditing ? 'border-dashed border-indigo-400 cursor-pointer hover:border-indigo-600' : 'border-gray-300'
                } overflow-hidden bg-gray-50 transition duration-200`}
                onClick={triggerFileInput}
              >
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt=""
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <ImageIcon size={40} className="text-gray-400" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Pencil size={24} className="text-white" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={!isEditing}
                className="hidden"
                id="company-logo-upload"
              />
              {isEditing && !company.logoUrl && (
                <p className="mt-2 text-sm text-gray-500">Click to upload logo</p>
              )}
            </div>

            {/* Main Company Information Fields */}
            <div className="space-y-4 md:col-span-2"> {/* Now using two columns within this section for better layout */}
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company-name"
                  value={company.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'bg-gray-50 text-gray-700 border-transparent cursor-default'
                  }`}
                  placeholder="e.g., Global Innovations Inc."
                />
              </div>

              <div>
                <label htmlFor="company-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Company URL
                </label>
                <input
                  type="url"
                  id="company-url"
                  value={company.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'bg-gray-50 text-gray-700 border-transparent cursor-default'
                  }`}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="company-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Type
                </label>
                <select
                  id="company-type"
                  value={company.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'bg-gray-50 text-gray-700 border-transparent cursor-default appearance-none'
                  }`}
                >
                  <option value="" disabled>Select type</option>
                  {companyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Company ID / Number
                </label>
                <input
                  type="text"
                  id="company-number"
                  value={company.number}
                  onChange={(e) => handleChange('number', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'bg-gray-50 text-gray-700 border-transparent cursor-default'
                  }`}
                  placeholder="e.g., EIN, Registration No."
                />
              </div>

              {/* Re-added Description Field */}
              <div className="md:col-span-2"> {/* This takes full width in the two-column grid */}
                <label htmlFor="company-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="company-description"
                  value={company.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={!isEditing}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'bg-gray-50 text-gray-700 border-transparent cursor-default'
                  }`}
                  placeholder="A brief description of the company..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Action Buttons (Save/Cancel) */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition duration-200"
            >
              Save Company
            </button>
          </div>
        </div>
      ) : (
        // Display the professional Company Details Card
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8 border border-gray-200 w-full animate-fade-in-up">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} Logo`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <ImageIcon size={30} className="text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                  {company.name || 'Company Name Not Set'}
                </h2>
                <p className="text-md text-gray-600 flex items-center mt-1">
                  <Building size={16} className="mr-1 text-gray-500" />
                  {company.type || 'Type Not Set'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
            >
              <Pencil size={18} />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="space-y-4 text-gray-700">
            {/* Company Details Section - Now includes description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <Info size={20} className="text-indigo-500" />
                <span>Company Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p className="flex items-center space-x-2">
                  <LinkIcon size={18} className="text-gray-500" />
                  <span className="font-medium">Website: </span>
                  {company.url ? (
                    <a
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.url}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
                <p className="flex items-center space-x-2">
                  <Hash size={18} className="text-gray-500" />
                  <span className="font-medium">ID/Number: </span>
                  {company.number || 'N/A'}
                </p>
              </div>
              {/* Re-added Description for display */}
              <div className="mt-4"> {/* Added margin top for spacing */}
                <span className="font-medium">Description: </span>
                <p className="whitespace-pre-wrap">{company.description || 'N/A'}</p> {/* Use whitespace-pre-wrap to respect line breaks */}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-gray-600 text-sm italic">
              <p>This information was last updated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}