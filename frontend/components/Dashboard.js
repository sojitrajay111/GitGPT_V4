import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const mockProjects = [
    {
      name: "E-commerce Platform",
      status: "In Progress",
      progress: 75,
      team: 8,
      deadline: "2024-01-15",
      priority: "High",
    },
    {
      name: "Mobile App Backend",
      status: "Review",
      progress: 90,
      team: 5,
      deadline: "2024-01-10",
      priority: "Critical",
    },
    {
      name: "Analytics Dashboard",
      status: "Planning",
      progress: 25,
      team: 3,
      deadline: "2024-02-01",
      priority: "Medium",
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Project Dashboard Preview
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Get a glimpse of how GitGPT organizes and manages your development
            projects
          </p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-gray-700/40 to-gray-600/40 border-gray-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Projects
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">12</div>
                <p className="text-xs text-gray-300">+2 from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-700/40 to-blue-600/40 border-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Active Stories
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">47</div>
                <p className="text-xs text-gray-300">+8 this week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-700/40 to-green-600/40 border-green-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Code Quality
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">94%</div>
                <p className="text-xs text-gray-300">+5% improvement</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-700/40 to-orange-600/40 border-orange-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Team Members
                </CardTitle>
                <Users className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">24</div>
                <p className="text-xs text-gray-300">Across all projects</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recent Projects
            </h3>
            {mockProjects.map((project, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      {project.name}
                    </h4>
                    <Badge
                      variant={
                        project.priority === "Critical"
                          ? "destructive"
                          : project.priority === "High"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {project.priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {project.team} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {project.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
