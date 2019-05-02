import React, { FC } from 'react'
import { JsonLd } from 'react-schemaorg'
import { Person } from 'schema-dts'

const Me: FC = () => (
  <JsonLd<Person>
    item={{
      '@context': 'https://schema.org',
      '@type': 'Person',
      address: 'Tokyo, Japan',
      email: 'ykzts@desire.sh',
      familyName: 'Yamagishi',
      gender: 'male',
      givenName: 'Kazutoshi',
      jobTitle: 'Software Developer',
      url: 'https://ykzts.com/'
    }}
  />
)

export default Me
