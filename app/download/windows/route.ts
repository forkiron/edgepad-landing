import { statSync, createReadStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";

const fileName = "EdgePad-0.1.0-beta-win-x64.zip";
const filePath = join(process.cwd(), "zipfiles", fileName);

export async function GET() {
  const fileStat = statSync(filePath);
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(fileStat.size),
    },
  });
}
