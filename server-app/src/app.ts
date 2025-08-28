import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import config from './config/config.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { appLogger } from './middlewares/logger.js'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import {
  googleAuthRoute,
  patientAuthRoute,
  providerAuthRoute,
} from './modules/auth/index.js'
import {
  patientAppointmentRoute,
  providerAppointmentRoute,
} from './modules/appointment/index.js'
import { vitalRoute } from './modules/vital/index.js'
import { insuranceProviderRoute } from './modules/insuranceProvider/index.js'
import { providerRoute } from './modules/provider/index.js'
import { patientRoute } from './modules/patient/index.js'
import { soapNoteRoute } from './modules/soapNote/index.js'
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

const PgSession = connectPgSimple(session)
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: config.SESSION_EXPIRATION_HOURS * 60 * 60 * 1000,
    },
    store: new PgSession({
      conString: config.DATABASE_URL,
      createTableIfMissing: true,
    }),
  })
)

app.get('/', (req, res) =>
  res.json({ message: `Welcome to ${config.APP_NAME}` })
)

app.use('/api/auth/patient', patientAuthRoute)
app.use('/api/auth/provider', providerAuthRoute)
app.use('/api/auth/google', googleAuthRoute)
app.use('/api/insurance-providers', insuranceProviderRoute)
app.use('/api/providers', providerRoute)
app.use('/api/patients', patientRoute)
app.use('/api/user', userRoute)
app.use('/api/patient/appointments', patientAppointmentRoute)
app.use('/api/provider/appointments', providerAppointmentRoute)
app.use('/api/vitals', vitalRoute)
app.use('/api/soap-notes', soapNoteRoute)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
