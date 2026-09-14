import {
  pageLoad,
  retrieveSoftwareProviders,
  createSoftwareProvider
} from './controller.js'

/**
 * Sets up the routes used in the /about page.
 * These routes are registered in src/server/router.js.
 */
export const softwareProviders = {
  openRoutes: [
    {
      method: 'GET',
      path: '/software-providers',
      ...pageLoad
    },
    {
      method: 'GET',
      path: '/retrieve-software-providers',
      ...retrieveSoftwareProviders
    },
    {
      method: 'POST',
      path: '/create-software-provider',
      ...createSoftwareProvider
    }
  ]
}
