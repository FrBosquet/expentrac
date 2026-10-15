# Auditoría tecnológica de Expentrac

> Remediación, 15/10/2026: este documento conserva el diagnóstico inicial del 13/10. El [estado de implementación](implementation.md) y el [registro del despliegue](production-release.md) recogen los cambios y comprobaciones actuales. La migración de producción y el despliegue coordinado están realizados; quedan por revisar 21 excepciones de reconciliación legacy y las comprobaciones autenticadas/proveedor. La primera ejecución automática del worker devolvió HTTP 200.

Fecha: 13 de octubre de 2026. Alcance: repositorio local, aplicación 0.5.0. Análisis del código y configuración, inventario instalado y bloqueado, comprobaciones locales y documentación oficial consultada en esta fecha. No se han actualizado dependencias ni modificado aplicación, base de datos, despliegue o secretos.

## Diagnóstico

La base es una aplicación Next.js App Router con React, TypeScript, PostgreSQL/Prisma, NextAuth y una UI de Radix/shadcn y Tailwind. Es un stack válido para conservar la web pública renderizada en servidor y avanzar hacia un dashboard con consultas y mutaciones uniformes en cliente. No hace falta cambiar de framework ni separar repositorios para ello.

La prioridad es cerrar fallos de autorización y operaciones administrativas expuestas en los handlers, corregir errores de clasificación de contratos y salir de Next.js 14. Antes de invertir en optimizar el bundle o migrar Tailwind, conviene estabilizar estos límites y añadir pruebas de aislamiento entre usuarios. Los tests actuales pasan, pero cubren fechas y planificación, no la seguridad de los endpoints.

Los hallazgos de seguridad siguientes están confirmados **por lectura estática del código**. No he enviado solicitudes a producción ni comprobado protección adicional en Vercel, proxy, firewall o infraestructura externa; por tanto, no afirmo exposición efectiva del despliegue ni explotación previa.

## Tecnología actual y actualización recomendada

«Declarada» es el rango en `package.json`; «local» es el `package.json` real de `node_modules`. Las versiones principales de esta tabla coinciden con el importer raíz de `pnpm-lock.yaml` (formato 9). Un rango `^` no implica que ya se haya instalado su versión más reciente. El inventario completo de dependencias directas está al final.

| Área | Declarada | Local / lock | Recomendación y coste |
|---|---|---|---|
| Next.js | `^14.2.4` | 14.2.4 | Contención: parche de rama 14 que cubra al menos 14.2.35. Destino: release estable y parcheada de 16.x; **migración mayor**. |
| MDX / plugin Next | `@next/mdx`, plugin ESLint `^14.1.3` | 14.1.3 | Alinear con la versión elegida de Next. Revisar integración MDX y bundler. |
| React / React DOM | 18.3.1 | 18.3.1 | Migración coordinada a React 19.x con Next y tipos; validar Radix, gráficos, formularios, hidratación y email. |
| Node.js | Sin `engines` ni fichero de versión | 22.18.0 en esta terminal | Fijar Node 24 LTS actualizado, o 22 LTS parcheado como paso transitorio. El runtime del despliegue no está comprobado. |
| TypeScript / tipos | TS `^5.4.2`; Node 20.11.27; React 18.3.3 | TS 5.4.2 | Actualizar TS y tipos compatibles con runtime/framework elegidos. No convertir la migración a ESM en un cambio incidental. |
| Prisma CLI / client | Ambos `^5.11.0` | Ambos 5.11.0 | Mantenerlos exactamente alineados. Planificar 5→6→7 con comprobación por etapa; v7 cambia configuración y construcción del cliente. |
| PostgreSQL | Prisma datasource | Versión del servidor desconocida | Comprobar versión, proveedor, pooling, backups y restore antes de planificar cambios de infraestructura. |
| NextAuth / adapter | `^4.24.7` / `^1.5.0` | 4.24.7 / 1.5.0 | Primero parches compatibles de v4 y probar sesiones/Google. Evaluar v5 aparte; la guía oficial aún prescribe el tag `beta`. |
| TanStack Query | `^5.45.1` | 5.45.1 | Actualizar dentro de v5 compatible y homogeneizar su uso; ver informe específico de React Query. |
| Zustand | `^4.5.2` | 4.5.2 | Reducirlo a estado UI y planificar v5 por separado, revisando selectores y referencias estables. |
| Tailwind / merge / PostCSS | 3.4.1 / `^2.2.1` / 8.4.35 | 3.4.1 / 2.2.1 / 8.4.35 | Actualizar versiones compatibles primero. Tailwind 4 exige migración de configuración/CSS, plugin PostCSS y validación visual. |
| UI Radix/shadcn | Paquetes individuales | Ver inventario | Actualizar Radix por grupos; shadcn está copiado en `components/ui`, no se actualiza solo con `pnpm update`. |
| Recharts | `^2.12.2` | 2.12.2 | Evaluar 3.x con pruebas de gráficos/tooltips y cambio de target mínimo a ES6. |
| React Email / Resend | `^2.1.4` / `^3.2.0` | 2.1.4 / 3.2.0 | Migración dedicada de email: API de paquetes actual, render, Tailwind y control de errores/idempotencia. |
| ESLint / configuración | `^8.57.0` / `^1.0.2` | 8.57.0 / 1.0.2 | ESLint 8 está EOL; objetivo ESLint 10 si plugins/config lo soportan. Migrar a flat config y CLI; resolver compatibilidad primero. |
| Jest / ts-jest | `^29.7.0` / `^29.1.2` | 29.7.0 / 29.1.2 | Conservar inicialmente el runner funcional; actualizar la pareja tras comprobar compatibilidad. Añadir tests útiles de API y dominio antes de cambiar runner. |
| Sharp, iconos, sonner, utilidades | Ver inventario | Ver inventario | Actualizar en lotes compatibles tras el framework. Medir bundle antes de retirar o sustituir librerías. |

