import React, { useState } from 'react'; // Import useState
import { FaEdit, FaGithub, FaEnvelope, FaSave, FaTimes } from 'react-icons/fa'; // Import relevant icons, including save and cancel
import { useGetUserAndGithubDataQuery } from '@/features/githubApiSlice'; // Import the hook
// Assuming you have a mutation hook for updating user data, e.g., useUpdateUserMutation
// import { useUpdateUserMutation } from '@/features/userApiSlice'; // You'll need to create this in your RTK Query setup

export default function UserProfile({ userId }) {
  const { data, isLoading, isError } = useGetUserAndGithubDataQuery(userId);
  // const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation(); // Example mutation hook

  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  // You might want to allow editing of other fields as well

  // Effect to set initial form values when data loads or when starting to edit
  React.useEffect(() => {
    if (data) {
      setEditedUsername(data.user?.username || '');
      setEditedEmail(data.githubData?.githubEmail || '');
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center text-red-500">
        Error loading profile.
      </div>
    );
  }

  const username = data?.user?.username || 'N/A';
  const email = data?.githubData?.githubEmail || 'N/A';
  const avatar_url = data?.githubData?.avatarUrl || '/logo.png'; // Use a default image
  const githubUsername = data?.githubData?.githubUsername || 'N/A';
  const joinedDate = data?.user?.joinedDate ? new Date(data.user.joinedDate).toLocaleDateString() : 'N/A'; // Format date
  const lastActivity = data?.user?.lastActivity ? new Date(data.user.lastActivity).toLocaleString() : 'N/A'; // Format date and time


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    // In a real application, you would send this data to your backend
    // using an RTK Query mutation.
    console.log('Saving changes:', { editedUsername, editedEmail });
    setIsEditing(false); // For demonstration, exit edit mode immediately
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset edited values to original data when canceling
    setEditedUsername(data.user?.username || '');
    setEditedEmail(data.githubData?.githubEmail || '');
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-green-50"
              aria-label="Save Profile"
              // disabled={isUpdating} // Disable while saving
            >
              <FaSave className="mr-2 text-sm" />
              <span className="text-sm font-medium">Save</span>
            </button>
            <button
              onClick={handleCancelClick}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-50"
              aria-label="Cancel Editing"
            >
              <FaTimes className="mr-2 text-sm" />
              <span className="text-sm font-medium">Cancel</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditClick}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-blue-50"
            aria-label="Edit Profile"
          >
            <FaEdit className="mr-2 text-sm" />
            <span className="text-sm font-medium">Edit Profile</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 mb-6">
        <img
          src={avatar_url}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 shadow-md"
        />
        <div>
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="font-extrabold text-2xl text-gray-900 mb-1 border-b border-gray-300 focus:border-blue-500 outline-none"
              />
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <FaEnvelope className="mr-2 text-blue-500" />
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="border-b border-gray-300 focus:border-blue-500 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="font-extrabold text-2xl text-gray-900 mb-1">{username}</div>
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <FaEnvelope className="mr-2 text-blue-500" />
                <span>{email}</span>
              </div>
            </>
          )}
          <div className="flex items-center text-gray-600 text-sm">
            <FaGithub className="mr-2 text-gray-700" />
            <span>{githubUsername}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-gray-700 text-sm">
        <p>Joined: {joinedDate}</p>
        <p>Last Activity: {lastActivity}</p>
      </div>
    </div>
  );
}