import React from 'react';
import { useGetProjectsQuery, useGetDeveloperProjectsQuery } from '@/features/projectApiSlice'; // Import your RTK Query hooks
import { useGetUserAndGithubDataQuery } from '@/features/githubApiSlice'; // To get the user role
import { useParams } from 'next/navigation'; // To get userId from the URL

export default function InProgressProjectList() {
  const { userId } = useParams(); // Get userId from the URL
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const user_role = userData?.user?.role;

  // Fetch projects based on user role
  const { data: managerProjectsData, isLoading: managerProjectsLoading, isError: managerProjectsError } = useGetProjectsQuery(userId, { skip: user_role !== "manager" || !userId });
  const { data: developerProjectsData, isLoading: developerProjectsLoading, isError: developerProjectsError } = useGetDeveloperProjectsQuery(userId, { skip: user_role !== "developer" || !userId });

  // Determine which projects array to use
  const allProjects = user_role === "manager" ? managerProjectsData?.projects : developerProjectsData;

  const isLoading = managerProjectsLoading || developerProjectsLoading;
  const isError = managerProjectsError || developerProjectsError;

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 flex justify-center items-center h-48 font-sans"> {/* Added font-sans here */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center text-red-500 font-sans"> {/* Added font-sans here */}
        Error loading projects.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 font-sans"> {/* Applied font-sans to the main container */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
        All Assigned Projects
      </h2>
      <ul className="space-y-4">
        {(allProjects && allProjects.length > 0) ? (
          allProjects.map((project) => (
            <li
              key={project._id}
              className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:scale-[1.01] shadow-sm"
            >
              <span className="text-gray-900 font-semibold text-lg">
                {project.projectName}
              </span>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-center py-4">
            No projects assigned yet.
          </li>
        )}
      </ul>

      <div className="mt-6 text-center">
        <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">
          Manage Projects &rarr;
        </button>
      </div>
    </div>
  );
}