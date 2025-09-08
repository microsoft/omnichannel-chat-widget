import { useContext } from "react";

/**
 * Direction context for RTL/LTR support
 */
export interface DirectionContextType {
    direction: "ltr" | "rtl";
}

/**
 * Hook to get the current text direction (RTL/LTR)
 * This can be used by components to apply appropriate styling and behavior
 * 
 * @returns The current direction ('ltr' or 'rtl')
 */
export function useDirection(): "ltr" | "rtl" {
    // For now, we'll detect direction from document or provide a default
    // This can be enhanced later to use React context or other mechanisms
    
    // Check if document direction is set
    if (typeof document !== "undefined") {
        const documentDir = document.documentElement.dir || document.body.dir;
        if (documentDir === "rtl" || documentDir === "ltr") {
            return documentDir as "ltr" | "rtl";
        }
    }
    
    // Check if the page language suggests RTL
    if (typeof document !== "undefined") {
        const lang = document.documentElement.lang || document.body.lang || navigator.language;
        const rtlLanguages = ["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi"];
        const langCode = lang.split("-")[0].toLowerCase();
        
        if (rtlLanguages.includes(langCode)) {
            return "rtl";
        }
    }
    
    // Default to LTR
    return "ltr";
}

/**
 * Utility function to detect if the current direction is RTL
 * @returns true if direction is RTL, false otherwise
 */
export function useIsRTL(): boolean {
    return useDirection() === "rtl";
}
