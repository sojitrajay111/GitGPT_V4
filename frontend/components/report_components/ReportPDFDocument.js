import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#F5F7FA',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#263238',
  },
  date: {
    fontSize: 12,
    marginBottom: 30,
    textAlign: 'center',
    color: '#546E7A',
  },
  section: {
    margin: 15,
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    border: '1px solid #E0E0E0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#263238',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#4F46E5',
    borderBottom: '1px solid #E0E0E0',
    paddingBottom: 5,
  },
  text: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.5,
    color: '#546E7A',
  },
  statCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
    marginTop: 15,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 15,
    margin: 8,
    width: '45%',
    border: '1px solid #D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'extrabold',
    color: '#1F2937',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 'auto',
    marginBottom: 15,
  },
  chartContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    marginBottom: 15,
    border: '1px solid #E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 5,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    marginRight: 6,
    borderRadius: 3,
  },
  coverPage: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 30,
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#263238',
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 28,
    marginBottom: 40,
    color: '#4F46E5',
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 18,
    color: '#546E7A',
    textAlign: 'center',
    position: 'absolute',
    bottom: 50,
  },
});

const CoverPage = ({ projectName }) => (
  <Page size="A4" style={styles.coverPage}>
    <Text style={styles.coverTitle}>Project Performance Report</Text>
    <Text style={styles.coverSubtitle}>{projectName}</Text>
    <Text style={styles.coverDate}>Date: {new Date().toLocaleDateString()}</Text>
  </Page>
);

export default function ReportPDFDocument({ projectData, projectName, chartImages, COLORS }) {
  // Calculate project duration
  const startDate = new Date(projectData.startDate);
  const endDate = new Date(projectData.endDate);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate task completion percentage
  const taskCompletionPercentage = projectData.totalTasks > 0
    ? ((projectData.completedTasks / projectData.totalTasks) * 100).toFixed(2)
    : 0;

  // Determine a simple project health status
  let projectHealth = "On Track";
  if (projectData.pendingTasks > (projectData.totalTasks * 0.2)) {
    projectHealth = "At Risk";
  } else if (projectData.pendingTasks > 0) {
    projectHealth = "Minor Delays";
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Project Overview</Text>
          <Text style={styles.text}>Project Name: {projectName}</Text>
          <Text style={styles.text}>Project ID: {projectData.projectId || 'N/A'}</Text>
          <Text style={styles.text}>Start Date: {projectData.startDate}</Text>
          <Text style={styles.text}>End Date: {projectData.endDate}</Text>
          <Text style={styles.text}>Project Duration: {diffDays} days</Text>
          <Text style={styles.text}>Total Developers: {projectData.totalDevelopers}</Text>
          <Text style={styles.text}>Total Tasks: {projectData.totalTasks}</Text>
          <Text style={styles.text}>Completed Tasks: {projectData.completedTasks}</Text>
          <Text style={styles.text}>Pending Tasks: {projectData.pendingTasks}</Text>
          <Text style={styles.text}>Task Completion Rate: {taskCompletionPercentage}%</Text>
          <Text style={styles.text}>Project Health: {projectHealth}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Key Performance Indicators</Text>
          <Text style={styles.text}>
            Overall, the project has completed {projectData.statCards?.tasksCompleted} tasks
            with an average completion time of {projectData.statCards?.avgCompletionTime} days.
          </Text>
          <Text style={styles.text}>
            Team productivity stands at {projectData.statCards?.teamProductivity}%, and there are currently
            {projectData.statCards?.pendingReviews} tasks awaiting review.
          </Text>
        </View>
        {chartImages.developerActivity && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Developer Activity: Hours Worked & Tasks Completed</Text>
            <View style={styles.chartContainer}>
              <Image src={chartImages.developerActivity} style={styles.image} />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.text}>Hours Worked</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.text}>Tasks Completed</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {chartImages.codeContribution && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Code Contribution (LOC): Developer vs AI</Text>
            <View style={styles.chartContainer}>
              <Image src={chartImages.codeContribution} style={styles.image} />
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
            </View>
          </View>
        )}
        {chartImages.aiImpact && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>AI Impact: Time & Cost Reduction</Text>
            <View style={styles.chartContainer}>
              <Image src={chartImages.aiImpact} style={styles.image} />
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
            </View>
          </View>
        )}
        {chartImages.developerVelocity && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Developer Velocity: Avg. Task Completion Time</Text>
            <View style={styles.chartContainer}>
              <Image src={chartImages.developerVelocity} style={styles.image} />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.text}>Avg. Days</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {chartImages.projectStatus && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Project Completion Status</Text>
            <View style={styles.chartContainer}>
              <Image src={chartImages.projectStatus} style={styles.image} />
              <View style={styles.legendContainer}>
                {projectData.projectStatus?.map((entry, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: COLORS[index % COLORS.length] }]} />
                    <Text style={styles.text}>{`${entry.name} (${entry.value}%)`}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
} 