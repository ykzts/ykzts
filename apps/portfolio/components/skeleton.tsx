import { twMerge } from 'tailwind-merge'

export default function Skeleton({
  className
}: Readonly<{ className?: string | undefined }>) {
  return (
    <span
      className={twMerge(
        'inline-flex h-[1lh] w-full items-center max-w-full animate-pulse before:inline-block before:h-[1em] before:w-full before:rounded-md before:bg-gray-200',
        className
      )}
    />
  )
}
