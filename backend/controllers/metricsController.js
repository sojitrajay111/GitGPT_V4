// controllers/metricsController.js
const UserStory = require("../models/UserStory");
const Project = require("../models/Project");
const CodeContribution = require("../models/CodeContribution");
const GitHubData = require("../models/GithubData");

/**
 * Helper function to get the authenticated user's GitHub PAT and username.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{pat: string, username: string}>} - The user's GitHub PAT and username.
 * @throws {Error} If GitHub data is not found.
 */
const getGitHubAuthDetails = async (userId) => {
  const githubData = await GitHubData.findOne({ userId });
  if (!githubData || !githubData.githubPAT) {
    const error = new Error("GitHub PAT not found for the user.");
    error.status = 400;
    throw error;
  }
  return { pat: githubData.githubPAT, username: githubData.githubUsername };
};

/**
 * Helper function to calculate Lines of Code (LOC) from a git diff string.
 * This is a simplified parser.
 * @param {string} diff - The diff string from a commit.
 * @returns {{added: number, deleted: number, total: number}} - An object with added, deleted, and total lines changed.
 */
function parseDiffForLoc(diff) {
  let added = 0;
  let deleted = 0;
  if (!diff) return { added, deleted, total: 0 };

  const lines = diff.split("\n");
  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      added++;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      deleted++;
    }
  }
  return { added, deleted, total: added + deleted };
}

/**
 * @desc Get various metrics for a project, including AI/Developer collaboration data.
 * @route GET /api/metrics/:projectId
 * @access Private
 */
const getProjectMetrics = async (req, res) => {
  const { projectId } = req.params;
  const authenticatedUserId = req.user.id; // The user making the request

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // --- 1. Project Work Progress (User Stories Status) ---
    const userStories = await UserStory.find({ projectId }).select(
      "status createdAt"
    );
    const projectWorkProgress = userStories.reduce((acc, story) => {
      const date = story.createdAt.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = { total: 0, completed: 0, aiDeveloped: 0 };
      }
      acc[date].total++;
      if (story.status === "COMPLETED") {
        acc[date].completed++;
      }
      if (story.status === "AI DEVELOPED") {
        acc[date].aiDeveloped++;
      }
      return acc;
    }, {});

    const sortedProgressData = Object.keys(projectWorkProgress)
      .sort()
      .map((date) => {
        const { total, completed, aiDeveloped } = projectWorkProgress[date];
        return {
          date,
          "Total User Stories": total,
          "Completed User Stories": completed,
          "AI Developed Stories": aiDeveloped,
          "Progress (%)":
            total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
        };
      });

    // --- 2. Code Contribution (Developer vs. AI) & Time Saved by AI ---
    const allContributions = await CodeContribution.find({ projectId });

    let aiLinesOfCode = 0;
    let developerLinesOfCode = 0;
    let totalGeminiTokensUsed = 0;

    allContributions.forEach((contribution) => {
      if (contribution.contributorType === "AI") {
        aiLinesOfCode += contribution.linesOfCode;
        totalGeminiTokensUsed += contribution.geminiTokensUsed;
      } else if (contribution.contributorType === "Developer") {
        developerLinesOfCode += contribution.linesOfCode;
      }
    });

    const codeContributionData = [
      { name: "Developer", "Lines of Code": developerLinesOfCode },
      { name: "AI", "Lines of Code": aiLinesOfCode },
    ];

    // Simple heuristic for time saved by AI
    const estimatedHoursSavedPer100LinesAI = 1;
    const timeSavedByAI =
      (aiLinesOfCode / 100) * estimatedHoursSavedPer100LinesAI;

    // Weekly data for chart visualization (last 5 weeks)
    const weeks = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      weeks.push({ label: weekLabel, start: new Date(weekStart), end: new Date(weekEnd) });
    }
    // Aggregate AI lines of code by week
    const weeklyTimeSaved = weeks.map(({ label, start, end }) => {
      const weekAiLoc = allContributions.filter(c => c.contributorType === 'AI' && c.createdAt >= start && c.createdAt <= end)
        .reduce((sum, c) => sum + c.linesOfCode, 0);
      return {
        name: label,
        "Hours Saved": Math.round((weekAiLoc / 100) * estimatedHoursSavedPer100LinesAI)
      };
    });

    // --- 3. Gemini AI Token Usage ---
    const totalTokenBudget = 1000000; // Example budget
    const geminiTokenData = [
      { name: "Used", value: totalGeminiTokensUsed },
      {
        name: "Remaining",
        value: Math.max(0, totalTokenBudget - totalGeminiTokensUsed),
      },
    ];

    // --- 4. AI-Assisted PRs vs. Developer-Only PRs ---
    const { githubRepoLink } = project;
    let aiAssistedPrs = 0;
    let developerOnlyPrs = 0;
    let prsOpen = 0;
    let prsMerged = 0;
    let prsClosed = 0;

    if (githubRepoLink) {
      try {
        // Corrected: Use dynamic import() for ES Modules like @octokit/rest
        const { Octokit } = await import("@octokit/rest");
        const { pat } = await getGitHubAuthDetails(authenticatedUserId);
        const octokit = new Octokit({ auth: pat });
        const repoMatch = githubRepoLink.match(
          /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/i
        );

        if (repoMatch) {
          const owner = repoMatch[1];
          const repoName = repoMatch[2];

          const { data: pullRequests } = await octokit.rest.pulls.list({
            owner,
            repo: repoName,
            state: "all",
            per_page: 100,
          });

          const userStoriesWithPrs = await UserStory.find({
            projectId,
            prUrl: { $exists: true, $ne: "" },
          }).select("prUrl");

          const aiGeneratedPrUrls = new Set(
            userStoriesWithPrs.map((us) => us.prUrl)
          );

          pullRequests.forEach((pr) => {
            if (aiGeneratedPrUrls.has(pr.html_url)) {
              aiAssistedPrs++;
            } else {
              developerOnlyPrs++;
            }

            if (pr.state === "open") {
              prsOpen++;
            } else if (pr.merged_at) {
              prsMerged++;
            } else if (pr.state === "closed") {
              prsClosed++;
            }
          });
        }
      } catch (error) {
        console.error("Error fetching GitHub PRs for metrics:", error.message);
        // Continue without PR data if GitHub fetch fails
      }
    }

    const prStatusData = [
      { name: "Open", value: prsOpen },
      { name: "Merged", value: prsMerged },
      { name: "Closed (Unmerged)", value: prsClosed },
    ];

    const prContributionData = [
      { name: "AI-Assisted PRs", value: aiAssistedPrs },
      { name: "Developer-Only PRs", value: developerOnlyPrs },
    ];

    res.status(200).json({
      success: true,
      projectWorkProgressData: sortedProgressData,
      codeContributionData,
      timeSavedData: weeklyTimeSaved,
      geminiTokenData,
      prStatusData,
      prContributionData,
    });
  } catch (error) {
    console.error("Error fetching project metrics:", error);
    res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Internal server error while fetching project metrics.",
    });
  }
};

module.exports = {
  getProjectMetrics,
  parseDiffForLoc, // Export for potential use in other controllers
};
