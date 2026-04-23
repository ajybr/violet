import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JSONLSearch from "../components/JSONLSearch";
import SemanticSearch from "../components/SemanticSearch";

export default function Semantic() {
  return (
    <div className="p-6">
      <Tabs defaultValue="Semantic" className="w-full">
        <TabsList className="grid grid-cols-2 w-lg">
          <TabsTrigger value="Semantic">Semantic</TabsTrigger>
          <TabsTrigger value="JSON">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="JSON">
          <JSONLSearch />
        </TabsContent>

        <TabsContent value="Semantic">
          <SemanticSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
