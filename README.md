# poe-ai-companion-tools
Various tools for using generated LLM content with PoE planner, PoB, etc.

## PoE Atlas Tree CLI

A Node.js ES module CLI tool for generating PoE Planner URLs from atlas tree data and allocation profiles.

### Installation

Requires Node.js 14.0.0 or higher.

```bash
npm install
```

### Usage

```bash
node src/index.mjs --atlas-json <path> --profile <path> [options]
```

#### Required Arguments

- `--atlas-json <path>`: Path to atlas JSON file containing node definitions
- `--profile <path>`: Path to profile JSON file with allocated nodes

#### Optional Arguments

- `--base-url <url>`: Base URL for PoE Planner (default: `https://poeplanner.com/atlas-tree/`)
- `--help, -h`: Show help message

### Example

```bash
node src/index.mjs --atlas-json data/atlas.json --profile profiles/tree.json
```

### Data Formats

#### Profile JSON Format

```json
{
  "allocatedById": [1, 2, 3],
  "allocatedByName": ["Stream of Consciousness", "Essence Rush"]
}
```

Both `allocatedById` and `allocatedByName` are optional, but at least one must be provided.

#### Atlas JSON Format

```json
{
  "nodes": [
    {
      "id": 1,
      "name": "Stream of Consciousness",
      "description": "Your Maps cannot be modified by Sextants..."
    }
  ]
}
```

### Features

- ✅ Load atlas data from JSON files
- ✅ Support allocation by node ID
- ✅ Support allocation by node name
- ✅ Automatic name-to-ID resolution
- ✅ Validation of node IDs and names
- ✅ Compact base64url encoding for PoE Planner URLs
- ✅ Helpful error messages and warnings
