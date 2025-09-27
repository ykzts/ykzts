'use client'

import { useState } from 'react'
import Link from '@/components/link'
import styles from './contact-form.module.css'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    consent: false,
    email: '',
    message: '',
    name: '',
    subject: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.consent) {
      alert('プライバシーポリシーに同意してください。')
      return
    }
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData)
    alert(
      'お問い合わせフォームの実装は今後予定されています。現在はメールでのご連絡をお願いします。'
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="name">お名前 *</label>
        <input
          id="name"
          name="name"
          onChange={handleChange}
          required
          type="text"
          value={formData.name}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">メールアドレス *</label>
        <input
          id="email"
          name="email"
          onChange={handleChange}
          required
          type="email"
          value={formData.email}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="subject">件名 *</label>
        <input
          id="subject"
          name="subject"
          onChange={handleChange}
          required
          type="text"
          value={formData.subject}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message">メッセージ *</label>
        <textarea
          id="message"
          name="message"
          onChange={handleChange}
          required
          rows={5}
          value={formData.message}
        />
      </div>

      <div className={styles.checkbox}>
        <input
          checked={formData.consent}
          id="consent"
          name="consent"
          onChange={handleChange}
          type="checkbox"
        />
        <label htmlFor="consent">
          <Link href="/privacy">プライバシーポリシー</Link>に同意します *
        </label>
      </div>

      <button className={styles.submit} type="submit">
        送信
      </button>
    </form>
  )
}
