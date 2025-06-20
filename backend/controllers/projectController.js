const Project = require("../models/Project");
const GitHubData = require("../models/GithubData"); // To get PAT for repo creation
const User = require("../models/User"); // To update isAuthenticatedToGithub if PAT becomes invalid
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Import ProjectCollaborator

const createProject = async (req, res) => {
  try {
    const {
      projectName,
      projectDescription,
      githubRepoLink,
      createNewRepo,
      repoName,
    } = req.body;
    const userId = req.user.id; // Assuming userId from authentication middleware

    // Validate required fields for project creation
    if (!projectName || !projectDescription) {
      return res.status(400).json({
        success: false,
        message: "Project name and description are required.",
      });
    }

    let finalGithubRepoLink = githubRepoLink; // Initialize with provided link

    // If the user opts to create a new GitHub repository
    if (createNewRepo) {
      if (!repoName) {
        return res.status(400).json({
          success: false,
          message: "New repository name is required when creating a new repo.",
        });
      }

      // Fetch GitHub authentication data for the user
      const githubData = await GitHubData.findOne({ userId });
      if (!githubData || !githubData.githubPAT || !githubData.githubUsername) {
        return res.status(400).json({
          success: false,
          message:
            "GitHub authentication data missing. Cannot create new repository without a valid PAT.",
        });
      }

      const githubPAT = githubData.githubPAT;
      const githubUsername = githubData.githubUsername;

      // 1. Call GitHub API to create a new private repository
      const createRepoResponse = await fetch(
        `https://api.github.com/user/repos`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${githubPAT}`,
            "User-Agent": githubUsername, // GitHub requires a User-Agent header
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: repoName,
            private: true, // Always create private repos
            description: projectDescription, // Use project description for repo description
          }),
        }
      );

      if (!createRepoResponse.ok) {
        // If token is invalid or expired (e.g., 401 Unauthorized), update user's auth status
        if (createRepoResponse.status === 401) {
          await User.findByIdAndUpdate(userId, {
            isAuthenticatedToGithub: false,
          });
        }
        const errorData = await createRepoResponse.json();
        console.error("GitHub repo creation error:", errorData);
        return res.status(createRepoResponse.status).json({
          success: false,
          message: `Failed to create GitHub repository: ${
            errorData.message || "Unknown error"
          }`,
        });
      }

      const newRepoData = await createRepoResponse.json();
      finalGithubRepoLink = newRepoData.html_url; // Set the link to the newly created repo
      const defaultBranch = newRepoData.default_branch; // Get the default branch name (usually 'main' or 'master')

      // 2. Create README.md file and push it to the default branch
      const readmeContent = `# ${projectName}\n\n${projectDescription}\n`;
      const encodedReadmeContent =
        Buffer.from(readmeContent).toString("base64");

      try {
        const createReadmeResponse = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}/contents/README.md`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Initial commit: Add README.md",
              content: encodedReadmeContent,
              branch: defaultBranch,
            }),
          }
        );

        if (!createReadmeResponse.ok) {
          const errorData = await createReadmeResponse.json();
          console.error("Failed to create README.md:", errorData);
          console.warn(
            "Could not create README.md. Project created, but README might be missing."
          );
        } else {
          console.log("README.md created successfully.");
        }
      } catch (error) {
        console.error("Error creating README.md:", error);
      }

      // Define standard SFDX project files and content
      const sfdxProjectFiles = [
        {
          path: ".forceignore",
          content: `# Files matching these patterns are ignored when pushing or retrieving changes.\n# Add patterns for sensitive data, generated files, or anything you don't want in your Salesforce org.\n\n# Example: Ignore local configurations\n.env\nconfig/*.json\n\n# Salesforce DX specific ignores\n**/*.log\n**/debugs/*\n**/test-results/*\n**/reports/*\n**/metadata/*\n**/temp/*\n\n# VS Code specific ignores\n.vscode/*\n!/.vscode/extensions.json\n!/.vscode/settings.json\n!/.vscode/launch.json`,
        },
        {
          path: ".gitignore",
          content: `# Salesforce DX project specific ignores\n.sfdx/\n.sf/\n# If using npm\nnode_modules/\npackage-lock.json\n\n# If using VS Code\n.vscode/\n\n# Logs\n*.log\n\n# Misc\n.DS_Store\n*.sublime-project\n*.sublime-workspace`,
        },
        {
          path: ".prettierignore",
          content: `# Files matching these patterns will be ignored by Prettier.\n# Add patterns for generated files or directories that you don't want Prettier to format.\n\n# Salesforce DX specific ignores\n**/sfdx-project.json\n**/force-app/main/default/**/*.xml\n\n# Node modules\nnode_modules/`,
        },
        {
          path: ".prettierrc",
          content: `{\n  "trailingComma": "es5",\n  "tabWidth": 2,\n  "semi": true,\n  "singleQuote": true,\n  "printWidth": 120\n}`,
        },
        {
          path: "jest.config.js",
          content: `module.exports = {\n  testEnvironment: 'node',\n  // Add more Jest configurations as needed for Salesforce projects (e.g., LWC testing)\n};`,
        },
        {
          path: "package.json",
          content: `{\n  "name": "${
            repoName || "sfdx-project"
          }",\n  "private": true,\n  "version": "1.0.0",\n  "description": "Salesforce DX Project",\n  "scripts": {\n    "test": "echo \\"No test specified\\" && exit 0"\n  },\n  "devDependencies": {\n    "@salesforce/sfdx-lwc-jest": "^0.12.0"\n  },\n  "dependencies": {},\n  "keywords": [\n    "salesforce",\n    "sfdx"\n  ],\n  "author": "",\n  "license": "ISC"\n}`,
        },
        {
          path: "sfdx-project.json",
          content: `{\n  "packageDirectories": [\n    {\n      "path": "force-app",\n      "default": true\n    }\n  ],\n  "namespace": "",\n  "sfdcApiVersion": "58.0",\n  "sourceApiVersion": "58.0"\n}`,
        },
        // Empty directories represented by .gitkeep
        { path: ".husky/.gitkeep", content: "" },
        { path: ".sf/.gitkeep", content: "" },
        { path: ".sfdx/.gitkeep", content: "" },
        { path: ".vscode/.gitkeep", content: "" },
        { path: "config/.gitkeep", content: "" },
        { path: "scripts/.gitkeep", content: "" },
        { path: "force-app/main/default/applications/.gitkeep", content: "" },
        { path: "force-app/main/default/aura/.gitkeep", content: "" },
        { path: "force-app/main/default/classes/.gitkeep", content: "" },
        { path: "force-app/main/default/contentassets/.gitkeep", content: "" },
        { path: "force-app/main/default/flexipages/.gitkeep", content: "" },
        { path: "force-app/main/default/layouts/.gitkeep", content: "" },
        { path: "force-app/main/default/lwc/.gitkeep", content: "" },
        { path: "force-app/main/default/objects/.gitkeep", content: "" },
        { path: "force-app/main/default/permissionsets/.gitkeep", content: "" },
        {
          path: "force-app/main/default/staticresources/.gitkeep",
          content: "",
        },
        { path: "force-app/main/default/tabs/.gitkeep", content: "" },
        { path: "force-app/main/default/triggers/.gitkeep", content: "" },
      ];

      // 3. Generate SFDX project structure and push it to main
      try {
        // Get the latest commit SHA of the default branch (main)
        const getDefaultBranchRefResponse = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}/git/ref/heads/${defaultBranch}`,
          {
            method: "GET",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
          }
        );

        if (!getDefaultBranchRefResponse.ok) {
          const errorData = await getDefaultBranchRefResponse.json();
          console.error(`Failed to get ref for ${defaultBranch}:`, errorData);
          throw new Error(`Failed to get ref for ${defaultBranch}`);
        }
        const defaultBranchRefData = await getDefaultBranchRefResponse.json();
        const latestCommitSha = defaultBranchRefData.object.sha;

        // Get the tree SHA of the latest commit
        const getCommitResponse = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}/git/commits/${latestCommitSha}`,
          {
            method: "GET",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
          }
        );

        if (!getCommitResponse.ok) {
          const errorData = await getCommitResponse.json();
          console.error("Failed to get commit details:", errorData);
          throw new Error("Failed to get commit details");
        }
        const commitData = await getCommitResponse.json();
        const baseTreeSha = commitData.tree.sha;

        // Prepare tree objects for new files
        const tree = sfdxProjectFiles.map((file) => ({
          path: file.path,
          mode: "100644", // File blob
          type: "blob",
          content: file.content,
        }));

        // Create a new tree
        const createTreeResponse = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}/git/trees`,
          {
            method: "POST",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base_tree: baseTreeSha,
              tree: tree,
            }),
          }
        );

        if (!createTreeResponse.ok) {
          const errorData = await createTreeResponse.json();
          console.error("Failed to create new tree:", errorData);
          throw new Error("Failed to create new tree");
        }
        const newTreeData = await createTreeResponse.json();
        const newTreeSha = newTreeData.sha;

        // Create a new commit
        const createCommitResponse = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}/git/commits`,
          {
            method: "POST",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Initial commit: Add Salesforce DX project structure",
              tree: newTreeSha,
              parents: [latestCommitSha],
            }),
          }
        );

        if (!createCommitResponse.ok) {
          const errorData = await createCommitResponse.json();
          console.error("Failed to create new commit:", errorData);
          throw new Error("Failed to create new commit");
        }
        const newCommitData = await createCommitResponse.json();
        const newCommitSha = newCommitData.sha;

        // Update the default branch (main) to point to the new commit
        const updateBranchRefResponse = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}/git/refs/heads/${defaultBranch}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sha: newCommitSha,
            }),
          }
        );

        if (!updateBranchRefResponse.ok) {
          const errorData = await updateBranchRefResponse.json();
          console.error(
            `Failed to update ${defaultBranch} branch ref:`,
            errorData
          );
          throw new Error(`Failed to update ${defaultBranch} branch ref`);
        }
        console.log(
          "Salesforce DX project structure committed successfully to main."
        );

        // 4. Implement hierarchical branch creation: main -> uat -> qat -> dev (lowercase)
        let currentBaseBranch = defaultBranch;
        let currentBaseSha = newCommitSha; // Use the SHA of the commit with SFDX structure

        const branchOrder = ["uat", "qat", "dev"]; // Lowercase as requested

        for (const branchName of branchOrder) {
          const createBranchResponse = await fetch(
            `https://api.github.com/repos/${githubUsername}/${repoName}/git/refs`,
            {
              method: "POST",
              headers: {
                Authorization: `token ${githubPAT}`,
                "User-Agent": githubUsername,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: currentBaseSha, // Branch off the current base SHA
              }),
            }
          );

          if (!createBranchResponse.ok) {
            const errorData = await createBranchResponse.json();
            console.error(
              `Failed to create branch '${branchName}' from '${currentBaseBranch}':`,
              errorData
            );
            // If a branch fails to create, we cannot proceed with the hierarchical creation
            // as subsequent branches depend on it. So, break the loop.
            break;
          } else {
            console.log(
              `Branch '${branchName}' created successfully from '${currentBaseBranch}'.`
            );
            // Update currentBaseBranch and currentBaseSha for the next iteration
            currentBaseBranch = branchName;
            // Get the SHA of the newly created branch to use as the base for the next one
            const getNewBranchShaResponse = await fetch(
              `https://api.github.com/repos/${githubUsername}/${repoName}/git/ref/heads/${currentBaseBranch}`,
              {
                method: "GET",
                headers: {
                  Authorization: `token ${githubPAT}`,
                  "User-Agent": githubUsername,
                  "Content-Type": "application/json",
                },
              }
            );

            if (getNewBranchShaResponse.ok) {
              const newBranchShaData = await getNewBranchShaResponse.json();
              currentBaseSha = newBranchShaData.object.sha;
            } else {
              const errorData = await getNewBranchShaResponse.json();
              console.error(
                `Failed to get SHA for newly created branch ${currentBaseBranch}:`,
                errorData
              );
              console.warn(
                "Subsequent hierarchical branches might not be created correctly."
              );
              // If we can't get the SHA of the new branch, future branches in the hierarchy will fail
              break;
            }
          }
        }
      } catch (error) {
        console.error(
          "Error generating SFDX project structure or branches:",
          error
        );
        // It's important to decide if this should be a hard failure or allow project creation
        // but with a warning that the GitHub repo might not be fully initialized as expected.
        // For now, it will proceed but log a warning. You might want to return an error.
      }
    } else if (!githubRepoLink) {
      // If not creating a new repo, a GitHub repo link must be provided
      return res.status(400).json({
        success: false,
        message:
          "GitHub repository link is required if not creating a new one.",
      });
    }

    // Create the new project in the database
    const newProject = await Project.create({
      userId,
      projectName,
      projectDescription,
      githubRepoLink: finalGithubRepoLink,
      projectType: "Salesforce", // Explicitly set projectType to 'Salesforce'
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully!",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating project",
    });
  }
};

