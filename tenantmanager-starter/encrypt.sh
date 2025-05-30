
topsecret encrypt ./_decrypted/tenants/001_dev.env ./_encrypted/tenants/001_dev.secret --key-file=./_secret.key
topsecret encrypt ./_decrypted/tenants/002_test.env ./_encrypted/tenants/002_dev.secret --key-file=./_secret.key
topsecret encrypt ./_decrypted/tenants/003_prod.env ./_encrypted/tenants/003_prod.secret --key-file=./_secret.key