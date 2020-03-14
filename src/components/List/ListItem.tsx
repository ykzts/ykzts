import React, { FC } from 'react'

const ListItem: FC = ({ children }) => (
  <>
    <li className="list__item">{children}</li>

    <style jsx>{`
      .list__item {
        margin: 0 0 3rem 0;
        padding-left: 0;
      }

      @media (max-width: 736px) {
        .list__item {
          margin: 0 0 2rem 0;
        }
      }

      .list__item:last-child {
        margin-bottom: 0;
      }

      .list__item :last-child {
        margin-bottom: 0;
      }
    `}</style>
  </>
)

export default ListItem
