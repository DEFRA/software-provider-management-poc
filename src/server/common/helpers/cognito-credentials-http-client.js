import Wreck from '@hapi/wreck'
import { createLogger } from '#/server/common/helpers/logging/logger.js'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { HttpRequest } from '@smithy/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { config } from '#/config/config.js'

const logger = createLogger()
const { baseUrl, region } = config.get('cognito')
const serviceName = config.get('serviceName')

const fetchDetailsPath = `/dev/tenants/services/${serviceName}/user-pool/fetch-details`

const signer = new SignatureV4({
  credentials: defaultProvider(),
  region,
  service: serviceName,
  sha256: Sha256
})

async function allCognitoCredentials() {
  logger.info('Fetching all Cognito credentials from the backend service...')

  const requestToSign = new HttpRequest({
    method: 'GET',
    protocol: 'https:',
    hostname: baseUrl,
    path: fetchDetailsPath,
    headers: {
      host: baseUrl
    }
  })

  let signed
  try {
    signed = await signer.sign(requestToSign)
  } catch (error) {
    logger.error('Error signing the request:', error)
    throw new Error('Error signing the request: ' + error.message)
  }

  let res, payload
  try {
    ;({ res, payload } = await Wreck.get(
      `https://${baseUrl}${fetchDetailsPath}`,
      {
        headers: signed.headers,
        method: signed.method
      }
    ))
  } catch (error) {
    logger.error('Error fetching Cognito credentials:', error)
    throw new Error('Error fetching Cognito credentials: ' + error.message)
  }

  if (res.statusCode !== 200) {
    logger.error(
      `Failed to fetch Cognito credentials. Status code: ${res.statusCode}`
    )
    throw new Error(
      `Failed to fetch Cognito credentials. Status code: ${res.statusCode}`
    )
  }

  logger.info(
    'Successfully fetched all Cognito credentials from the backend service.'
  )
  logger.info(payload)
  return payload
}

export { allCognitoCredentials }