Las versiones objetivo anteriores son líneas de migración, no una lista de bumps ya demostrados compatibles. La documentación de Next consultada muestra 16.4.0 y la de React 19.3; no se ha consultado exhaustivamente el registro npm para fijar el último patch de cada paquete. La selección final debe confirmar dist-tags estables, peer dependencies, advisories y lockfile en el momento de implementar.

### Estado oficial y cambios que afectan este código

- **Next 14 fuera de soporte:** la política oficial sitúa 16 en Active LTS y 15 en Maintenance LTS. El aviso de diciembre de 2025 afecta al App Router de 14 con DoS y fija 14.2.35 como corrección de ese aviso. Es contención temporal, no garantía de cubrir todos los avisos posteriores. Next 14 estable no está afectado por el RCE React2Shell de aquel aviso; no confundir vulnerabilidades. Fuentes: [soporte Next](https://nextjs.org/support-policy), [DoS RSC](https://nextjs.org/blog/security-update-2025-12-11), [React2Shell](https://nextjs.org/blog/CVE-2025-66478).
- **Next 15/16:** migrar `params`, `searchParams` y otras Request APIs asíncronas; revisar los defaults de caché; reemplazar `next lint` por CLI y ejecutar lint explícitamente en CI. Adaptar `revalidateTag` y revisar bundler/MDX e imágenes. El repositorio usa params síncronos, tags de fetch, `next lint` e `images.domains`. Fuentes: [guía 15](https://nextjs.org/docs/app/guides/upgrading/version-15), [guía 16](https://nextjs.org/docs/app/guides/upgrading/version-16), [versiones React](https://react.dev/versions).
- **Prisma 7:** exige cambios ESM, configuración de conexión/CLI, cliente generado y adapter de base de datos. Revisar SSL, pooling y carga de variables. No basta cambiar `5.11.0` a `7`. La fuente consultada identifica Prisma 8 como RC, que no es el destino recomendado de esta auditoría. Fuente: [guía Prisma 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).
- **Node y tooling:** 22 y 24 tienen soporte LTS según el calendario oficial; 20 ya está EOL. Los tipos Node 20 del proyecto no prueban que el despliegue use Node 20. ESLint 10 es la línea actual y 8 está EOL. Fuentes: [calendario Node](https://github.com/nodejs/Release), [soporte ESLint](https://eslint.org/version-support/).
- **UI y email:** Tailwind 4 cambia el contrato de estilos y navegadores mínimos. Recharts 3 tiene cambios de props/eventos y target. Zustand 5 cambia selectores/equality y recomienda actualizar primero a la última v4. React Email documenta la consolidación de componentes en `react-email`; no introducir como destino el agregador antiguo sin revisar su estado. Fuentes: [Tailwind 4](https://tailwindcss.com/docs/upgrade-guide), [Recharts 3](https://github.com/recharts/recharts/wiki/3.0-migration-guide), [Zustand 5](https://github.com/pmndrs/zustand/blob/main/docs/reference/migrations/migrating-to-v5.md), [changelog oficial email](https://github.com/resend/react-email/blob/canary/packages/react-email/CHANGELOG.md).
- **Autenticación:** conservar independencia entre corregir autorización y migrar biblioteca; una actualización de NextAuth no añade controles de propietario en nuestros handlers. Fuente: [migración Auth.js v5](https://authjs.dev/getting-started/migrating-to-v5).

## Hallazgos del código y prioridades

P0: corregir antes de publicar más cambios. P1: siguiente lote de estabilidad. P2: optimización/mantenimiento posterior.

### P0 — Autorización en lecturas, operaciones y jobs

1. **Lecturas sin sesión con `userId` recibido del cliente.** `app/api/contract/route.ts:21`, `app/api/share/route.ts:26`, `app/api/provider-on-contract/route.ts:4`, `app/api/loan/route.ts:12`, `app/api/subscription/route.ts:13` y `app/api/notification/route.ts:6` consultan recursos usando ese identificador sin autenticar al solicitante. `app/api/user/route.ts:4` permite búsqueda vacía que devuelve todos los usuarios, con sus campos de modelo. Riesgo: lectura de datos de otros usuarios si esas rutas son accesibles. Derivar identidad de sesión, establecer política explícita de compartidos aceptados y devolver DTO mínimos; paginar y restringir búsquedas.
2. **Operaciones sin autenticación.** `app/api/migrate/route.ts:207` recorre y modifica períodos de toda la base desde un GET público en el código. `app/api/email/route.tsx:41` envía un template a un usuario arbitrario. `app/api/notification/route.ts:32` permite crear notificaciones y activar email sin sesión. Retirar rutas de mantenimiento a scripts offline y cerrar envíos a acciones autorizadas con límites de frecuencia. No ejecutar estos endpoints como comprobación de auditoría.
3. **Cron sin autenticación y sin idempotencia.** `app/api/notification/cron/route.ts:9` crea notificaciones/emails, borra registros viejos y responde con `users` completos. Solicitudes repetidas repiten el proceso. Validar `Authorization: Bearer CRON_SECRET`, devolver solo métricas y persistir una clave única de envío por usuario/fecha/tipo. Vercel documenta autenticación del cron, pero el handler debe verificarla. Fuente: [gestión de cron Vercel](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
4. **Modificar compartidos sin comprobar destinatario.** `app/api/share/[id]/route.ts:79` carga el share y `:95` lo modifica por id; solo exige una sesión, no `share.toId === session.user.id`. Añadir autorización antes de leer/modificar y validar `accepted` como booleano real. Probar que un tercer usuario recibe 403.
5. **Secreto de revalidación público.** `app/api/revalidate/route.ts:8` utiliza `NEXT_PUBLIC_REVALIDATE_SECRET`; `sdk/loan.ts:15` y `sdk/subscription.ts:26` lo incorporan a la URL. Es un secreto destinado al bundle cliente y query string. Reemplazar por revalidación en servidor tras mutaciones autenticadas, limitar tags por identidad y retirar el endpoint si deja de ser necesario. No he leído ni copiado el valor local.

Al cerrar los GET, hay que adaptar también su consumidor RSC: `app/dashboard/layout.tsx:26` usa SDK HTTP y `sdk/contract.ts:7` no reenvía sesión. Solución preferida: capa de servicios de servidor reutilizable que valide identidad y sea llamada directamente por RSC y handlers; SDK de navegador autenticado para TanStack Query. Cerrar los endpoints sin cambiar ese consumidor puede romper la carga inicial.

### P1 — Corrección funcional, tipos y resiliencia

- **Filtro de contratos ignorado.** `app/api/contract/route.ts:25` valida `type`, pero `:51` consulta con `type: undefined`. `sdk/subscription.ts:7` espera filtrar suscripciones. Corregir el filtro y probar que una lista de suscripciones excluye loans/WORK.
- **Sueldos tratados como suscripciones en el digest.** `app/api/notification/cron/route.ts:62` clasifica LOAN frente a «todo lo demás». WORK, creado en `app/dashboard/profile/add-contract/page.tsx:33`, entra en subs. Seleccionar explícitamente LOAN/SUBSCRIPTION o definir un flujo de ingresos separado; esto afecta totales y asunto del email.
- **GET detalle con condición de acceso incorrecta.** `app/api/contract/[id]/route.ts:114` utiliza `no propietario || no destinatario`; acaba exigiendo ser ambos y bloquea al propietario normal y al receptor compartido. Expresar la política como propietario **o** destinatario con aceptación y probar las cuatro combinaciones.
- **Filtro de no leídas inefectivo.** `app/api/notification/route.ts:25` usa `ack: false || undefined`, que evalúa a undefined y omite el filtro. Aclarar si se buscan todas o solo no leídas y probarlo.
- **Validación insuficiente de entradas.** Handlers convierten JSON mediante casts TypeScript; formularios convierten números/fechas sin esquema de servidor (`app/dashboard/profile/add-contract/page.tsx:19`, `app/api/loan/route.ts:59`). Validar importes finitos, rangos de payday, enum de tipo, fechas ordenadas, IDs y ownership de relaciones; devolver errores consistentes sin exponer errores Prisma crudos.
- **Clientes HTTP sin verificación de resultado.** `sdk/contract.ts:7` y el resto del SDK procesan JSON sin `response.ok`; `lib/brandfetch.ts:6` hace lo mismo para un proveedor externo. Definir error de transporte común, serialización Date→DTO y validación de respuesta; usar timeout/cancelación y reintentar solo operaciones seguras.
- **Email no transaccional con estado persistido.** `lib/notification/daily.ts:26` crea el registro y `:38` envía después. Un fallo puede dejar estado parcial; un reintento puede duplicar. Usar outbox o estado de entrega con clave idempotente y reintentos acotados; comprobar el resultado que devuelve Resend y registrar métricas de fallo sin payload sensible. La escritura anidada de un contrato sí es atómica en Prisma; no confundirla con esta secuencia DB+servicio externo.
- **Dinero almacenado en `Float`.** `prisma/schema.prisma:78`, `:102`, `:182` y `:214` guardan importes de coma flotante. Evaluar Decimal PostgreSQL o céntimos enteros y reglas de reparto/redondeo. Requiere migración de datos, DTO y cálculos; no cambiarlo durante un bump de Prisma.
- **PrismaClient no protegido frente a hot reload.** `lib/prisma.ts:48` crea una instancia por carga del módulo. La referencia del proyecto lo denomina singleton, pero no existe caché global de desarrollo. Separar tipos de DTO de módulos de servidor y aplicar singleton global en desarrollo. Fuente: [Prisma con Next](https://docs.prisma.io/docs/guides/v7/frameworks/nextjs).

### P2 — Rendimiento, estructura y mantenimiento

- **Evitar HTTP del servidor contra su propia API:** el layout carga cuatro recursos completos antes de renderizar (`app/dashboard/layout.tsx:26`). Los includes de contratos/providers/shares repiten contratos, usuarios y períodos. Servicios directos para RSC y consultas cliente por necesidad de pantalla reducen saltos y payload. Medir antes/después TTFB, bytes JSON y número de consultas, sin inventar una mejora porcentual.
- **Uniformar propiedad del estado:** hoy los datos de servidor se copian a Zustand (`store/index.tsx:60`) y solo parte de WORK usa Query. Reservar Zustand para UI/fecha; Query para recursos remotos con keys por usuario e invalidación de mutaciones. El informe específico desarrolla el plan de React Query.
- **Modelo antiguo junto al nuevo:** el schema mantiene Loan/Subscription/UserProvider y modelos Contract/Period, con comentario de retirada pendiente (`prisma/schema.prisma:161`). Identificar consumidores y datos restantes, migrar con reconciliación y rollback, después retirar tablas y rutas muertas. No asumir que el comentario autoriza borrar datos.
- **Índices y paginación:** el schema no declara `@@index` para filtros recurrentes (Contract.userId/type, Notification.userId/date, Share.toId, Period.payday). Evaluar índices con EXPLAIN en réplica o staging y cardinalidad real; PostgreSQL no crea automáticamente índices de todas las FK. Paginar listas antes de crecimiento significativo. No se midieron query plans ni se accedió a DB.
- **Fechas del cron:** `vercel.json` fija 10:00; el handler usa fechas y horas locales del proceso, sin zona de negocio explícita. Definir día de pago en Europe/Madrid y comportamiento para DST, fin de mes y payday 29–31; limitar concurrencia de Promise.all sobre usuarios. Añadir tests de esos límites.
- **Bundle y proveedores globales:** el layout público monta SessionProvider, contexto de tema y tooltip (`components/root-provider.tsx`), aunque no todas las páginas los necesitan. Medir JavaScript inicial y evaluar mover proveedores privados al dashboard. Recharts e iconos de varias familias son candidatos a carga por pantalla/consolidación tras medir.
- **Blog:** `lib/blog.ts:35` compila todos los MDX para extraer frontmatter. Separar metadatos de compilación y generar/cachear contenido público; validar slug contra lista de posts y controlar 404. Los MDX son locales y de confianza en esta inspección; no introducir contenido remoto sin validar su ejecución.
- **Dependencias candidatas a retirada:** no encontré usos en código de `@vercel/postgres`, `docuporter` y `next-themes`; el tema real es un contexto propio. Validar CLI/config y una instalación/build limpios antes de retirarlas. Un proveedor de DB en Vercel no significa que su SDK deba estar instalado: Prisma conecta directamente. `components/Icons.tsx:1` reexporta una familia completa; verificar tree-shaking en vez de asumir tamaño del bundle.
- **Toolchain reproducible:** solo hay lock pnpm, pero README/scripts usan npm; faltan `packageManager` y `engines`. Elegir pnpm con versión fija e instalación frozen-lockfile en CI. `package.json:17` invoca `ts-node script.ts`, sin script.ts ni ts-node declarados; eliminar o completar ese comando. Separar herramientas de build/tipos/lint de dependencias runtime cuando proceda.
- **Documentación/config:** no se encontró AGENTS.md aplicable en repo; se leyó `.cursor/REFERENCE.md`. Esa referencia describe SDK solo frontend y singleton Prisma, pero el código contradice ambos puntos. Crear AGENTS.md después de decidir convenciones. Revisar `tsconfig.json` (target ES5 y `moduleResolution` adicional fuera de compilerOptions); el typecheck actual lo acepta, pero no es una configuración coherente para futuras migraciones.

## Plan secuenciado y criterios de cierre

| Orden | Lote | Cierre verificable |
|---|---|---|
| 1 | Aislar rutas, retirar mantenimiento HTTP, proteger cron/email, corregir share/revalidación | Tests anónimo/propietario/receptor/tercero para cada recurso; ningún cambio cross-user; cron no autorizado 401; llamadas repetidas no duplican emails. Adaptar RSC para no depender de GET públicos. |
| 2 | Parche Next de contención y baseline reproducible | Lock coherente; Node/packageManager fijados; tests, typecheck, lint y build en entorno de prueba. Confirmar advisories aplicables a versiones exactas. |
| 3 | Corregir filtro type, WORK en gastos, permisos detalle, ack y validación | Tests de regresión de ingresos vs gastos, límites de fechas, ownership y errores; fixture con loan/sub/WORK y contratos compartidos. |
| 4 | Unificar acceso a datos y React Query del dashboard | Servicios autorizados y SDK consistente; aislamiento de caché por sesión; invalidación tras CRUD/shares/ack; navegación/recarga conservan consistencia. Mantener render servidor de web/blog. |
| 5 | Migrar Next 14→15→16 y React 19 con lint/config | Revisar codemods, APIs asíncronas, MDX, fetch/cache, auth Google y rutas directas. Checks por etapa y smoke/E2E en preview; no activar Compiler/Cache Components incidentalmente. |
| 6 | Prisma 5→6→7 y fiabilidad de DB/jobs | Migración revisada en copia/staging, backups y restore probados; generación/adapter/env/SSL correctos; presupuesto de conexiones y outbox/idempotencia verificados. |
| 7 | UI/email/tooling y mejoras medidas | Lotes independientes de Zustand, Tailwind, Radix, Recharts, React Email/Resend y ESLint; regresión visual, render de emails y mediciones bundle/queries antes/después. |
| 8 | Retirada de legacy y precisión monetaria | Inventario de datos/consumidores, reconciliación y rollback; importes/repartos iguales bajo reglas documentadas; solo entonces borrar rutas/modelos antiguos. |

Prisma y modernización UI pueden adelantarse si aparece una vulnerabilidad aplicable; no acoplar todas las migraciones a un único PR. El refactor de datos puede dividirse por recurso para conservar una app usable en cada etapa.

## Comprobaciones y límites

- Leídos package/config/lock, instrucciones de referencia, schema/migraciones, layouts, SDK, stores, autenticación, handlers, utilidades de negocio, cron y email.
- `node_modules/.bin/jest --runInBand`: **2 suites, 29 tests, todos pasan**.
- `node_modules/.bin/tsc --noEmit --incremental false`: **exit 0**, sin diagnósticos; desactivado incremental para no escribir tsbuildinfo.
- `node_modules/.bin/next lint`: **exit 0**, sin warnings ni errores. Puede actualizar caché ignorada de Next/ESLint; no modifica fuente de la aplicación.
- Versiones directas leídas desde package.json instalado y cotejadas con importer del lock; Node de terminal 22.18.0. El inventario siguiente no describe producción.
- No se ejecutó build completo, instalación, pnpm audit, migración, prisma generate, consultas a DB, requests de explotación ni env pull. Build/auth/jobs necesitan entorno de prueba controlado; una lectura estática no prueba disponibilidad ni seguridad de producción.
- No se revisó estado de cuentas Vercel/Resend/Google, runtime desplegado, versión de PostgreSQL, backups, trazas o métricas. Los índices/rendimiento son propuestas pendientes de medición, no cuellos de botella demostrados.
- Las comprobaciones verdes no invalidan los fallos de autorización detectados; no existen tests de API o E2E en los dos archivos de tests encontrados.

## Inventario completo de dependencias directas

Versiones locales de la instalación auditada. El inventario no atribuye una recomendación de latest a cada paquete; el plan anterior agrupa las actualizaciones por riesgo y compatibilidad.

| Grupo | Paquete | Declarada | Instalada |
|---|---|---|---|
| dependencies | `@auth/prisma-adapter` | `^1.5.0` | 1.5.0 |
| dependencies | `@mdx-js/loader` | `^3.0.1` | 3.0.1 |
| dependencies | `@mdx-js/react` | `^3.0.1` | 3.0.1 |
| dependencies | `@next/eslint-plugin-next` | `^14.1.3` | 14.1.3 |
| dependencies | `@next/mdx` | `^14.1.3` | 14.1.3 |
| dependencies | `@number-flow/react` | `^0.4.1` | 0.4.1 |
| dependencies | `@prisma/client` | `^5.11.0` | 5.11.0 |
| dependencies | `@radix-ui/react-avatar` | `^1.0.4` | 1.0.4 |
| dependencies | `@radix-ui/react-dialog` | `^1.0.5` | 1.0.5 |
| dependencies | `@radix-ui/react-dropdown-menu` | `^2.0.6` | 2.0.6 |
| dependencies | `@radix-ui/react-form` | `^0.0.3` | 0.0.3 |
| dependencies | `@radix-ui/react-icons` | `^1.3.0` | 1.3.0 |
| dependencies | `@radix-ui/react-label` | `^2.0.2` | 2.0.2 |
| dependencies | `@radix-ui/react-navigation-menu` | `^1.1.4` | 1.1.4 |
| dependencies | `@radix-ui/react-popover` | `^1.0.7` | 1.0.7 |
| dependencies | `@radix-ui/react-progress` | `^1.0.3` | 1.0.3 |
| dependencies | `@radix-ui/react-select` | `^2.0.0` | 2.0.0 |
| dependencies | `@radix-ui/react-separator` | `^1.0.3` | 1.0.3 |
| dependencies | `@radix-ui/react-slot` | `^1.0.2` | 1.0.2 |
| dependencies | `@radix-ui/react-switch` | `^1.0.3` | 1.0.3 |
| dependencies | `@radix-ui/react-toggle` | `^1.0.3` | 1.0.3 |
| dependencies | `@radix-ui/react-tooltip` | `^1.0.7` | 1.0.7 |
| dependencies | `@react-email/body` | `0.0.8` | 0.0.8 |
| dependencies | `@react-email/button` | `^0.0.15` | 0.0.15 |
| dependencies | `@react-email/column` | `0.0.10` | 0.0.10 |
| dependencies | `@react-email/container` | `0.0.12` | 0.0.12 |
| dependencies | `@react-email/head` | `0.0.9` | 0.0.9 |
| dependencies | `@react-email/heading` | `0.0.12` | 0.0.12 |
| dependencies | `@react-email/hr` | `0.0.8` | 0.0.8 |
| dependencies | `@react-email/html` | `^0.0.8` | 0.0.8 |
| dependencies | `@react-email/img` | `0.0.8` | 0.0.8 |
| dependencies | `@react-email/link` | `0.0.8` | 0.0.8 |
| dependencies | `@react-email/preview` | `0.0.9` | 0.0.9 |
| dependencies | `@react-email/row` | `0.0.8` | 0.0.8 |
| dependencies | `@react-email/section` | `0.0.12` | 0.0.12 |
| dependencies | `@react-email/tailwind` | `^0.0.18` | 0.0.18 |
| dependencies | `@react-email/text` | `0.0.8` | 0.0.8 |
| dependencies | `@tanstack/react-query` | `^5.45.1` | 5.45.1 |
| dependencies | `@types/mdx` | `^2.0.13` | 2.0.13 |
| dependencies | `@types/node` | `20.11.27` | 20.11.27 |
| dependencies | `@types/react` | `18.3.3` | 18.3.3 |
| dependencies | `@types/react-dom` | `18.2.22` | 18.2.22 |
| dependencies | `@vercel/postgres` | `^0.7.2` | 0.7.2 |
| dependencies | `autoprefixer` | `10.4.18` | 10.4.18 |
| dependencies | `class-variance-authority` | `^0.7.0` | 0.7.0 |
| dependencies | `classnames` | `^2.5.1` | 2.5.1 |
| dependencies | `clsx` | `^2.1.0` | 2.1.0 |
| dependencies | `cmdk` | `^1.0.0` | 1.0.0 |
| dependencies | `docuporter` | `^0.7.1` | 0.7.1 |
| dependencies | `dotenv-cli` | `^7.4.1` | 7.4.1 |
| dependencies | `lucide-react` | `^0.357.0` | 0.357.0 |
| dependencies | `next` | `^14.2.4` | 14.2.4 |
| dependencies | `next-auth` | `^4.24.7` | 4.24.7 |
| dependencies | `next-mdx-remote` | `^6.0.0` | 6.0.0 |
| dependencies | `next-themes` | `^0.3.0` | 0.3.0 |
| dependencies | `nextjs-toploader` | `^1.6.6` | 1.6.6 |
| dependencies | `postcss` | `8.4.35` | 8.4.35 |
| dependencies | `react` | `18.3.1` | 18.3.1 |
| dependencies | `react-dom` | `18.3.1` | 18.3.1 |
| dependencies | `react-email` | `^2.1.4` | 2.1.4 |
| dependencies | `react-icons` | `^5.0.1` | 5.0.1 |
| dependencies | `recharts` | `^2.12.2` | 2.12.2 |
| dependencies | `remark-unwrap-images` | `^4.0.0` | 4.0.0 |
| dependencies | `resend` | `^3.2.0` | 3.2.0 |
| dependencies | `sharp` | `^0.33.2` | 0.33.2 |
| dependencies | `sonner` | `^1.5.0` | 1.5.0 |
| dependencies | `tailwind-merge` | `^2.2.1` | 2.2.1 |
| dependencies | `tailwindcss` | `3.4.1` | 3.4.1 |
| dependencies | `tailwindcss-animate` | `^1.0.7` | 1.0.7 |
| dependencies | `zustand` | `^4.5.2` | 4.5.2 |
| devDependencies | `@tanstack/eslint-plugin-query` | `^5.43.1` | 5.43.1 |
| devDependencies | `@types/jest` | `^29.5.12` | 29.5.12 |
| devDependencies | `eslint` | `^8.57.0` | 8.57.0 |
| devDependencies | `eslint-config-frbosquet-tsnext` | `^1.0.2` | 1.0.2 |
| devDependencies | `jest` | `^29.7.0` | 29.7.0 |
| devDependencies | `prettier` | `^3.3.2` | 3.3.2 |
| devDependencies | `prisma` | `^5.11.0` | 5.11.0 |
| devDependencies | `ts-jest` | `^29.1.2` | 29.1.2 |
| devDependencies | `typescript` | `^5.4.2` | 5.4.2 |
