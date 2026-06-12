2026-06-12T05:47:21.045353769Z     at /opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:849:32
2026-06-12T05:47:21.045356318Z     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-12T05:47:21.045359419Z     at async /opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:830:5 {
2026-06-12T05:47:21.045362599Z   code: 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR',
2026-06-12T05:47:21.045365019Z   help: 'https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/'
2026-06-12T05:47:21.045367459Z }
2026-06-12T05:47:50.966267452Z ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default). This could indicate a misconfiguration which would prevent express-rate-limit from accurately identifying users. See https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/ for more information.
2026-06-12T05:47:50.966303922Z     at Object.xForwardedForHeader (/opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:371:13)
2026-06-12T05:47:50.966307102Z     at wrappedValidations.<computed> [as xForwardedForHeader] (/opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:685:22)
2026-06-12T05:47:50.966309182Z     at Object.keyGenerator (/opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:788:20)
2026-06-12T05:47:50.966311753Z     at /opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:849:32
2026-06-12T05:47:50.966314493Z     at async /opt/render/project/src/backend/node_modules/express-rate-limit/dist/index.cjs:830:5 {
2026-06-12T05:47:50.966317163Z   code: 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR',
2026-06-12T05:47:50.966319113Z   help: 'https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/'
2026-06-12T05:47:50.966321023Z }
2026-06-12T05:49:15.774825448Z Error de configuración SMTP: Error: Connection timeout
2026-06-12T05:49:15.774850969Z     at SMTPConnection._formatError (/opt/render/project/src/backend/node_modules/nodemailer/lib/smtp-connection/index.js:809:19)
2026-06-12T05:49:15.774855189Z     at SMTPConnection._onError (/opt/render/project/src/backend/node_modules/nodemailer/lib/smtp-connection/index.js:795:20)
2026-06-12T05:49:15.774861489Z     at Timeout.<anonymous> (/opt/render/project/src/backend/node_modules/nodemailer/lib/smtp-connection/index.js:237:22)
2026-06-12T05:49:15.774864689Z     at listOnTimeout (node:internal/timers:605:17)
2026-06-12T05:49:15.774867689Z     at process.processTimers (node:internal/timers:541:7) {
2026-06-12T05:49:15.774871409Z   code: 'ETIMEDOUT',
2026-06-12T05:49:15.774874469Z   command: 'CONN'
2026-06-12T05:49:15.774877509Z }
2026-06-12T05:49:51.673229618Z Error al enviar correo: Error: Connection timeout
2026-06-12T05:49:51.673256409Z     at SMTPConnection._formatError (/opt/render/project/src/backend/node_modules/nodemailer/lib/smtp-connection/index.js:809:19)
2026-06-12T05:49:51.673261209Z     at SMTPConnection._onError (/opt/render/project/src/backend/node_modules/nodemailer/lib/smtp-connection/index.js:795:20)
2026-06-12T05:49:51.673265309Z     at Timeout.<anonymous> (/opt/render/project/src/backend/node_modules/nodemailer/lib/smtp-connection/index.js:237:22)
2026-06-12T05:49:51.673269239Z     at listOnTimeout (node:internal/timers:605:17)
2026-06-12T05:49:51.673273109Z     at process.processTimers (node:internal/timers:541:7) {
2026-06-12T05:49:51.673289609Z   code: 'ETIMEDOUT',
2026-06-12T05:49:51.673293569Z   command: 'CONN'
2026-06-12T05:49:51.673297679Z }
2026-06-12T05:49:51.673409472Z Error al enviar verificación de correo: Error: Error al enviar correo electrónico
2026-06-12T05:49:51.673421982Z     at EmailTemplateService.enviarEmail (/opt/render/project/src/backend/src/services/EmailTemplateService.js:826:13)
2026-06-12T05:49:51.673427272Z     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-12T05:49:51.673432172Z     at async EmailVerificationService.enviarVerificacion (/opt/render/project/src/backend/src/services/EmailVerificationService.js:58:7)
2026-06-12T05:49:51.673437072Z     at async registrarEstudiante (/opt/render/project/src/backend/src/controllers/auth.controller.js:254:5)
2026-06-12T05:49:51.673500324Z Error al registrar usuario: Error: Error al enviar el correo de verificación
2026-06-12T05:49:51.673511054Z     at EmailVerificationService.enviarVerificacion (/opt/render/project/src/backend/src/services/EmailVerificationService.js:71:13)
2026-06-12T05:49:51.673528624Z     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-12T05:49:51.673532515Z     at async registrarEstudiante (/opt/render/project/src/backend/src/controllers/auth.controller.js:254:5)
2026-06-12T05:50:00.012403406Z 🔄 Iniciando actualización automática de estados...
2026-06-12T05:50:00.012433507Z 🔄 Buscando eventos para activar...
2026-06-12T05:50:00.018875507Z ℹ️ No hay eventos para activar en este momento
2026-06-12T05:50:00.018891407Z 🔄 Buscando eventos para finalizar...
2026-06-12T05:50:00.022821832Z ℹ️ No hay eventos para finalizar en este momento
2026-06-12T05:50:00.022835723Z ℹ️ No hay inscripciones para procesar (sin eventos finalizados)
2026-06-12T05:50:00.022851033Z ✅ Actualización automática completada en 10ms
2026-06-12T05:50:00.022862753Z 📊 Resumen: 0 activados, 0 finalizados, 0 inscripciones actualizadas