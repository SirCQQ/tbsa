import { format } from "date-fns";

export const logError = (...args: (string | object | unknown)[]): void => {
  const now = new Date();
  const formatDate = format(now, "dd/MM/yyyy HH:mm:ss");
  console.error(formatDate, ...args);
};
