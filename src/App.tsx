import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth-context";
import Navbar from "@/components/navbar";
import LandingPage from "@/pages/landing-page";
import ExplorePage from "@/pages/explore-page";
import ResultsPage from "@/pages/results-page";
import LoginPage from "@/pages/login-page";
import ProfilePage from "@/pages/profile-page";
import PrivacyPolicy from "@/pages/privacy-policy";
import { ExploreProvider } from "@/context/explore-provider";
import { Navigate } from "react-router-dom";
import PreferencesPage from "./pages/explore/preferences-page";
import PlacesPage from "./pages/explore/places-page";
import RoutesPage from "./pages/explore/routes-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ExploreProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />}>
                <Route index element={<Navigate to="preferences" replace />} />
                <Route path="preferences" element={<PreferencesPage />} />
                <Route path="places" element={<PlacesPage />} />
                <Route path="routes" element={<RoutesPage />} />
              </Route>
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </BrowserRouter>
        </ExploreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
