import { Shield, Lock, Eye, MapPin, Sparkles, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: "var(--t-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-100 text-forest-700 text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Privacy & Transparency
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" style={{ color: "var(--t-stone-800)" }}>
            Your Data <span className="t-gradient-text">Stays Yours</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
            At Turismo, we believe travel planning should be as safe as it is inspiring. 
            Here is how we handle your information with care and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <SectionCard 
            icon={<MapPin className="w-6 h-6 text-forest-500" />}
            title="Location Intelligence"
            content="We use your geographic coordinates only to provide relevant nearby recommendations and accurate routing. This data is processed in real-time and is never sold to third parties."
          />
          <SectionCard 
            icon={<Sparkles className="w-6 h-6 text-amber-500" />}
            title="AI Personalization"
            content="Our AI agents analyze your selected preferences (e.g., 'heritage', 'nature') to craft custom itineraries. These preferences are stored securely to improve your future planning experience."
          />
          <SectionCard 
            icon={<Lock className="w-6 h-6 text-sky-600" />}
            title="Secure Authentication"
            content="Your account is protected by industry-standard JWT tokens and bcrypt password hashing. We never store plain-text passwords on our servers."
          />
          <SectionCard 
            icon={<Database className="w-6 h-6 text-terra-500" />}
            title="Saved Itineraries"
            content="When you select 'Save Itinerary', we store the trip details so you can access them anytime from your profile. You have full control to delete these at any time."
          />
        </div>

        <div className="t-card p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--t-stone-800)" }}>
              <Eye className="w-6 h-6 text-forest-600" /> Useful Points to Note
            </h2>
            <ul className="space-y-4">
              <ListItem text="We use OpenStreetMap (OSRM) for high-precision route calculations. Only necessary coordinate pairs are transmitted." />
              <ListItem text="Our reverse geocoding service allows us to show you readable city names instead of raw coordinates for a better experience." />
              <ListItem text="We do not track your location in the background. Access is only requested when you click 'Use My Current Location'." />
              <ListItem text="Cookies are strictly used for session management to keep you logged in across devices." />
            </ul>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-forest-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
        </div>

        <div className="text-center">
          <p className="text-sm text-stone-400 mb-8">Last Updated: March 27, 2026</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 rounded-xl t-btn-primary font-bold shadow-lg">
            Return to Exploration
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="t-card p-8 hover:shadow-xl transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3" style={{ color: "var(--t-stone-800)" }}>{title}</h3>
      <p className="text-stone-500 leading-relaxed text-sm">{content}</p>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex gap-4 items-start">
      <div className="w-1.5 h-1.5 rounded-full bg-forest-400 mt-2 shrink-0" />
      <span className="text-stone-600 leading-relaxed">{text}</span>
    </li>
  );
}
