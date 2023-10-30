export const clientRouting = true
export const hydrationCanBeAborted = true

import React from 'react'
import { hydrateRoot, createRoot, Root } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PageShell } from './PageShell'
import { HydrationBoundary } from '@tanstack/react-query'

import { PageContext } from './types'
import Provider from './Provider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export { render, onHydrationEnd, onPageTransitionEnd, onPageTransitionStart }

let root: Root
async function render(pageContext: PageContext) {
  const { Page, pageProps, dehydratedState } = pageContext

  const page = (
    <Provider>
      <HydrationBoundary state={dehydratedState}>
        <BrowserRouter>
          <PageShell pageContext={pageContext}>
            <Page {...pageProps} />
          </PageShell>
        </BrowserRouter>
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </Provider>
  )
  const container = document.getElementById('page-view')

  if (container && pageContext.isHydration) {
    root = hydrateRoot(container, page)
  } else {
    if (!root) {
      root = createRoot(container!)
    }
    root.render(page)
  }
  document.title = (pageContext.exports.documentProps || {}).title || (pageContext.documentProps || {}).title || 'Demo'
}

// async function onBeforeRender(pageContext: PageContext) {
//   //const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
//   //await delay(1000);
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries:
//       {
//         gcTime: 5000
//       }
//     }
//   });
//   const {
//     exports: { prefetchQueries },
//   } = pageContext;

//   if (prefetchQueries?.constructor === Object) {
//     const queries: Promise<void>[] = [];

//     Object.entries(prefetchQueries).forEach(([key, query]) => {
//       queries.push(
//         queryClient.prefetchQuery({
//           queryKey: [key],
//           queryFn: query.fn
//         })
//       )
//     })

//     await Promise.all(queries);
//   }

//   const dehydratedState = dehydrate(queryClient);

//   return {
//     pageContext: {
//       dehydratedState
//       // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
//     },
//   }
// }

function onHydrationEnd() {
  console.log('Hydration finished; page is now interactive.')
}
function onPageTransitionStart() {
  console.log('Page transition start')
  document.querySelector('body')?.classList.add('page-is-transitioning')
}
function onPageTransitionEnd() {
  console.log('Page transition end')
  document.querySelector('body')?.classList.remove('page-is-transitioning')
}

/* To enable Client-side Routing:
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
