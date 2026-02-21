type DateDisplayProps = {
  date: string | null
  className?: string
}

export default function DateDisplay({ date, className }: DateDisplayProps) {
  if (!date) {
    return <span className={className}>未公開</span>
  }

  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <time className={className} dateTime={date}>
      {formattedDate}
    </time>
  )
}
