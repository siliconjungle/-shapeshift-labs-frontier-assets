import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  compileAssetCatalog,
  createAssetCatalog,
  createAssetProof,
  createAssetRegistryGraph,
  decodeAssetJsonl,
  encodeAssetJsonl,
  planAssetReview,
  queryAssetCatalog,
  traceAssetImpact,
  validateAssetCatalog
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');
const repoRoot = path.basename(path.dirname(packageDir)) === 'packages'
  ? path.resolve(packageDir, '..', '..')
  : packageDir;
const args = parseArgs(process.argv.slice(2));
const assetCount = readPositiveInt(args.assets, 1000);
const rounds = readPositiveInt(args.rounds, 30);
const outPath = args.out ? path.resolve(repoRoot, args.out) : null;

const input = makeCatalogInput(assetCount);
let catalog = createAssetCatalog(input);
let compiled = compileAssetCatalog(catalog);
let impact = traceAssetImpact(compiled, { changedResources: ['shader:shader-1'] });
let review = planAssetReview(compiled, { changedResources: ['shader:shader-1'] });
let jsonl = encodeAssetJsonl([impact, review]);
let cursor = 0;

const rows = [
  measure('create-catalog-' + assetCount, 8, () => {
    catalog = createAssetCatalog(input);
    return catalog.resources.length;
  }),
  measure('compile-catalog-' + assetCount, 8, () => {
    compiled = compileAssetCatalog(catalog);
    return compiled.resourcesById.size;
  }),
  measure('validate-catalog-' + assetCount, 8, () => validateAssetCatalog(catalog).issues.length),
  measure('query-output', 32, () => queryAssetCatalog(compiled, { outputs: ['dist/asset-' + (cursor++ % assetCount) + '.glb'] }).resources.length),
  measure('query-kind', 32, () => queryAssetCatalog(compiled, { kinds: ['shader'] }).resources.length),
  measure('trace-shader-impact', 16, () => {
    impact = traceAssetImpact(compiled, { changedResources: ['shader:shader-' + (cursor++ % 16)] });
    return impact.resourceIds.length + impact.consumerIds.length;
  }),
  measure('trace-file-impact', 16, () => {
    impact = traceAssetImpact(compiled, { changedFiles: ['art/asset-' + (cursor++ % assetCount) + '.blend'] });
    return impact.resourceIds.length + impact.outputUris.length;
  }),
  measure('plan-review', 8, () => {
    review = planAssetReview(compiled, { changedResources: ['material:material-' + (cursor++ % 16)] });
    return review.reviewItems.length;
  }),
  measure('registry-graph', 4, () => {
    const graph = createAssetRegistryGraph(compiled, { package: '@shapeshift-labs/frontier-assets' });
    return graph.entries.length + graph.edges.length;
  }),
  measure('jsonl-encode', 16, () => {
    jsonl = encodeAssetJsonl([impact, review]);
    return jsonl.length;
  }),
  measure('jsonl-decode', 16, () => decodeAssetJsonl(jsonl).length),
  measure('proof', 8, () => createAssetProof(catalog).hash.length)
];

const report = {
  package: '@shapeshift-labs/frontier-assets',
  version: readPackageVersion(),
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: process.platform + ' ' + process.arch,
  assetCount,
  rounds,
  rows
};

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
}

console.log(report.package + ' package benchmark');
console.log('Node ' + report.node + ' on ' + report.platform + ', assets=' + assetCount + ', rounds=' + rounds);
console.log('These are Frontier-only package measurements, not competitor comparisons.');
console.log('');
console.log(padRight('Fixture', 30) + padLeft('Median', 12) + padLeft('p95', 12));
for (const row of rows) {
  console.log(padRight(row.fixture, 30) + padLeft(formatUs(row.medianUs), 12) + padLeft(formatUs(row.p95Us), 12));
}
if (outPath) console.log('\nwrote ' + path.relative(repoRoot, outPath));

