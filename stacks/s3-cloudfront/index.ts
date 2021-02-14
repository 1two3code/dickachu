import cloudfront = require("@aws-cdk/aws-cloudfront")
import route53 = require("@aws-cdk/aws-route53")
import s3 = require("@aws-cdk/aws-s3")
import s3deploy = require("@aws-cdk/aws-s3-deployment")
import acm = require("@aws-cdk/aws-certificatemanager")
import cdk = require("@aws-cdk/core")
import targets = require("@aws-cdk/aws-route53-targets/lib")
import { Stack, App, StackProps } from "@aws-cdk/core"
import path = require("path")

export interface StaticSiteProps extends StackProps {
  domainName: string
  siteSubDomain: string
}

export class StaticSiteStack extends Stack {
  constructor(parent: App, name: string, props: StaticSiteProps) {
    super(parent, name, props)

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    })
    const siteDomain = props.siteSubDomain + "." + props.domainName
    new cdk.CfnOutput(this, "Site", { value: "https://" + siteDomain })

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: siteDomain,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    new cdk.CfnOutput(this, "Bucket", { value: siteBucket.bucketName })

    const certificateArn = new acm.DnsValidatedCertificate(
      this,
      "SiteCertificate",
      {
        domainName: `*.${props.domainName}`,
        hostedZone: zone,
        region: "us-east-1", // cloudfront certs always us-east-1
      }
    ).certificateArn
    new cdk.CfnOutput(this, "Certificate", { value: certificateArn })

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "SiteDistribution",
      {
        aliasConfiguration: {
          acmCertRef: certificateArn,
          names: [siteDomain],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            customOriginSource: {
              domainName: siteBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    )
    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    })

    new route53.ARecord(this, "SiteAliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone,
    })

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset(path.resolve(__dirname, '../../dickachu'))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    })
  }
}