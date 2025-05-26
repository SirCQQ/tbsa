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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Camera, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  meterType: z.string().min(1, "Selectează tipul de contor"),
  currentReading: z.string().min(1, "Citirea curentă este obligatorie"),
  readingDate: z.date({
    required_error: "Data citirii este obligatorie",
  }),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SubmitReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const meterTypes = [
  { value: "water", label: "Apă Rece" },
  { value: "hot-water", label: "Apă Caldă" },
];

export function SubmitReadingModal({
  open,
  onOpenChange,
}: SubmitReadingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meterType: "",
      currentReading: "",
      notes: "",
      readingDate: new Date(),
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simulare API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Submitting reading:", {
        ...data,
        photo: selectedFile,
      });

      // Reset form și închide modal
      form.reset();
      setSelectedFile(null);
      onOpenChange(false);

      // TODO: Implementare API call real
      // await submitReading(data)
    } catch (error) {
      console.error("Error submitting reading:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Trimite Citire Contor
          </DialogTitle>
          <DialogDescription>
            Completează formularul pentru a trimite citirea contorului tău.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="meterType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Contor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul de contor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentReading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Citirea Curentă</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 1234.56"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Introdu valoarea afișată pe contor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Citirii</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ro })
                          ) : (
                            <span>Selectează data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data când a fost efectuată citirea
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Fotografie Contor (Opțional)
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative overflow-hidden"
                  asChild
                >
                  <label className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    {selectedFile ? "Schimbă Foto" : "Adaugă Foto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </Button>
                {selectedFile && (
                  <span className="text-sm text-muted-foreground">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Adaugă o fotografie pentru verificare (JPG, PNG)
              </p>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observații (Opțional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adaugă observații despre citire..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Orice informații suplimentare despre citire
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Se trimite..." : "Trimite Citirea"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
