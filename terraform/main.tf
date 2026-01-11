variable "cloud_id" { type = string }
variable "folder_id" { type = string }
variable "molz_session_token" { type = string }
variable "nalog_login" { type = string }
variable "nalog_password" { type = string }

variable "container_env" {
  type    = map(string)
  default = {}
}

data "yandex_resourcemanager_folder" "folder" {
  folder_id = var.folder_id
}

locals {
  project_name = "positions-postbox"
  folder_id    = data.yandex_resourcemanager_folder.folder.id
  folder_name  = data.yandex_resourcemanager_folder.folder.name
}

# REGISTRY
locals {
  app_path           = "${path.root}/../app"
  ignore             = [".node_modules/", ".output", ".nuxt", ".DS_Store", "build", "coverage", "tests/", ".env"]
  app_files          = [for f in fileset(path.cwd, "${local.app_path}/**") : f if length(regexall(join("|", local.ignore), f)) == 0]
  project_files_hash = sha1(join("", [for f in local.app_files : filesha1(f)]))
}

resource "yandex_container_registry" "registry" {
  name      = local.project_name
  folder_id = local.folder_id
}

resource "docker_registry_image" "registry" {
  name = docker_image.main.name

  triggers = {
    hash = local.project_files_hash
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "docker_image" "main" {
  name = "cr.yandex/${yandex_container_registry.registry.id}/main:latest"

  build {
    context = abspath(local.app_path)
  }

  triggers = {
    hash = local.project_files_hash
  }
}

# CONTAINER
resource "yandex_iam_service_account" "container_owner" {
  name        = "container-owner-${local.project_name}-${local.folder_name}"
  description = "Service account for pulling container images, run serverless containers, access YDB"
  folder_id   = local.folder_id
}

resource "yandex_iam_service_account" "postbox_sender" {
  name        = "postbox-sender-${local.project_name}-${local.folder_name}"
  description = "Service account for sending postbox"
  folder_id   = local.folder_id
}

resource "yandex_resourcemanager_folder_iam_member" "container_owner" {
  for_each = toset([
    "container-registry.images.puller",
    "ydb.editor",
  ])
  role      = each.key
  folder_id = local.folder_id
  member    = "serviceAccount:${yandex_iam_service_account.container_owner.id}"
}

resource "yandex_resourcemanager_folder_iam_member" "postbox_sender" {
  role      = "postbox.sender"
  folder_id = local.folder_id
  member    = "serviceAccount:${yandex_iam_service_account.postbox_sender.id}"
}

resource "yandex_iam_service_account_static_access_key" "postbox_sender_key" {
  service_account_id = yandex_iam_service_account.postbox_sender.id
  description        = "Access key for sending postbox"
}

resource "yandex_serverless_container" "container" {
  name               = local.project_name
  memory             = 512
  cores              = 1
  core_fraction      = 50
  concurrency        = 16
  folder_id          = var.folder_id
  service_account_id = yandex_iam_service_account.container_owner.id

  image {
    url    = docker_registry_image.registry.name
    digest = docker_registry_image.registry.sha256_digest
    environment = merge(var.container_env, {
      "LOG_VARIANT"         = "JSON",
      AWS_ACCESS_KEY_ID     = yandex_iam_service_account_static_access_key.postbox_sender_key.access_key,
      AWS_SECRET_ACCESS_KEY = yandex_iam_service_account_static_access_key.postbox_sender_key.secret_key,
      YDB_ENDPOINT          = yandex_ydb_database_serverless.ydb.ydb_full_endpoint,
      NALOG_LOGIN           = var.nalog_login,
      NALOG_PASSWORD        = var.nalog_password,
      MOLZ_SESSION_TOKEN    = var.molz_session_token,
    })
  }

  depends_on = [
    yandex_resourcemanager_folder_iam_member.container_owner,
    yandex_resourcemanager_folder_iam_member.postbox_sender,
  ]
}

resource "yandex_function_trigger" "trigger" {
  name      = local.project_name
  folder_id = var.folder_id
  container {
    id                 = yandex_serverless_container.container.id
    service_account_id = yandex_iam_service_account.container_owner.id
    retry_attempts     = 1
    retry_interval     = 10
    path               = "/check"
  }
  timer {
    cron_expression = "* * ? * * *"
    payload         = "check"
  }
}


# YDB

resource "yandex_ydb_database_serverless" "ydb" {
  name                = local.project_name
  folder_id           = var.folder_id
  deletion_protection = false

  serverless_database {
    enable_throttling_rcu_limit = false
    provisioned_rcu_limit       = 0
    storage_size_limit          = 10
    throttling_rcu_limit        = 0
  }
}
