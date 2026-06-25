/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 */

import { createLogger } from '../../common/helpers/logging/logger.js'
import { getClientDetails } from '#/server/common/helpers/cognito-client.js'

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
    let message = ''
    let isSuccess = false
    let softwareProviders = []

    logger.info('retrieving software provider details...')

    try {
      const details = await getClientDetails()

      softwareProviders = details.map(
        ({ UserPoolClient: { ClientName, ClientId, CreationDate } }) => [
          { text: ClientName },
          { text: ClientId },
          { text: new Date(CreationDate).toLocaleDateString('en-GB') }
        ]
      )

      isSuccess = true
      message = 'Software providers retrieved successfully.'
    } catch (error) {
      message = 'Software provider retrieval failed'
    }

    return h.view('providers/index', {
      pageTitle: 'Software Providers',
      heading: 'Software Providers',
      message,
      isSuccess,
      head: [
        { text: 'Name' },
        { text: 'Client ID' },
        { text: 'Creation Date' }
      ],
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
