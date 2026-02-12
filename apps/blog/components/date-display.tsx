type DateDisplayProps = {
  date: string
  className?: string
}

export default function DateDisplay({ date, className }: DateDisplayProps) {
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
