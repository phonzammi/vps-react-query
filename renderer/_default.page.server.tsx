import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { PageShell } from "./PageShell";
import { escapeInject } from "vite-plugin-ssr/server";
import logoUrl from "./logo.svg";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { renderToStream } from "react-streaming/server"; //streaming

import { PageContext } from "./types";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export { render, onBeforeRender };

export const passToClient = [
  "pageProps",
  "documentProps",
  "dehydratedState",
];
const queryClient = new QueryClient({
  defaultOptions: {
    queries:
    {
      gcTime: 5000
    }
  }
});
async function onBeforeRender(pageContext: PageContext) {
  //const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  //await delay(1000);
  
  const {
    exports: { prefetchQueries },
  } = pageContext;

  if (prefetchQueries?.constructor === Object) {
    const queries: Promise<void>[] = [];

    Object.entries(prefetchQueries).forEach(([key, query]) => {
      queries.push(
        queryClient.prefetchQuery({
          queryKey: [key],
          queryFn: query.fn
        })
      )
    })

    await Promise.all(queries);
  }

  const dehydratedState = dehydrate(queryClient);

  return {
    pageContext: {
      dehydratedState
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    },
  }
}

async function render(pageContext: PageContext) {
  const {
    Page,
    pageProps,
    urlPathname
  } = pageContext;

  const stream = await renderToStream(
    <QueryClientProvider client={queryClient}>
        <StaticRouter location={urlPathname}>
          <PageShell pageContext={pageContext}>
            <Page {...pageProps} />
          </PageShell>
        </StaticRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>,
    {
      disable: true
    }
  );

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports;
  console.log(documentProps)
  const title = (documentProps && documentProps.title) || "Vite SSR app";
  const desc =
    (documentProps && documentProps.description) ||
    "App using Vite + vite-plugin-ssr";

  return escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="page-view">${stream}</div>
      </body>
    </html>`;

  // return {
  //   documentHtml,
  //   pageContext: {
  //     // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
  //   },
  // };
}
