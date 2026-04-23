"use client";
import RequestForm from "./RequestForm";
import Logs from "./Logs";
import Stats from "./Stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function Dashboard() {
  return (
    <main>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <RequestForm />
          <Logs />
        </div>
        <div className="space-y-4">
          <Card className="bg-transparent">
            <CardHeader>
              {" "}
              <CardTitle>Vector visualizer</CardTitle>
            </CardHeader>
            <CardContent className="">
              When you GET /search or GET /docs the server response will often
              include embeddings, distances, or scores. Inspect the right panel
              to view raw vectors and scores. Add more visualization later
              (t-SNE, UMAP) as needed.
            </CardContent>
          </Card>
          <Stats />
        </div>
      </div>
    </main>
  );
}
