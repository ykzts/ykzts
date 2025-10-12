export type ContactEmailData = {
  name: string
  email: string
  subject: string
  message: string
}

export function generateContactEmailText(data: ContactEmailData): string {
  return `
お名前: ${data.name}
メールアドレス: ${data.email}
件名: ${data.subject}

メッセージ:
${data.message}
  `.trim()
}