function makeCatalogInput(count) {
  const resources = [];
  for (let i = 0; i < 16; i++) {
    resources.push({
      id: 'shader:shader-' + i,
      kind: 'shader',
      source: 'shaders/shader-' + i + '.wgsl',
      outputs: [{ id: 'shader:shader-' + i + ':compiled', uri: 'dist/shaders/shader-' + i + '.bin', contentHash: 'sha256:shader:' + i }],
      owner: '@team/rendering'
    });
    resources.push({
      id: 'material:material-' + i,
      kind: 'material',
      source: 'materials/material-' + i + '.json',
      dependsOn: ['shader:shader-' + i],
      owner: '@team/rendering'
    });
  }
  for (let i = 0; i < count; i++) {
    const group = i % 16;
    resources.push({
      id: 'task:asset-' + i + '.build',
      kind: 'task',
      source: 'pipelines/asset-' + i + '.ts',
      outputs: ['dist/asset-' + i + '.glb', 'dist/asset-' + i + '.png'],
      owner: '@team/tools'
    });
    resources.push({
      id: 'asset:asset-' + i,
      source: 'art/asset-' + i + '.blend',
      outputs: [
        { id: 'asset:asset-' + i + ':glb', uri: 'dist/asset-' + i + '.glb', contentHash: 'sha256:asset:' + i },
        { id: 'asset:asset-' + i + ':thumb', kind: 'thumbnail', uri: 'dist/asset-' + i + '.png', width: 256, height: 256 }
      ],
      variants: [
        { id: 'asset:asset-' + i + ':lod0', kind: 'lod', uri: 'dist/asset-' + i + '.lod0' },
        { id: 'asset:asset-' + i + ':lod1', kind: 'lod', uri: 'dist/asset-' + i + '.lod1' }
      ],
      transforms: [{
        id: 'transform:asset-' + i,
        kind: 'export',
        inputs: ['art/asset-' + i + '.blend'],
        outputs: ['dist/asset-' + i + '.glb', 'dist/asset-' + i + '.png'],
        dependsOn: ['shader:shader-' + group, 'material:material-' + group],
        generatedBy: 'task:asset-' + i + '.build'
      }],
      dependsOn: ['shader:shader-' + group, 'material:material-' + group],
      generatedBy: 'task:asset-' + i + '.build',
      usedBy: ['scene:scene-' + (i % 64), 'route:/assets/' + (i % 128), 'test:asset-' + (i % 128)],
      owner: '@team/content',
      tags: ['asset', 'group-' + group]
    });
  }
  for (let i = 0; i < 64; i++) {
    resources.push({
      id: 'scene:scene-' + i,
      kind: 'scene',
      source: 'scenes/scene-' + i + '.json',
      dependsOn: ['asset:asset-' + (i % count)],
      usedBy: ['route:/scene/' + i],
      owner: '@team/world'
    });
  }
  return { id: 'bench.assets', resources, metadata: { token: 'bench-secret' } };
}

function measure(fixture, batchSize, fn) {
  const values = [];
  let sink = 0;
  for (let round = 0; round < rounds; round++) {
    const started = performance.now();
    for (let i = 0; i < batchSize; i++) sink += fn();
    values[values.length] = ((performance.now() - started) * 1000) / batchSize;
  }
  if (sink === -1) console.log('sink=' + sink);
  values.sort((left, right) => left - right);
  return { fixture, medianUs: percentile(values, 0.5), p95Us: percentile(values, 0.95) };
}

function percentile(values, p) {
  return values[Math.min(values.length - 1, Math.floor((values.length - 1) * p))] ?? 0;
}

function formatUs(value) {
  if (value >= 1000) return (value / 1000).toFixed(2) + ' ms';
  return value.toFixed(2) + ' us';
}

function padRight(value, width) {
  return String(value).padEnd(width, ' ');
}

function padLeft(value, width) {
  return String(value).padStart(width, ' ');
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--assets') out.assets = argv[++i];
    else if (arg === '--rounds') out.rounds = argv[++i];
    else if (arg === '--out') out.out = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run bench -- [--assets 1000] [--rounds 30] [--out benchmarks/results/frontier-assets-package-bench-latest.json]');
      process.exit(0);
    }
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
