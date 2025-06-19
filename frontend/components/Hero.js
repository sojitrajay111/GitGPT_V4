"use client";

import { ArrowRight, Github, Zap, Code, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Import the LoginDialog and SignupDialog components
import LoginDialog from "@/components/LoginDialog";
import SignupDialog from "@/components/SignupDialog";

const Hero = () => {
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showLoginDialogAfterSignup, setShowLoginDialogAfterSignup] =
    useState(false);

  const handleGetStartedClick = () => {
    setShowLoginDialog(true);
  };

  const handleLoginSuccess = (userId) => {
    setShowLoginDialog(false);
    setShowLoginDialogAfterSignup(false); // Close if it was opened from signup dialog
    if (userId) {
      router.push(`/${userId}/dashboard`);
      router.refresh();
    } else {
      console.error(
        "Login successful but no user ID received for redirection."
      );
      router.push("/dashboard");
    }
  };

  const handleCreateAccountClick = () => {
    setShowSignupDialog(true);
  };

  const handleSignupSuccess = () => {
    setShowSignupDialog(false); // Close the signup dialog
    setShowLoginDialogAfterSignup(true); // Open the login dialog after successful signup
  };

  // Function to be passed to SignupDialog to trigger LoginDialog opening
  const handleOpenLoginFromSignup = () => {
    setShowSignupDialog(false); // Close signup dialog
    setShowLoginDialog(true); // Open login dialog
  };

  // Function to be passed to LoginDialog to trigger SignupDialog opening
  const handleOpenSignupFromLogin = () => {
    setShowLoginDialog(false); // Close login dialog
    setShowSignupDialog(true); // Open signup dialog
  };

  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-slate-800/20 blur-3xl"></div>
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            {/* Updated styling for the GitGPT button */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-10 py-2 border border-white/20">
              <Github className="h-5 w-5 text-white" />
              <span className="text-white font-medium">GitGPT</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300 text-sm">
                AI-Powered Development
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            AI-Powered
            <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              {" "}
              Development
            </span>
            <br />
            Project Management
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            Transform your development workflow with intelligent project
            management, automated user stories, comprehensive documentation, and
            advanced code analysis.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 text-lg"
              onClick={handleGetStartedClick}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 text-lg"
              onClick={handleCreateAccountClick}
            >
              Create New Account
            </Button>
          </div>

          <div className="mt-16 flex justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-400" />
              <span>Code Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-400" />
              <span>Team Collaboration</span>
            </div>
          </div>
        </div>
      </div>

      {/* LoginDialog triggered by "Get Started" button or from SignupDialog */}
      <LoginDialog
        open={showLoginDialog || showLoginDialogAfterSignup}
        onClose={() => {
          setShowLoginDialog(false);
          setShowLoginDialogAfterSignup(false);
        }}
        onSuccess={handleLoginSuccess}
        onShowSignupDialog={handleOpenSignupFromLogin}
      />

      {/* SignupDialog triggered by "Create New Account" button or from LoginDialog */}
      <SignupDialog
        open={showSignupDialog}
        onClose={() => setShowSignupDialog(false)}
        onSuccess={handleSignupSuccess}
        onShowLoginDialog={handleOpenLoginFromSignup}
      />
    </section>
  );
};

export default Hero;
