import assert from 'node:assert';
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

const args = parseArgs(process.argv.slice(2));
const cases = readPositiveInt(args.cases, 500);
let seed = readPositiveInt(args.seed, 0xa55e7);
let checked = 0;

for (let i = 0; i < cases; i++) {
  const input = makeCatalogInput(i);
  const catalog = createAssetCatalog(input);
  const compiled = compileAssetCatalog(catalog);
  const validation = validateAssetCatalog(catalog);
  assert.strictEqual(compiled.validation.valid, validation.valid);
  assert.strictEqual(compiled.catalog.resources.length, catalog.resources.length);

  const assetRows = queryAssetCatalog(compiled, { kinds: ['asset'] }).resources;
  assert.ok(assetRows.every((resource) => resource.assetKind === 'asset'));

  const changedShader = 'shader:shader-' + nextInt(4);
  const impact = traceAssetImpact(compiled, { changedResources: [changedShader] });
  assert.ok(Array.isArray(impact.resourceIds));
  assert.ok(Array.isArray(impact.outputUris));

  const changedFile = 'art/asset-' + nextInt(input.assetCount) + '.blend';
  const fileImpact = traceAssetImpact(compiled, { changedFiles: [changedFile] });
  assert.ok(fileImpact.sourceFiles.every((file) => typeof file === 'string'));

  const review = planAssetReview(compiled, { changedResources: [changedShader], now: i + 1 });
  assert.ok(Array.isArray(review.reviewItems));
  const registry = createAssetRegistryGraph(compiled);
  assert.ok(registry.entries.length >= catalog.resources.length);

  const jsonl = encodeAssetJsonl([impact, review]);
  assert.strictEqual(decodeAssetJsonl(jsonl).length, 2);
  assert.notStrictEqual(createAssetProof(catalog).hash.length, 0);
  checked++;
}

console.log('frontier-assets fuzz ok: ' + checked + ' cases');

function makeCatalogInput(index) {
  const assetCount = 3 + nextInt(8);
  const resources = [];
  for (let i = 0; i < 4; i++) {
    resources.push({
      id: 'shader:shader-' + i,
      kind: 'shader',
      source: 'shaders/shader-' + i + '.wgsl',
      outputs: [{ id: 'shader:shader-' + i + ':compiled', uri: 'dist/shader-' + i + '.bin', contentHash: 'sha256:shader:' + index + ':' + i }]
    });
    resources.push({
      id: 'material:material-' + i,
      kind: 'material',
      source: 'materials/material-' + i + '.json',
      dependsOn: ['shader:shader-' + i]
    });
  }
  for (let i = 0; i < assetCount; i++) {
    const shader = 'shader:shader-' + (i % 4);
    const material = 'material:material-' + (i % 4);
    resources.push({
      id: 'task:asset-' + i + '.build',
      kind: 'task',
      source: 'pipelines/asset-' + i + '.ts',
      outputs: ['dist/asset-' + i + '.glb', 'dist/asset-' + i + '.png']
    });
    resources.push({
      id: 'asset:asset-' + i,
      source: 'art/asset-' + i + '.blend',
      outputs: [
        { id: 'asset:asset-' + i + ':glb', uri: 'dist/asset-' + i + '.glb', contentHash: 'sha256:asset:' + index + ':' + i },
        { id: 'asset:asset-' + i + ':thumb', kind: 'thumbnail', uri: 'dist/asset-' + i + '.png' }
      ],
      variants: maybe() ? [{ id: 'asset:asset-' + i + ':lod', kind: 'lod', uri: 'dist/asset-' + i + '.lod' }] : [],
      dependsOn: [shader, material],
      generatedBy: 'task:asset-' + i + '.build',
      usedBy: ['scene:scene-' + (i % 3), 'route:/assets/' + i, maybe() ? 'test:asset-' + i : 'route:/game'],
      owner: '@team/content',
      tags: ['asset', 'group-' + (i % 3)]
    });
  }
  for (let i = 0; i < 3; i++) {
    resources.push({
      id: 'scene:scene-' + i,
      kind: 'scene',
      source: 'scenes/scene-' + i + '.json',
      dependsOn: ['asset:asset-' + (i % assetCount)],
      usedBy: ['route:/scene/' + i]
    });
  }
  return { id: 'assets-fuzz-' + index, assetCount, resources };
}

function maybe() {
  return (next() & 1) === 1;
}

function nextInt(max) {
  return next() % max;
}

function next() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cases') out.cases = argv[++i];
    else if (argv[i] === '--seed') out.seed = argv[++i];
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
