declare module "bun" {
  interface Env {
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    MOLZ_SESSION_TOKEN: string
    YDB_ENDPOINT: string
    NALOG_LOGIN: string
    NALOG_PASSWORD: string
    LOCAL?: string
  }
}