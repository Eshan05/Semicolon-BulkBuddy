'use server'

import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function submitContactForm(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  }

  const validatedData = contactSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Contact form submitted:', validatedData.data)

  return {
    success: true,
    message: "Thank you! We'll be in touch soon.",
  }
}
