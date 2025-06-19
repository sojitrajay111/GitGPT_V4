"use client";

import React, { useState } from "react";
import {
  Brain,
  FileText,
  BarChart3,
  GitBranch,
  Download,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Features = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // State to track the current feature index

  const features = [
    {
      icon: Brain,
      title: "AI Project Management",
      description:
        "Intelligent dashboard that automatically organizes and prioritizes your development projects with machine learning insights.",
      color: "text-gray-300",
    },
    {
      icon: FileText,
      title: "Smart User Stories",
      description:
        "Generate comprehensive user stories and documentation automatically from your project requirements and code analysis.",
      color: "text-blue-400",
    },
    {
      icon: BarChart3,
      title: "Advanced Code Analysis",
      description:
        "Deep code insights with performance metrics, security analysis, and optimization suggestions powered by AI.",
      color: "text-green-400",
    },
    {
      icon: GitBranch,
      title: "Git Integration",
      description:
        "Seamless integration with your existing Git workflow, tracking changes and providing intelligent merge suggestions.",
      color: "text-orange-400",
    },
    {
      icon: Download,
      title: "Downloadable Artifacts",
      description:
        "Export documentation, reports, and project artifacts in multiple formats for easy sharing and archiving.",
      color: "text-gray-300",
    },
    {
      icon: Sparkles,
      title: "Automated Workflows",
      description:
        "Streamline your development process with automated task creation, progress tracking, and team notifications.",
      color: "text-yellow-400",
    },
  ];

  const goToNext = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % features.length // Cycle back to the first feature
    );
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + features.length) % features.length // Cycle to the last feature if at the beginning
    );
  };

  const currentFeature = features[currentIndex];

  return (
    <section className="py-10 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Powerful Features for Modern Development
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Everything you need to manage, analyze, and optimize your
            development projects
          </p>
        </div>

        <div className="relative mx-auto max-w-2xl">
          {" "}
          {/* Container for the carousel card and navigation */}
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700/50 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg z-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Previous feature"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700/50 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg z-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Next feature"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
          {/* Card Display */}
          <div className="flex justify-center items-center">
            {/* Reduced height from h-[400px] to h-[320px] */}
            <Card
              key={currentIndex}
              className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-800/70
                         transition-all duration-500 ease-in-out transform
                         h-[320px] w-full max-w-xl p-6" /* Adjusted height and padding */
            >
              <CardHeader className="text-center">
                {/* Icon container also slightly smaller to fit */}
                <div className="h-14 w-14 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <currentFeature.icon
                    className={`h-7 w-7 ${currentFeature.color}`}
                  />{" "}
                  {/* Icon size also slightly smaller */}
                </div>
                <CardTitle className="text-white text-xl">
                  {currentFeature.title}
                </CardTitle>{" "}
                {/* Maintained title size */}
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-300 text-sm leading-relaxed mt-3">
                  {" "}
                  {/* Slightly smaller description text and mt */}
                  {currentFeature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
