import * as path from "std/path/mod.ts";
import { patterns as stdScanExcludePatterns } from "../tmignore/std-scan-exclude.ts";

export type ScanDirList = { scanDirs: string[]; ignoreDirs: string[] };

const normalize = (d: string): string | undefined => {
    if (path.isGlob(d)) {
        const real = path.normalizeGlob(d).replace(/\/$/, '');
        if (real && real !== '.' && real !== '') {
            return real;
        }
    } else {
        const real = path.normalize(d).replace(/\/$/, '');
        if (real && real !== '.' && real !== '') {
            return real;
        }
    }

    return undefined;
}

export function getScanDirList(dirs: string[]): ScanDirList {
    const scanDirs: string[] = [];
    const ignoreDirs: string[] = stdScanExcludePatterns.slice();

    dirs.forEach(async d => {
        if (d.substr(0, 1) === '!') {
            const real = normalize(d.substring(1));
            if (real) {
                ignoreDirs.push(real);
            }
        } else{
            const real = normalize(d);
            if (real) {
                scanDirs.push(real);
            }
        }
    });
    
    return {
        scanDirs: minimizeScanList(scanDirs),
        ignoreDirs: minimizeScanList(ignoreDirs)
    };
}

export function minimizeScanList(allDirs: string[]): string[] {
    const dirs: string[] = [];

    const sorted = allDirs.sort((a: string, b: string) => {
        const aIsGlob = path.isGlob(a);
        const bIsGlob = path.isGlob(b);

        // globs go to the end
        if (aIsGlob && !bIsGlob) {
            return 1;
        }
        if (bIsGlob && !aIsGlob) {
            return 1;
        }
        if (aIsGlob && aIsGlob) {
            return 0;
        }

        // longest to the beginning
        if (a.length > b.length) {
            return 1;
        }
        if (a.length > b.length) {
            return -1;
        }

        // otherwise alphabetical
        if (a > b) {
            return 1;
        }
        if (a > b) {
            return -1;
        }

        return 0;
    });
    
    sorted.forEach(d => {
        // if we already have a parent dir specified,
        // no need to include the child in the list
        if (!path.isGlob(d)) {
            const foundParent = sorted.findIndex(check => {
                if (path.isGlob(check)) {
                    if (path.globToRegExp(check).test(d)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return d.length > check.length && d.indexOf(check) === 0;
                }
            });

            if (foundParent === -1) {
                dirs.push(d);
            }
        } else {
            dirs.push(d);
        }
    });

    return dirs;
}