/**
 * @desc Get all projects for a specific user.
 * @route GET /api/projects/user/:userId
 * @access Private (requires user authentication middleware)
 */
const getProjectsByUserId = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId from authentication middleware

    // Find all projects associated with the userId and sort by creation date
    const projects = await Project.find({ userId }).sort({ createdAt: -1 }); // -1 for descending order

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching projects",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have permission to view it.",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching the project.",
    });
  }
};

/**
 * @desc Update an existing project.
 * @route PUT /api/projects/:projectId
 * @access Private (requires project ownership)
 */
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; // User initiating the update
    const { projectName, projectDescription } = req.body;

    if (!projectName || !projectDescription) {
      return res.status(400).json({
        success: false,
        message: "Project name and description are required for update.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Ensure the user updating the project is the owner
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project.",
      });
    }

    // Update project fields
    project.projectName = projectName;
    project.projectDescription = projectDescription;
    // Note: githubRepoLink is intentionally not updatable via this route as per requirements.

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully!",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating the project.",
    });
  }
};

/**
 * @desc Delete a project.
 * @route DELETE /api/projects/:projectId
 * @access Private (requires project ownership)
 */
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; // User initiating the delete

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Ensure the user deleting the project is the owner
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project.",
      });
    }

    await project.deleteOne(); // Use deleteOne() or remove()

    // Optionally, also delete associated collaborators data from ProjectCollaborator collection
    await ProjectCollaborator.deleteOne({ project_id: projectId });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully from the database.",
      githubRepoLink: project.githubRepoLink, // Return repo link for potential GitHub deletion in frontend
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting the project.",
    });
  }
};

