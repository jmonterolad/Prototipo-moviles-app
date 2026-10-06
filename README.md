# Reserva de la Móvil — Demo

Demo para reservar la móvil (vehículo promocional). Guatemala, **una sola
móvil**, **sin login**. El centro de todo es el calendario.

## Cómo correrlo

```bash
npm install          # instala y corre prisma generate solo

cp .env.example .env # pegá tu DATABASE_URL de Postgres

npm run db:push      # crea las tablas
npm run db:seed      # carga 3 reservas de ejemplo
npm run dev          # http://localhost:3000
```

Para la base de datos: [neon.tech](https://neon.tech) es lo más rápido para
probar hoy (gratis, sin tarjeta, 2 minutos). Para la demo en vivo con el
cliente, Railway (~$5/mes) porque no tiene la pausa de varios segundos del
free tier de Supabase.

## Cómo funciona

**Calendario** → elegís un día → **panel de horarios** → elegís bloques →
**formulario** → confirmás.

- **Bloques de 2 horas**, más atajos de "toda la mañana" y "toda la tarde"
- **Mínimo 5 días de anticipación**: los días más cercanos salen apagados y
  no se pueden tocar
- Un día con horarios ocupados muestra un punto ámbar; si ya no queda nada
  libre, punto rojo y el día queda deshabilitado
- Un bloque ya reservado muestra **quién** lo reservó, de qué CD y a qué
  punto de venta va — no se oculta nada
- **Formulario**: nombre de quien va a usarla, CD (dropdown de las cuatro)
  y punto de venta (texto libre)
- **`/historial`**: el audit log, cada reserva y cancelación en orden

## Dónde cambiar las cosas que van a cambiar

| Qué | Dónde |
|---|---|
| Horarios de los bloques | `src/lib/slots.ts` → `TIME_BLOCKS` |
| Los 5 días de anticipación | `src/lib/slots.ts` → `ADVANCE_DAYS` |
| Las CDs | `src/lib/cds.ts` + el enum `CD` en `prisma/schema.prisma` |
| Reglas de reserva | `src/actions/reservations.ts` |

Los horarios que puse (8–12 y 1–5) **son un supuesto mío**. Cuando te
confirmen la jornada real de la móvil, cambiás `TIME_BLOCKS` y el
calendario, el formulario y las validaciones se acomodan solos.

## Lo que NO puede hacer sin login (importante)

Sin identidad, **cualquiera que abra el link puede cancelar cualquier
reserva**. La app pide el nombre de quien cancela y lo guarda en el
historial, así que queda el rastro — pero no hay nada que lo impida.

Para el demo está bien. Es justo lo que resolvería el login con teléfono +
contraseña cuando llegue el momento: ahí cada reserva queda amarrada a un
usuario y solo esa persona (o un admin) la puede cancelar.

## Stack

- **Next.js 15 (App Router) + TypeScript** — front y back en un solo proyecto
- **PostgreSQL + Prisma**
- **Tailwind CSS**

Notas de modelado, por si volvés al código en un mes:

- La fecha se guarda como string `"YYYY-MM-DD"`, no como `DateTime`. Guatemala
  es UTC-6 y un `Date` mal construido corre el día completo — es el bug más
  fácil de que te haga ver roto el demo enfrente del cliente.
- Los bloques se guardan como texto separado por coma (`"08-10,10-12"`).
  Con una sola móvil, chequear el traslape en código es suficiente y se lee
  claro. Si algún día son varias móviles, ahí sí conviene una tabla aparte
  con constraint único.

## Responsive

- **Móvil → tablet**: calendario arriba, panel del día abajo (apilado)
- **Desktop** (`lg:`+): dos columnas lado a lado, mes completo y detalle a la vez

## Si después quieren login por teléfono

Es totalmente viable y es la decisión correcta para gente poco tecnológica.
Sería: agregar un modelo `User` con `phone` + `passwordHash`, Auth.js con un
provider de credenciales usando el teléfono como identificador, y en
`Reservation` un `userId` en vez del `requesterName` de texto libre. El resto
del calendario y los horarios no cambia.
