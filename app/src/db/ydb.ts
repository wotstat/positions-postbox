import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { AuthorizedKeyCredentialsProvider } from './authorized-key'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'

const provider = Bun.env.LOCAL ?
  new AuthorizedKeyCredentialsProvider({ token: '' }) :
  new MetadataCredentialsProvider({
    endpoint: 'http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token',
    flavor: 'Google',
  })

export const db = new Driver(Bun.env.YDB_ENDPOINT, {
  credentialsProvider: provider
})

export const sql = query(db)




