import ContactForm from './contact-form'
import SocialLinks from './social-links'

export default function Contact() {
  return (
    <section className="mx-auto max-w-4xl py-20" id="contact">
      <h2 className="mb-10 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Contact
      </h2>

      {/* Contact Form */}
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <p className="mb-4 text-base text-muted-foreground leading-relaxed">
          お問い合わせやご依頼は以下のフォームからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p className="mb-6 text-muted-foreground text-sm">
          ※無償もしくは報酬が不明瞭な依頼、依頼主が不明なスカウトメールにはご返答いたしかねます。
        </p>
        <ContactForm />
      </div>

      {/* Links */}
      <div className="mt-12">
        <h3 className="mb-4 font-medium text-foreground text-lg">Social</h3>
        <SocialLinks />
      </div>
    </section>
  )
}
