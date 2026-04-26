import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";
import { useExplore } from "@/context/explore.context";

const stepLabels = ["Preferences", "Pick Places", "Pick Routes"];

export default function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetWizard } = useExplore();

  const stepIndex = location.pathname.includes("preferences") ? 0 
                  : location.pathname.includes("places") ? 1 
                  : location.pathname.includes("routes") ? 2 : 0;

  const handleStartOver = () => {
    resetWizard();
    navigate("/explore/preferences");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      {/* Step indicator bar */}
      <div className="container mx-auto px-6 pt-4 pb-2">
        <div className="flex items-center justify-center gap-1">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              {i > 0 && (
                <div 
                  className="w-8 h-px mx-1" 
                  style={{ background: i <= stepIndex ? "var(--t-forest-300)" : "var(--t-sand-300)" }} 
                />
              )}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: i === stepIndex ? "var(--t-forest-600)" : i < stepIndex ? "var(--t-forest-50)" : "var(--t-sand-100)",
                  color: i === stepIndex ? "white" : i < stepIndex ? "var(--t-forest-700)" : "var(--t-stone-400)",
                }}
              >
                {i < stepIndex ? <Check className="w-3 h-3" /> : null}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <Outlet />

        {stepIndex > 0 && (
          <div className="text-center mt-6">
            <Button variant="ghost" size="sm" onClick={handleStartOver} style={{ color: "var(--t-stone-400)" }}>
              <RotateCcw className="w-4 h-4 mr-2" /> Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
