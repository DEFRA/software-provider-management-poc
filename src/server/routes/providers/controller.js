/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 */

import { createLogger } from '../../common/helpers/logging/logger.js'
import { allCognitoCredentials } from '#/server/common/helpers/cognito-credentials-http-client.js'

const logger = createLogger()

export const pageLoad = {
  handler(_request, h) {
    return h.view('providers/index', {
      pageTitle: 'Software Providers',
      switchOrganisationHref: '/retrieve-software-providers',
      heading: 'Software Providers',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Software Providers'
        }
      ]
    })
  }
}

export const retrieveSoftwareProviders = {
  async handler(_request, h) {
    let isSuccess = true
    let softwareProviders = []

    logger.info('retrieving software provider details...')

    try {
      const details = await allCognitoCredentials()

      logger.info('retrieve software provider details...')
      logger.info(details)

      softwareProviders = details.map(
        ({ UserPoolClient: { ClientName, ClientId, CreationDate } }) => [
          { text: ClientName },
          { text: ClientId },
          { text: new Date(CreationDate).toLocaleDateString('en-GB') }
        ]
      )
    } catch (error) {
      logger.error('Error retrieving software provider details...')
      logger.error(error)
      isSuccess = false
    }

    return h.view('providers/index', {
      pageTitle: 'Software Providers',
      heading: 'Software Providers',
      isSuccess,
      rows: softwareProviders,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Software Providers'
        }
      ]
    })
  }
}
