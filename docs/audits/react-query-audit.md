# Auditoría de React Query y coherencia del dashboard

Fecha: 13 de octubre de 2026. Análisis estático del checkout actual. No se modifica código, dependencias ni datos. Se ha leído `.cursor/REFERENCE.md`; no se ha encontrado un `AGENTS.md` en el repositorio. Las instrucciones globales proporcionadas en la conversación siguen aplicando.

## Revisión de implementación — 15 de octubre de 2026

Las secciones originales conservan el análisis histórico del 13 de octubre. El checkout ya tenía parte de la migración al comenzar esta revisión. Se ha completado el consumo privado mediante React Query v5, conservando la UI actual y, por elección del usuario, prefetch servidor con hidratación inicial.

- `lib/server/dashboard-prefetch.ts` utiliza servicios autorizados de `lib/server/reads.ts`, DTOs saneados y un QueryClient nuevo por petición. Lee todas las páginas antes de hidratar una lista completa; no utiliza HTTP interno ni SDK desde RSC.
- El shell precarga notificaciones para la campana. Los layouts de cada recurso precargan contratos/shares, perfil, catálogo o relaciones según la pantalla. `PrivateHydration` filtra los datos por la sesión actual antes de `HydrationBoundary`.
- `lib/query-policy.ts` mantiene un cliente estable por sesión en el navegador, incluso cuando React descarta un render inicial suspendido. Logout y cambio de cuenta cancelan y borran la caché anterior. SSR nunca comparte ese cliente.
- `hooks/resources.ts` centraliza queries y mutations. WORK se deriva de la lista canónica de contratos; ya no hay una copia independiente `contracts/WORK`. Perfil y catálogo tienen cinco minutos de frescura, notificaciones veinte segundos y contratos/shares un minuto; retención de cinco minutos. Sólo se reintentan lecturas con errores transitorios y nunca escrituras automáticamente.
- Las mutations exponen `isPending` y errores al UI, conservan borradores al fallar y esperan la invalidación de recursos dependientes. Se han retirado los lectores laborales y formularios servidor obsoletos. Zustand sólo conserva la fecha.
- Accept/reject confirma share y acknowledgement de la invitación en una transacción servidor; el cliente realiza una sola mutation. Ack automático expone error y reintento. Se conserva la entrega de emails posterior al commit.
- Hay skeletons de página, detalle, perfil, formularios, catálogo y resultados de búsqueda. Los refetches conservan datos existentes, muestran actualización en curso y ofrecen recuperación del error. El catálogo de proveedores es compartido por todos los formularios.
- Búsquedas de usuarios y marcas utilizan debounce, keys por término/sesión y AbortSignal. Se han corregido el nombre accesible del selector y el estilo de items `data-disabled=false`, que impedía seleccionar resultados con el cmdk actual.

Validación: `pnpm check`, `pnpm test:db`, `pnpm build` y el suite de navegador contra PostgreSQL desechable en localhost. Las pruebas cubren permisos existentes, rollback de share/ack, aislamiento de SSR y de cuentas, ausencia de lecturas cliente duplicadas al hidratar, frescura después de mutations, errores/refetch sin perder contenido, borradores y búsquedas con respuestas fuera de orden. Las medidas de localhost son sintéticas; no se afirma una mejora de rendimiento en producción. Siguen pendientes la comprobación real de OAuth, Brandfetch/email y despliegue con datos de producción.

El patrón de hidratación sigue la [guía oficial de TanStack para App Router](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr); los datos saneados conservan fechas compatibles con React Flight y con la restauración de fechas del SDK HTTP.

## Resultado

React Query está instalado y tiene un provider en el dashboard, pero **sólo existe un `useQuery` y ninguna `useMutation`**. La mayoría de datos remotos se cargan en un layout RSC, se copian a Zustand al montar y se actualizan manualmente después de cada escritura. Perfil y contratos laborales usan además RSC y Server Actions. Hay tres mecanismos de actualización con distinta frescura y gestión de errores.

La recomendación es convertir React Query en la fuente de estado remoto del dashboard, conservar Zustand para fecha y estado de interfaz, y mantener Next.js App Router. La landing y el blog pueden seguir usando RSC. Una experiencia SPA del dashboard no requiere mover Prisma, autenticación o autorización al navegador ni sustituir el router. Antes de ampliar las lecturas cliente es necesario corregir las comprobaciones de acceso de las APIs y acciones existentes.

