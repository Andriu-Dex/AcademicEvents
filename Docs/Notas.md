2026-06-12T18:35:20.206879819Z #9 5.791 (196/196) Installing wget (1.25.0-r2)
2026-06-12T18:35:20.354730369Z #9 5.800 Executing busybox-1.37.0-r30.trigger
2026-06-12T18:35:20.354746939Z #9 5.806 Executing ca-certificates-20260413-r0.trigger
2026-06-12T18:35:20.354752639Z #9 5.847 Executing fontconfig-2.17.1-r0.trigger
2026-06-12T18:35:20.354757409Z #9 5.883 Executing mkfontscale-1.2.3-r1.trigger
2026-06-12T18:35:20.35476202Z #9 5.939 Executing glib-2.86.3-r0.trigger
2026-06-12T18:35:20.512506667Z #9 5.946 Executing shared-mime-info-2.4-r6.trigger
2026-06-12T18:35:20.7573159Z #9 6.342 Executing gdk-pixbuf-2.44.4-r0.trigger
2026-06-12T18:35:20.96143609Z #9 6.349 Executing gtk-update-icon-cache-3.24.51-r0.trigger
2026-06-12T18:35:20.961472811Z #9 6.378 Executing gtk+3.0-3.24.51-r0.trigger
2026-06-12T18:35:20.961481721Z #9 6.395 OK: 756.5 MiB in 214 packages
2026-06-12T18:35:25.390546519Z #9 DONE 11.0s
2026-06-12T18:35:25.531583067Z 
2026-06-12T18:35:25.531599447Z #10 [ 4/13] RUN addgroup -g 1001 -S nodejs &&     adduser -S nodeuser -u 1001 -G nodejs
2026-06-12T18:35:25.531603177Z #10 DONE 0.1s
2026-06-12T18:35:25.734270766Z 
2026-06-12T18:35:25.734295847Z #11 [ 5/13] WORKDIR /app
2026-06-12T18:35:25.734300387Z #11 DONE 0.0s
2026-06-12T18:35:25.734304287Z 
2026-06-12T18:35:25.734308817Z #12 [ 6/13] COPY package*.json ./
2026-06-12T18:35:25.734312778Z #12 DONE 0.0s
2026-06-12T18:35:25.734316427Z 
2026-06-12T18:35:25.734320288Z #13 [ 7/13] RUN npm ci --no-audit --no-fund
2026-06-12T18:35:27.854260678Z #13 2.270 npm warn deprecated multer@1.4.5-lts.2: Multer 1.x is impacted by a number of vulnerabilities, which have been patched in 2.x. You should upgrade to the latest 2.x version.
2026-06-12T18:35:28.35892288Z #13 2.770 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-12T18:35:35.584503154Z #13 10.00 
2026-06-12T18:35:35.584525524Z #13 10.00 > backend@1.0.0 postinstall
2026-06-12T18:35:35.584537405Z #13 10.00 > prisma generate
2026-06-12T18:35:35.584539585Z #13 10.00 
2026-06-12T18:35:36.288806142Z #13 10.71 Error: Could not find Prisma Schema that is required for this command.
2026-06-12T18:35:36.288832682Z #13 10.71 You can either provide it with `--schema` argument,
2026-06-12T18:35:36.288856043Z #13 10.71 set it in your `prisma.config.ts`,
2026-06-12T18:35:36.288861083Z #13 10.71 set it as `prisma.schema` in your package.json,
2026-06-12T18:35:36.288864753Z #13 10.71 or put it into the default location (`./prisma/schema.prisma`, or `./schema.prisma`.
2026-06-12T18:35:36.288867143Z #13 10.71 Checked following paths:
2026-06-12T18:35:36.288869563Z #13 10.71 
2026-06-12T18:35:36.288872093Z #13 10.71 schema.prisma: file not found
2026-06-12T18:35:36.288874473Z #13 10.71 prisma/schema.prisma: file not found
2026-06-12T18:35:36.288876853Z #13 10.71 
2026-06-12T18:35:36.288879413Z #13 10.71 See also https://pris.ly/d/prisma-schema-location
2026-06-12T18:35:36.454970496Z #13 10.72 npm error code 1
2026-06-12T18:35:36.454989736Z #13 10.72 npm error path /app
2026-06-12T18:35:36.454998426Z #13 10.72 npm error command failed
2026-06-12T18:35:36.455006596Z #13 10.72 npm error command sh -c prisma generate
2026-06-12T18:35:36.455013376Z #13 10.72 npm notice
2026-06-12T18:35:36.455021167Z #13 10.72 npm notice New major version of npm available! 10.8.2 -> 11.17.0
2026-06-12T18:35:36.455025427Z #13 10.72 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
2026-06-12T18:35:36.455029297Z #13 10.72 npm notice To update run: npm install -g npm@11.17.0
2026-06-12T18:35:36.455033347Z #13 10.72 npm notice
2026-06-12T18:35:36.455038887Z #13 10.72 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-06-12T18_35_25_725Z-debug-0.log
2026-06-12T18:35:42.434765885Z #13 ERROR: process "/bin/sh -c npm ci --no-audit --no-fund" did not complete successfully: exit code: 1
2026-06-12T18:35:42.470583736Z ------
2026-06-12T18:35:42.470598686Z  > importing cache manifest
2026-06-12T18:35:42.470604366Z ------
2026-06-12T18:35:42.470609467Z ------
2026-06-12T18:35:42.470615857Z  > [ 7/13] RUN npm ci --no-audit --no-fund:
2026-06-12T18:35:42.470621497Z 10.72 npm error code 1
2026-06-12T18:35:42.470626037Z 10.72 npm error path /app
2026-06-12T18:35:42.470631177Z 10.72 npm error command failed
2026-06-12T18:35:42.470635687Z 10.72 npm error command sh -c prisma generate
2026-06-12T18:35:42.470638877Z 10.72 npm notice
2026-06-12T18:35:42.470643517Z 10.72 npm notice New major version of npm available! 10.8.2 -> 11.17.0
2026-06-12T18:35:42.470646798Z 10.72 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
2026-06-12T18:35:42.470651398Z 10.72 npm notice To update run: npm install -g npm@11.17.0
2026-06-12T18:35:42.470654567Z 10.72 npm notice
2026-06-12T18:35:42.470659018Z 10.72 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-06-12T18_35_25_725Z-debug-0.log
2026-06-12T18:35:42.470662138Z ------
2026-06-12T18:35:42.471346752Z Dockerfile:32
2026-06-12T18:35:42.471357862Z --------------------
2026-06-12T18:35:42.471361542Z   30 |     
2026-06-12T18:35:42.471364733Z   31 |     # Instalar dependencias
2026-06-12T18:35:42.471367882Z   32 | >>> RUN npm ci --no-audit --no-fund
2026-06-12T18:35:42.471370943Z   33 |     
2026-06-12T18:35:42.471374143Z   34 |     # Configurar Puppeteer para usar Chromium instalado
2026-06-12T18:35:42.471377203Z --------------------
2026-06-12T18:35:42.471380573Z error: failed to solve: process "/bin/sh -c npm ci --no-audit --no-fund" did not complete successfully: exit code: 1


