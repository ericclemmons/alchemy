---
title: Managing Sentry Projects with Alchemy
description: Learn how to create, configure, and manage Sentry projects using Alchemy.
---

# Sentry Project

Create and manage Sentry projects.

## Authentication

You can authenticate with Sentry in two ways:

1. Environment variable (recommended):
   ```bash
   # .env
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

2. Pass the token directly:
   ```typescript
   const project = await Project("my-project", {
     name: "My Project",
     organization: "my-org",
     team: "my-team",
     authToken: "your_auth_token"
   });
   ```

Get your auth token from [Sentry's API settings](https://sentry.io/settings/account/api/auth-tokens/).

## Usage

# Project

The Project resource lets you create and manage [Sentry](https://sentry.io) projects within your teams.

## Minimal Example

Create a basic Sentry project:

```ts
import { Project } from "alchemy/sentry";

const project = await Project("my-project", {
  name: "My Project",
  team: "my-team",
  organization: "my-org"
});
```

## Custom Platform

Create a project for a specific platform:

```ts
import { Project } from "alchemy/sentry";

const project = await Project("js-project", {
  name: "JavaScript Project",
  team: "my-team",
  organization: "my-org",
  platform: "javascript"
});
```

## Custom Slug and Rules

Create a project with a custom slug and disabled default rules:

```ts
import { Project } from "alchemy/sentry";

const project = await Project("custom-project", {
  name: "Custom Project",
  team: "my-team",
  organization: "my-org",
  slug: "custom-project-slug",
  defaultRules: false
});
```

## Adopt Existing Project

Create or adopt an existing project with the same slug:

```ts
import { Project } from "alchemy/sentry";

const project = await Project("existing-project", {
  name: "Existing Project",
  team: "my-team",
  organization: "my-org",
  adopt: true
});
``` 