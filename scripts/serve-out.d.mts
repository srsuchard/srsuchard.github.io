import type { Server } from "node:http";

/** A static file server that mimics GitHub Pages path handling for the given directory. */
export function createPagesServer(rootDir: string): Server;
