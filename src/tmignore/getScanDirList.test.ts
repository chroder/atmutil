import {
    assertEquals,
} from "testing/asserts.ts";

import { getScanDirList } from "./getScanDirList.ts";

Deno.test("test minimal list", async () => {
    const r = await getScanDirList([
        "/a/b/c",
        "/a",
        "/a/foo/bar",
        "/foo/bar/baz",
        "/foobar"
    ]);

    assertEquals(r.scanDirs, [
        "/a", "/foo/bar/baz", "/foobar"
    ]);
});

Deno.test("test minimal ignore list with globs", async () => {
    const r = await getScanDirList([
        "/a/b/c/d/e/f",
        "**/f",
    ]);

    assertEquals(r.scanDirs, [
        "**/f"
    ]);
});

Deno.test("test normalized paths", async () => {
    const r = await getScanDirList([
        "/a/b/c",
        "/a/b/c/../../",
        "/a/foo/bar",
        "/foo/bar/baz",
        "/foobar"
    ]);

    assertEquals(r.scanDirs, [
        "/a", "/foo/bar/baz", "/foobar"
    ]);
});