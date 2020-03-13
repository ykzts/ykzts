import React, { FC } from 'react'

const List: FC = ({ children }) => (
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
