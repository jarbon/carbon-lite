import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveSettings} from './settings-viewer.mjs';
const plugin=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try {
 const {server,...view}=await serveSettings(process.argv[2],plugin,{home:process.env.CARBON_BACKGROUND_TEST_HOME});
 process.send(view);
}catch(e){process.send({error:e.message});process.exitCode=1;}
