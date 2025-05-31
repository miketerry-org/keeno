
topsecret encrypt _server.env _server.secret --key-file _secret.key
topsecret encrypt _tenants/001_dev.env _tenants/001_dev.secret --key-file _secret.key
topsecret encrypt _tenants/002_test.env _tenants/002_test.secret --key-file _secret.key
topsecret encrypt _tenants/003_prod.env _tenants/003_prod.secret --key-file _secret.key
