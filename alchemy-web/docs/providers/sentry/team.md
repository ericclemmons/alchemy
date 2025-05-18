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

```typescript
import { Team } from "@alchemy/providers/sentry";

// Create a basic team
const team = await Team("my-team", {
  name: "My Team",
  organization: "my-org"
});

// Create a team with a custom slug
const team = await Team("custom-team", {
  name: "Custom Team",
  organization: "my-org",
  slug: "custom-team-slug"
});

// Create a team with a custom auth token
const team = await Team("my-team", {
  name: "My Team",
  organization: "my-org",
  authToken: alchemy.secret("my-auth-token")
});
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | The name for the team |
| `organization` | `string` | Yes | The organization ID or slug that owns the team |
| `slug` | `string` | No | Uniquely identifies a team and is used for the interface |
| `authToken` | `Secret` | No | Auth token to use (overrides environment variable) |
| `adopt` | `boolean` | No | Whether to adopt an existing team with the same slug if it exists |

## Output

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | The ID of the team |
| `name` | `string` | The name of the team |
| `slug` | `string` | The slug of the team |
| `dateCreated` | `string` | Time at which the team was created |
| `isMember` | `boolean` | Whether the current user is a member of the team |
| `teamRole` | `string` | The role of the current user in the team |
| `flags` | `object` | Team flags |
| `access` | `array` | Access permissions for the team |
| `hasAccess` | `boolean` | Whether the current user has access to the team |
| `isPending` | `boolean` | Whether the team membership is pending |
| `memberCount` | `number` | Number of members in the team |
| `avatar` | `object` | Team avatar information |

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