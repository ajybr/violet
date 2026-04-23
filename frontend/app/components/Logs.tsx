"use client";
import { useLogStore } from "../store/logStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Logs() {
  const logs = useLogStore((st) => st.logs);
  console.log(logs);
  return (
    <Card className="p-4  overflow-auto space-y-3 text-xs">
      <CardHeader>
        <CardTitle>Logs</CardTitle>
        <CardDescription>Log responses appear here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => {
            const c = !log.status
              ? "border-slate-400"
              : log.status >= 200 && log.status < 300
                ? "border-green-500/50"
                : log.status >= 400 && log.status < 600
                  ? "border-red-500"
                  : "border-slate-400";
            return (
              <div
                key={log.id}
                className={`border ${c} backdrop-blur-3xl space-y-3 rounded-lg p-2 text-xs`}
              >
                <div className="font-mono text-[10px]  mb-1">
                  {log.method} {log.route} • {log.ms}ms
                </div>

                {log.status && (
                  <div>
                    <div className="font-semibold">Status:</div>
                    <div className="">{log.status}</div>
                  </div>
                )}

                <div>
                  <div className="font-semibold">Response:</div>
                  <pre className="whitespace-pre-wrap wrap-break-word">
                    {JSON.stringify(log.res, null, 2)}
                  </pre>

                  <div className="mt-1 text-[10px] ">{`${new Date(log.time).toLocaleString()}`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
