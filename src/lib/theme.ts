export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "careerpulse:theme";

/**
 * Runs synchronously in <head> before first paint (see Next.js "Preventing flash
 * before hydration" guide) so the saved or system theme is applied with no flash.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.setAttribute("data-theme-pref",p)}catch(e){}})()`;

export function resolveTheme(pref: ThemePreference, systemDark: boolean): "light" | "dark" {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

export function nextPreference(pref: ThemePreference): ThemePreference {
  return pref === "light" ? "dark" : pref === "dark" ? "system" : "light";
}
