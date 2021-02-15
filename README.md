# dickachu
Just a static html site and a CDK deployment for AWS static site hosting.

### Run local http-server
```
npm i -g http-server
cd dikachu && http-server
```

### Deploy
1. Register domain
2. Create a public certificate for domain at AWS (Certificate Manager)
3. Add AWS Account Id and domain to the cdk.json file and index.ts
4. Deploy stack (`npm run build && npm run synth && npm run deploy`)
5. Set domain nameservers to point to AWS Route 53 (resource created on stack deploy)
