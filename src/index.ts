import { Hono } from "hono";
import Cloudflare from "cloudflare";
import { env } from "cloudflare:workers";
import { Layout, Index, ProjectDetail } from "./templates";

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

export default app;
