# Upstash Redis

Create and manage Upstash Redis databases with global replication.

## Usage

```typescript
import { UpstashRedis } from "alchemy/upstash";

// Create a basic Redis database in us-east-1
const redis = await UpstashRedis("my-redis", {
  name: "my-redis",
  primaryRegion: "us-east-1"
});

// Create a Redis database with read replicas
const redis = await UpstashRedis("my-redis", {
  name: "my-redis",
  primaryRegion: "us-east-1",
  readRegions: ["us-west-1", "us-west-2"]
});

// Create a Redis database with a monthly budget
const redis = await UpstashRedis("my-redis", {
  name: "my-redis",
  primaryRegion: "us-east-1",
  budget: 100
});

// Create a Redis database with eviction enabled
const redis = await UpstashRedis("my-redis", {
  name: "my-redis",
  primaryRegion: "us-east-1",
  eviction: true
});
```

## Configuration

### Required Environment Variables

- `UPSTASH_API_KEY`: Your Upstash API key
- `UPSTASH_EMAIL`: Your Upstash account email

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Name of the database |
| `primaryRegion` | `"us-east-1" \| "us-west-1" \| "us-west-2" \| "eu-west-1" \| "eu-central-1" \| "ap-southeast-1" \| "ap-southeast-2" \| "ap-northeast-1" \| "sa-east-1"` | Primary region for the database |
| `readRegions` | `UpstashRegion[]` | Optional read regions for replication |
| `budget` | `number` | Optional monthly budget in USD |
| `eviction` | `boolean` | Optional flag to enable/disable eviction for the database |

### Output

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Database ID |
| `name` | `string` | Database name |
| `databaseType` | `string` | Pricing model type |
| `region` | `"global"` | Region (always "global") |
| `port` | `number` | Database port |
| `createdAt` | `number` | Creation timestamp |
| `state` | `string` | Database state |
| `password` | `Secret` | Database password |
| `userEmail` | `string` | Owner email |
| `endpoint` | `string` | Database endpoint |
| `tls` | `boolean` | TLS enabled |
| `restToken` | `Secret` | REST API token |
| `readOnlyRestToken` | `Secret` | Read-only REST API token |
| `eviction` | `boolean` | Whether eviction is enabled | 