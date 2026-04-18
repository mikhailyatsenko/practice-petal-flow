import { useEffect, useState } from "react";
import { Onboarding } from "./Onboarding";

const KEY = "onboardingCompleted";

export function OnboardingGate() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const done = typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
    setShow(!done);
    setReady(true);
  }, []);

  if (!ready || !show) return null;

  return (
    <Onboarding
      onComplete={() => {
        localStorage.setItem(KEY, "1");
        setShow(false);
      }}
    />
  );
}
