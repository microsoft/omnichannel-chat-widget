import { ReactNode } from "react";

export const encodeComponentString = (element: ReactNode) => {
    return JSON.stringify(element, (_k, v) =>
        typeof v === "symbol" ? `$$Symbol:${Symbol.keyFor(v)}` : v,
    );
};