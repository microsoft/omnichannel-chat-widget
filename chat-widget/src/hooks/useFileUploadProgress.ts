import { useState, useCallback } from "react";

export interface UploadProgressItem {
    id: string;
    progress: number;
    status: "uploading" | "completed" | "error";
}

export const useFileUploadProgress = () => {
    const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgressItem>>(new Map());
    const [intervals, setIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());

    const simulateUpload = useCallback((fileId: string) => {
        // Start at 0%
        setUploadProgress(prev => new Map(prev).set(fileId, {
            id: fileId,
            progress: 0,
            status: "uploading"
        }));

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20; // 20% increments: 0→20→40→60→80→100
            
            if (progress >= 100) {
                clearInterval(interval);
                setIntervals(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(fileId);
                    return newMap;
                });
                
                // Mark as completed, then auto-remove
                setUploadProgress(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(fileId); // Simple: just remove when done
                    return newMap;
                });
            } else {
                setUploadProgress(prev => new Map(prev).set(fileId, {
                    id: fileId,
                    progress,
                    status: "uploading"
                }));
            }
        }, 500); // 500ms per step = 2.5 seconds total

        setIntervals(prev => new Map(prev).set(fileId, interval));
    }, []);

    const cancelUpload = useCallback((fileId: string) => {
        const interval = intervals.get(fileId);
        if (interval) {
            clearInterval(interval);
            setIntervals(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });
        }
        
        setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    }, [intervals]);

    const getProgress = useCallback((fileId: string): number | undefined => {
        return uploadProgress.get(fileId)?.progress;
    }, [uploadProgress]);

    return {
        uploadProgress,
        simulateUpload,
        cancelUpload,
        getProgress
    };
};
