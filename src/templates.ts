import { html } from "hono/html";
import type Cloudflare from "cloudflare";

export const Layout = (props: {
  title: string;
  children?: any;
}) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${props.title}</title>
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
  <div>${props.details}</div>
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
  <dl>
    <dt>Sub domain</dt>
    <dd>
      <a href="${projectInfo.subdomain}" target="_blank">
        ${projectInfo.subdomain}
      </a>
    </dd>

    <dt>Build command</dt>
    <dd><code>${projectInfo.build_config?.build_command}</code></dd>

    <dt>Destination directory</dt>
    <dd>${projectInfo.build_config?.destination_dir}</dd>

    ${projectInfo.source?.type === "github"
      ? html`
          <dt>GitHub</dt>
          <dd>
            <a
              href="https://github.com/${projectInfo.source?.config
                ?.owner}/${projectInfo.source?.config?.repo_name}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${projectInfo.source?.config?.owner}/${projectInfo.source?.config
                ?.repo_name}
            </a>
          </dd>
        `
      : ""}
  </dl>
`;

export const DeploymentDetails = (
  deployment: Cloudflare.Pages.Projects.Deployment,
  deploymentLogs: Cloudflare.Pages.Projects.Deployments.History.Logs.LogGetResponse
) => html`
  <h1>Deployment Details</h1>
  <nav><a href="/">< Back</a></nav>
  <div>${DeploymentSummary(deployment)}</div>
  <hr />
  ${DeploymentLogs(deploymentLogs)}
`;

const DeploymentList = (deployments: Cloudflare.Pages.Projects.Deployment[]) =>
  html`
    ${deployments.map(
      (deployment) => html`<p>${DeploymentListItem(deployment)}</p>`
    )}
  `;

const DeploymentListItem = (
  deployment: Cloudflare.Pages.Projects.Deployment
) => html`
  <div>
    <b>
      ${deployment.deployment_trigger?.metadata?.branch} /
      ${deployment.deployment_trigger?.metadata?.commit_message?.split("\n")[0]}
    </b>
    <span>[${deployment.latest_stage?.status}]</span>
  </div>
  <div>
    <a href="/details?id=${deployment.id}">Detail</a>
    <span>·</span>
    <a href="${deployment.url}" target="_blank" rel="noopener noreferrer"
      >Preview</a
    >
  </div>
`;

const DeploymentSummary = (
  deployment: Cloudflare.Pages.Projects.Deployment
) => html`
  <dl>
    <dt>Status</dt>
    <dd>${deployment.latest_stage?.status}</dd>
    <dt>Created On</dt>
    <dd>
      ${deployment.created_on?.split("T")[0]}
      ${deployment.created_on?.slice(11, 23)}
    </dd>
    <dt>Branch</dt>
    <dd>${deployment.deployment_trigger?.metadata?.branch}</dd>
    <dt>Commit Hash</dt>
    <dd>${deployment.deployment_trigger?.metadata?.commit_hash}</dd>
    <dt>Commit Message</dt>
    <dd>
      <pre>${deployment.deployment_trigger?.metadata?.commit_message}</pre>
    </dd>
  </dl>
  <details>
    <summary>Build Settings</summary>
    <dl>
      <dt>Build Command</dt>
      <dd><code>${deployment.build_config?.build_command}</code></dd>
      <dt>Destination Directory</dt>
      <dd>${deployment.build_config?.destination_dir}</dd>
    </dl>
  </details>
  <menu>
    <a href="${deployment.url}" target="_blank" rel="noopener noreferrer">
      Preview
    </a>
    ${deployment.source?.type === "github"
      ? html`
          <span>·</span>
          <a
            href=${"https://github.com/" +
            deployment.source.config?.owner +
            "/" +
            deployment.source.config?.repo_name +
            "/tree/" +
            deployment.deployment_trigger?.metadata?.branch}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Branch
          </a>
          <span>·</span>
          <a
            href=${"https://github.com/" +
            deployment.source.config?.owner +
            "/" +
            deployment.source.config?.repo_name +
            "/commit/" +
            deployment.deployment_trigger?.metadata?.commit_hash}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Commit
          </a>
        `
      : ""}
  </menu>
`;

const DeploymentLogs = (
  logs: Cloudflare.Pages.Projects.Deployments.History.Logs.LogGetResponse
) =>
  html`<pre>
${logs.data
      // Same ts slice as Cloudflare dashboard
      ?.map((item) => `[${item.ts?.slice(11, 23)}] ${item.line}`)
      .join("\n")
      // Remove ANSI escape codes
      .replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      )}</pre
  >`;
