import { parse, ArgParsingOptions } from "std/flags/mod.ts";

export function getCommandArgs(commandName: string, options: ArgParsingOptions = {}, args: string[] | undefined = undefined) {
    const parsed = parse(args || Deno.args, options);

    const gotCommandName = parsed._.shift();
    if (gotCommandName !== commandName) {
        throw new Error("Unexpected command name");
    }

    return parsed;
}

export function strArrayArg(arg: string | string[] | undefined): string[] {
    if (typeof arg === 'undefined') {
        return [];
    }

    return Array.isArray(arg) ? arg : [arg];
}