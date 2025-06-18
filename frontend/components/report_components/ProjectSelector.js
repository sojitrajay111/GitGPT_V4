import React from "react";

export default function ProjectSelector({ allProjects, selectedProjectId, handleProjectChange, currentTheme }) {
  return (
    <select
      className="px-5 py-2 border rounded-lg text-base font-medium shadow-sm focus:ring-2 focus:border-transparent transition duration-200 ease-in-out"
      value={selectedProjectId}
      onChange={handleProjectChange}
      style={{
        backgroundColor: currentTheme.palette.background.paper,
        color: currentTheme.palette.text.primary,
        borderColor: currentTheme.palette.divider,
        outline: 'none',
        boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
      }}
    >
      {(allProjects && allProjects.length > 0) ? (
        allProjects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.projectName}
          </option>
        ))
      ) : (
        <option value="">No Projects Available</option>
      )}
    </select>
  );
} 