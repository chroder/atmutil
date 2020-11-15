import * as path from "std/path/mod.ts";

import {
    assertEquals,
} from "testing/asserts.ts";

import { reposPath } from "../testing/testUtils.ts";
import { listFromFile } from "./listFromFile.ts";

Deno.test("reading list from file", async () => {
    const filename = path.resolve(reposPath, "src/testing/resources/list.txt");
    console.log(filename);
    const list = await listFromFile(filename);
    assertEquals(list, [ "/a/b/c", "!/a/b/c", "im testing", "/foo/bar" ]);
});