import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  ListUserPoolClientsCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { createLogger } from '#/server/common/helpers/logging/logger.js'
import { config } from '#/config/config.js'
import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import { HttpsProxyAgent } from 'hpagent'

const logger = createLogger()
const { userPoolId, region, pageSize } = config.get('cognito')

const client = new CognitoIdentityProviderClient({
  region,
  requestHandler: new NodeHttpHandler({
    httpsAgent: new HttpsProxyAgent({ proxy: config.get('httpProxy') })
  })
})
export const getClientDetails = async () => {
  logger.info('retrieving client details...')

  try {
    const response = await client.send(
      new ListUserPoolClientsCommand({
        UserPoolId: userPoolId,
        MaxResults: pageSize
      })
    )

    if (!response?.UserPoolClients?.length) {
      logger.warn('No user pool clients found')
      return []
    }

    return await Promise.all(
      response.UserPoolClients.map(({ ClientId, UserPoolId }) =>
        client.send(
          new DescribeUserPoolClientCommand({
            UserPoolId,
            ClientId
          })
        )
      )
    )
  } catch (error) {
    logger.error(error)
    throw new Error('Software provider retrieval failed')
  }
}
