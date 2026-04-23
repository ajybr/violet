"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";
import { useLogStore } from "../store/logStore";

export default function RequestForm() {
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">(
    "GET",
  );
  const [route, setRoute] = useState("/collections");
  const [body, setBody] = useState({});

  const push = useLogStore((s) => s.push);

  const mutation = useMutation({
    mutationFn: async () => {
      const m = method.toUpperCase();
      const id = uuid();
      const t0 = performance.now();

      let dataObj;
      if (typeof body === "string") {
        dataObj = body.trim() ? JSON.parse(body) : {};
      } else {
        dataObj = body;
      }

      try {
        let res: any;

        switch (m) {
          case "GET":
            res = await api.get(route);
            break;
          case "POST":
            res = await api.post(route, dataObj);
            break;
          case "PUT":
            res = await api.put(route, dataObj);
            break;
          case "DELETE":
            res = await api.delete(route);
            break;
        }
        console.log(res);

        push({
          id,
          method: m,
          status: res!.status,
          route,
          req: dataObj,
          res: res!.data,
          ms: Math.round(performance.now() - t0),
          time: new Date().toISOString(),
        });
      } catch (err: any) {
        push({
          id,
          method,
          route,
          req: dataObj,
          res: { error: err.message || String(err) },
          ms: 0,
          time: new Date().toISOString(),
        });
      }
    },
  });
  return (
    <div className="p-4 space-y-3 border rounded-xl">
      <div className="flex gap-3">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          placeholder="/collections"
        />

        <Button onClick={() => mutation.mutate()}>send</Button>
      </div>

      <Textarea
        className="min-h-[140px]"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="text-xs text-muted-foreground">
        GET ignores body. Other methods send JSON.
      </div>
    </div>
  );
}
