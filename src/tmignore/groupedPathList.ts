import { parse } from "https://deno.land/std@0.77.0/path/mod.ts";

export type GroupedPathList = {
    readonly dirs: string[];
    readonly files: string[];
};

export function mergeGroupedPathLists(lists: GroupedPathList[]): GroupedPathList {
    const dirs = new Set<string>();
    const files = new Set<string>();

    lists.forEach(i => {
        i.dirs.forEach(x => dirs.add(x));
        i.files.forEach(x => files.add(x));
    });

    return minimizeGroupedPathList({
        dirs: Array.from(dirs).map(d => d.replace(/\/$/, '')),
        files: Array.from(files)
    });
}

export function minimizeGroupedPathList(list: GroupedPathList): GroupedPathList {
    return {
        dirs: list.dirs,
        files: list.files.filter(f => {
            return list.dirs.findIndex(dir => f.length > dir.length && f.indexOf(dir) === 0) === -1
        })
    }
}