const getProjectReportData = async (req, res) => {
  try {
    const { projectId } = req.params;

    // In a real application, you would fetch dynamic data from your database
    // based on the projectId. For now, we'll return mock data.
    const mockReportData = {
      developerActivity: [
        { name: "Mon", "Hours Worked": 8, "Tasks Completed": 3 },
        { name: "Tue", "Hours Worked": 7.5, "Tasks Completed": 4 },
        { name: "Wed", "Hours Worked": 8.5, "Tasks Completed": 3 },
        { name: "Thu", "Hours Worked": 9, "Tasks Completed": 5 },
        { name: "Fri", "Hours Worked": 7, "Tasks Completed": 2 },
        { name: "Sat", "Hours Worked": 4, "Tasks Completed": 1 },
        { name: "Sun", "Hours Worked": 2, "Tasks Completed": 0 },
      ],
      codeContribution: [
        { name: "Jan", "Developer LOC": 4000, "AI Generated LOC": 2400 },
        { name: "Feb", "Developer LOC": 3000, "AI Generated LOC": 1398 },
        { name: "Mar", "Developer LOC": 2000, "AI Generated LOC": 9800 },
        { name: "Apr", "Developer LOC": 2780, "AI Generated LOC": 3908 },
        { name: "May", "Developer LOC": 1890, "AI Generated LOC": 4800 },
        { name: "Jun", "Developer LOC": 2390, "AI Generated LOC": 3800 },
      ],
      aiImpact: [
        { name: "Feature A", "Time Reduced (Hours)": 15, "Cost Saved ($)": 750 },
        { name: "Feature B", "Time Reduced (Hours)": 10, "Cost Saved ($)": 500 },
        { name: "Feature C", "Time Reduced (Hours)": 20, "Cost Saved ($)": 1000 },
        { name: "Feature D", "Time Reduced (Hours)": 8, "Cost Saved ($) ": 400 },
      ],
      developerVelocity: [
        { name: "Before AI", value: 5.2 },
        { name: "With AI", value: 2.8 },
      ],
      projectStatus: [
        { name: "Completed Projects", value: 60 },
        { name: "In Progress", value: 35 },
        { name: "On Hold", value: 5 },
      ],
      statCards: {
        tasksCompleted: 42, // Example dynamic data
        avgCompletionTime: "5.2",
        teamProductivity: "85",
        pendingReviews: 3,
      },
    };

    res.status(200).json({ success: true, data: mockReportData });
  } catch (error) {
    console.error("Error fetching project report data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project report data.",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectReportData,
};