## 1. Inventario real

| Elemento | Uso actual y evidencia |
|---|---|
| Versión | `package.json` declara `@tanstack/react-query: ^5.45.1`; `pnpm-lock.yaml:122–124` resuelve **5.45.1**. No implica que la instalación local sea idéntica al lock. |
| Provider | `store/index.tsx:28` crea un `QueryClient` a nivel de módulo; `:67–68` envuelve los hijos del dashboard. No tiene defaults propios. |
| Ámbito | `app/dashboard/layout.tsx:35–44` coloca `StoreProvider` dentro de `DashboardLayout`. La navegación/bell exterior no queda bajo React Query: al migrar debe invertirse este orden. `components/NavigationMenu.tsx:24` importa la campana. |
| Query | `components/work-contract/summary.tsx:91–94`: key `['work-contracts']`, lectura por `fetchWorkContracts()` (Server Action). |
| Estados | Ese componente muestra loading/error/success (`:117–129`); no tiene tratamiento específico de vacío, actualización en segundo plano o reintento manual. |
| Lectura servidor | `actions/work-contract.ts:7–27` obtiene usuario mediante `getUserData`, filtra por usuario y tipo WORK y consulta Prisma. |
| Mutations y cache | Búsqueda global sin usos de `useMutation`, `useQueryClient`, `invalidateQueries`, `setQueryData`, `prefetchQuery`, `HydrationBoundary` ni `useInfiniteQuery`. |
| ESLint | `.eslintrc.json:4` activa reglas recomendadas de TanStack; esto no reemplaza un contrato común de datos o pruebas de invalidación. |
| Otros providers | `components/root-provider.tsx` contiene `SessionProvider`; `components/Provider.tsx:11–12` sólo devuelve children. La referencia de proyecto describe estos elementos de forma aproximada. |

La key laboral no incluye usuario. El cliente de módulo tampoco se reinicia explícitamente al cerrar sesión. Esto crea riesgo de reutilizar datos privados en un cambio de cuenta en la misma sesión de navegador. No se afirma que haya ocurrido una fuga: no se ha probado el ciclo real de login/logout ni que el cliente actual reciba datos privados durante SSR. No ampliar la hidratación con un cliente de servidor compartido entre peticiones.

## 2. Cómo llegan y cambian los datos

```text
Layout dashboard RSC → SDK fetch → API → Prisma
                         ↓
                  props de StoreProvider
                         ↓ useEffect([])
           Zustand: contracts/shares/notifications/providersOnContracts
                         ↓
                 hooks y componentes UI

CRUD en UI → SDK/API o Server Action → update/add/remove de Zustand
                                    → a veces POST /api/revalidate

Perfil laboral → useQuery → Server Action → Prisma
Perfil/alta laboral → formulario RSC → Server Action → redirect
```

El layout espera en paralelo contratos, shares, notificaciones y relaciones de proveedores para **cualquier** pantalla (`app/dashboard/layout.tsx:26–32`). El SDK se documenta como exclusivo del frontend (`sdk/README.md`), pero el layout lo importa para hacer HTTP interno desde servidor. No reenvía cookies explícitamente. Al asegurar los GETs, esta ruta de lectura deberá pasar a servicios de servidor directos o reenviar correctamente la sesión; la primera opción evita el salto HTTP interno.

`StoreProvider` inicia slices vacías y las rellena después del primer render (`store/index.tsx:60–65`). Ese efecto sin dependencias no sincroniza cambios posteriores de props: un refresh/revalidación del servidor no garantiza que Zustand reciba el nuevo resultado. Los detalles pueden devolver `null` mientras aún no hay datos (`app/dashboard/loans/[id]/page.tsx:18–20`).

### Matriz de pantallas y datos

