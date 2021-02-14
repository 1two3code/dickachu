import cdk = require("@aws-cdk/core")
import { StaticSiteStack } from "./stacks/s3-static-site-with-cloudfront"

const app = new cdk.App()
const staticSite = new StaticSiteStack(app, "Dickachu", {
  env: {
    account: '',
    region: '',
  },
  domainName: "dickachu.com",
  siteSubDomain: "yolo",
})

// example of adding a tag - please refer to AWS best practices for ideal usage
cdk.Tags.of(staticSite).add("Dickachu", "Static Web")

app.synth()