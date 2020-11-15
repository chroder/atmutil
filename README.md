A small utility that helps manage Time Machine exclusions. Written in Typescript/[Deno](https://deno.land/).

This uses macOS `tmutil` under the hood. The name stands for "**A**dvanced tmutil".

# Example usage

```
atmutil --scan-dir /Users/chroder --ignore-dev --ignore 'name=*.bak'
```

# Help

```
$ atmutil help
NAME
    atmutil - a utility to manage Time Machine backups

USAGE
    atmutil COMMAND [options]


COMMANDS

    help            Show this help message
    help COMMAND    Show help for a particular command
    updateignore    Update the ignore lists

GENERAL
    --version, -V
        Get version information
```

```
$ atmutil help updateignore
NAME
    atmutil updateignore - control which files are ignored by Time Machine

USAGE
    atmutil updateignore [options]

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
                -e "regex=.*/README..*"

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

```