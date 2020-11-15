import { parse } from "std/flags/mod.ts";
import { CmdDef } from "./commands/types.ts";
import * as updateignore from "./commands/updateignore.ts";

const binName = Deno.env.get('__atmutil_name') || Deno.mainModule;
const versionString = '0.1.0';

const initialArgs = parse(Deno.args);
const commands: { [name: string]: CmdDef } = {
    'updateignore': updateignore
}

if (initialArgs['version'] || initialArgs['V']) {
    console.log(`${binName} version ${versionString}`);
    Deno.exit();
}

if (initialArgs['help']) {
    initialArgs._.unshift('help');
}

const commandName = initialArgs._.shift();

if (!commandName || commandName === 'help') {
    const subCommandName = initialArgs._.shift() as string;
    if (subCommandName && commands[subCommandName]) {
        console.log(commands[subCommandName].getHelp(binName));
        Deno.exit();
    }

    const helpMessage = `
NAME
    ${binName} - a utility to manage Time Machine backups

USAGE
    ${binName} COMMAND [options]


COMMANDS
    
    help            Show this help message
    help COMMAND    Show help for a particular command
    updateignore    Update the ignore lists

GENERAL
    --version, -V
        Get version information
`;
    
    console.log(helpMessage);
    Deno.exit();
}

if (!commands[commandName]) {
    console.error(`Unknown command ${commandName}`);
    Deno.exit(1);
}

commands[commandName].run();