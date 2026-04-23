"use client";

import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { embedImg } from "../lib/embed_api";

export default function EmbedImage() {
  const [files, setFiles] = useState<File[]>();
  const [vec, setVec] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = async (fs: File[]) => {
    setFiles(fs);
    if (!fs?.length) return;

    setLoading(true);
    const out = await embedImg(fs[0]); // clean modular call
    setVec(out.vector);
    setLoading(false);
  };

  return (
    <Card className="p-4 space-y-4 w-full flex items-center">
      <div className="max-w-lg">
        <Dropzone
          accept={{ "image/*": [] }}
          maxFiles={1}
          maxSize={1024 * 1024 * 10}
          onDrop={handleDrop}
          onError={console.error}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div>

      {loading && (
        <div className="w-full flex justify-center">
          <div className="flex items-center justify-center bg-slate-300/10 rounded-lg h-fit space-x-2 px-4 py-2 max-w-fit">
            <Spinner />
            <div>Loading</div>
          </div>
        </div>
      )}

      {vec && (
        <Card className="p-4 space-y-3">
          <CardHeader>
            <CardTitle>dimensions: {vec ? vec.length : 0}</CardTitle>
          </CardHeader>

          <CardContent className="text-xs break-all">
            {vec && JSON.stringify(vec)}
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
