import { api } from "@/lib/axios";
import type { ContactFormData } from "@/lib/validations/contact";

// Contact API functions
export const contactApi = {
  // Send contact form
  sendContactForm: async (data: ContactFormData) => {
    const response = await api.post("/contact", data);
    return response.data;
  },
};

// Response types
export type ContactResponse = {
  message: string;
  data?: {
    id: string;
    status: string;
  };
};
