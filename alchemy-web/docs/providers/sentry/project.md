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

```typescript
import { Project } from "@alchemy/providers/sentry";

// Create a basic project
const project = await Project("my-project", {
  name: "My Project",
  team: "my-team",
  organization: "my-org"
});

// Create a project with a custom slug
const project = await Project("custom-project", {
  name: "Custom Project",
  team: "my-team",
  organization: "my-org",
  slug: "custom-project-slug"
});

// Create a project with a custom auth token
const project = await Project("my-project", {
  name: "My Project",
  team: "my-team",
  organization: "my-org",
  authToken: alchemy.secret("my-auth-token")
});
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | The name for the project |
| `team` | `string` | Yes | The team slug that owns the project |
| `organization` | `string` | Yes | The organization ID or slug that owns the project |
| `slug` | `string` | No | Uniquely identifies a project and is used for the interface |
| `platform` | `string` | No | The platform for the project |
| `defaultRules` | `boolean` | No | Whether to alert on every new issue |
| `authToken` | `Secret` | No | Auth token to use (overrides environment variable) |
| `adopt` | `boolean` | No | Whether to adopt an existing project with the same slug if it exists |

## Output

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | The ID of the project |
| `name` | `string` | The name of the project |
| `slug` | `string` | The slug of the project |
| `platform` | `string` | The platform of the project |
| `defaultRules` | `boolean` | Whether to alert on every new issue |
| `team` | `object` | The team that owns the project |
| `teams` | `array` | All teams that have access to the project |
| `isBookmarked` | `boolean` | Whether the project is bookmarked |
| `isMember` | `boolean` | Whether the current user is a member of the project |
| `access` | `array` | Access permissions for the project |
| `hasAccess` | `boolean` | Whether the current user has access to the project |
| `dateCreated` | `string` | Time at which the project was created |
| `environments` | `array` | List of environments in the project |
| `eventProcessing` | `object` | Event processing status |
| `features` | `array` | List of features enabled for the project |
| `firstEvent` | `string` | Whether the project has received its first event |
| `firstTransactionEvent` | `boolean` | Whether the project has received its first transaction event |
| `hasSessions` | `boolean` | Whether the project has sessions |
| `hasProfiles` | `boolean` | Whether the project has profiles |
| `hasReplays` | `boolean` | Whether the project has replays |
| `hasFlags` | `boolean` | Whether the project has flags |
| `hasMonitors` | `boolean` | Whether the project has monitors |
| `hasFeedbacks` | `boolean` | Whether the project has feedback |
| `hasNewFeedbacks` | `boolean` | Whether the project has new feedback |
| `hasMinifiedStackTrace` | `boolean` | Whether the project has minified stack traces |
| `hasInsightsHttp` | `boolean` | Whether the project has HTTP insights |
| `hasInsightsDb` | `boolean` | Whether the project has database insights |
| `hasInsightsAssets` | `boolean` | Whether the project has asset insights |
| `hasInsightsAppStart` | `boolean` | Whether the project has app start insights |
| `hasInsightsScreenLoad` | `boolean` | Whether the project has screen load insights |
| `hasInsightsVitals` | `boolean` | Whether the project has vitals insights |
| `hasInsightsCaches` | `boolean` | Whether the project has cache insights |
| `hasInsightsQueues` | `boolean` | Whether the project has queue insights |
| `hasInsightsLlmMonitoring` | `boolean` | Whether the project has LLM monitoring |
| `platforms` | `array` | List of platforms in the project |
| `latestRelease` | `string` | Latest release information |
| `hasUserReports` | `boolean` | Whether the project has user reports |
| `latestDeploys` | `string` | Latest deployment information | 