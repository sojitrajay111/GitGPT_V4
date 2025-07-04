const Project = require("../models/Project");
const GitHubData = require("../models/GithubData"); // To get PAT for repo creation
const User = require("../models/User"); // To update isAuthenticatedToGithub if PAT becomes invalid
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Import ProjectCollaborator
const { createGitHubWebhook } = require("./githubController");

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
        const errorData = await createRepoResponse.json(); // Parse error response
        // If token is invalid or expired (e.g., 401 Unauthorized), update user's auth status
        if (createRepoResponse.status === 401) {
          await User.findByIdAndUpdate(userId, {
            isAuthenticatedToGithub: false,
          });
        }
        console.error(
          "GitHub repo creation error (status:",
          createRepoResponse.status,
          "):",
          errorData
        );
        return res.status(createRepoResponse.status).json({
          success: false,
          message: `Failed to create GitHub repository: ${
            errorData.message || "Unknown error"
          }. Details: ${JSON.stringify(errorData.errors || "N/A")}`, // Include specific errors array if present
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

      // Define ONLY the GitHub Action workflow files to be pushed by the backend.
      // The SFDX project structure and initial code will be handled by the GitHub Action itself.
      const sfdxProjectFiles = [
        // --- GitHub Action Workflow File: initialize-sfdx.yml ---
        {
          path: ".github/workflows/initialize-sfdx.yml",
          content: `name: Initialize Salesforce DX Project

on:
  push:
    branches:
      - main # Trigger when the initial commit (e.g., README.md) lands on main
    # Optional: Only trigger if README.md (or similar initial file) is pushed
    # paths:
    #   - 'README.md' 
    
jobs:
  setup-sfdx-project:
    runs-on: ubuntu-latest
    
    # Permissions for GITHUB_TOKEN to push changes and create branches
    permissions:
      contents: write
      pull-requests: write # If you ever wanted to open PRs, good to have
      id-token: write # If you need OIDC for external services

    steps:
      - name: Check if SFDX Project is already initialized
        id: check_init
        run: |
          if [ -f "sfdx-project.json" ]; then
            echo "sfdx-project.json already exists. Skipping initial setup workflow."
            echo "skip_initial_setup=true" >> \$GITHUB_OUTPUT
          else
            echo "sfdx-project.json not found. Proceeding with initial setup."
            echo "skip_initial_setup=false" >> \$GITHUB_OUTPUT
          fi
      
      - name: Skip if already initialized
        if: steps.check_init.outputs.skip_initial_setup == 'true'
        run: |
          echo "Initial setup already completed, skipping remaining steps."
          exit 0 # Exit the job successfully

      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          # Use GITHUB_TOKEN to ensure subsequent pushes are authorized
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18' # Or your preferred Node.js version, ensure it's compatible with SF CLI

      - name: Install Salesforce CLI
        run: |
          echo "Installing Salesforce CLI..."
          npm install --global @salesforce/cli
          echo "Salesforce CLI installed."

      - name: Get Repository Name
        id: repo_name_step # Use a descriptive ID for the step
        run: echo "name=$(echo '\${{ github.repository }}' | cut -d '/' -f 2)" >> \$GITHUB_OUTPUT
        # This extracts the repository name (e.g., "my-new-salesforce-repo")
        # and makes it available as \`steps.repo_name_step.outputs.name\`

      - name: Generate SFDX Project Structure
        run: |
          echo "Generating Salesforce DX project structure..."
          # Use the repository name dynamically for project creation
          # The sf project generate command creates a folder with the project name.
          # We need to move its content to the root of the repo.
          sf project generate --name \${{ steps.repo_name_step.outputs.name }} --output-dir . --template standard
          
          # Move generated content to the repository root
          GENERATED_DIR="\${{ steps.repo_name_step.outputs.name }}"
          echo "Moving contents from \$GENERATED_DIR to repository root..."
          shopt -s dotglob # Include dotfiles in mv command
          mv "\$GENERATED_DIR"/* .
          # Remove the empty generated directory
          rm -rf "\$GENERATED_DIR"
          echo "SFDX project structure generated and moved to root."

      - name: Copy Initial Salesforce Code
        run: |
          echo "Copying initial Salesforce code from template-sfdx-code..."
          # This assumes your template code is in a folder named 'template-sfdx-code'
          # located at the root of THIS repository.
          # It copies all contents from template-sfdx-code/force-app into the
          # force-app/main/default directory of the newly generated SFDX project.
          if [ -d "template-sfdx-code/force-app" ]; then
            cp -r template-sfdx-code/force-app/* force-app/main/default/
            echo "Initial Salesforce code copied successfully."
          else
            echo "Warning: 'template-sfdx-code/force-app' directory not found. Skipping initial code copy."
          fi

      - name: Configure Git and Commit Changes
        run: |
          echo "Configuring Git user and committing changes..."
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add . # Add all newly generated and copied files
          # Only commit if there are changes (e.g., if initial code was copied)
          git commit -m "feat: Initialize Salesforce DX project structure and initial code" || echo "No new changes to commit for initial setup."
          echo "Changes committed."

      - name: Push Initial SFDX Setup to Main
        run: |
          echo "Pushing initial SFDX setup to main branch..."
          git push origin main
          echo "Pushed to main branch."

      - name: Create Hierarchical Branches (UAT, QAT, DEV)
        run: |
          echo "Creating hierarchical branches..."
          # Ensure we are on main and have the latest changes before branching
          git checkout main
          git pull origin main # Ensure we have the latest commit, including the SFDX setup

          # Create and push uat branch
          git checkout -b uat
          git push -u origin uat
          echo "Branch 'uat' created and pushed."

          # Create and push qat branch from uat (or main, depending on strict hierarchy needs)
          # For a strict hierarchy, branch from the previous one.
          # If you want them all from main, uncomment 'git checkout main' before each.
          git checkout main # Branch from main
          git checkout -b qat
          git push -u origin qat
          echo "Branch 'qat' created and pushed."

          # Create and push dev branch from qat (or main)
          git checkout main # Branch from main
          git checkout -b dev
          git push -u origin dev
          echo "Branch 'dev' created and pushed."
        # GITHUB_TOKEN is automatically available and has permissions to push to the same repo
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`, // Note the escaped "$" characters for YAML variables
        },
        // --- GitHub Action Workflow File: feature.yml ---
        {
          path: ".github/workflows/feature.yml",
          content: `name: 'Deploy to Salesforce Org'

on:
  push:
    branches:
      - "feature/ai/**"

jobs:
  deploy-lwc:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source code
        uses: actions/checkout@v2

      - name: Install Salesforce CLI
        run: |
          npm install --global @salesforce/cli

      - name: Store JWT private key
        run: |
          # Store the JWT private key from GitHub secrets into a file
          echo "\${{ secrets.SF_JWT_KEY }}" > server.key

      - name: Authenticate to Salesforce using JWT
        run: |
          # Authenticate to the org
          echo "\${{ secrets.SF_SERVER_KEY }}" > server.key
          sf org login jwt --client-id "\${{ secrets.SF_CONSUMER_KEY }}" --jwt-key-file server.key --username "\${{ secrets.SF_USERNAME }}" --instance-url "\${{ secrets.SF_LOGIN_URL }}"
          rm -f server.key # Clean up key file

      - name: Install jq (for JSON parsing)
        run: |
          sudo apt-get update
          sudo apt-get install -y jq

      - name: Deploy LWC Components (ignoring warnings)
        run: |
          sf project deploy start \
            -d force-app/main/default/lwc \
            -o "\${{ secrets.SF_USERNAME }}" \
            --ignore-warnings \
            --json > deploy-result.json

      - name: Debug Deployment Errors
        if: failure()
        run: |
          echo "❌ Deployment failed. Details:"
          cat deploy-result.json | jq .

      - name: List Deployed LWC Component Names
        if: success()
        run: |
          echo "✅ Deployed LWC components in org:"
          jq -r 'if .result.details.componentSuccess then
             .result.details.componentSuccess[] 
             | select(.componentType == "LightningComponentBundle") 
             | .fullName 
           else 
             "⚠️ No LWC components deployed." 
           end' deploy-result.json
`, // Note the escaped "$" characters for YAML variables
        },
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
              message: "feat: Add GitHub Action workflows", // Updated message
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
        console.log("GitHub Action workflows committed successfully to main.");

        // 4. Implement hierarchical branch creation: main -> uat -> qat -> dev (lowercase)
        let currentBaseBranch = defaultBranch;
        let currentBaseSha = newCommitSha; // Use the SHA of the commit with GH actions

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
        console.error("Error generating GitHub Action or branches:", error);
        // It's important to decide if this should be a hard failure or allow project creation
        // but with a warning that the GitHub repo might not be fully initialized as expected.
        // For now, it will proceed but log a warning. You might want to return an error.
      }

      // After finalGithubRepoLink is set (repo is created or linked)
      const repoUrlParts = finalGithubRepoLink.split("/");
      const owner = repoUrlParts[repoUrlParts.length - 2];
      const repo = repoUrlParts[repoUrlParts.length - 1];
      // Reuse the existing githubData variable if it exists, otherwise fetch it
      let managerGitHubData = githubData;
      if (!managerGitHubData) {
        managerGitHubData = await GitHubData.findOne({ userId });
      }
      if (managerGitHubData && managerGitHubData.githubPAT) {
        const webhookUrl = process.env.WEBHOOK_URL || "https://your-backend.com/api/github/webhook";
        try {
          await createGitHubWebhook(managerGitHubData.githubPAT, owner, repo, webhookUrl);
        } catch (err) {
          console.error("Error creating GitHub webhook:", err.message);
          // Optionally, you can return a warning in the response, but don't block project creation
        }
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
    const userId = req.user.id; // User ID from authentication middleware

    // Fetch the user to determine their role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let projects = [];

    if (user.role === "manager") {
      // Manager: Fetch projects created by this user
      projects = await Project.find({ userId }).sort({ createdAt: -1 });
    } else if (user.role === "developer") {
      // Developer: Fetch projects where they are a collaborator
      // 1. Get the developer's GitHub ID
      const userGitHubData = await GitHubData.findOne({ userId });
      if (!userGitHubData) {
        return res.status(404).json({
          success: false,
          message:
            "GitHub data not found for the developer. Please link your GitHub account.",
        });
      }
      const githubId = userGitHubData.githubId;

      // 2. Find ProjectCollaborator documents where this developer is a collaborator
      const projectCollaboratorDocs = await ProjectCollaborator.find({
        "collaborators.githubId": githubId,
      });

      // Extract unique project IDs from the found collaboration documents
      const projectIds = projectCollaboratorDocs.map((doc) => doc.project_id);

      // 3. Fetch all projects using the collected project IDs
      projects = await Project.find({ _id: { $in: projectIds } }).sort({
        createdAt: -1,
      });
    } else {
      // Handle other roles or unassigned roles if necessary
      return res.status(403).json({
        success: false,
        message: "Access denied: Invalid user role.",
      });
    }

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects by user ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching projects.",
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
        {
          name: "Feature A",
          "Time Reduced (Hours)": 15,
          "Cost Saved ($)": 750,
        },
        {
          name: "Feature B",
          "Time Reduced (Hours)": 10,
          "Cost Saved ($)": 500,
        },
        {
          name: "Feature C",
          "Time Reduced (Hours)": 20,
          "Cost Saved ($)": 1000,
        },
        {
          name: "Feature D",
          "Time Reduced (Hours)": 8,
          "Cost Saved ($) ": 400,
        },
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
