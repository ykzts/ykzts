import { type ReactNode } from 'react'
import styles from './wrapper.module.css'

export default function LayoutWrapper({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return <div className={styles.wrapper}>{children}</div>
}
