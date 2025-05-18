---
title: Managing Sentry Teams with Alchemy
description: Learn how to create, configure, and manage Sentry teams using Alchemy.
---

# Sentry Team

Create and manage Sentry teams.

## Authentication

You can authenticate with Sentry in two ways:

1. Environment variable (recommended):
   ```bash
   # .env
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

2. Pass the token directly:
   ```typescript
   const team = await Team("my-team", {
     name: "My Team",
     organization: "my-org",
     authToken: "your_auth_token"
   });
   ```

Get your auth token from [Sentry's API settings](https://sentry.io/settings/account/api/auth-tokens/).

## Usage

# Team

The Team resource lets you create and manage [Sentry](https://sentry.io) teams within your organization.

## Minimal Example

Create a basic Sentry team:

```ts
import { Team } from "alchemy/sentry";

const team = await Team("my-team", {
  name: "My Team",
  organization: "my-org"
});
```

## Custom Slug

Create a team with a custom slug:

```ts
import { Team } from "alchemy/sentry";

const team = await Team("custom-team", {
  name: "Custom Team",
  organization: "my-org",
  slug: "custom-team-slug"
});
```

## Adopt Existing Team

Create or adopt an existing team with the same slug:

```ts
import { Team } from "alchemy/sentry";

const team = await Team("existing-team", {
  name: "Existing Team",
  organization: "my-org",
  adopt: true
});
``` 