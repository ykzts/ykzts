import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Handlebars from 'handlebars'

export type ContactEmailData = {
  name: string
  email: string
  subject: string
  message: string
}

// Load and compile template at module initialization
const templatePath = join(
  process.cwd(),
  'lib',
  'email-templates',
  'contact.hbs'
)
const templateSource = readFileSync(templatePath, 'utf-8')
const template = Handlebars.compile(templateSource)

export function generateContactEmailText(data: ContactEmailData): string {
  return template(data).trim()
}
