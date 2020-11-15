import { getScanDirList } from "../tmignore/getScanDirList.ts";
import { listFromFile } from "../utils/listFromFile.ts";
import { getCommandArgs, strArrayArg } from "./utils.ts";
import { patterns as devPatterns } from "../tmignore/dev-patterns.ts";
import { findCmd } from "../tmignore/findCmd.ts";
import { evalGitIgnore, findGitIgnore } from "../tmignore/gitIgnore.ts";
import { GroupedPathList, mergeGroupedPathLists } from "../tmignore/groupedPathList.ts";

export const COMMAND_NAME = 'updateignore';

export function getHelp(binName: string): string {
    return `
NAME
    ${binName} ${COMMAND_NAME} - control which files are ignored by Time Machine

USAGE
    ${binName} ${COMMAND_NAME} [options]

DESCRIPTION
    This utility works in two ways. The first way is simply by letting you
    specify pattern(s) you want to ignore (e.g. --ignore).

    The second way is by generating a list of files to ignore by scanning
    directories for things you commonly DON'T want to backup (e.g. --gitignore).

OPTIONS

    -p, --preview
        Do not actually update the ignore list. This will just ouput a list
        of files that would be considered ignored.

IGNORE OPTIONS

    -e, --ignore
        Specify an ignore pattern. May be one of a few different formats.

            Path - Glob
                -e "*/foor/README.*"
                -e "path=*/foo/README.*"

            Path - Regex
                -e "regex=.*/README\..*"
            
            Name - Glob
                -e "name=README.*"

    --ignore-list
        Specify a file that includes globs (one per line). This works the same as specifying
        multiple --ignore options.

SCANNING OPTIONS

    -s, --scan-dir
        Specify a directory to scan.

    --scan-dir-list
        Specify a file that includes directories to scan (one per line). This is the same
        as specifying multiple --scan-dir options.

    --ignore-dev
        Ignores common ephemeral developer related directories such as node_modules,
        and scans for .gitignore files to ignore those too.
`;
}

export async function run(): Promise<void> {
    const args = getCommandArgs(COMMAND_NAME, {
        "alias": {
            "p": "preview",
            "e": "ignore",
            "s": "scan-dir"
        },
        "boolean": ["preview", "gitignore", "tmignore", "ignore-dev", "ignore-caches"],
        "string": ["ignore", "ignore-list", "scan-dir", "scan-dir-list"]
    });

    const argScanDirs = strArrayArg(args["scan-dir"]);
    if (args["scan-dir-list"]) {
        await Promise.all(
            strArrayArg(args["scan-dir-list"]).map(async f => {
                const list = await listFromFile(f);
                list.forEach(v => argScanDirs.push(v));
            })
        );
    }

    const scanDirs = getScanDirList(argScanDirs);

    //const ignoredFiles: string = [];
    //const ignoredDirs: string = [];

    const ignorePatterns = strArrayArg(args['ignore']);
    if (args["ignore-list"]) {
        await Promise.all(
            strArrayArg(args["ignore-list"]).map(async f => {
                const list = await listFromFile(f);
                list.forEach(v => ignorePatterns.push(v));
            })
        );
    }

    if (args["ignore-dev"]) {
        devPatterns.forEach(p => ignorePatterns.push(p));
    }

    const result = await findCmd(scanDirs, ignorePatterns);

    const gitIgnoreFiles = await findGitIgnore({
        scanDirs: scanDirs.scanDirs,
        ignoreDirs: scanDirs.ignoreDirs.concat(result.dirs)
    });

    const gitIgnored: GroupedPathList[]  = [];
    if (gitIgnoreFiles.length) {
        await Promise.all(
            gitIgnoreFiles.map(gitIgnore => {
                return evalGitIgnore(gitIgnore).then(files => {
                    gitIgnored.push(files);
                })
            })
        );
    }

    const final = mergeGroupedPathLists([result].concat(gitIgnored));
    
    if (args["preview"]) {
        console.log(final);
    } else {
        // todo use tmutil to ignore files
    }

    console.log(`Ignored files: ${final.files.length}`);
    console.log(`Ignored dirs:  ${final.dirs.length}`);
}