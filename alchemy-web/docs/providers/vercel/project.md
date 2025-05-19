# Project

Create and manage Vercel projects.

## Authentication

To use this resource, set `VERCEL_ACCESS_TOKEN` in your `.env` file or pass `accessToken` directly in your resource configuration.

## Examples

### With `accessToken`

```ts
const project = await Project("my-app", {
  name: "my-app",
  framework: "astro",
  accessToken: alchemy.secret(process.env.VERCEL_ACCESS_TOKEN)
});
```

### With GitHub

```typescript
const project = await Project("my-app", {
  name: "my-app",
  framework: "nextjs",
  gitRepository: {
    type: "github",
    repo: "username/my-app"
  },
});
```

### With Secrets (Environment Variables)

```ts
const project = await Project("my-app", {
  name: "my-app",
  environmentVariables: [
    {
      key: "DATABASE_URL",
      value: alchemy.secret("DATABASE_URL"),
      type: "encrypted",
      target: ["production", "preview"]
    }
  ],
});
```

### With Custom Build Settings

```ts
const project = await Project("my-app", {
  name: "my-app",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  installCommand: "npm install",
  devCommand: "npm run dev",
});
```
