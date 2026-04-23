import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
  const { text } = await req.json();

  // resolve absolute path from project root
  const script = path.join(process.cwd(), "..", "ingest", "embed_text.py");

  console.log("script:", script); // must print /path/to/project/ingest/embed_text.py
  console.log("cwd:", process.cwd()); // must print project root

  const p = spawn("uv", ["run", script]);

  const out: Buffer[] = [];
  const err: Buffer[] = [];

  p.stdout.on("data", (c) => out.push(c));
  p.stderr.on("data", (c) => err.push(c));

  p.stdin.write(JSON.stringify({ text }));
  p.stdin.end();

  await new Promise((r) => p.on("close", r));

  if (err.length) {
    console.error("PYTHON ERROR:", Buffer.concat(err).toString());
    return NextResponse.json({ error: "python crashed" }, { status: 500 });
  }

  const raw = Buffer.concat(out).toString();
  console.log("python stdout:", raw);

  return NextResponse.json({ vector: JSON.parse(raw) });
}
