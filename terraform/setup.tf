terraform {
  required_providers {
    yandex = {
      source = "yandex-cloud/yandex"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = "3.6.2"
    }
  }

  backend "s3" {
    endpoint = "storage.yandexcloud.net"
    region   = "ru-central1"
    key      = "main/positions-postbox.tfstate"

    skip_region_validation      = true
    skip_credentials_validation = true
  }
}

provider "yandex" {
  zone                     = "ru-central1-a"
  service_account_key_file = "authorized_key.json"
}

provider "docker" {
  registry_auth {
    address  = "cr.yandex"
    username = "json_key"
    password = file("authorized_key.json")
  }
}
