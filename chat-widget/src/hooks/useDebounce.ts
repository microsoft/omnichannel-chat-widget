import { useRef, useEffect } from "react";

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: unknown[]) => void;

export default function useDebounce<Fn extends SomeFunction>(func: Fn, delay = 1000) {
    const timer = useRef<Timer>();

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