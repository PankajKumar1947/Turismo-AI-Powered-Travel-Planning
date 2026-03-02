import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Leaf, User, LogOut, Compass } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-lg"
      style={{ background: "rgba(250, 248, 245, 0.85)", borderBottom: "1px solid var(--t-border)" }}
    >
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Leaf className="w-5 h-5 transition-transform group-hover:rotate-12" style={{ color: "var(--t-forest-500)" }} />
          <span className="text-xl font-bold t-gradient-text">Turismo</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Compass className="w-4 h-4" /> Explore
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.name?.split(" ")[0]}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="rounded-xl">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="t-btn-primary gap-1.5">
                <User className="w-4 h-4" /> Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
