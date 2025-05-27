"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Camera,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface PendingReading {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  meterType: string;
  currentReading: number;
  previousReading: number;
  readingDate: Date;
  submittedAt: Date;
  notes?: string;
  photo?: string;
  status: "pending" | "approved" | "rejected";
}

interface ValidateReadingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data pentru demonstrație
const mockReadings: PendingReading[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Ion Popescu",
    userEmail: "ion.popescu@email.com",
    meterType: "water",
    currentReading: 123.45,
    previousReading: 118.23,
    readingDate: new Date("2024-01-15"),
    submittedAt: new Date("2024-01-16"),
    notes: "Citire normală, fără probleme",
    photo: "meter-photo-1.jpg",
    status: "pending",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Maria Ionescu",
    userEmail: "maria.ionescu@email.com",
    meterType: "hot-water",
    currentReading: 89.67,
    previousReading: 85.12,
    readingDate: new Date("2024-01-14"),
    submittedAt: new Date("2024-01-15"),
    status: "pending",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Andrei Georgescu",
    userEmail: "andrei.georgescu@email.com",
    meterType: "water",
    currentReading: 89.45,
    previousReading: 87.23,
    readingDate: new Date("2024-01-13"),
    submittedAt: new Date("2024-01-14"),
    notes: "Contor înlocuit recent",
    status: "pending",
  },
];

const meterTypeLabels = {
  water: "Apă Rece",
  "hot-water": "Apă Caldă",
};

export function ValidateReadingsModal({
  open,
  onOpenChange,
}: ValidateReadingsModalProps) {
  const [readings, setReadings] = useState<PendingReading[]>(mockReadings);
  const [selectedReading, setSelectedReading] = useState<PendingReading | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (readingId: string) => {
    setIsProcessing(true);
    try {
      // Simulare API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReadings((prev) => prev.filter((r) => r.id !== readingId));
      setSelectedReading(null);

      console.log("Approved reading:", readingId);
      // TODO: Implementare API call real
    } catch (error) {
      console.error("Error approving reading:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (readingId: string, reason: string) => {
    if (!reason.trim()) {
      alert("Te rog să specifici motivul respingerii");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulare API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReadings((prev) => prev.filter((r) => r.id !== readingId));
      setSelectedReading(null);
      setRejectionReason("");

      console.log("Rejected reading:", readingId, "Reason:", reason);
      // TODO: Implementare API call real
    } catch (error) {
      console.error("Error rejecting reading:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateConsumption = (current: number, previous: number) => {
    return current - previous;
  };

  const getConsumptionStatus = (consumption: number, meterType: string) => {
    // Logică simplă pentru a determina dacă consumul pare normal
    const thresholds = {
      water: { normal: 10, high: 25 },
      "hot-water": { normal: 8, high: 20 },
    };

    const threshold =
      thresholds[meterType as keyof typeof thresholds] || thresholds.water;

    if (consumption < 0)
      return {
        status: "error",
        label: "Eroare",
        color: "destructive" as const,
      };
    if (consumption > threshold.high)
      return {
        status: "high",
        label: "Consum Mare",
        color: "destructive" as const,
      };
    if (consumption > threshold.normal)
      return {
        status: "medium",
        label: "Consum Mediu",
        color: "secondary" as const,
      };
    return {
      status: "normal",
      label: "Consum Normal",
      color: "default" as const,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Validează Citiri Contoare ({readings.length})
          </DialogTitle>
          <DialogDescription>
            Revizuiește și validează citirilе trimise de utilizatori
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Toate citirilе au fost procesate
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Nu există citiri în așteptarea validării
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-y-auto pr-2">
              {/* Lista citirilоr */}
              <div className="space-y-3">
                {readings.map((reading) => {
                  const consumption = calculateConsumption(
                    reading.currentReading,
                    reading.previousReading
                  );
                  const consumptionStatus = getConsumptionStatus(
                    consumption,
                    reading.meterType
                  );

                  return (
                    <Card
                      key={reading.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedReading?.id === reading.id
                          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setSelectedReading(reading)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {reading.userName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {reading.userEmail}
                            </p>
                          </div>
                          <Badge variant={consumptionStatus.color}>
                            {consumptionStatus.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Tip:
                            </span>
                            <p className="font-medium">
                              {
                                meterTypeLabels[
                                  reading.meterType as keyof typeof meterTypeLabels
                                ]
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Consum:
                            </span>
                            <p className="font-medium">
                              {consumption.toFixed(2)} kWh/m³
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Citire:
                            </span>
                            <p className="font-medium">
                              {reading.currentReading}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Data:
                            </span>
                            <p className="font-medium">
                              {format(reading.readingDate, "dd MMM", {
                                locale: ro,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          Trimis{" "}
                          {format(reading.submittedAt, "dd MMM, HH:mm", {
                            locale: ro,
                          })}
                          {reading.photo && <Camera className="h-3 w-3 ml-2" />}
                          {reading.notes && (
                            <MessageSquare className="h-3 w-3 ml-1" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detalii citire selectată */}
              <div className="lg:border-l lg:pl-4">
                {selectedReading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Detalii Citire - {selectedReading.userName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Tip Contor:
                          </span>
                          <p className="font-medium">
                            {
                              meterTypeLabels[
                                selectedReading.meterType as keyof typeof meterTypeLabels
                              ]
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Citire Anterioară:
                          </span>
                          <p className="font-medium">
                            {selectedReading.previousReading}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Citire Curentă:
                          </span>
                          <p className="font-medium text-lg">
                            {selectedReading.currentReading}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Data Citirii:
                          </span>
                          <p className="font-medium">
                            {format(selectedReading.readingDate, "PPP", {
                              locale: ro,
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Consum:
                          </span>
                          <p className="font-medium text-lg">
                            {calculateConsumption(
                              selectedReading.currentReading,
                              selectedReading.previousReading
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedReading.notes && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Observații:
                        </span>
                        <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                          {selectedReading.notes}
                        </p>
                      </div>
                    )}

                    {selectedReading.photo && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Fotografie:
                        </span>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          <span className="text-sm">
                            {selectedReading.photo}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(selectedReading.id)}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isProcessing ? "Se procesează..." : "Aprobă"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleReject(selectedReading.id, rejectionReason)
                          }
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Respinge
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Motivul respingerii (obligatoriu pentru respingere)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Selectează o citire
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500">
                      Alege o citire din lista din stânga pentru a vedea
                      detaliile
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Închide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