| Pantalla o flujo | Lectura actual | Escritura actual | Patrón propuesto |
|---|---|---|---|
| `/dashboard` | Componentes calculan resumen, forecast y calendario desde hooks de préstamos/suscripciones y fecha; datos iniciales del layout | Diálogos reutilizan CRUD | `useContracts` + `useShares`; cálculos puros por fecha. Fetch paralelo y estados por sección. |
| `/dashboard/loans` | `useLoans` → Zustand, derivación por fecha y shares aceptados (`components/loan/context.tsx:15–52`) | SDK loan + actualización local + revalidate | Query canónica de contratos; `useCreateLoan`, `useUpdateLoan`, `useDeleteContract`; invalidación común. |
| `/dashboard/loans/[id]` | Busca en lista propia o share (`context.tsx:56–68`) | Misma CRUD; redirección tras borrar | Lectura detalle autorizada, opcionalmente con placeholder desde lista; loading, 404 y 403 explícitos. |
| `/dashboard/subscriptions` | `useSubs` → Zustand; activas/pausadas/compartidas (`components/subscription/context.tsx:9–45`) | SDK subscription + actualización local + revalidate | Misma query de contratos, selectores por tipo/fecha y hooks de mutation. |
| `/dashboard/subscriptions/[id]` | Busca en propia o share (`context.tsx:49–60`) | CRUD SDK y Server Actions para pausa/reanudar/precio | Query detalle y mutations uniformes; acciones pueden permanecer detrás de adaptador. |
| `/dashboard/providers` | `components/provider/context.tsx` deriva proveedores de `providersOnContracts` en Zustand | Alta usa SDK y callback (`components/provider/add.tsx:31–44`) | Query de catálogo más relaciones, o derivación desde contratos si el contrato de datos lo permite; invalidar relaciones tras CRUD. |
| `/dashboard/notifications` y campana | Zustand; pendientes derivados por `ack` (`components/notifications/context.tsx:6–16`) | SDK ack; efectos manuales; aceptar/rechazar share dispara dos requests | Query notificaciones compartida por lista y bell; mutations, recuperación de fallos y refetch al foco. |
| Shares de préstamos/suscripciones | `components/share/hooks.ts`; lista cargada por layout | `shareSdk.update` seguido de `notificationSdk.ack` | Una operación servidor coherente de aceptar/rechazar + ack, con invalidación de shares/notificaciones/contratos. |
| `/dashboard/profile` | RSC `getUserData` + query laboral aislada | Enlaces a edición/alta | `useProfile` y contratos WORK derivados de query canónica. NextAuth sigue siendo fuente de sesión. |
| `/dashboard/profile/edit` | RSC y Prisma (`page.tsx:8–9`) | Server Action inline actualiza y redirige (`:11–26`) | Formulario cliente + mutation; refrescar perfil y sesión si muestra campos modificados. |
| `/dashboard/profile/add-contract` | RSC `ProviderInput` consulta todo catálogo (`components/provider-input.tsx:7–18`) | Server Action crea WORK y redirect (`page.tsx:15–57`) | Query catálogo + mutation laboral; actualizar contratos/relaciones y navegar tras confirmación. |
| Búsqueda de usuarios | `UserSearch.tsx:31–54`: debounce 170 ms, SDK y estado local | Selección queda local al formulario | Query con texto normalizado y usuario en key, `enabled` por longitud, debounce y cancelación. |
| Búsqueda de marcas | `BrandAutocomplete.tsx:58–81`: fetch directo a Brandfetch por pulsación | ProviderDialog crea proveedor vía SDK | Query por término con debounce/cancelación; texto y selección siguen locales; adaptador SDK para respetar convención. |
| Landing/blog/pricing/team | RSC y componentes públicos fuera del StoreProvider | No requieren caché privada del dashboard | Conservar arquitectura pública RSC/MDX; no envolverla en provider de datos privados. |

### Inconsistencias concretas

