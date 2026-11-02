import { serveReport } from './report-viewer.mjs';
try {
  const { server, ...presentation } = await serveReport(process.argv[2]);
  process.send(presentation);
} catch (error) { process.send({ error: error.message }); process.exitCode = 1; }
