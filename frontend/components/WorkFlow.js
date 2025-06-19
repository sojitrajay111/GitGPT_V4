"use client";

import React, { useState } from "react";
import {
  FolderPlus,
  FileText,
  Code2,
  GitBranch,
  Download,
  BarChart3,
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

const Workflow = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // State to track the current workflow step index

  const workflowSteps = [
    {
      icon: FolderPlus,
      title: "Project Creation",
      description:
        "Managers create new projects with AI-powered setup and intelligent configuration.",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      icon: FileText,
      title: "Smart User Stories",
      description:
        "Write comprehensive user stories with AI assistance and smart suggestions.",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      icon: Code2,
      title: "Code Analysis",
      description:
        "Perform deep code analysis with security, performance, and quality insights.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      icon: GitBranch,
      title: "Branch & PR",
      description:
        "Create branches and pull requests with intelligent workflow management.",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      icon: Download,
      title: "Export Artifacts",
      description:
        "Export documentation, reports, and all project artifacts in multiple formats.",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      icon: BarChart3,
      title: "Complete Report",
      description:
        "Generate detailed reports with AI vs developer contributions and code diffs.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
    },
  ];

  const goToNext = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % workflowSteps.length // Cycle back to the first step
    );
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + workflowSteps.length) % workflowSteps.length // Cycle to the last step if at the beginning
    );
  };

  const currentStep = workflowSteps[currentIndex];

  return (
    <section className="py-10 px-6 lg:px-8 bg-gradient-to-r from-gray-800/20 to-slate-800/20 ">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            Complete Development Workflow
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From project creation to final reporting, GitGPT handles your entire
            development lifecycle with AI intelligence
          </p>
        </div>

        <div className="relative mx-auto max-w-2xl">
          {" "}
          {/* Container for the carousel card and navigation */}
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700/50 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg z-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Previous step"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700/50 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg z-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Next step"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
          {/* Card Display */}
          <div className="flex justify-center items-center">
            <Card
              key={currentIndex} // Using currentIndex as key to trigger re-render and transition
              className="bg-gray-900/50 backdrop-blur-sm border-gray-700 hover:bg-gray-900/70
                         transition-all duration-500 ease-in-out transform
                         h-[320px] w-full max-w-xl p-8" /* Explicitly set size and padding */
            >
              <CardHeader className="pb-4">
                <div
                  className={`h-16 w-16 rounded-2xl ${currentStep.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <currentStep.icon
                    className={`h-8 w-8 ${currentStep.color}`}
                  />
                </div>
                <div className="flex items-center gap-3">
                  {/* Ensure the step number is consistently formatted with leading zero */}
                  <span className="text-2xl font-bold text-gray-600">
                    0{currentIndex + 1}
                  </span>
                  <CardTitle className="text-white text-2xl font-semibold">
                    {currentStep.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="mt-4">
                {" "}
                {/* Added mt-4 for description spacing */}
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  {currentStep.description}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* This section remains as it's separate from the carousel */}
        <div className="mt-20 text-center">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              AI-Powered Intelligence Reports
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              After completion, GitGPT generates comprehensive reports showing
              AI contributions, developer work, code differences, and detailed
              analysis results.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">85%</div>
                <div className="text-gray-300">AI Code Generation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  97%
                </div>
                <div className="text-gray-300">Code Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  42
                </div>
                <div className="text-gray-300">Analysis Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
