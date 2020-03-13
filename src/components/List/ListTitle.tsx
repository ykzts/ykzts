import React, { FC } from 'react'

const ListTitle: FC = ({ children }) => (
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
