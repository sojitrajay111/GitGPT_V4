import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// --- GitGPT Brand Theme for PDF ---
// This centralizes your brand colors and typography definitions
const GitGPTTheme = {
  colors: {
    primaryDark: '#241e2c', // Deep dark purple-grey
    primaryMedium: '#3A3245',
    primaryLight: '#52485E',
    accentOrange: '#FC6D26', // GitLab Orange
    accentOrangeDark: '#D64D00',
    backgroundLight: '#f9f8fa', // Light, off-white
    backgroundPaper: '#FFFFFF', // Pure white for sections/cards
    textPrimary: '#241e2c', // Main text color
    textSecondary: '#5F5F6B', // Secondary text (descriptions, captions)
    textMuted: '#A0A0A9', // Lighter text
    border: '#EAEAEA', // Light border for dividers, cards
    statSuccess: '#33CC33', // Example green for success stats
    statWarning: '#FF9900', // Example orange for warning stats
    statError: '#CC3333',   // Example red for error stats
  },
  fonts: {
    // IMPORTANT: For custom fonts like Inter to work in @react-pdf/renderer,
    // you must REGISTER them in your application's entry point where you use PDFDownloadLink or PDFViewer.
    // Example:
    // Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });
    // Font.register({ family: 'Inter', src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' });
    // For this direct code output, 'Helvetica' is used as a reliable fallback.
    primary: 'Helvetica', // Fallback
    bold: 'Helvetica-Bold', // Fallback
  },
  spacing: {
    pagePadding: 40,
    sectionMargin: 15, // Reduced from 20
    sectionPadding: 20, // Reduced from 25
    elementMarginBottom: 8, // Reduced from 10
    statCardPadding: 12, // Reduced from 15
  },
  typography: {
    h1: { fontSize: 36, fontWeight: 'bold', color: '#241e2c' }, // Cover Title
    h2: { fontSize: 28, fontWeight: 'bold', color: '#241e2c' }, // Report Main Header
    h3: { fontSize: 22, fontWeight: 'bold', color: '#241e2c' }, // Section Title
    h4: { fontSize: 18, fontWeight: 'bold', color: '#241e2c' }, // Subsection Title/Subtitle
    h5: { fontSize: 14, fontWeight: 'normal', color: '#241e2c' }, // Added for project tagline on cover
    body: { fontSize: 11, lineHeight: 1.4, color: '#5F5F6B' }, // Reduced line height slightly
    small: { fontSize: 9, lineHeight: 1.3, color: '#A0A0A9' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#241e2c' },
    statLabel: { fontSize: 12, color: '#5F5F6B' },
    caption: { fontSize: 10, lineHeight: 1.3, color: '#5F5F6B' }, // Reduced line height
  }
};

// --- PDF Document Styles ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: GitGPTTheme.colors.backgroundLight,
    padding: GitGPTTheme.spacing.pagePadding,
    fontFamily: GitGPTTheme.fonts.primary,
  },
  // --- Cover Page Styles ---
  coverPage: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GitGPTTheme.colors.backgroundLight,
    padding: GitGPTTheme.spacing.pagePadding * 2,
  },
  coverLogoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  coverLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: GitGPTTheme.typography.h1.fontSize,
    fontFamily: GitGPTTheme.fonts.bold,
    marginBottom: 10,
    color: GitGPTTheme.typography.h1.color,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: GitGPTTheme.typography.h2.fontSize,
    color: GitGPTTheme.colors.accentOrange,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: GitGPTTheme.fonts.bold,
  },
  coverDate: {
    fontSize: GitGPTTheme.typography.h4.fontSize,
    color: GitGPTTheme.colors.textSecondary,
    textAlign: 'center',
    position: 'absolute',
    bottom: 60,
  },
  // --- Header & Footer for Content Pages ---
  header: {
    position: 'absolute',
    top: 30,
    left: GitGPTTheme.spacing.pagePadding,
    right: GitGPTTheme.spacing.pagePadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottom: `1px solid ${GitGPTTheme.colors.border}`,
  },
  headerLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  headerTitle: {
    fontSize: GitGPTTheme.typography.body.fontSize,
    fontWeight: 'bold',
    color: GitGPTTheme.colors.textPrimary,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: GitGPTTheme.spacing.pagePadding,
    right: GitGPTTheme.spacing.pagePadding,
    textAlign: 'right',
    fontSize: GitGPTTheme.typography.small.fontSize,
    color: GitGPTTheme.colors.textMuted,
  },
  // --- General Section Styles ---
  section: {
    marginVertical: GitGPTTheme.spacing.sectionMargin / 2, // Use half margin for tighter sections
    padding: GitGPTTheme.spacing.sectionPadding,
    backgroundColor: GitGPTTheme.colors.backgroundPaper,
    borderRadius: 10,
    border: `1px solid ${GitGPTTheme.colors.border}`,
    shadowColor: GitGPTTheme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: GitGPTTheme.typography.h3.fontSize,
    fontFamily: GitGPTTheme.fonts.bold,
    marginBottom: GitGPTTheme.spacing.elementMarginBottom * 1.2, // Reduced from 1.5
    color: GitGPTTheme.colors.textPrimary,
    borderBottom: `1px solid ${GitGPTTheme.colors.border}`,
    paddingBottom: GitGPTTheme.spacing.elementMarginBottom / 2,
  },
  sectionSubtitle: {
    fontSize: GitGPTTheme.typography.h4.fontSize,
    fontFamily: GitGPTTheme.fonts.bold,
    marginBottom: GitGPTTheme.spacing.elementMarginBottom,
    color: GitGPTTheme.colors.primaryMedium,
  },
  text: {
    fontSize: GitGPTTheme.typography.body.fontSize,
    marginBottom: GitGPTTheme.spacing.elementMarginBottom,
    lineHeight: GitGPTTheme.typography.body.lineHeight,
    color: GitGPTTheme.typography.body.color,
  },
  // --- Stats Card Styles ---
  statCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: GitGPTTheme.spacing.elementMarginBottom,
    marginBottom: GitGPTTheme.spacing.elementMarginBottom * 1.5, // Added bottom margin
  },
  statCard: {
    backgroundColor: GitGPTTheme.colors.backgroundLight,
    borderRadius: 8,
    padding: GitGPTTheme.spacing.statCardPadding,
    margin: 4, // Reduced from 5
    width: '47%', // Adjusted from 48% to compensate for smaller margin
    border: `1px solid ${GitGPTTheme.colors.border}`,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    minHeight: 70, // Slightly reduced from 80 for tighter fit
  },
  statLabel: {
    fontSize: GitGPTTheme.typography.statLabel.fontSize,
    color: GitGPTTheme.typography.statLabel.color,
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: GitGPTTheme.typography.statValue.fontSize,
    fontFamily: GitGPTTheme.fonts.bold,
    color: GitGPTTheme.colors.accentOrange, // Use accent color for main stats
    textAlign: 'center',
  },
  // --- Chart Styles ---
  chartContainer: {
    width: '100%',
    height: 250, // Reduced height from 300 for tighter charts
    marginBottom: GitGPTTheme.spacing.elementMarginBottom,
    border: `1px solid ${GitGPTTheme.colors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartImage: {
    width: '100%',
    height: '100%', // Fill the container
    objectFit: 'contain', // Ensure chart content fits and respects aspect ratio
  },
  chartCaption: {
    fontSize: GitGPTTheme.typography.caption.fontSize,
    color: GitGPTTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: GitGPTTheme.spacing.elementMarginBottom / 2,
    marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2,
  },
  chartSource: {
    fontSize: GitGPTTheme.typography.small.fontSize,
    color: GitGPTTheme.colors.textMuted,
    textAlign: 'right',
    marginTop: GitGPTTheme.spacing.elementMarginBottom / 2,
  },
  // --- Legend Styles ---
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8, // Reduced from 10
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10, // Reduced from 12
    marginBottom: 4, // Reduced from 5
  },
  legendColorBox: {
    width: 12, // Reduced from 14
    height: 12, // Reduced from 14
    marginRight: 5, // Reduced from 6
    borderRadius: 3,
  },
  // --- Recommendation List Styles ---
  recommendationList: {
    marginTop: GitGPTTheme.spacing.elementMarginBottom,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GitGPTTheme.colors.accentOrange,
    marginRight: 8,
    marginTop: 4, // Adjust for vertical alignment with text
  },
});

// --- Components for Report Sections ---

// Header for content pages
const ReportHeader = ({ projectName }) => (
  <View style={styles.header} fixed>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image src="https://placehold.co/40x40/FC6D26/FFFFFF?text=G" style={styles.headerLogo} />
      <Text style={styles.headerTitle}>GitGPT Report: {projectName}</Text>
    </View>
    <Text style={styles.headerTitle}>Project Performance</Text>
  </View>
);

// Footer for content pages
const ReportFooter = () => (
  <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
    `${pageNumber} / ${totalPages}`
  )} fixed />
);

// Cover Page Component
const CoverPage = ({ projectName, projectTagline }) => (
  <Page size="A4" style={styles.coverPage}>
    <View style={styles.coverLogoContainer}>
      <Image src="https://placehold.co/80x80/FC6D26/FFFFFF?text=G" style={styles.coverLogo} />
      <Text style={[styles.coverTitle, { color: GitGPTTheme.colors.textPrimary }]}>GitGPT</Text>
    </View>
    <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.coverTitle}>Project Performance Report</Text>
      <Text style={styles.coverSubtitle}>{projectName}</Text>
      {projectTagline && (
        <Text style={[
          styles.text,
          {
            fontSize: GitGPTTheme.typography?.h5?.fontSize || GitGPTTheme.typography.body.fontSize,
            textAlign: 'center',
            color: GitGPTTheme.colors.textSecondary,
            maxWidth: '80%'
          }
        ]}>
          {projectTagline}
        </Text>
      )}
    </View>
    <Text style={styles.coverDate}>Date: {new Date().toLocaleDateString()}</Text>
  </Page>
);

// Main Report Document
export default function ReportPDFDocument({ projectData, projectName, chartImages, COLORS }) {
  // Ensure projectData has necessary defaults to prevent errors
  const safeProjectData = {
    projectId: 'N/A',
    startDate: 'N/A',
    endDate: 'N/A',
    totalDevelopers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    statCards: {
      tasksCompleted: 'N/A',
      avgCompletionTime: 'N/A',
      teamProductivity: 'N/A',
      pendingReviews: 'N/A',
    },
    recommendations: [],
    ...projectData, // Overwrite with actual data
  };

  const startDateObj = safeProjectData.startDate !== 'N/A' ? new Date(safeProjectData.startDate) : null;
  const endDateObj = safeProjectData.endDate !== 'N/A' ? new Date(safeProjectData.endDate) : null;

  const diffDays = (startDateObj && endDateObj) ? Math.ceil(Math.abs(endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) : 'N/A';

  const taskCompletionPercentage = safeProjectData.totalTasks > 0
    ? ((safeProjectData.completedTasks / safeProjectData.totalTasks) * 100).toFixed(2)
    : 0;

  let projectHealth = "On Track";
  if (safeProjectData.totalTasks > 0 && safeProjectData.pendingTasks / safeProjectData.totalTasks > 0.2) {
    projectHealth = "At Risk";
  } else if (safeProjectData.pendingTasks > 0) {
    projectHealth = "Minor Delays";
  }

  return (
    <Document>
      {/* Cover Page */}
      <CoverPage
        projectName={projectName}
        projectTagline="An AI-powered analysis of your development workflow, code quality, and team performance."
      />

      {/* Main Content Pages */}
      <Page size="A4" style={styles.page}>
        <ReportHeader projectName={projectName} />
        <View style={{ marginTop: 85 }}> {/* Increased offset for header from 70 to 85 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.text}>
              This report provides a comprehensive overview of the **{projectName}** project's performance,
              code quality, and the impact of AI integration up to **{new Date().toLocaleDateString()}**.
              Overall project health is **{projectHealth}**, with a task completion rate of **{taskCompletionPercentage}%**.
              Key insights include improvements in code contribution efficiency and a notable reduction in
              security vulnerabilities thanks to GitGPT's automated analysis.
            </Text>
            <Text style={styles.text}>
              **Key Performance Metrics:**
            </Text>
            <View style={styles.statCardContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Tasks Completed</Text>
                <Text style={styles.statValue}>{safeProjectData.statCards.tasksCompleted}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg. Completion Time</Text>
                <Text style={styles.statValue}>{safeProjectData.statCards.avgCompletionTime} Days</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Team Productivity</Text>
                <Text style={styles.statValue}>{safeProjectData.statCards.teamProductivity}%</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Pending Reviews</Text>
                <Text style={styles.statValue}>{safeProjectData.statCards.pendingReviews}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Overview & Metrics</Text>
            <Text style={styles.text}>
              This section provides detailed data on the project's foundational metrics and progress.
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Project Name:** {projectName}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Project ID:** {safeProjectData.projectId || 'N/A'}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Start Date:** {safeProjectData.startDate}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **End Date:** {safeProjectData.endDate}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Project Duration:** {diffDays} days
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Total Developers:** {safeProjectData.totalDevelopers}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Total Tasks:** {safeProjectData.totalTasks}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Completed Tasks:** {safeProjectData.completedTasks}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Pending Tasks:** {safeProjectData.pendingTasks}
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Task Completion Rate:** {taskCompletionPercentage}%
            </Text>
            <Text style={[styles.text, { marginBottom: GitGPTTheme.spacing.elementMarginBottom / 2 }]}>
              **Project Health:** {projectHealth}
            </Text>
          </View>
        </View>
        <ReportFooter />
      </Page>

      {/* New Page for Charts */}
      <Page size="A4" style={styles.page}>
        <ReportHeader projectName={projectName} />
        <View style={{ marginTop: 85 }}> {/* Increased offset for header from 70 to 85 */}
          {chartImages.developerActivity && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Developer Activity: Hours Worked & Tasks Completed</Text>
              <View style={styles.chartContainer}>
                <Image src={chartImages.developerActivity} style={styles.chartImage} />
              </View>
              <Text style={styles.chartCaption}>This chart illustrates the average hours worked by developers versus the number of tasks they completed over a period, providing insights into workload and output efficiency.</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#4F46E5' }]} /> {/* Use actual chart colors */}
                  <Text style={styles.text}>Hours Worked</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} /> {/* Use actual chart colors */}
                  <Text style={styles.text}>Tasks Completed</Text>
                </View>
              </View>
              <Text style={styles.chartSource}>Source: GitGPT Analytics</Text>
            </View>
          )}

          {chartImages.codeContribution && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Code Contribution (LOC): Developer vs AI</Text>
              <View style={styles.chartContainer}>
                <Image src={chartImages.codeContribution} style={styles.chartImage} />
              </View>
              <Text style={styles.chartCaption}>This bar chart compares Lines of Code (LOC) contributed by human developers versus AI-generated code, highlighting the AI's impact on code generation efficiency.</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.text}>Developer LOC</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.text}>AI Generated LOC</Text>
                </View>
              </View>
              <Text style={styles.chartSource}>Source: GitGPT Analytics</Text>
            </View>
          )}
        </View>
        <ReportFooter />
      </Page>

      {/* Another Page for Charts and Recommendations */}
      <Page size="A4" style={styles.page}>
        <ReportHeader projectName={projectName} />
        <View style={{ marginTop: 85 }}> {/* Increased offset for header from 70 to 85 */}
          {chartImages.aiImpact && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Impact: Time & Cost Reduction</Text>
              <View style={styles.chartContainer}>
                <Image src={chartImages.aiImpact} style={styles.chartImage} />
              </View>
              <Text style={styles.chartCaption}>This chart demonstrates the quantifiable benefits of AI, showing reduction in development time (hours) and associated cost savings ($).</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.text}>Time Reduced (Hours)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.text}>Cost Saved ($)</Text>
                </View>
              </View>
              <Text style={styles.chartSource}>Source: GitGPT Analytics</Text>
            </View>
          )}
          {chartImages.developerVelocity && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Developer Velocity: Avg. Task Completion Time</Text>
              <View style={styles.chartContainer}>
                <Image src={chartImages.developerVelocity} style={styles.chartImage} />
              </View>
              <Text style={styles.chartCaption}>This chart tracks the average time taken to complete tasks, indicating developer efficiency and potential bottlenecks in the workflow.</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.text}>Avg. Days</Text>
                </View>
              </View>
              <Text style={styles.chartSource}>Source: GitGPT Analytics</Text>
            </View>
          )}

          {chartImages.projectStatus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project Completion Status</Text>
              <View style={styles.chartContainer}>
                <Image src={chartImages.projectStatus} style={styles.chartImage} />
              </View>
              <Text style={styles.chartCaption}>A breakdown of project tasks by their completion status, illustrating what's completed, in progress, and pending.</Text>
              <View style={styles.legendContainer}>
                {safeProjectData.projectStatus?.map((entry, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: COLORS[index % COLORS.length] }]} />
                    <Text style={styles.text}>{`${entry.name} (${entry.value}%)`}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartSource}>Source: GitGPT Analytics</Text>
            </View>
          )}
        </View>
        <ReportFooter />
      </Page>

      {/* Key Recommendations Page */}
      <Page size="A4" style={styles.page}>
        <ReportHeader projectName={projectName} />
        <View style={{ marginTop: 85 }}> {/* Increased offset for header from 70 to 85 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Recommendations & Next Steps</Text>
            <Text style={styles.text}>
              Based on the analysis, here are actionable recommendations to further
              enhance the **{projectName}** project's performance and code quality:
            </Text>
            <View style={styles.recommendationList}>
              {safeProjectData.recommendations.length > 0 ? (
                safeProjectData.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationBullet} />
                    <Text style={styles.text}>{rec}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.text}>No specific recommendations available at this time.</Text>
              )}
            </View>
            <Text style={[styles.text, { marginTop: GitGPTTheme.spacing.elementMarginBottom * 2 }]}>
              For a deeper dive into these insights or to discuss custom strategies, please contact the GitGPT team.
            </Text>
          </View>
        </View>
        <ReportFooter />
      </Page>
    </Document>
  );
}
