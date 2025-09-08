
import {
    DocumentPdf20Filled,
    Document20Filled,
    Image20Filled,
    Video20Filled,
    Archive20Filled,
    DocumentData20Filled
} from "@fluentui/react-icons";
import React from "react";

const getFileIcon = (fileName?: string) => {
    const ext = fileName?.toLowerCase().split(".").pop() || "";

    switch (ext) {
    case "pdf":
        return <DocumentPdf20Filled style={{ color: "#D32F2F" }} />;
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
        return <Document20Filled style={{ color: "#2E7D32" }} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
        return <Image20Filled style={{ color: "#1976D2" }} />;
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "flv":
        return <Video20Filled style={{ color: "#7B1FA2" }} />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
        return <Archive20Filled style={{ color: "#F57C00" }} />;
    case "xls":
    case "xlsx":
    case "csv":
        return <DocumentData20Filled style={{ color: "#388E3C" }} />;
    default:
        return <Document20Filled style={{ color: "#616161" }} />;
    }
};
export default getFileIcon;