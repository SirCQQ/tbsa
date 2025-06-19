import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { contactApi, type ContactResponse } from "@/lib/api/contact";
import { getErrorMessage } from "@/lib/axios";
import type { ContactFormData } from "@/lib/validations/contact";
import type { AxiosError } from "axios";

// Contact form mutation hook
export function useContactForm(
  options?: UseMutationOptions<ContactResponse, AxiosError, ContactFormData>
) {
  return useMutation({
    mutationFn: (data: ContactFormData) => contactApi.sendContactForm(data),
    onError: (error) => {
      console.error("Contact form submission error:", getErrorMessage(error));
    },
    ...options,
  });
}
