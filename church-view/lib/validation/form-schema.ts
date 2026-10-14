import { z } from "zod";

export const submissionSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(140, "Name must be 140 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(254, "Email must be 254 characters or fewer."),
  phone: z.string().trim()
    .max(40, "Phone number must be 40 characters or fewer.")
    .refine((value) => value.length === 0 || value.length >= 7, "Phone number must contain at least 7 characters."),
  message: z.string().trim().min(5, "Please add at least 5 characters.").max(5000, "Message must be 5,000 characters or fewer."),
});

export type SubmissionValues = z.infer<typeof submissionSchema>;
