import { html } from "hono/html";
import type Cloudflare from "cloudflare";

export const Layout = (props: {
  title: string;
  description: string;
  children?: any;
}) => html`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${props.title}</title>
  <meta name="description" content="${props.description}">
  <head prefix="og: http://ogp.me/ns#">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${props.title}">
</head>
<body>
  ${props.children}
</body>
</html>
`;

export const Index = (props: {
  siteName: string;
  details: ReturnType<typeof ProjectDetail>;
  deployments: {
    production: Cloudflare.Pages.Projects.Deployment[];
    preview: Cloudflare.Pages.Projects.Deployment[];
  };
}) => html`
  <h1>${props.siteName}</h1>
  <div class="site-details">${props.details}</div>
  <h2>Deployments</h2>
  <hr />
  <h3>Production</h3>
  <div>${DeploymentList(props.deployments.production)}</div>
  <hr />
  <h3>Preview</h3>
  <div>${DeploymentList(props.deployments.preview)}</div>
`;

export const ProjectDetail = (
  projectInfo: Cloudflare.Pages.Projects.Project
) => html`
  ${projectInfo.subdomain
    ? html`<div>
        Sub domain:
        <a href="${projectInfo.subdomain}" target="_blank">
          ${projectInfo.subdomain}
        </a>
      </div>`
    : ""}
  ${projectInfo.source?.type === "github"
    ? html`<div>
        GitHub:
        <a
          href="https://github.com/${projectInfo.source?.config
            ?.owner}/${projectInfo.source?.config?.repo_name}"
          target="_blank"
        >
          ${projectInfo.source?.config?.owner}/${projectInfo.source?.config
            ?.repo_name}
        </a>
      </div>`
    : ""}
  ${projectInfo.build_config?.build_command
    ? html`<div>
        Build command:
        <code>${projectInfo.build_config.build_command}</code>
      </div>`
    : ""}
  ${projectInfo.build_config?.destination_dir
    ? html`<div>
        Destination directory:
        <code>${projectInfo.build_config.destination_dir}</code>
      </div>`
    : ""}
`;

export const DeploymentList = (
  deployments: Cloudflare.Pages.Projects.Deployment[]
) =>
  html`
    ${deployments.map(
      (deployment) => html`
        <p>
          <div>
            <b>
            ${deployment.deployment_trigger?.metadata?.branch}
            /
            ${
              deployment.deployment_trigger?.metadata?.commit_message?.split(
                "\n"
              )[0]
            }
            </b>
            <span>[${deployment.latest_stage?.status}]</span>
          </div>
          <div>
            <a href="/${deployment.id}">Detail</a>
            <span>·</span>
            <a
              href="${deployment.url}"
              target="_blank"
              rel="noopener noreferrer"
              >Preview</a
            >
          </div>
        </p>
      `
    )}
  `;
