"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const DARK = {
  bg:                "rgb(10,10,12)",
  bgAlt:             "rgb(12,12,16)",
  cardBg:            "rgb(18,18,24)",
  surface:           "rgba(255,255,255,0.03)",
  surface2:          "rgba(255,255,255,0.045)",
  surfaceHover:      "rgba(255,255,255,0.06)",
  border:            "rgba(255,255,255,0.06)",
  border2:           "rgba(255,255,255,0.09)",
  borderStrong:      "rgba(255,255,255,0.14)",
  text:              "rgb(240,240,248)",
  textSub:           "rgba(255,255,255,0.65)",
  textMuted:         "rgba(255,255,255,0.3)",
  textDim:           "rgba(255,255,255,0.42)",
  textFaint:         "rgba(255,255,255,0.2)",
  iconBtn:           "rgba(255,255,255,0.04)",
  iconBtnBorder:     "rgba(255,255,255,0.07)",
  iconColor:         "rgba(255,255,255,0.35)",
  sectionLabel:      "rgba(255,255,255,0.2)",
  activePill:        "rgba(139,92,246,0.14)",
  activeText:        "rgb(200,180,255)",
  inactiveText:      "rgba(255,255,255,0.42)",
  searchBg:          "rgba(255,255,255,0.04)",
  searchBorder:      "rgba(255,255,255,0.07)",
  searchPlaceholder: "rgba(255,255,255,0.2)",
  searchKbd:         "rgba(255,255,255,0.15)",
  searchKbdBg:       "rgba(255,255,255,0.06)",
  dropBg:            "rgb(18,18,24)",
  dropBorder:        "rgba(255,255,255,0.1)",
  dropItem:          "rgba(255,255,255,0.65)",
  dropHover:         "rgba(255,255,255,0.06)",
  inputBg:           "rgba(255,255,255,0.04)",
  inputBorder:       "rgba(255,255,255,0.09)",
  divider:           "rgba(255,255,255,0.06)",
  shadow:            "0 12px 40px rgba(0,0,0,0.55)",
  shadowSoft:        "0 8px 24px rgba(0,0,0,0.35)",
  skeleton:          "rgba(255,255,255,0.06)",
};

export const LIGHT = {
  bg:                "rgb(246,246,250)",
  bgAlt:             "rgb(255,255,255)",
  cardBg:            "rgb(255,255,255)",
  surface:           "rgba(0,0,0,0.025)",
  surface2:          "rgba(0,0,0,0.035)",
  surfaceHover:      "rgba(0,0,0,0.05)",
  border:            "rgba(0,0,0,0.08)",
  border2:           "rgba(0,0,0,0.1)",
  borderStrong:      "rgba(0,0,0,0.16)",
  text:              "rgb(12,12,20)",
  textSub:           "rgba(0,0,0,0.68)",
  textMuted:         "rgba(0,0,0,0.38)",
  textDim:           "rgba(0,0,0,0.48)",
  textFaint:         "rgba(0,0,0,0.3)",
  iconBtn:           "rgba(0,0,0,0.04)",
  iconBtnBorder:     "rgba(0,0,0,0.09)",
  iconColor:         "rgba(0,0,0,0.4)",
  sectionLabel:      "rgba(0,0,0,0.25)",
  activePill:        "rgba(139,92,246,0.1)",
  activeText:        "rgb(109,40,217)",
  inactiveText:      "rgba(0,0,0,0.48)",
  searchBg:          "rgba(0,0,0,0.04)",
  searchBorder:      "rgba(0,0,0,0.09)",
  searchPlaceholder: "rgba(0,0,0,0.3)",
  searchKbd:         "rgba(0,0,0,0.2)",
  searchKbdBg:       "rgba(0,0,0,0.06)",
  dropBg:            "rgb(255,255,255)",
  dropBorder:        "rgba(0,0,0,0.1)",
  dropItem:          "rgba(0,0,0,0.65)",
  dropHover:         "rgba(0,0,0,0.05)",
  inputBg:           "rgba(0,0,0,0.03)",
  inputBorder:       "rgba(0,0,0,0.1)",
  divider:           "rgba(0,0,0,0.08)",
  shadow:            "0 8px 32px rgba(0,0,0,0.12)",
  shadowSoft:        "0 4px 16px rgba(0,0,0,0.08)",
  skeleton:          "rgba(0,0,0,0.06)",
};

export type DashboardTheme = typeof DARK;

const DashboardThemeContext = createContext<{ dark: boolean; T: DashboardTheme; toggle: () => void }>({
  dark: true,
  T: DARK,
  toggle: () => {},
});

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("portal-theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.setAttribute("data-portal-theme", "light");
    }
  }, []);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem("portal-theme", next ? "dark" : "light");
      document.documentElement.setAttribute("data-portal-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <DashboardThemeContext.Provider value={{ dark, T: dark ? DARK : LIGHT, toggle }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export const useDashboardTheme = () => useContext(DashboardThemeContext);
