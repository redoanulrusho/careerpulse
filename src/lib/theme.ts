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

/**
 * Cycle light → dark → system. From "system", jump to the opposite of what is
 * currently shown so the first click always changes the theme visibly.
 */
export function nextPreference(pref: ThemePreference, systemDark: boolean): ThemePreference {
  if (pref === "system") return systemDark ? "light" : "dark";
  return pref === "light" ? "dark" : "system";
}
