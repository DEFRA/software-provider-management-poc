import { vi } from 'vitest'
import {
  DescribeUserPoolClientCommand,
  ListUserPoolClientsCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { getClientDetails } from './cognito-client.js'

const mockSend = vi.hoisted(() => vi.fn())

vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: vi.fn().mockImplementation(function () {
    return { send: mockSend }
  }),
  ListUserPoolClientsCommand: vi.fn(),
  DescribeUserPoolClientCommand: vi.fn()
}))

describe('#getClientDetails', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('Should return client details for all pool clients', async () => {
    mockSend
      .mockResolvedValueOnce({
        UserPoolClients: [
          { ClientId: 'abc123', UserPoolId: 'eu-west-2_testpool' },
          { ClientId: 'def456', UserPoolId: 'eu-west-2_testpool' }
        ]
      })
      .mockResolvedValueOnce({
        UserPoolClient: {
          ClientName: 'Provider One',
          ClientId: 'abc123',
          CreationDate: new Date('2026-05-19')
        }
      })
      .mockResolvedValueOnce({
        UserPoolClient: {
          ClientName: 'Provider Two',
          ClientId: 'def456',
          CreationDate: new Date('2026-05-20')
        }
      })

    const result = await getClientDetails()

    expect(result).toHaveLength(2)
    expect(result[0].UserPoolClient.ClientName).toBe('Provider One')
    expect(result[1].UserPoolClient.ClientName).toBe('Provider Two')
    expect(ListUserPoolClientsCommand).toHaveBeenCalledWith({
      UserPoolId: expect.any(String),
      MaxResults: 2
    })
    expect(DescribeUserPoolClientCommand).toHaveBeenCalledWith({
      UserPoolId: expect.any(String),
      ClientId: 'abc123'
    })
    expect(DescribeUserPoolClientCommand).toHaveBeenCalledWith({
      UserPoolId: expect.any(String),
      ClientId: 'def456'
    })
  })

  test('Should throw when ListUserPoolClientsCommand fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('Cognito unavailable'))

    await expect(getClientDetails()).rejects.toThrow(
      'Software provider retrieval failed'
    )
  })

  test('Should throw when DescribeUserPoolClientCommand fails', async () => {
    mockSend
      .mockResolvedValueOnce({
        UserPoolClients: [
          { ClientId: 'abc123', UserPoolId: expect.any(String) }
        ]
      })
      .mockRejectedValueOnce(new Error('Describe failed'))

    await expect(getClientDetails()).rejects.toThrow(
      'Software provider retrieval failed'
    )
  })
})
