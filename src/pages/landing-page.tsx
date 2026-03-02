import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, Wallet, Globe, Sparkles,
  Navigation, TreePine, Compass, SunMedium,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Any City, Worldwide",
    description: "Discover tourist spots in any city across the globe — from Kolkata to Kyoto.",
  },
  {
    icon: Clock,
    title: "Time-Optimized",
    description: "30 minutes or 3 days — we craft itineraries that make every moment count.",
  },
  {
    icon: Wallet,
    title: "Budget-Friendly",
    description: "Set your budget, get recommendations that maximize experience per penny.",
  },
  {
    icon: SunMedium,
    title: "Seasonal & Festive",
    description: "Discover places that shine during festivals, blooming seasons, and local events.",
  },
  {
    icon: Navigation,
    title: "Smart Routes",
    description: "Walk, metro, cab, or ferry — with local tips from people who know the city.",
  },
  {
    icon: Compass,
    title: "AI-Powered Agents",
    description: "Three AI agents collaborate to find, route, and plan your perfect day.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden t-section-bg">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: "var(--t-forest-200)", opacity: 0.3, animationDuration: "4s" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
            style={{ background: "var(--t-amber-200)", opacity: 0.25, animationDuration: "6s", animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "var(--t-sky-200)", opacity: 0.15 }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-36 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 t-badge-nature"
          >
            <TreePine className="w-4 h-4" />
            AI-Powered Travel Planning
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="t-gradient-text">Explore Smarter.</span>
            <br />
            <span style={{ color: "var(--t-stone-800)" }}>Travel Better.</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--t-stone-500)" }}
          >
            Tell us your time, budget, and location — our AI agents find the
            perfect tourist spots, smart routes, and seasonal highlights.
          </p>

          <Link to="/explore">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-2xl t-btn-primary hover:scale-105 transition-transform"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--t-stone-800)" }}>
            Why <span className="t-gradient-text">Turismo</span>?
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "var(--t-stone-500)" }}>
            Three AI agents work together to give you the most efficient travel experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="t-card p-6 group cursor-default">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: "var(--t-forest-50)" }}
              >
                <feature.icon className="w-6 h-6" style={{ color: "var(--t-forest-600)" }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--t-stone-800)" }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--t-stone-500)" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: "1px solid var(--t-border)" }}>
        <div className="container mx-auto px-6 text-center text-sm" style={{ color: "var(--t-stone-400)" }}>
          <p>© {new Date().getFullYear()} Turismo — AI-Powered Travel Planning</p>
        </div>
      </footer>
    </div>
  );
}
