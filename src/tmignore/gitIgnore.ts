import * as path from "std/path/mod.ts";
import { decode as utf8decode } from "std/encoding/utf8.ts";
import { findCmd, groupFileListResult } from "./findCmd.ts";
import { minimizeScanList, ScanDirList } from "./getScanDirList.ts";
import { GroupedPathList } from "./groupedPathList.ts";

export async function findGitIgnore(scanDirs: ScanDirList): Promise<string[]> {
    const findParams = [
        '/usr/bin/find',
    ];

    scanDirs.scanDirs.forEach(i => {
        findParams.push(i);
    });

    ["/Users/*/Library"].concat(scanDirs.ignoreDirs).forEach((i, idx) => {
        findParams.push('!');
        findParams.push('(');
        findParams.push('-type');
        findParams.push('d');
        findParams.push('-path');
        findParams.push(i);
        findParams.push('-prune');
        findParams.push(')');
    });

    const results = await findCmd({
        scanDirs: scanDirs.scanDirs,
        ignoreDirs: minimizeScanList([
            "/Users/*/Library",
            "/Users/*/Music",
            "/Users/*/Movies",
            "/Users/*/Pictures",
            "*/node_modules",
        ].concat(scanDirs.ignoreDirs))
    }, ["file.name=.gitignore"]);

    return results.files;
}

export async function evalGitIgnore(gitIgnoreFile: string): Promise<GroupedPathList> {
    const reposDir = path.dirname(gitIgnoreFile);
    const gitParams = [
        '/usr/bin/git',
        '-C',
        reposDir,
        'ls-files',
        '--directory',
        '--ignored',
        '--others',
        '--exclude-standard',
        '-z'
    ];

    const p = Deno.run({
        cmd: gitParams,
        stdout: "piped",
        stderr: "piped"
    });

    const status = await p.status();

    if (!status.success) {
        console.debug(utf8decode(await p.stderrOutput()));
        throw new Error(`Failed with code ${status.code}`);
    }

    const resultRaw = await p.output();
    const result = utf8decode(resultRaw)
        .replace(/^\0/, '')
        .replace(/\0$/, '')
        .split("\x00");

    return groupFileListResult(result.map(p => path.join(reposDir, p)));
}