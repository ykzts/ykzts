import React, { FC, ReactElement } from 'react'

interface Props {
  name: string
}

const Icon: FC<Props> = ({ name }): ReactElement => {
  return <span className="material-icons">{name}</span>
}

export default Icon
