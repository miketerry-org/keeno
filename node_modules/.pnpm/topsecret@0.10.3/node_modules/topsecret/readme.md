CLI:

--encrypt-file <infile> <outFile>
-- decrypt-file <inFile> <outFile>
-- generate-key <outFile>. // if no file then print to console-- password-key
-- password-key <password> <outFile> // if no file then print to console

====
--random-key
-- password-key

- key : string
-
- saveKey(filename)
- password
- cypher : string
- encryptBuffer(buffer) : buffer
- decryptBuffer(buffer) : buffer
- encryptFile(srcFilename, dstFilename)
- decryptFile(srcFilename, dstFilename)
- encryptJSON(data) : buffer
- decryptJSON(buffer): JSON
- loadBuffer(filename)
- saveBuffer(filename, buffer)
  -LoadJSON(filename) : json
- saveJSON(filename,json)
- encryptDotEnv(filename)
- decryptDotEnv(filename)
