import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public/images");
  const files = fs.readdirSync(dir);

  // return absolute URLs the browser can load
  const out = files.map((f) => `/images/${f}`);

  return Response.json(out);
}
