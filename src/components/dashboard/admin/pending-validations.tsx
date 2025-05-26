import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PendingValidation {
  id: string;
  building: string;
  apartment: string;
  reading: number;
  unit: string;
  status: "urgent" | "new" | "review";
  priority: number;
}

const mockValidations: PendingValidation[] = [
  {
    id: "1",
    building: "Bloc A",
    apartment: "Apt. 15",
    reading: 23.5,
    unit: "m³",
    status: "urgent",
    priority: 1,
  },
  {
    id: "2",
    building: "Bloc B",
    apartment: "Apt. 7",
    reading: 18.2,
    unit: "m³",
    status: "new",
    priority: 2,
  },
  {
    id: "3",
    building: "Bloc C",
    apartment: "Apt. 22",
    reading: 15.8,
    unit: "m³",
    status: "review",
    priority: 3,
  },
];

const statusConfig = {
  urgent: {
    bgColor: "bg-red-50 dark:bg-red-950/20",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    label: "Urgent",
  },
  new: {
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    badgeColor:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    label: "Nou",
  },
  review: {
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    label: "Revizie",
  },
};

export function PendingValidations() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Validări în Așteptare
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockValidations.map((validation) => {
            const config = statusConfig[validation.status];
            return (
              <div
                key={validation.id}
                className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} transition-colors duration-200 hover:opacity-80`}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {validation.building}, {validation.apartment}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Citire: {validation.reading} {validation.unit}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-md font-medium ${config.badgeColor}`}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
