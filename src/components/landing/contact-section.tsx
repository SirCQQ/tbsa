"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSchema,
  type ContactFormData,
  formatPhoneNumber,
} from "@/lib/validations/contact";
import { ControlledInput, ControlledTextarea } from "@/components/ui/inputs";
import { useContactForm } from "@/hooks/use-contact";
import { getErrorMessage, isAxiosError } from "@/lib/axios";

export function ContactSection() {
  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const { handleSubmit, reset, setError } = methods;

  const contactMutation = useContactForm({
    onSuccess: () => {
      // Reset form on successful submission
      reset();
    },
    onError: (error) => {
      // Handle validation errors from server
      if (isAxiosError(error, 400) && error.response?.data) {
        const errorData = error.response.data as any;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach(
            (validationError: { field: string; message: string }) => {
              setError(validationError.field as keyof ContactFormData, {
                message: validationError.message,
              });
            }
          );
        }
      }
    },
  });

  const onSubmit = (data: ContactFormData) => {
    // Format phone number if provided
    const formattedData = {
      ...data,
      phone: data.phone ? formatPhoneNumber(data.phone) : undefined,
    };

    // Use mutate instead of mutateAsync since we handle success/error in callbacks
    contactMutation.mutate(formattedData);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email general",
      value: "contact@tbsa.ro",
      description: "Pentru întrebări generale și informații",
      color: "bg-blue-500",
    },
    {
      icon: Phone,
      title: "Telefon",
      value: "+40 123 456 789",
      description: "Luni - Vineri, 09:00 - 18:00",
      color: "bg-green-500",
    },
    {
      icon: MessageSquare,
      title: "Suport tehnic",
      value: "support@tbsa.ro",
      description: "Pentru probleme tehnice și asistență",
      color: "bg-purple-500",
    },
    {
      icon: MapPin,
      title: "Adresa",
      value: "Iași, România",
      description: "Sediul central al companiei",
      color: "bg-red-500",
    },
  ];

  const officeHours = [
    { day: "Luni - Vineri", hours: "09:00 - 18:00" },
    { day: "Sâmbătă", hours: "10:00 - 14:00" },
    { day: "Duminică", hours: "Închis" },
  ];

  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950 dark:via-background dark:to-emerald-950"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Contact
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contactează-ne
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Suntem aici să te ajutăm să transformi administrarea asociației
            tale. Contactează-ne pentru o consultație gratuită.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Trimite-ne un mesaj
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactMutation.isSuccess && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      ✅ Mesajul a fost trimis cu succes! Vă vom răspunde în
                      curând.
                    </p>
                  </div>
                )}

                {contactMutation.isError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-300 font-medium">
                      ❌ A apărut o eroare. Vă rugăm să încercați din nou.
                      {contactMutation.error && (
                        <span className="block text-sm mt-1">
                          {getErrorMessage(contactMutation.error)}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ControlledInput
                        name="firstName"
                        label="Nume"
                        placeholder="Ionescu"
                        required
                      />

                      <ControlledInput
                        name="lastName"
                        label="Prenume"
                        placeholder="Ion"
                        required
                      />
                    </div>

                    <ControlledInput
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="ion.ionescu@email.com"
                      required
                    />

                    <ControlledInput
                      name="phone"
                      type="tel"
                      label="Telefon (opțional)"
                      placeholder="+40 123 456 789"
                    />

                    <ControlledInput
                      name="subject"
                      label="Subiect"
                      placeholder="Despre ce ai dori să discutăm?"
                      required
                    />

                    <ControlledTextarea
                      name="message"
                      label="Mesaj"
                      placeholder="Spune-ne mai multe despre asociația ta și cum te putem ajuta..."
                      rows={5}
                      required
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Se trimite...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Trimite mesajul
                        </>
                      )}
                    </Button>
                  </form>
                </FormProvider>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-6">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${method.color} mb-4`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {method.title}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                        {method.value}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Office Hours */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Program de lucru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {schedule.day}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Suport de urgență:</strong> Pentru probleme critice,
                    suntem disponibili 24/7 prin email la support@tbsa.ro
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  De ce să ne alegi?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      &lt; 24h
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Timp de răspuns
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      100%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Satisfacția clienților
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Programează o demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
