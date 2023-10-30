import { MovieDetails } from "../types/api/Movie";

export async function getStarWarsMovies(): Promise<MovieDetails[]> {
  const response = await fetch("https://star-wars.brillout.com/api/films.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let movies: MovieDetails[] = ((await response.json()) as any).results;
  movies = movies.map((movie: MovieDetails, i: number) => ({
    ...movie,
    id: String(i + 1),
  }));
  return movies;
}