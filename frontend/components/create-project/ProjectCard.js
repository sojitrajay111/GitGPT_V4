// components/ProjectCard.js
import React from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Register Chart.js components if not already registered globally
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ProjectCard = ({ project, currentTheme, onProjectClick }) => {
  // Mock data for charts (retained from original page.js)
  const getWorkingReportChartData = (projectName) => ({
    labels: ["Completed", "In Progress", "Blocked"],
    datasets: [
      {
        data: [
          Math.floor(Math.random() * 50) + 20, // Completed %
          Math.floor(Math.random() * 30) + 10, // In Progress %
          Math.floor(Math.random() * 10) + 5, // Blocked %
        ],
        backgroundColor: ["#34D399", "#FBBF24", "#F87171"], // Tailwind green-400, amber-400, red-400
        hoverBackgroundColor: ["#10B981", "#F59E0B", "#EF4444"], // Tailwind green-500, amber-500, red-500
        borderWidth: 0,
      },
    ],
  });

  const getProjectsRemainingChartData = (projectName) => ({
    labels: ["Remaining Tasks"],
    datasets: [
      {
        label: "Tasks",
        data: [Math.floor(Math.random() * 30) + 5], // Number of remaining tasks
        backgroundColor: "#60A5FA", // Tailwind blue-400
        borderColor: "#3B82F6", // Tailwind blue-500
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed + "%";
            }
            return label;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false, // Hide x-axis labels
      },
      y: {
        beginAtZero: true,
        display: false, // Hide y-axis labels
      },
    },
  };

  // Extract GitHub URL from project data
  const getGitHubRepo = (project) => {
    return project.githubRepoLink || "N/A";
  };

  return (
    <div
      key={project._id}
      className={`rounded-xl shadow-md border overflow-hidden transform transition-transform duration-200 hover:scale-[1.01]
        ${
          currentTheme === "dark"
            ? "bg-[#161717] border-gray-700"
            : "bg-white border-gray-200"
        }
      `}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Project Details */}
        <div className="p-5 lg:w-2/3">
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-xl font-bold cursor-pointer hover:text-blue-500 transition-colors duration-200
                ${currentTheme === "dark" ? "text-white" : "text-gray-900"}
              `}
              onClick={() => onProjectClick(project._id)}
            >
              {project.projectName}
            </h3>
            <div className="flex space-x-2">
              <a
                href={getGitHubRepo(project)}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-colors duration-200
                  ${
                    currentTheme === "dark"
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }
                `}
                title="Go to GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.74.08-.725.08-.725 1.204.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
          <p
            className={`mb-3 text-sm
              ${currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}
            `}
          >
            {project.projectDescription}
          </p>
          <div
            className={`text-sm hover:underline truncate
              ${currentTheme === "dark" ? "text-blue-400" : "text-blue-600"}
            `}
          >
            <a
              href={getGitHubRepo(project)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.74.08-.725.08-.725 1.204.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              {getGitHubRepo(project)}
            </a>
          </div>
        </div>

        {/* Charts Section */}
        <div
          className={`lg:w-1/3 p-5 flex flex-col sm:flex-row lg:flex-col items-center justify-around border-t lg:border-t-0 lg:border-l
            ${
              currentTheme === "dark"
                ? "bg-[#2f2f2f] border-gray-700"
                : "bg-gray-50 border-gray-200"
            }
          `}
        >
          <div className="w-full sm:w-1/2 lg:w-full h-32 mb-4 sm:mb-0 lg:mb-4 flex flex-col items-center">
            <h4
              className={`text-md font-semibold mb-2
                ${currentTheme === "dark" ? "text-gray-200" : "text-gray-700"}
              `}
            >
              Working Report
            </h4>
            <div className="relative w-24 h-24">
              <Doughnut
                data={getWorkingReportChartData(project.projectName)}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
