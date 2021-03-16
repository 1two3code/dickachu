import cdk = require("@aws-cdk/core")
import { StaticSiteStack } from "./stacks/s3-cloudfront"

const app = new cdk.App()
const staticSite = new StaticSiteStack(app, "Dickachu", {
  env: {
    account: '814967776290',
    region: 'eu-north-1',
  },
  domainName: "dickachu.com",
  siteSubDomain: "yolo",
})

cdk.Tags.of(staticSite).add("Dickachu", "Static Web")

app.synth()