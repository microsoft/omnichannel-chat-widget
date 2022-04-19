import { BrowserVendor } from "../../webchatcontroller/enums/BrowserVendor";
import { getBrowserName, isChromiumEdge } from "./BrowserInfo";
import ArchiveIcon from "../../../../assets/icons/archiveIcon.svg";
import AudioIcon from "../../../../assets/icons/audioIcon.svg";
import BlankIcon from "../../../../assets/icons/blankIcon.svg";
import VideoIcon from "../../../../assets/icons/videoIcon.svg";
import ImageIcon from "../../../../assets/icons/imageIcon.svg";
import WordIcon from "../../../../assets/icons/wordIcon.svg";
import OneNoteIcon from "../../../../assets/icons/oneNoteIcon.svg";
import PowerpointIcon from "../../../../assets/icons/powerpointIcon.svg";
import VisioIcon from "../../../../assets/icons/visioIcon.svg";
import PDFIcon from "../../../../assets/icons/pdfIcon.svg";
import ExcelIcon from "../../../../assets/icons/excelIcon.svg";
import { Constants } from "../../../../common/Constants";

const FileAttachmentIconMap:{[unit: string]: unknown} = {
    "aac": AudioIcon,
    "aiff": AudioIcon,
    "alac": AudioIcon,
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
    switch(getBrowserName()) {
    case BrowserVendor.CHROME:
    case BrowserVendor.OPERA: return Constants.chromeSupportedInlineMediaRegex.test(attachmentName);
    case BrowserVendor.FIREFOX: return Constants.firefoxSupportedInlineMediaRegex.test(attachmentName);
    case BrowserVendor.EDGE: return isChromiumEdge() && Constants.chromeSupportedInlineMediaRegex.test(attachmentName);
    default: return false;
    }
};