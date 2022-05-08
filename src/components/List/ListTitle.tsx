import { type FC, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

const ListTitle: FC<Props> = ({ children }) => (
  <>
    <h3 className="list__title">{children}</h3>

    <style jsx>{`
      .list__title {
        margin: 0 0 1rem 0;
      }
    `}</style>
  </>
)

export default ListTitle
