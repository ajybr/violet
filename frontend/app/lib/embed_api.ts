export async function embedText(t: string) {
  const r = await fetch("http://localhost:8001/embed/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: t }),
  });
  if (!r.ok) throw new Error("fail");
  return r.json(); // { vector: number[] }
}

export async function embedImg(f: File | string) {
  let b64: string;

  if (f instanceof File) {
    const buf = await f.arrayBuffer();
    b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  } else {
    b64 = f;
  }

  const r = await fetch("http://localhost:8001/embed/img", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ b64 }),
  });

  if (!r.ok) throw new Error("fail");
  return r.json(); // { vector: [...] }
}
