import { type FC, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

const List: FC<Props> = ({ children }) => (
  <>
    <ul className="list">{children}</ul>

    <style jsx>{`
      .list {
        list-style: none;
        padding-left: 0;
      }
    `}</style>
  </>
)

export default List
