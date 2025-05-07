import { ArchiveIcon, AudioIcon, BlankIcon, ExcelIcon, ImageIcon, OneNoteIcon, PDFIcon, PowerpointIcon, VideoIcon, VisioIcon, WordIcon } from "../../../../assets/Icons";
import { getBrowserName, isChromiumEdge } from "./BrowserInfo";

import { BrowserVendor } from "../../webchatcontroller/enums/BrowserVendor";
import { Constants } from "../../../../common/Constants";

const FileAttachmentIconMap: { [unit: string]: unknown } = {
    "aac": AudioIcon,
    "aiff": AudioIcon,
    "alac": AudioIcon,
    "amr": AudioIcon,
    "avchd": VideoIcon,
    "avi": VideoIcon,
    "bmp": ImageIcon,
    "doc": WordIcon,
    "docx": WordIcon,
    "flac": AudioIcon,
    "flv": VideoIcon,
    "gif": ImageIcon,
    "jiff": ImageIcon,
    "jpeg": ImageIcon,
    "jpg": ImageIcon,
    "mpe": VideoIcon,
    "mpeg": VideoIcon,
    "mpg": VideoIcon,
    "mpv": VideoIcon,
    "mp2": AudioIcon,
    "mp3": AudioIcon,
    "mp4": VideoIcon,
    "m4p": VideoIcon,
    "m4v": VideoIcon,
    "mov": VideoIcon,
    "one": OneNoteIcon,
    "pcm": AudioIcon,
    "pdf": PDFIcon,
    "png": ImageIcon,
    "ppt": PowerpointIcon,
    "pptx": PowerpointIcon,
    "qt": VideoIcon,
    "rar": ArchiveIcon,
    "swf": VideoIcon,
    "tar": ArchiveIcon,
    "tar.gz": ArchiveIcon,
    "tgz": ArchiveIcon,
    "txt": BlankIcon,
    "vsd": VisioIcon,
    "vsdx": VisioIcon,
    "wav": AudioIcon,
    "webm": VideoIcon,
    "webp": ImageIcon,
    "wma": AudioIcon,
    "wmv": VideoIcon,
    "xls": ExcelIcon,
    "xlsx": ExcelIcon,
    "zip": ArchiveIcon,
    "zipx": ArchiveIcon,
    "7z": ArchiveIcon,
};

/**
 * Get file attachment icon image depending on extension.
 *
 * @param extension File extension
*/
export const getFileAttachmentIconData = (extension: string) => {
    const key: string = extension.startsWith(".") ? extension.slice(1) : extension || "";
    const icon = FileAttachmentIconMap[key.toLowerCase()] || BlankIcon;

    return icon;
};

// Check if browser supports inline media playing for current media format
export const isInlineMediaSupported = (attachmentName: string): boolean => {
    switch (getBrowserName()) {
        case BrowserVendor.CHROME:
        case BrowserVendor.OPERA: return Constants.chromeSupportedInlineMediaRegex.test(attachmentName);
        case BrowserVendor.FIREFOX: return Constants.firefoxSupportedInlineMediaRegex.test(attachmentName);
        case BrowserVendor.EDGE: return isChromiumEdge() && Constants.chromeSupportedInlineMediaRegex.test(attachmentName);
        default: return false;
    }
};