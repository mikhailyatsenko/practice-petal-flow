import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const KEY = "onboardingCompleted";
const COUNTRY_KEY = "selectedCountry";

export function OnboardingGate() {
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completed =
      typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
    setDone(completed);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || done) return;
    const country =
      typeof window !== "undefined" && localStorage.getItem(COUNTRY_KEY);
    navigate({ to: country ? "/onboarding" : "/welcome" });
  }, [ready, done, navigate]);

  return null;
}

