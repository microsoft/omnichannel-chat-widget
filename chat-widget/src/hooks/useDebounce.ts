import { useRef, useEffect } from "react";

type TimerType = ReturnType<typeof setTimeout>;
type FunctionType = (...args: unknown[]) => void;

export default function useDebounce<Fn extends FunctionType>(func: Fn, delay = 1000) {
    const timer = useRef<TimerType>();

    useEffect(() => {
        return () => {
            if (!timer.current) return;
            clearTimeout(timer.current);
        };
    }, []);

    const debouncedFunction = ((...args) => {
        const newTimer = setTimeout(() => {
            func(...args);
        }, delay);
        clearTimeout(timer.current);
        timer.current = newTimer;
    }) as Fn;

    return debouncedFunction;
}