import { Hono } from "hono";
import Cloudflare from "cloudflare";
import { env } from "cloudflare:workers";
import { Layout, Index, ProjectDetail, DeploymentDetails } from "./templates";

const app = new Hono<{ Bindings: CloudflareBindings }>();
const client = new Cloudflare({ apiToken: env.CLOUDFLARE_API_TOKEN });

const DefaultLayout = (children?: any) =>
  Layout({
    title: env.PROJECT_NAME,
    description: env.PROJECT_DESCRIPTION,
    children: children,
  });

app.get("/", async (c) => {
  const projectInfo = await client.pages.projects.get(c.env.PROJECT_NAME, {
    account_id: c.env.CLOUDFLARE_ACCOUNT_ID,
  });

  const deploymentList: {
    production: Cloudflare.Pages.Projects.Deployment[];
    preview: Cloudflare.Pages.Projects.Deployment[];
  } = { production: [], preview: [] };

  for (const environment of ["production", "preview"] as const) {
    deploymentList[environment] = await client.pages.projects.deployments
      .list(c.env.PROJECT_NAME, {
        account_id: c.env.CLOUDFLARE_ACCOUNT_ID,
        env: environment,
        // @ts-expect-error - per_page exists in API but not in types in cloudflare@5.2.0
        per_page: environment === "production" ? 3 : 10,
      })
      .then((r) => r.result);
  }

  return c.html(
    DefaultLayout(
      Index({
        siteName: c.env.PROJECT_NAME,
        details: ProjectDetail(projectInfo),
        deployments: deploymentList,
      })
    )
  );
});

app.get("/details", async (c) => {
  const id = c.req.query("id");

  if (!id) return c.text("Missing deployment ID", 400);

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return c.text("Invalid deployment ID format", 400);

  const args = [
    c.env.PROJECT_NAME,
    id,
    { account_id: c.env.CLOUDFLARE_ACCOUNT_ID },
  ] as const;

  const [deploymentInfo, deploymentLogs] = await Promise.all([
    client.pages.projects.deployments.get(...args),
    client.pages.projects.deployments.history.logs.get(...args),
  ]);

  return c.html(
    DefaultLayout(DeploymentDetails(deploymentInfo, deploymentLogs))
  );
});

export default app;