1. **Invalidación distinta de la lectura.** El layout obtiene contratos con tag `subscription:${userId}` (`sdk/contract.ts:7`). Crear/editar/borrar préstamo invalida `loan:${userId}` (`sdk/loan.ts:14–17`, `components/loan/add.tsx:48`). No alcanza esa lectura de contratos. Los shares también llevan tag loan (`sdk/share.ts:7`) y las relaciones llevan subscription (`sdk/provider-on-contract.ts:7`). Aunque Next haga efectiva una revalidación, el efecto de montaje no sincroniza Zustand.
2. **Relaciones obsoletas después de CRUD.** Los formularios actualizan contracts, pero no el slice `providersOnContracts`: la pantalla de proveedores puede conservar asociaciones anteriores. `components/loan/edit.tsx:51–55` sólo actualiza el contrato y llama a revalidate.
3. **HTTP fallido puede parecer éxito.** Fetchers como `sdk/loan.ts:21–47`, `sdk/share.ts:13–23` y `sdk/notifications.ts:14–27` parsean JSON sin comprobar `response.ok`. Un 403 con JSON puede dar `undefined`, cerrar el modal o contaminar estado. TanStack tampoco detectaría correctamente ese error sin que el fetcher lance una excepción. Véase [Query Functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions).
4. **Estados duplicados y errores invisibles.** Formularios mantienen `loading` y dejan TODO toast (`components/loan/add.tsx:35–56`, edit/delete equivalentes). `useAutoAck` no tiene catch/finally (`components/notifications/components/hooks.ts:13–24`); un fallo deja loading activado. Aceptar share y marcar notificación son dos operaciones secuenciales sin recuperación del fallo parcial (`components/notifications/components/loan-share.tsx:91–118`; patrón equivalente para subscriptions).
5. **Listas y detalles compartidos no aplican la misma condición.** Listas exigen `share.accepted`, pero detalles buscan cualquier share (`components/loan/context.tsx:27–31` frente a `:63–66`, y subscription equivalentes). El permiso efectivo debe definirse en servidor, distinguiendo invitación de acceso al recurso completo.
6. **Fecha incoherente.** `useSubs` usa fecha seleccionada, mientras `useSub` llama `getSub(id)` con fecha por defecto y `unwrapSub` sin fecha para shares (`components/subscription/context.tsx:11`, `:52–58`). La migración debe preservar y armonizar la misma semántica temporal; cambiar el mes no debe provocar HTTP si sólo afecta cálculos locales.
7. **Respuesta excesiva y filtro ignorado.** `app/api/contract/route.ts:24–34` valida `type`, pero la consulta usa `type: undefined` (`:48–58`), con relaciones amplias. Un fetch filtrado no devuelve sólo el tipo solicitado. Consolidar DTO y servicio antes de depender de keys filtradas.

## 3. Condiciones previas de acceso y contrato API

Estas son observaciones del código, no pruebas contra producción. El repositorio no contiene un middleware que proteja globalmente estas rutas. Puede existir una protección externa que no se haya inspeccionado, pero el layout autenticado no autoriza requests directos a sus APIs ni a Server Actions.

| Prioridad | Evidencia | Corrección necesaria antes de ampliar cliente |
|---|---|---|
| P0 | GET `app/api/contract/route.ts:21–58`, `share/route.ts:26–46`, `notification/route.ts:6–27`, `provider-on-contract/route.ts:4–24`, y GET loan/subscription | Obtener usuario de sesión servidor, no confiar en `?userId=`; limitar campos/relaciones; respuesta privada sin caché pública. |
| P0 | `components/subscription/actions.ts:7`, `:52`, `:114` escriben por id sin obtener sesión/comprobar propietario | Auth y autorización por recurso en **cada** acción; validar tipo SUBSCRIPTION e inputs; transacción para cerrar/abrir periodos. |
| P0 | `app/api/share/[id]/route.ts:79–99` lee por id y actualiza sin comparar destinatario con `session.user.id` | Sólo destinatario autorizado puede aceptar/rechazar; definir idempotencia y efecto de notificación. |
| P1 | `app/api/contract/[id]/route.ts:114–119` deniega si no es dueño **o** no tiene share | Definir dueño **o** share autorizado; negar si ninguna condición. Añadir relaciones del DTO detalle, actualmente sólo incluye shares (`:98–100`). |
| P1 | `app/api/user/route.ts:4–20` búsqueda sin auth, permite término vacío y devuelve usuarios completos | Sesión, longitud mínima también en servidor, límite/paginación y DTO mínimo para compartir. |
| P1 | SDK invalida usando `NEXT_PUBLIC_REVALIDATE_SECRET`; endpoint compara esa variable (`app/api/revalidate/route.ts:8`) | No usar una variable pública como secreto de autorización. Para dashboard privado preferir no-store y Query invalidation; si queda invalidación servidor, ejecutarla dentro de escritura autorizada. |

