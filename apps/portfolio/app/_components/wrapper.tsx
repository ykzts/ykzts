'use client'

import clsx from 'clsx'
import { type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from './wrapper.module.css'

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const { inView, ref } = useInView()

  return (
    <div
      className={clsx(styles.wrapper, { [styles['wrapper--active']]: inView })}
      ref={ref}
    >
      {children}
    </div>
  )
}
