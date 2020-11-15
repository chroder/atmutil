export async function listFromFile(filename: string): Promise<string[]> {
    const lines: string[] = [];

    (await Deno.readTextFile(filename)).split("\n").forEach(rawLine => {
        const line = rawLine.trim();
        if (line !== '' && line.substr(0, 1) !== '#') {
            lines.push(line);
        }
    });

    return lines;
}