GET y mutation deben revalidar permisos en servidor aunque el UI o el query key contengan usuario. Mantener Prisma y secretos en módulos de servidor. Separar DTO cliente de `lib/prisma.ts`, que también instancia Prisma (`:48`), y usar imports sólo de tipos donde corresponda. Server Actions requieren sus propias comprobaciones: [documentación Next.js 14](https://nextjs.org/docs/14/app/building-your-application/data-fetching/server-actions-and-mutations).

## 4. Patrón común propuesto

### Fuente de verdad y límites

- **Servidor:** servicios por dominio con sesión, permisos, validación y Prisma. Route Handlers para lecturas cancelables y mutations HTTP. Server Actions existentes pueden envolverse en `useMutation` durante la transición; no hace falta reescribir cada transporte para conseguir coherencia cliente.
- **SDK:** funciones de transporte/DTO sin hooks. URLs de mismo origen (`/api/...`) para navegador; comprobación de status, `ApiError` con status/code, JSON tipado, `Content-Type`, query params mediante `URLSearchParams` y `AbortSignal`. Consultas privadas con política explícita sin caché HTTP compartida.
- **React Query:** datos remotos y ciclo pending/error/refetch, mutations y coherencia de vistas. Un provider **por encima de navegación y contenido**, estable durante sesión del dashboard; cliente distinto para SSR por petición si hay prefetch.
- **Zustand/local state:** fecha seleccionada, panel abierto, filtros de UI, selección temporal y borradores. No conservar copias permanentes de contracts, shares, notifications y relations en dos caches.
- **NextAuth:** sesión. `useProfile` consulta datos de perfil, sin inventar un segundo mecanismo de autenticación. Reset/cancel de queries privadas y slices al logout/cambio de usuario; proteger también resultados en vuelo.

### Keys y queries

Propuesta de fábrica compartida (ejemplo de diseño, no implementación):

```ts
scope(userId)                     // ['user', userId]
contracts.list(userId)            // ['user', userId, 'contracts', 'list']
contracts.detail(userId, id)      // ['user', userId, 'contracts', 'detail', id]
shares.list(userId)               // ['user', userId, 'shares', 'list']
notifications.list(userId, filter)// ['user', userId, 'notifications', 'list', filter]
profile(userId)                   // ['user', userId, 'profile']
providerRelations(userId)         // ['user', userId, 'provider-relations']
providers.catalog(userId)         // ['user', userId, 'providers', 'catalog']
users.search(userId, text)        // ['user', userId, 'users', 'search', text]
brands.search(text)               // ['brands', 'search', text]
```

Incluir filtros/paginación en key **si cambian lo solicitado al servidor**. Fecha seleccionada queda fuera cuando sólo cambia una derivación local. Las keys identifican los datos, no dan permisos: [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys).

Empezar con una lista canónica de contratos propios para minimizar la migración, derivando LOAN/SUBSCRIPTION/WORK con selectores puros (`unwrapLoan`/`unwrapSub`) y combinando shares según permisos. Evitar una query WORK y otra lista completa para representar indefinidamente la misma entidad. Para datasets grandes, medir y separar listas filtradas/paginadas y agregados; no introducir esa complejidad sin medir volumen/payload.

Definir `queryOptions` por recurso y hooks de dominio (`useLoans`, `useSubs`, `useProfile`) que adapten las queries a los contratos actuales del UI. Una lista canónica **no significa** que React Query normalice entidades automáticamente: lista, detalle y datos embebidos en shares necesitan actualización/invalidation explícita. No usar el detalle reducido actual como `initialData` de un DTO completo.

### Política inicial de frescura y UX

Valores de partida para validar con uso real, no cifras medidas:

| Recurso | `staleTime` inicial | Refetch/UX |
|---|---:|---|
| Contratos y shares | 60 s | Refetch al foco/reconectar cuando stale; invalidar al escribir. |
| Notificaciones | 15–30 s | Refetch al foco; polling sólo si hay requisito de recepción en vivo. |
| Perfil | 5 min | Invalidar tras editar; actualizar también sesión si cambia nombre visible. |
| Catálogo proveedores | 5 min | Invalidar alta; relaciones separadas con frescura de contratos. |
| Búsquedas | 30–60 s | Debounce 200–300 ms, longitud mínima, `enabled`, signal al fetch; caché privada corta para búsqueda de usuarios. |

Configurar `gcTime` de forma explícita, inicialmente 5 minutos; no persistir información privada en localStorage sin un requisito específico. Query retries acotados a fallos transitorios de red/5xx; sin retry automático de 401/403/validación y sin reintentos automáticos de mutations que puedan crear duplicados. TanStack considera stale los datos por defecto, puede refetch al montar/foco/reconectar y conserva queries inactivas cinco minutos: [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).

Skeleton para primer pending; mantener datos existentes durante `isFetching`; vacío distinto de error; error de fetch en segundo plano sin borrar datos válidos; error inline en formulario y toast común para mutation; botón bloqueado mientras pending, conservando borrador y modal si falla. En búsqueda, texto previo no debe reemplazar el resultado del término actual: pasar el signal permite cancelar transporte obsoleto ([Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)).

### Mutations e invalidación

| Mutación | Actualización/invalidation |
|---|---|
| Crear/editar/borrar loan o subscription | Lista de contratos + detalle afectado; relaciones de proveedores; shares con contrato embebido que pueda haber cambiado. El resumen se deriva de la lista. Eliminar detalle de caché al borrar. |
| Pausar/reanudar/cambiar precio | Mismo contrato lista/detalle; shares; todos los cálculos temporales se recomputan. |
| Crear WORK | Lista canónica (y key laboral mientras exista) + relaciones de proveedores. |
| Alta provider | Catálogo; devolver proveedor confirmado al selector del formulario. |
| Accept/reject share | Shares + notificaciones + detalle afectado/consultas de recursos accesibles. Respuesta servidor coherente, idealmente con ack en la misma operación; no intentar una transacción con llamadas cliente independientes. |
| Ack notification | Actualizar notificación confirmada y/o invalidar todas sus listas filtradas; bell deriva misma fuente. |
| Editar perfil | Perfil + sincronización de campos mostrados por sesión. |

Para una respuesta completa confirmada, `setQueryData` puede actualizar el detalle y la lista inmutablemente; invalidar relaciones y proyecciones dependientes. Nunca insertar DTO parcial o `undefined`. Comenzar sin optimistic updates para operaciones con periodos, permisos o efectos email. Ack puede hacerse optimista después de añadir cancelación, snapshot y rollback. `onSuccess` debe esperar invalidaciones relevantes antes de dar por finalizada la operación cuando la vista de destino depende del resultado: [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations).

## 5. Dashboard SPA y convivencia con RSC

Objetivo recomendado: shell autenticado en `app/dashboard/layout.tsx` y componentes cliente consumiendo queries dentro de un provider estable, con navegación Next `Link`/`useRouter`. El guard de sesión puede seguir en el layout servidor. Las APIs siguen autenticadas y la base de datos permanece en servidor. Convertir los datos del perfil/formularios a hooks cierra la principal excepción actual.

Hay dos alternativas de primer acceso:

| Alternativa | Ventaja | Coste/riesgo |
|---|---|---|
| Queries cliente tras shell | Menos acoplamiento RSC; sencilla operación SPA | Primera carga privada espera JS + requests; hace falta skeleton y consultas paralelas. |
| Prefetch servidor + hydrate inicial | Contenido inicial más rápido y transición suave | DTO, keys, timestamps y permisos deben coincidir; cliente SSR por petición; mayor complejidad. |

Recomiendo migrar con hidratación inicial de datos ya obtenidos por layout, o `initialData` controlado como puente, y medir si conviene retirar ese prefetch al terminar. Si se hidrata, usar `dehydrate`/`HydrationBoundary`, un cliente por petición y `staleTime` positivo. Evitar representar el mismo dato vivo a la vez en RSC y Query, porque el refetch cliente no sincroniza automáticamente el HTML del servidor. [Server Rendering & Hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr).

RSC puede seguir proporcionando guard y bootstrap aunque la experiencia interactiva sea SPA. Si el requisito final es eliminar también el bootstrap RSC de datos, se retira en la última fase tras comparar tiempos. No hacen falta React Router, export estático ni un backend separado. Mantener páginas públicas y MDX actuales sin cache de usuario.

## 6. Orden de migración y criterios de salida

| Fase | Prioridad y trabajo | Criterio para continuar |
|---|---|---|
| 0 | P0/P1: asegurar APIs/actions, permisos de share/detalle, validación, transacciones de periodos, filtro type y DTO | Usuario anónimo/ajeno no lee ni muta datos; owner y share aceptado funcionan; detalle sirve DTO suficiente. |
| 1 | P1: fetcher común, fábrica keys/queryOptions, provider arriba de navegación, aislamiento por sesión, error/UX común | Fetcher lanza errores HTTP; logout/account switch cancela y borra cache privada; bell dentro del provider. |
| 2 | P1: piloto perfil/WORK y mutations de edición/alta | Crear WORK o editar perfil actualiza la pantalla y navegación sin hard reload; no query key global por usuario. |
| 3 | P1: contracts y shares; adaptar `useLoans`/`useSubs`, todos sus consumidores y CRUD, pausa/precio/resume | Listado, detalle, resumen y calendario cambian juntos; fecha consistente; no copias de contratos en Zustand. |
| 4 | P1: notifications/bell y provider relations/catalog | Accept/reject/ack y CRUD no dejan indicadores/asociaciones antiguos; failure parcial controlado. |
| 5 | P2: búsquedas query/cancelación y retiro bootstrap de datos si las métricas lo justifican | No resultados fuera de orden, requests acotados y todos los estados de carga visibles. |
| 6 | P2: retirar slices remotas, invalidación pública y lecturas SDK desde RSC obsoletas; documentar patrón | Zustand sólo UI; ninguna pantalla privada exige refresh manual ni sincronización paralela de stores. |

Cada migración debe mover **todos los lectores y escritores de un recurso** o proporcionar un adaptador temporal de una sola dirección; no añadir dual writes permanentes Query + Zustand. Rollback por recurso antes de eliminar su slice. No mezclar en el mismo cambio la actualización mayor de Next/React y la sustitución completa de estado: aislar regresiones y coordinar con la auditoría tecnológica.

## 7. Validación necesaria al implementar

No se han ejecutado pruebas porque esta entrega sólo crea un reporte. La migración necesita pruebas de comportamiento, no snapshots que repitan hooks:

- API: anónimo, propietario, destinatario aceptado/pendiente/rechazado y tercero; falsificación de `userId`/id; delete y mutations de periodos; sesión expirada.
- Cliente: crear/editar/borrar → navegación entre detalle/lista/resumen/proveedores y vuelta atrás, sin recarga; pausa/reanudar/precio y cambio de mes; direct URL y hard reload.
- Coherencia: accept/reject share cambia acceso y notificaciones; ack cambia bell/lista; edición compartida por propietario se recoge al foco; error de segunda operación no queda oculto.
- Cache: dos cuentas en el mismo navegador, logout con requests en vuelo, SSR concurrente si se hidrata, ausencia de requests duplicados para keys idénticas.
- Errores: 400/401/403/404/500, red desconectada y respuesta no JSON; formulario retiene borrador; loading termina; sin retry peligroso de escrituras.
- Búsqueda: respuesta del término anterior más lenta, cerrar selector y desmontar, longitud mínima, límites servidor y encoding.
- Medición antes/después: tiempo a primer dato, número/payload de requests por navegación, renders en cambio de mes, refetch al foco y memoria por sesión. No prometer ahorro sin medir.

## Alcance y límites

El inventario cubre app/dashboard, providers, slices, SDK, acciones y rutas de recursos implicadas. Las evidencias son archivo/línea del checkout, y las prioridades son recomendaciones técnicas del auditor. No se han usado credenciales, consultado la base de datos, llamado APIs del proyecto ni ejecutado un análisis dinámico de producción. No se conocen volumen de datos, política externa de acceso ni tiempos actuales.

Las recomendaciones consultan documentación primaria oficial de TanStack v5 y Next.js 14. Las páginas `latest` incluyen funcionalidades posteriores a 5.45.1; el plan utiliza APIs v5 habituales y no presupone disponibilidad de opciones recientes como `staleTime: 'static'`. La guía avanzada SSR falló al cargar; se verificó la guía oficial general SSR/hidratación como respaldo. Actualización de versiones, vulnerabilidades generales y limpieza de dependencias pertenecen al reporte tecnológico separado.
