export type CmdDef = {
    getHelp: (binName: string) => string;
    run(): void;
}