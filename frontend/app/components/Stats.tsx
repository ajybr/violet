import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogStore } from "../store/logStore";

export default function Stats() {
  const logs = useLogStore((s) => s.logs);

  const total = logs.length;
  const avgMs = total
    ? Math.round(logs.reduce((s, l) => s + l.ms, 0) / total)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>Total requests: {total}</div>
          <div>Avg latency: {avgMs} ms</div>
        </div>
      </CardContent>
    </Card>
  );
}
