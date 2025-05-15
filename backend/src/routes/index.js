import express from 'express';
import { userRoutes } from './user.routes.js';
import {postRoutes} from './post.routes.js'
import { commentRoutes } from './comment.routes.js';
import { goalRoutes } from './goal.routes.js';
import { messageRoutes } from './message.routes.js';
import { eventRoutes } from './event.routes.js';
import { eventParticipantRoutes } from './eventparticipant.routes.js';
import { challengeParticipantRoutes } from './challengeparticipant.routes.js';
import { challengeRoutes } from './challenge.routes.js';
import { checkInRoutes } from './checkin.routes.js';
import { solicitationRoutes } from './solicitation.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { bigEventRoutes } from './bigevent.routes.js';
import { registrationRoutes } from './registration.routes.js';

const routes = express()

routes.use('/user', userRoutes)
routes.use('/post', postRoutes)
routes.use('/comment', commentRoutes)
routes.use('/goal', goalRoutes)
routes.use('/message', messageRoutes)
routes.use('/event', eventRoutes)
routes.use('/challenge', challengeRoutes)
routes.use('/eventparticipant', eventParticipantRoutes)
routes.use('/challengeparticipant', challengeParticipantRoutes)
routes.use('/checkin', checkInRoutes)
routes.use('/solicitation', solicitationRoutes)
routes.use('/notification', notificationRoutes)
routes.use('/bigevent', bigEventRoutes)
routes.use('/registration', registrationRoutes)


export {routes}
