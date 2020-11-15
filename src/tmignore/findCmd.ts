import { decode as utf8decode } from "std/encoding/utf8.ts";
import { ScanDirList } from "./getScanDirList.ts";
import { GroupedPathList } from "./groupedPathList.ts";

export async function findCmd(scanDirs: ScanDirList, patterns: string[]): Promise<GroupedPathList> {
    const findParams = [
        '/usr/bin/find',
    ];

    scanDirs.scanDirs.forEach(i => {
        findParams.push(i);
    });

    scanDirs.ignoreDirs.forEach((i, idx) => {
        findParams.push('!');
        findParams.push('(');
        findParams.push('-type');
        findParams.push('d');
        findParams.push('-path');
        findParams.push(i);
        findParams.push('-prune');
        findParams.push(')');
    });

    findParams.push('(');
    const patternTypeRe = /^(file.|dir.)?(name=|path=|regex=)?(.*?)$/;
    patterns.forEach((p, idx) => {
        if (idx > 0) {
            findParams.push('-or');
        }

        const m = patternTypeRe.exec(p) || [undefined, "path", p];
        
        switch(m[1]) {
            case "file":
                findParams.push('-type');
                findParams.push('f');
                break;
            case "dir":
                findParams.push('-type');
                findParams.push('d');
                break;
        }

        switch (m[2]) {
            case "regex=":
                findParams.push('-regex');                
                break;
            case "name=":
                findParams.push('-name');
                break;
            default:
                findParams.push('-path');
                break;
        }
        findParams.push(m[3]!);
    });
    findParams.push(')');
    findParams.push('-prune');
    findParams.push('-print0');

    const p = Deno.run({
        cmd: findParams,
        stdout: "piped",
        stderr: "piped"
    });

    const status = await p.status();

    if (!status.success) {
        console.debug(await p.stderrOutput());
        throw new Error(`Failed with code ${status.code}`);
    }

    const resultRaw = await p.output();
    const result = utf8decode(resultRaw)
        .replace(/^\0/, '')
        .replace(/\0$/, '')
        .split("\x00");

    return groupFileListResult(result);
}

export async function groupFileListResult(paths: string[]): Promise<GroupedPathList> {
    const findResult: GroupedPathList = {
        dirs: [],
        files: []
    };

    await Promise.all(
        paths.map(async f => {
            const info = await Deno.stat(f);
            if (info.isDirectory) {
                findResult.dirs.push(f);
            } else {
                findResult.files.push(f);
            }
        })
    );

    return findResult;
}