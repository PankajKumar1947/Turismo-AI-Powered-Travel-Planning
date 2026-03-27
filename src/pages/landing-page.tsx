import { Link } from "react-router-dom";

import {
  MapPin, Clock, Wallet, Globe, Sparkles,
  Navigation, TreePine, Compass, SunMedium,
  ArrowRight, CheckCircle2, Star,
  Mountain, Trees, Waves
} from "lucide-react";
import { Button } from "../components/ui/button";

const features = [
  {
    icon: Globe,
    title: "Any City, Worldwide",
    description: "Discover tourist spots in any city across the globe — from Kolkata to Kyoto.",
  },
  {
    icon: Clock,
    title: "Time-Optimized",
    description: "30 minutes or 3 days — we make every moment count.",
  },
  {
    icon: Wallet,
    title: "Budget-Friendly",
    description: "Set your budget, get recommendations that maximize experience per penny.",
  },
  {
    icon: SunMedium,
    title: "Seasonal & Festive",
    description: "Discover places that shine during festivals and blooming seasons.",
  },
  {
    icon: Navigation,
    title: "Smart Routes",
    description: "Walk, metro, cab, or ferry — with local tips for every path.",
  },
  {
    icon: Compass,
    title: "AI-Powered Agents",
    description: "Three AI agents collaborate to plan your perfect day.",
  },
];

const steps = [
  {
    title: "Tell your preferences",
    description: "Enter your city, budget, and time availability — then choose your travel vibe.",
    icon: MapPin,
    color: "var(--t-forest-500)",
    bgColor: "var(--t-forest-50)"
  },
  {
    title: "Interactive Selection",
    description: "Pick recommended spots and routes tailored by our specialized AI agents.",
    icon: Sparkles,
    color: "var(--t-forest-600)",
    bgColor: "var(--t-forest-100)"
  },
  {
    title: "Ready to Explore",
    description: "Get a complete, optimized itinerary with real-time navigation and local tips.",
    icon: Navigation,
    color: "var(--t-forest-700)",
    bgColor: "var(--t-forest-200)"
  }
];

