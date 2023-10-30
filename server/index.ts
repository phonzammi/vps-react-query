import express from "express";
import path from "path";
import compression from "compression";
import { renderPage } from "vite-plugin-ssr/server";
import { fileURLToPath } from "url";
import sirv from "sirv";

const isProduction = process.env.NODE_ENV === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = `${__dirname}/..`

startServer();

async function startServer() {
  const app = express();

  app.use(compression());

  if (isProduction) {
    app.use(sirv(`${root}/dist/client`));
  } else {
    const vite = await import("vite");
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true },
      })
    ).middlewares;
    app.use(viteDevMiddleware);
  }

  app.get("*", async (req, res, next) => {
    const userAgent = req.headers['user-agent']
    // console.log("🚀 ~ file: index.ts:31 ~ app.get ~ userAgent:", userAgent)
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      userAgent
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    } else {
      const { statusCode, headers, earlyHints } = httpResponse
      if (res.writeEarlyHints) res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })
      headers.forEach(([name, value]) => res.setHeader(name, value))
      res.status(statusCode)
      httpResponse.pipe(res)
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port);
  console.info(`Server running at http://localhost:${port}`);
}
