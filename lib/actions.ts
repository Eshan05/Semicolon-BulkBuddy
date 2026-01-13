'use server'

import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

interface ContactFormError {
  success: false
  errors: {
    name?: string[]
    email?: string[]
    phone?: string[]
    message?: string[]
  }
}

interface ContactFormSuccess {
  success: true
  message: string
}

type ContactFormResult = ContactFormError | ContactFormSuccess

export async function submitContactForm(prevState: unknown, formData: FormData): Promise<ContactFormResult> {
  const rawData: ContactFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string | undefined,
    message: formData.get('message') as string,
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