---


2026-06-12T18:19:30.787565959Z ℹ️ No active tokens found for user e45323bf-3edd-4891-9fb0-a5894b41a7d7
2026-06-12T18:19:30.78759136Z 📊 Batch notification: 0 sent, 0 failed to 1 users
2026-06-12T18:19:30.788883985Z ℹ️ No users found with role GENERAL_ADMIN in tenant uta-tenant-id
2026-06-12T18:20:00.008800448Z 🔄 Iniciando actualización automática de estados...
2026-06-12T18:20:00.008842459Z 🔄 Buscando eventos para activar...
2026-06-12T18:20:00.013402781Z ℹ️ No hay eventos para activar en este momento
2026-06-12T18:20:00.013427742Z 🔄 Buscando eventos para finalizar...
2026-06-12T18:20:00.017026829Z ℹ️ No hay eventos para finalizar en este momento
2026-06-12T18:20:00.01706362Z ℹ️ No hay inscripciones para procesar (sin eventos finalizados)
2026-06-12T18:20:00.01706908Z ✅ Actualización automática completada en 8ms
2026-06-12T18:20:00.01707329Z 📊 Resumen: 0 activados, 0 finalizados, 0 inscripciones actualizadas
2026-06-12T18:21:33.288249111Z 📅 parseUTCDate - Input: 2026-06-12T17:00:00.000Z
2026-06-12T18:21:33.288293023Z 📅 Fecha parseada exitosamente: {
2026-06-12T18:21:33.288299212Z   input: '2026-06-12T17:00:00.000Z',
2026-06-12T18:21:33.288304193Z   parsed: '2026-06-12T17:00:00.000Z',
2026-06-12T18:21:33.288308913Z   utcHours: 17
2026-06-12T18:21:33.288313653Z }
2026-06-12T18:21:33.288318863Z 📅 parseUTCDate - Input: 2026-06-30T09:00:00.000Z
2026-06-12T18:21:33.288334704Z 📅 Fecha parseada exitosamente: {
2026-06-12T18:21:33.288340274Z   input: '2026-06-30T09:00:00.000Z',
2026-06-12T18:21:33.288344514Z   parsed: '2026-06-30T09:00:00.000Z',
2026-06-12T18:21:33.288347764Z   utcHours: 9
2026-06-12T18:21:33.288351544Z }
2026-06-12T18:21:33.288366844Z 📅 parseUTCDate - Input: 2026-06-12T17:00:00.000Z
2026-06-12T18:21:33.288381125Z 📅 La entrada ya es un objeto Date
2026-06-12T18:21:33.288393885Z 📅 parseUTCDate - Input: 2026-06-30T09:00:00.000Z
2026-06-12T18:21:33.288408766Z 📅 La entrada ya es un objeto Date
2026-06-12T18:21:34.203847217Z 📅 parseUTCDate - Input: 2026-06-12T17:00:00.000Z
2026-06-12T18:21:34.203893898Z 📅 Fecha parseada exitosamente: {
2026-06-12T18:21:34.203907338Z   input: '2026-06-12T17:00:00.000Z',
2026-06-12T18:21:34.203912869Z   parsed: '2026-06-12T17:00:00.000Z',
2026-06-12T18:21:34.203917639Z   utcHours: 17
2026-06-12T18:21:34.203922429Z }
2026-06-12T18:21:34.203927639Z 📅 parseUTCDate - Input: 2026-06-30T09:00:00.000Z
2026-06-12T18:21:34.203932549Z 📅 Fecha parseada exitosamente: {
2026-06-12T18:21:34.203937269Z   input: '2026-06-30T09:00:00.000Z',
2026-06-12T18:21:34.203941869Z   parsed: '2026-06-30T09:00:00.000Z',
2026-06-12T18:21:34.20394649Z   utcHours: 9
2026-06-12T18:21:34.20395117Z }
2026-06-12T18:21:55.585902199Z MulterError: Unexpected field
2026-06-12T18:21:55.5859408Z     at wrappedFileFilter (/opt/render/project/src/backend/node_modules/multer/index.js:40:19)
2026-06-12T18:21:55.58594821Z     at Multipart.<anonymous> (/opt/render/project/src/backend/node_modules/multer/lib/make-middleware.js:109:7)
2026-06-12T18:21:55.585955031Z     at Multipart.emit (node:events:508:28)
2026-06-12T18:21:55.585960941Z     at HeaderParser.cb (/opt/render/project/src/backend/node_modules/busboy/lib/types/multipart.js:358:14)
2026-06-12T18:21:55.585966931Z     at HeaderParser.push (/opt/render/project/src/backend/node_modules/busboy/lib/types/multipart.js:162:20)
2026-06-12T18:21:55.585972711Z     at SBMH.ssCb [as _cb] (/opt/render/project/src/backend/node_modules/busboy/lib/types/multipart.js:394:37)
2026-06-12T18:21:55.585978851Z     at feed (/opt/render/project/src/backend/node_modules/streamsearch/lib/sbmh.js:248:10)
2026-06-12T18:21:55.585985021Z     at SBMH.push (/opt/render/project/src/backend/node_modules/streamsearch/lib/sbmh.js:104:16)
2026-06-12T18:21:55.585991541Z     at Multipart._write (/opt/render/project/src/backend/node_modules/busboy/lib/types/multipart.js:567:19)
2026-06-12T18:21:55.586013172Z     at writeOrBuffer (node:internal/streams/writable:570:12)
2026-06-12T18:25:50.578566863Z     at async enviarCertificadoPorCorreo (/opt/render/project/src/backend/src/controllers/certificado.controller.js:353:25)
2026-06-12T18:25:53.234193776Z 🔍 Verificando certificado para inscripción: b52372b8-ac0b-4de5-9221-2066e159c3ef
2026-06-12T18:25:53.234226906Z 👤 Usuario autenticado: {
2026-06-12T18:25:53.234239867Z   id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:25:53.234245577Z   role: 'STUDENT',
2026-06-12T18:25:53.234250587Z   rol_usu: 'ESTUDIANTE',
2026-06-12T18:25:53.234255467Z   tenantId: 'uta-tenant-id',
2026-06-12T18:25:53.234258527Z   tenantSlug: 'uta',
2026-06-12T18:25:53.234261547Z   iat: 1781288720,
2026-06-12T18:25:53.234264557Z   exp: 1781295920
2026-06-12T18:25:53.234267577Z }
2026-06-12T18:25:53.241584744Z 📝 Inscripción encontrada: {
2026-06-12T18:25:53.241596924Z   id: 'b52372b8-ac0b-4de5-9221-2066e159c3ef',
2026-06-12T18:25:53.241601934Z   tenantId: 'uta-tenant-id',
2026-06-12T18:25:53.241607404Z   accountId: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:25:53.241611554Z   eventId: 'cc55aacd-c38f-4c27-8ec1-76edc8d42427',
2026-06-12T18:25:53.241616155Z   status: 'APPROVED',
2026-06-12T18:25:53.241620515Z   registeredAt: 2026-06-12T18:19:29.672Z,
2026-06-12T18:25:53.241624725Z   validatedByAdminId: 'e45323bf-3edd-4891-9fb0-a5894b41a7d7',
2026-06-12T18:25:53.241629175Z   validatedAt: 2026-06-12T18:24:47.978Z,
2026-06-12T18:25:53.241633405Z   finalAttendancePercent: 100,
2026-06-12T18:25:53.241637585Z   occupiesSpot: true,
2026-06-12T18:25:53.241641655Z   userApprovedCertificate: false,
2026-06-12T18:25:53.241645745Z   account: {
2026-06-12T18:25:53.241649845Z     id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:25:53.241654165Z     tenantId: 'uta-tenant-id',
2026-06-12T18:25:53.241658276Z     userId: 'bc4b2aca-3fe3-42dc-b956-d8b42eb85941',
2026-06-12T18:25:53.241662526Z     email: 'mnavarro1337@uta.edu.ec',
2026-06-12T18:25:53.241668006Z     password: '$2b$10$oDvO.L6Grh/taUqVisFDeuFGp1vAVrT96Q4yDRiPpavp/I8RjoBCi',
2026-06-12T18:25:53.241672256Z     role: 'STUDENT',
2026-06-12T18:25:53.241676626Z     isEmailVerified: true,
2026-06-12T18:25:53.241680696Z     emailVerifiedAt: 2026-06-12T18:18:50.336Z,
2026-06-12T18:25:53.241684736Z     createdAt: 2026-06-12T18:18:30.084Z
2026-06-12T18:25:53.241698687Z   }
2026-06-12T18:25:53.241701717Z }
2026-06-12T18:25:53.241704487Z 🔄 Comparando IDs:
2026-06-12T18:25:53.241707937Z ID Usuario Auth: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:25:53.241710897Z ID Cuenta Inscripción: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:25:53.241713837Z Rol Usuario: ESTUDIANTE
2026-06-12T18:25:53.241716617Z ¿Es admin? false
2026-06-12T18:25:53.241719477Z ¿Es propietario? true
2026-06-12T18:25:53.269182354Z 🔧 Configuración de Puppeteer: {
2026-06-12T18:25:53.269203824Z   isDocker: true,
2026-06-12T18:25:53.269207504Z   executablePath: '/usr/bin/chromium-browser',
2026-06-12T18:25:53.269210734Z   headless: 'new'
2026-06-12T18:25:53.269219924Z }
2026-06-12T18:25:53.269769979Z ❌ Error generando certificado PDF: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:25:53.26978643Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:25:53.26979157Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:25:53.26979548Z     at async generarCertificado (/opt/render/project/src/backend/src/controllers/certificado.controller.js:217:23)
2026-06-12T18:25:53.26980516Z Error al generar certificado: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:25:53.2698095Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:25:53.269813451Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:25:53.269817311Z     at async generarCertificado (/opt/render/project/src/backend/src/controllers/certificado.controller.js:217:23)
2026-06-12T18:25:58.974911112Z 🔍 Verificando certificado para inscripción: b52372b8-ac0b-4de5-9221-2066e159c3ef
2026-06-12T18:25:58.974959273Z 👤 Usuario autenticado: {
2026-06-12T18:25:58.974967443Z   id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:25:58.974972403Z   role: 'STUDENT',
2026-06-12T18:25:58.974976414Z   rol_usu: 'ESTUDIANTE',
2026-06-12T18:25:58.974980244Z   tenantId: 'uta-tenant-id',
2026-06-12T18:25:58.974984144Z   tenantSlug: 'uta',
2026-06-12T18:25:58.974988014Z   iat: 1781288720,
2026-06-12T18:25:58.974992264Z   exp: 1781295920
2026-06-12T18:25:58.974996184Z }
2026-06-12T18:25:58.981743805Z 📝 Inscripción encontrada: {
2026-06-12T18:25:58.981761565Z   id: 'b52372b8-ac0b-4de5-9221-2066e159c3ef',
2026-06-12T18:25:58.981768946Z   tenantId: 'uta-tenant-id',
2026-06-12T18:25:58.981777286Z   accountId: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:25:58.981783696Z   eventId: 'cc55aacd-c38f-4c27-8ec1-76edc8d42427',
2026-06-12T18:25:58.981790496Z   status: 'APPROVED',
2026-06-12T18:25:58.981796336Z   registeredAt: 2026-06-12T18:19:29.672Z,
2026-06-12T18:25:58.981802286Z   validatedByAdminId: 'e45323bf-3edd-4891-9fb0-a5894b41a7d7',
2026-06-12T18:25:58.981808937Z   validatedAt: 2026-06-12T18:24:47.978Z,
2026-06-12T18:25:58.981814157Z   finalAttendancePercent: 100,
2026-06-12T18:25:58.981818047Z   occupiesSpot: true,
2026-06-12T18:25:58.981821877Z   userApprovedCertificate: false,
2026-06-12T18:25:58.981825777Z   account: {
2026-06-12T18:25:58.981829647Z     id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:25:58.981833917Z     tenantId: 'uta-tenant-id',
2026-06-12T18:25:58.981837758Z     userId: 'bc4b2aca-3fe3-42dc-b956-d8b42eb85941',
2026-06-12T18:25:58.981841647Z     email: 'mnavarro1337@uta.edu.ec',
2026-06-12T18:25:58.981872899Z     password: '$2b$10$oDvO.L6Grh/taUqVisFDeuFGp1vAVrT96Q4yDRiPpavp/I8RjoBCi',
2026-06-12T18:25:58.981877979Z     role: 'STUDENT',
2026-06-12T18:25:58.981881659Z     isEmailVerified: true,
2026-06-12T18:25:58.981886519Z     emailVerifiedAt: 2026-06-12T18:18:50.336Z,
2026-06-12T18:25:58.981890609Z     createdAt: 2026-06-12T18:18:30.084Z
2026-06-12T18:25:58.981893509Z   }
2026-06-12T18:25:58.981896029Z }
2026-06-12T18:25:58.981898549Z 🔄 Comparando IDs:
2026-06-12T18:25:58.98191154Z ID Usuario Auth: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:25:58.981915Z ID Cuenta Inscripción: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:25:58.98191829Z Rol Usuario: ESTUDIANTE
2026-06-12T18:25:58.9819215Z ¿Es admin? false
2026-06-12T18:25:58.98192468Z ¿Es propietario? true
2026-06-12T18:25:59.009836848Z 🔧 Configuración de Puppeteer: {
2026-06-12T18:25:59.009862939Z   isDocker: true,
2026-06-12T18:25:59.009866279Z   executablePath: '/usr/bin/chromium-browser',
2026-06-12T18:25:59.009869709Z   headless: 'new'
2026-06-12T18:25:59.009873539Z }
2026-06-12T18:25:59.010258409Z ❌ Error generando certificado PDF: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:25:59.01027049Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:25:59.01027667Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:25:59.01028118Z     at async generarCertificado (/opt/render/project/src/backend/src/controllers/certificado.controller.js:217:23)
2026-06-12T18:25:59.01028421Z Error al generar certificado: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:25:59.01028706Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:25:59.0102896Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:25:59.01029215Z     at async generarCertificado (/opt/render/project/src/backend/src/controllers/certificado.controller.js:217:23)
2026-06-12T18:26:19.631438145Z 🔍 Verificando certificado para inscripción: b52372b8-ac0b-4de5-9221-2066e159c3ef
2026-06-12T18:26:19.631474016Z 👤 Usuario autenticado: {
2026-06-12T18:26:19.631479416Z   id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:26:19.631484356Z   role: 'STUDENT',
2026-06-12T18:26:19.631488296Z   rol_usu: 'ESTUDIANTE',
2026-06-12T18:26:19.631516437Z   tenantId: 'uta-tenant-id',
2026-06-12T18:26:19.631522177Z   tenantSlug: 'uta',
2026-06-12T18:26:19.631526157Z   iat: 1781288720,
2026-06-12T18:26:19.631530108Z   exp: 1781295920
2026-06-12T18:26:19.631534158Z }
2026-06-12T18:26:19.638047943Z 📝 Inscripción encontrada: {
2026-06-12T18:26:19.638066193Z   id: 'b52372b8-ac0b-4de5-9221-2066e159c3ef',
2026-06-12T18:26:19.638070813Z   tenantId: 'uta-tenant-id',
2026-06-12T18:26:19.638075473Z   accountId: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:26:19.638079324Z   eventId: 'cc55aacd-c38f-4c27-8ec1-76edc8d42427',
2026-06-12T18:26:19.638083744Z   status: 'APPROVED',
2026-06-12T18:26:19.638087994Z   registeredAt: 2026-06-12T18:19:29.672Z,
2026-06-12T18:26:19.638091884Z   validatedByAdminId: 'e45323bf-3edd-4891-9fb0-a5894b41a7d7',
2026-06-12T18:26:19.638095784Z   validatedAt: 2026-06-12T18:24:47.978Z,
2026-06-12T18:26:19.638100034Z   finalAttendancePercent: 100,
2026-06-12T18:26:19.638103884Z   occupiesSpot: true,
2026-06-12T18:26:19.638120845Z   userApprovedCertificate: false,
2026-06-12T18:26:19.638123585Z   account: {
2026-06-12T18:26:19.638126315Z     id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:26:19.638129105Z     tenantId: 'uta-tenant-id',
2026-06-12T18:26:19.638131515Z     userId: 'bc4b2aca-3fe3-42dc-b956-d8b42eb85941',
2026-06-12T18:26:19.638133915Z     email: 'mnavarro1337@uta.edu.ec',
2026-06-12T18:26:19.638139365Z     password: '$2b$10$oDvO.L6Grh/taUqVisFDeuFGp1vAVrT96Q4yDRiPpavp/I8RjoBCi',
2026-06-12T18:26:19.638141915Z     role: 'STUDENT',
2026-06-12T18:26:19.638144395Z     isEmailVerified: true,
2026-06-12T18:26:19.638146895Z     emailVerifiedAt: 2026-06-12T18:18:50.336Z,
2026-06-12T18:26:19.638149315Z     createdAt: 2026-06-12T18:18:30.084Z
2026-06-12T18:26:19.638151886Z   }
2026-06-12T18:26:19.638154406Z }
2026-06-12T18:26:19.638156835Z 🔄 Comparando IDs:
2026-06-12T18:26:19.638159306Z ID Usuario Auth: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:26:19.638161766Z ID Cuenta Inscripción: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:26:19.638164186Z Rol Usuario: ESTUDIANTE
2026-06-12T18:26:19.638166596Z ¿Es admin? false
2026-06-12T18:26:19.638179936Z ¿Es propietario? true
2026-06-12T18:26:19.66362938Z 🔧 Configuración de Puppeteer: {
2026-06-12T18:26:19.66365096Z   isDocker: true,
2026-06-12T18:26:19.66365526Z   executablePath: '/usr/bin/chromium-browser',
2026-06-12T18:26:19.663658551Z   headless: 'new'
2026-06-12T18:26:19.663661571Z }
2026-06-12T18:26:19.664081602Z ❌ Error generando certificado PDF: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:26:19.664091572Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:26:19.664096922Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:26:19.664101223Z     at async generarCertificado (/opt/render/project/src/backend/src/controllers/certificado.controller.js:217:23)
2026-06-12T18:26:19.664112203Z Error al generar certificado: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:26:19.664116223Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:26:19.664120103Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:26:19.664124093Z     at async generarCertificado (/opt/render/project/src/backend/src/controllers/certificado.controller.js:217:23)
2026-06-12T18:26:23.203981272Z 🔍 Verificando certificado para inscripción: b52372b8-ac0b-4de5-9221-2066e159c3ef
2026-06-12T18:26:23.204021923Z 👤 Usuario autenticado: {
2026-06-12T18:26:23.204026303Z   id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:26:23.204030093Z   role: 'STUDENT',
2026-06-12T18:26:23.204032883Z   rol_usu: 'ESTUDIANTE',
2026-06-12T18:26:23.204035363Z   tenantId: 'uta-tenant-id',
2026-06-12T18:26:23.204037773Z   tenantSlug: 'uta',
2026-06-12T18:26:23.204040303Z   iat: 1781288720,
2026-06-12T18:26:23.204044544Z   exp: 1781295920
2026-06-12T18:26:23.204048473Z }
2026-06-12T18:26:23.211601987Z 📝 Inscripción encontrada: {
2026-06-12T18:26:23.211621167Z   id: 'b52372b8-ac0b-4de5-9221-2066e159c3ef',
2026-06-12T18:26:23.211623647Z   tenantId: 'uta-tenant-id',
2026-06-12T18:26:23.211626277Z   accountId: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:26:23.211628787Z   eventId: 'cc55aacd-c38f-4c27-8ec1-76edc8d42427',
2026-06-12T18:26:23.211646608Z   status: 'APPROVED',
2026-06-12T18:26:23.211649448Z   registeredAt: 2026-06-12T18:19:29.672Z,
2026-06-12T18:26:23.211651548Z   validatedByAdminId: 'e45323bf-3edd-4891-9fb0-a5894b41a7d7',
2026-06-12T18:26:23.211653488Z   validatedAt: 2026-06-12T18:24:47.978Z,
2026-06-12T18:26:23.211655508Z   finalAttendancePercent: 100,
2026-06-12T18:26:23.211657598Z   occupiesSpot: true,
2026-06-12T18:26:23.211659528Z   userApprovedCertificate: false,
2026-06-12T18:26:23.211661558Z   account: {
2026-06-12T18:26:23.211663608Z     id: 'f967e572-8232-4117-a302-329f7c523924',
2026-06-12T18:26:23.211665608Z     tenantId: 'uta-tenant-id',
2026-06-12T18:26:23.211667738Z     userId: 'bc4b2aca-3fe3-42dc-b956-d8b42eb85941',
2026-06-12T18:26:23.211669678Z     email: 'mnavarro1337@uta.edu.ec',
2026-06-12T18:26:23.211672128Z     password: '$2b$10$oDvO.L6Grh/taUqVisFDeuFGp1vAVrT96Q4yDRiPpavp/I8RjoBCi',
2026-06-12T18:26:23.211674269Z     role: 'STUDENT',
2026-06-12T18:26:23.211676218Z     isEmailVerified: true,
2026-06-12T18:26:23.211678209Z     emailVerifiedAt: 2026-06-12T18:18:50.336Z,
2026-06-12T18:26:23.211680129Z     createdAt: 2026-06-12T18:18:30.084Z
2026-06-12T18:26:23.211682079Z   }
2026-06-12T18:26:23.211684099Z }
2026-06-12T18:26:23.211686179Z 🔄 Comparando IDs:
2026-06-12T18:26:23.211688209Z ID Usuario Auth: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:26:23.211690169Z ID Cuenta Inscripción: f967e572-8232-4117-a302-329f7c523924
2026-06-12T18:26:23.211692139Z Rol Usuario: ESTUDIANTE
2026-06-12T18:26:23.211704089Z ¿Es admin? false
2026-06-12T18:26:23.211706579Z ¿Es propietario? true
2026-06-12T18:26:23.239559778Z 🔧 Configuración de Puppeteer: {
2026-06-12T18:26:23.239587208Z   isDocker: true,
2026-06-12T18:26:23.239589808Z   executablePath: '/usr/bin/chromium-browser',
2026-06-12T18:26:23.239592168Z   headless: 'new'
2026-06-12T18:26:23.239594338Z }
2026-06-12T18:26:23.240082232Z ❌ Error generando certificado PDF: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:26:23.240094412Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:26:23.240098552Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:26:23.240102462Z     at async enviarCertificadoPorCorreo (/opt/render/project/src/backend/src/controllers/certificado.controller.js:353:25)
2026-06-12T18:26:23.240113172Z Error al enviar certificado: Error: Browser was not found at the configured executablePath (/usr/bin/chromium-browser)
2026-06-12T18:26:23.240116222Z     at ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
2026-06-12T18:26:23.240119322Z     at async generarCertificadoPDF (/opt/render/project/src/backend/src/utils/certificado.utils.js:481:15)
2026-06-12T18:26:23.240122113Z     at async enviarCertificadoPorCorreo (/opt/render/project/src/backend/src/controllers/certificado.controller.js:353:25)
2026-06-12T18:26:59.956541345Z 🔍 [PDF] Datos recibidos para generar PDF: {
2026-06-12T18:26:59.956564325Z   carrera: {
2026-06-12T18:26:59.956570866Z     id: '70874bb0-0130-44c9-b0c7-119f1d328921',
2026-06-12T18:26:59.956574166Z     name: 'Automatización y Robótica',
2026-06-12T18:26:59.956577976Z     description: 'Enfocada en sistemas automatizados, control industrial y robótica aplicada.',
2026-06-12T18:26:59.956581116Z     faculty: {
2026-06-12T18:26:59.956584986Z       name: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
2026-06-12T18:26:59.956596766Z       university: [Object]
2026-06-12T18:26:59.956598977Z     },
2026-06-12T18:26:59.956601777Z     users: [ [Object] ]
2026-06-12T18:26:59.956603747Z   },
2026-06-12T18:26:59.956605767Z   estadisticas: {
2026-06-12T18:26:59.956607707Z     totalEstudiantes: 1,
2026-06-12T18:26:59.956609727Z     totalInscripciones: 0,
2026-06-12T18:26:59.956611747Z     eventosParticipados: 0,
2026-06-12T18:26:59.956613747Z     porcentajeParticipacion: 0,
2026-06-12T18:26:59.956615757Z     comparativaCarreras: [ [Object], [Object], [Object], [Object], [Object] ]
2026-06-12T18:26:59.956617807Z   },
2026-06-12T18:26:59.956619817Z   eventosPorCarrera: 0
2026-06-12T18:26:59.956621807Z }
2026-06-12T18:26:59.957436219Z 📄 [PDF] Plantilla HTML leída correctamente
2026-06-12T18:26:59.957511771Z 🔧 [PDF] Reemplazando placeholders...
2026-06-12T18:26:59.957529471Z 🔧 [PDF] nombre_carrera: Automatización y Robótica
2026-06-12T18:26:59.957559772Z 🔧 [PDF] nombre_universidad: undefined
2026-06-12T18:26:59.957563082Z 🔧 [PDF] nombre_facultad: undefined
2026-06-12T18:26:59.957868731Z ✅ [PDF] Placeholders reemplazados correctamente
2026-06-12T18:26:59.957934282Z ✅ [PDF] Todos los placeholders fueron reemplazados correctamente
2026-06-12T18:26:59.957937713Z 🖨️ [PDF] Iniciando generación de PDF con Puppeteer...
2026-06-12T18:26:59.958883858Z Error al generar PDF de reporte por carrera: Error: Could not find Chrome (ver. 137.0.7151.55). This can occur if either
2026-06-12T18:26:59.958892088Z  1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`) or
2026-06-12T18:26:59.958894768Z  2. your cache path is incorrectly configured (which is: /opt/render/.cache/puppeteer).
2026-06-12T18:26:59.958896918Z For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.
2026-06-12T18:26:59.958899608Z     at ChromeLauncher.resolveExecutablePath (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:308:27)
2026-06-12T18:26:59.958902088Z     at ChromeLauncher.computeLaunchArguments (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/ChromeLauncher.js:93:24)
2026-06-12T18:26:59.958904808Z     at async ChromeLauncher.launch (/opt/render/project/src/backend/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:84:28)
2026-06-12T18:26:59.958907419Z     at async generarReporteCarreraPDF (/opt/render/project/src/backend/src/utils/reporte.utils.js:285:19)
2026-06-12T18:26:59.958909448Z     at async descargarReporteCarreraPDF (/opt/render/project/src/backend/src/controllers/reporte.controller.js:883:5)