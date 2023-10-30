import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../../api/users'

import type { User } from '../../types/api/User'

export { Page, prefetchQueries }

const prefetchQueries = {
  ['users']: {
    fn: getUsers,
  }
}

function Page() {
  const { data, isPending} = useQuery<User[]>({ queryKey: ['users'], queryFn: getUsers });

  return (
    <>
      <h1>Welcome</h1>
      <p>Users prefetched on the server, inside onBeforeRender function</p>
      <p>isPending always {`${isPending}`}</p>
      <ul>
        {data?.map((user) =>
          <li key={user.id}>{user.name}</li>
        )}
      </ul>
    </>
  )
}
