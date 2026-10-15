import { contract } from './decode'
import { envelope, request } from './http'

export const workContractSdk = {
  create: (body: Record<string, FormDataEntryValue>) =>
    request(
      'work-contract',
      { method: 'POST', body: JSON.stringify(body) },
      envelope(contract)
    )
}
