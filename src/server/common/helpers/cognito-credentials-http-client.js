import Wreck from '@hapi/wreck'
import { createLogger } from '#/server/common/helpers/logging/logger.js'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { HttpRequest } from '@smithy/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { config } from '#/config/config.js'

const logger = createLogger()
const { baseUrl, region } = config.get('cognito')

const fetchDetailsPath = `/dev/tenants/services/waste-movement-external-api/user-pool/fetch-details`
const createClientPath = `/dev/tenants/services/waste-movement-external-api/user-pool/create-clients`

const signer = new SignatureV4({
  credentials: defaultProvider(),
  region,
  service: 'execute-api',
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

  const signed = await signer.sign(requestToSign)

  const { res, payload } = await Wreck.get(
    `https://${baseUrl}${fetchDetailsPath}`,
    {
      headers: signed.headers,
      json: true
    }
  )

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

  return payload
}

async function createCognitoCredentials(clientName) {
  logger.info('Creating a new Cognito client...')

  const body = JSON.stringify({ client_names: [clientName] })

  const requestToSign = new HttpRequest({
    method: 'POST',
    protocol: 'https:',
    hostname: baseUrl,
    path: createClientPath,
    headers: {
      host: baseUrl,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body).toString()
    },
    body
  })

  const signed = await signer.sign(requestToSign)

  logger.info('*********')
  logger.info(`https://${baseUrl}${createClientPath}`)
  logger.info('*********')

  const { res, payload } = await Wreck.post(
    `https://${baseUrl}${createClientPath}`,
    {
      headers: signed.headers,
      json: true,
      payload: signed.body
    }
  )

  if (res.statusCode !== 200) {
    logger.error(
      `Failed to create Cognito credentials. Status code: ${res.statusCode} with payload ${JSON.stringify(payload)}`
    )
    throw new Error(
      `Failed to create Cognito credentials. Status code: ${res.statusCode}`
    )
  }

  logger.info('Successfully created Cognito credentials')
  logger.info(payload.body)

  return payload
}

export { allCognitoCredentials, createCognitoCredentials }
