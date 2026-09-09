import { vi } from 'vitest'
import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'
import { getClientDetails } from '#/server/common/helpers/cognito-client.js'

vi.mock('#/server/common/helpers/cognito-client.js', () => ({
  getClientDetails: vi.fn()
}))

describe('#softwareProvidersController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should display software providers page on GET', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/software-providers'
    })

    expect(result).toEqual(expect.stringContaining('Software Providers'))
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should display error on failed retrieval', async () => {
    getClientDetails.mockRejectedValue(new Error('Cognito error'))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/retrieve-software-providers'
    })

    expect(result).toEqual(
      expect.stringContaining('Software provider retrieval failed')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})
