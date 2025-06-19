import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Dashboard from "@/components/Dashboard";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Workflow from "@/components/WorkFlow";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <Hero />
      <Features />
      <Dashboard />
      <Workflow />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
