/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 */

import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  allCognitoCredentials,
  createCognitoCredentials
} from '#/server/common/helpers/cognito-credentials-http-client.js'

const logger = createLogger()

export const pageLoad = {
  handler(_request, h) {
    return h.view('providers/index', {
      pageTitle: 'Software Providers',
      switchOrganisationHref: '/retrieve-software-providers',
      createClientHref: '/create-software-provider',
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

      softwareProviders = details.body.client_details.map(
        ({ client_name: clientName, client_id: clientId }) => [
          { text: clientName },
          { text: clientId }
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

export const createSoftwareProvider = {
  async handler(request, h) {
    let createdSoftwareProviders = []

    const { softwareProviderName } = request.payload

    logger.info(`Creating software provider [${softwareProviderName}]`)

    try {
      const response = await createCognitoCredentials({
        clientName: softwareProviderName
      })

      createdSoftwareProviders = response.body.client_details.map(
        ({
          client_name: clientName,
          client_id: clientId,
          client_secret: clientSecret
        }) => [{ text: clientName }, { text: clientId }, { text: clientSecret }]
      )
    } catch (error) {
      logger.error('Error creating software providers')
      logger.error(error)
    }

    return h.view('providers/index', {
      pageTitle: 'Software Providers',
      heading: 'Software Providers',
      createdClients: createdSoftwareProviders,
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
