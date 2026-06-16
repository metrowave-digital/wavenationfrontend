import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export type CreateWaveNationApolloClientOptions = {
  graphqlUrl?: string
  fetchImpl?: typeof fetch
}

export function createWaveNationApolloClient(
  options: CreateWaveNationApolloClientOptions = {},
) {
  const uri =
    options.graphqlUrl ??
    process.env.NEXT_PUBLIC_WAVENATION_GRAPHQL_URL ??
    'https://cms.wavenation.online/api/graphql'

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri,
      fetch: options.fetchImpl ?? fetch,
    }),
  })
}