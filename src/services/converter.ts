import { convertWpToGhost } from "./converters/wpToGhost";
import { convertGhostToWp } from "./converters/ghostToWp";

export type ConversionDirection = 'wp-to-ghost' | 'ghost-to-wp';

export interface ConversionOptions {
    ghostVersion: string;
}

export interface ConversionResult {
    output: string;
    error?: string;
}

export const convert = (
    content: string,
    direction: ConversionDirection,
    options: ConversionOptions
): ConversionResult => {
    try {
        if (direction === 'wp-to-ghost') {
            const ghostData = convertWpToGhost(content, options.ghostVersion);
            return { output: JSON.stringify(ghostData, null, 2) };
        } else {
            const ghostData = JSON.parse(content);
            const wpXml = convertGhostToWp(ghostData);
            return { output: wpXml };
        }
    } catch (err: any) {
        return {
            output: "",
            error: err.message || "An error occurred during conversion"
        };
    }
};
