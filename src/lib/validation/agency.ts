import { z } from "zod"

export const businessIdSchema = z
  .string()
  .regex(/^\d{7}-\d$/, "Business ID must look like 1234567-8")

export const switchAgencySchema = z.object({
  businessId: businessIdSchema,
})

export const updateAgencySchema = z.object({
  name: z.string().min(2, "Agency name is required"),
  businessId: businessIdSchema.optional().or(z.literal("")),
})

export const inviteAgencyStaffSchema = z.object({
  email: z.email(),
  name: z.string().min(2, "Name is required"),
})

export const inviteBandMemberSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1, "Name is required"),
  instrument: z.string().max(80).optional(),
})

export const acceptInviteSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
