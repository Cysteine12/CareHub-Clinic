import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import config from './config/config.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { appLogger } from './middlewares/logger.js'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { authRoute, googleAuthRoute } from './modules/auth/index.js'
import { appointmentRoute } from './modules/appointment/index.js'
import { appointmentProviderRoute } from './modules/appointment/index.js'
import { vitalsRoute } from './modules/vitals/index.js'
import { insuranceProviderRoute } from './modules/insuranceProvider/index.js'
import { providerRoute } from './modules/provider/index.js'
import { patientRoute } from './modules/patient/index.js'
import { soapNoteRoute } from './modules/soapnote/index.js'
import { userRoute } from './modules/user/index.js'

const app = express()

app.set('trust proxy', true)
app.use(appLogger)

app.use(
  cors({
    origin: config.ORIGIN_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Accept-Language',
      'X-Requested-With',
      'Content-Language',
      'Content-Type',
      'Origin',
      'Authorization',
      'X-Forwarded-For',
      'X-Real-IP',
    ],
    optionsSuccessStatus: 200,
    credentials: true,
  })
)

app.use(helmet())

app.use(express.json())
const originUrl = new URL(config.ORIGIN_URL)
const cookieDomain = originUrl.hostname

const isProduction = config.NODE_ENV === 'production'
const sameSite = isProduction ? 'none' : 'lax'

const PgSession = connectPgSimple(session)
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // isProduction,
      httpOnly: true,
      sameSite: 'lax',// sameSite,
      maxAge: config.SESSION_EXPIRATION_HOURS * 60 * 60 * 1000,
      // domain: cookieDomain,
    },
    store: new PgSession({
      conString: config.DATABASE_URL,
      createTableIfMissing: true,
    }),
  })
)

app.use('/api/auth', authRoute)
app.use('/api/auth/google', googleAuthRoute)
app.use('/api/insurance-providers', insuranceProviderRoute)
app.use('/api/providers', providerRoute)
app.use('/api/patients', patientRoute)
app.use('/api/appointment', appointmentRoute)
app.use('/api/provider/appointment', appointmentProviderRoute)
app.use('/api/provider/vitals', vitalsRoute)
app.use('/api/provider/soapnotes', soapNoteRoute)
app.use('/api/user', userRoute)
app.use('/api/vitals', vitalsRoute)
app.use('/api/soapnotes', soapNoteRoute)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
