import { setupServer } from 'msw/node'
import { restHandlers } from './handler'

export const server  = setupServer(...restHandlers)