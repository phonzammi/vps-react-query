import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getStarWarsMovies } from '../../api/movies'
import { Movie } from '../../types/api/Movie'

export { Page, prefetchQueries }

const prefetchQueries = {
  ['movies']: {
    fn: getStarWarsMovies,
  }
}

function Page() {
  const { data: movies, isPending } = useQuery<Movie[]>({ queryKey: ['movies'], queryFn: getStarWarsMovies });

  return (
    <>
      <h1>Star Wars Movies</h1>
      <p>isPending always {`${isPending}`}</p>
      <ol>
        {movies?.map(({ id, title, release_date }) => (
          <li key={id}>
            <strong>{title}</strong> ({release_date})
          </li>
        ))}
      </ol>
      <p>
        Source: <a href="https://star-wars.brillout.com">star-wars.brillout.com</a>.
      </p>
    </>
  )
}