const destinations = [
  {
    name: "Kyoto, Japan",
    tag: "Zen & Tradition",
    image: "/images/kyoto.png",
    rating: 4.9,
    icon: Trees
  },
  {
    name: "Santorini, Greece",
    tag: "Coastal Beauty",
    image: "/images/santorini.png",
    rating: 4.8,
    icon: Waves
  },
  {
    name: "Swiss Alps",
    tag: "Mountain Escape",
    image: "/images/alps.png",
    rating: 5.0,
    icon: Mountain
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden t-section-bg pt-12">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: "var(--t-forest-200)", opacity: 0.3, animationDuration: "4s" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
            style={{ background: "var(--t-amber-200)", opacity: 0.25, animationDuration: "6s", animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-36 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 t-badge-nature animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <TreePine className="w-4 h-4" />
            AI-Powered Travel Planning
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <span className="t-gradient-text">Explore Smarter.</span>
            <br />
            <span style={{ color: "var(--t-stone-800)" }}>Travel Better.</span>
          </h1>

          <p
            className="text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000"
            style={{ color: "var(--t-stone-500)" }}
          >
            Tell us your time, budget, and location — our AI agents find the
            perfect tourist spots and optimized routes for your next adventure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link to="/explore">
              <Button
                size="lg"
                className="text-lg px-8 py-7 rounded-2xl t-btn-primary hover:scale-105 transition-all shadow-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Start Exploring
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-7 rounded-2xl border-2 hover:bg-stone-50 transition-all font-semibold"
                style={{ borderColor: "var(--t-forest-200)", color: "var(--t-forest-700)" }}
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-white/50 backdrop-blur-sm" style={{ borderColor: "var(--t-border)" }}>
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold t-gradient-text">50k+</div>
              <div className="text-sm font-medium" style={{ color: "var(--t-stone-500)" }}>Places Indexed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold t-gradient-text">120+</div>
              <div className="text-sm font-medium" style={{ color: "var(--t-stone-500)" }}>Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold t-gradient-text">15k+</div>
              <div className="text-sm font-medium" style={{ color: "var(--t-stone-500)" }}>Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold t-gradient-text">3</div>
              <div className="text-sm font-medium" style={{ color: "var(--t-stone-500)" }}>Specialized AI Agents</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--t-stone-800)" }}>
            How <span className="t-gradient-text">Turismo</span> Works
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "var(--t-stone-500)" }}>
            Our multi-agent system takes care of the complex planning so you can focus on the fun.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto px-4">
          {/* Curved connecting line for desktop */}
          <div className="hidden md:block absolute top-[60px] left-0 w-full h-24 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
              <path
                d="M 166 40 Q 333 0, 500 50 Q 666 100, 833 40"
                stroke="url(#route-gradient)"
                strokeWidth="3"
                strokeDasharray="12 10"
                className="animate-route-flow"
                strokeLinecap="round"
                opacity="0.4"
              />
              <defs>
                <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--t-forest-300)" />
                  <stop offset="50%" stopColor="var(--t-forest-500)" />
                  <stop offset="100%" stopColor="var(--t-forest-700)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-6 group/step">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all hover:scale-110 hover:rotate-3"
                  style={{ background: "white", border: `2px solid ${step.color}` }}
                >
                  <div
                    className="w-full h-full rounded-[calc(1.5rem-2px)] flex items-center justify-center opacity-80"
                    style={{ background: step.bgColor }}
                  >
                    <step.icon className="w-10 h-10 transition-transform group-hover/step:-translate-y-1" style={{ color: step.color }} />
                  </div>
                </div>
                {/* Fixed Number Position */}
                <div
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg border-4 border-white transition-transform group-hover/step:scale-110"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--t-stone-800)" }}>{step.title}</h3>
              <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: "var(--t-stone-500)" }}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 t-section-bg">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--t-stone-800)" }}>
                Popular <span className="t-gradient-text">Destinations</span>
              </h2>
              <p className="max-w-xl" style={{ color: "var(--t-stone-500)" }}>
                Discover how our AI plans unique journeys in the world's most beautiful places.
              </p>
            </div>
            <Link to="/explore">
              <Button variant="ghost" className="group text-forest-700 font-semibold gap-2">
                See all cities <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div key={dest.name} className="group relative overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all h-[450px]">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white text-sm font-bold">{dest.rating}</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 mb-3" style={{ color: "var(--t-forest-700)" }}>
                    <dest.icon className="w-3.5 h-3.5" />
                    {dest.tag}
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{dest.name}</h4>
                  <p className="text-white/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    AI-powered daily schedules, scenic routes, and local secrets.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--t-stone-800)" }}>
            Why <span className="t-gradient-text">Turismo</span>?
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "var(--t-stone-500)" }}>
            Experience travel planning powered by specialized AI collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="t-card p-8 group transition-all hover:-translate-y-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-sm"
                style={{ background: "var(--t-forest-50)" }}
              >
                <feature.icon className="w-7 h-7" style={{ color: "var(--t-forest-600)" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--t-stone-800)" }}>
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: "var(--t-stone-500)" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 py-20">
        <div
          className="rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl"
          style={{ background: "linear-gradient(135deg, var(--t-forest-800) 0%, var(--t-forest-600) 40%, var(--t-terra-600) 100%)" }}
        >
          {/* Nature SVG Silhouettes Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <path d="M0 200 L200 80 L400 150 L600 40 L800 120 L1000 70 L1000 200 Z" fill="white" />
            </svg>
          </div>

          {/* Animated glow elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/20 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/30 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-forest-400/20 blur-[130px] rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-forest-400/30 transition-colors duration-1000" />

          <div className="relative z-10 glass-container p-4 md:p-8 rounded-[30px] border border-white/10">
            <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Ready to plan your next <br />
              <span className="text-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)] italic">extraordinary adventure?</span>
            </h2>
            <p className="text-white/80 text-lg md:text-2xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Join thousands of travelers who use <span className="text-white border-b-2 border-amber-400">Turismo</span> to discover hidden gems with AI-powered precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/explore">
                <Button
                  size="lg"
                  className="bg-amber-500 text-forest-950 hover:bg-amber-400 text-xl px-12 py-8 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-all font-black border-none"
                >
                  Start Exploring Now
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/20 text-xl px-10 py-8 rounded-2xl transition-all font-bold hover:border-white/40"
                >
                  Join the Community
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-white/50">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-amber-400" /> Free to use
              </div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-amber-400" /> Precise routing
              </div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-amber-400" /> 100% Personalised
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: "1px solid var(--t-border)", background: "white" }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6" style={{ color: "var(--t-forest-600)" }} />
              <span className="text-2xl font-bold t-gradient-text underline-offset-4 decoration-forest-200">Turismo</span>
            </div>
            <div className="flex gap-8 text-sm font-medium" style={{ color: "var(--t-stone-600)" }}>
              <Link to="/explore" className="hover:text-forest-600 transition-colors">Explore</Link>
              <Link to="/login" className="hover:text-forest-600 transition-colors">Sign In</Link>
              <a href="#" className="hover:text-forest-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-forest-600 transition-colors">Terms</a>
            </div>
          </div>
          <div className="text-center text-sm pt-8 border-t" style={{ borderColor: "var(--t-border)", color: "var(--t-stone-400)" }}>
            <p>© {new Date().getFullYear()} Turismo — Crafted with ❤️ and AI for the modern explorer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reuse Existing Lucide imports and add new ones if needed
function Leaf(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C10.32 14.36 12 12 12 12" />
    </svg>
  );
}
