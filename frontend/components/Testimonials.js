import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at TechCorp",
      avatar: "/placeholder.svg",
      content:
        "GitGPT transformed our development workflow. The AI-powered project management and automated documentation saved us countless hours.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "CTO at StartupXYZ",
      avatar: "/placeholder.svg",
      content:
        "The code analysis features are incredible. We caught potential issues before they became problems, and our code quality improved significantly.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Product Manager at DevStudio",
      avatar: "/placeholder.svg",
      content:
        "Finally, a tool that bridges the gap between technical and non-technical team members. The user stories and documentation are always up-to-date.",
      rating: 5,
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Development Teams
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            See what developers and project managers are saying about GitGPT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-800/70 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
