import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Securitate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          Schimbă Parola
        </Button>
        <Button variant="outline" className="w-full justify-start">
          Istoric Conectări
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700"
        >
          Șterge Contul
        </Button>
      </CardContent>
    </Card>
  );
}
