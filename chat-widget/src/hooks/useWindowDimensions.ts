import { useState, useEffect } from "react";
import useDebounce from "./useDebounce";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

export default function useWindowDimensions(delay = 200) {

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const handleResize = () => setWindowDimensions(getWindowDimensions());
    const debouncedHandleResize = useDebounce(handleResize, delay);

    useEffect(() => {        
        window.addEventListener("resize", debouncedHandleResize);
        return () => window.removeEventListener("resize", debouncedHandleResize);
    }, []);

    return windowDimensions;
}