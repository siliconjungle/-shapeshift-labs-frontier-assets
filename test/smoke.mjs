import assert from 'node:assert';
import {
  compileAssetCatalog,
  createAssetCatalog,
  createAssetProof,
  createAssetRegistryGraph,
  decodeAssetJsonl,
  defineAsset,
  defineAssetCatalog,
  encodeAssetJsonl,
  planAssetReview,
  queryAssetCatalog,
  redactAssetValue,
  traceAssetImpact,
  validateAssetCatalog
} from '../dist/index.js';

const catalog = createAssetCatalog({
  id: 'game.content',
  package: '@game/app',
  feature: 'overworld',
  owner: '@team/content',
  metadata: { licenseKey: 'secret' },
  resources: [
    {
      id: 'shader:foliage',
      kind: 'shader',
      source: 'shaders/foliage.wgsl',
      outputs: [{ id: 'shader:foliage.compiled', uri: 'dist/shaders/foliage.bin', contentHash: 'sha256:shader' }],
      usedBy: ['asset:overworld.tree'],
      owner: '@team/rendering',
      tags: ['shader']
    },
    {
      id: 'material:leaf',
      kind: 'material',
      source: 'materials/leaf.json',
      dependsOn: ['shader:foliage'],
      usedBy: ['asset:overworld.tree'],
      owner: '@team/rendering',
      tags: ['material']
    },
    {
      id: 'task:asset.build-tree',
      kind: 'task',
      source: 'pipelines/tree.asset.ts',
      outputs: ['tree.glb', 'tree-thumb.png', 'tree-lod0.bin', 'tree-lod1.bin'],
      owner: '@team/tools',
      tags: ['build']
    },
    {
      id: 'asset:overworld.tree',
      source: 'art/tree.blend',
      outputs: [
        { id: 'asset:overworld.tree.glb', uri: 'tree.glb', contentType: 'model/gltf-binary', contentHash: 'sha256:tree-glb' },
        { id: 'asset:overworld.tree.thumb', kind: 'thumbnail', uri: 'tree-thumb.png', width: 256, height: 256 }
      ],
      variants: [
        { id: 'asset:overworld.tree.lod0', kind: 'lod', uri: 'tree-lod0.bin' },
        { id: 'asset:overworld.tree.lod1', kind: 'lod', uri: 'tree-lod1.bin' }
      ],
      transforms: [{
        id: 'transform:tree.blend.glb',
        kind: 'blender-export',
        inputs: ['art/tree.blend'],
        outputs: ['tree.glb', 'tree-thumb.png'],
        dependsOn: ['shader:foliage', 'material:leaf'],
        generatedBy: 'task:asset.build-tree'
      }],
      dependsOn: ['shader:foliage', 'material:leaf'],
      usedBy: ['scene:overworld', 'route:/editor/assets', 'test:overworld.smoke'],
      generatedBy: 'task:asset.build-tree',
      owner: '@team/content',
      tags: ['tree', 'asset']
    },
    {
      id: 'scene:overworld',
      kind: 'scene',
      source: 'scenes/overworld.scene.json',
      dependsOn: ['asset:overworld.tree'],
      usedBy: ['route:/play/overworld'],
      owner: '@team/world'
    },
    {
      id: 'route:/editor/assets',
      kind: 'route',
      dependsOn: ['asset:overworld.tree'],
      owner: '@team/tools'
    },
    {
      id: 'test:overworld.smoke',
      kind: 'test',
      source: 'tests/overworld.smoke.ts',
      dependsOn: ['asset:overworld.tree', 'scene:overworld'],
      owner: '@team/qa'
    }
  ]
});

assert.strictEqual(defineAssetCatalog({ id: 'empty' }).id, 'empty');
assert.strictEqual(defineAsset({ id: 'asset:hero', source: 'art/hero.psd' }).assetKind, 'asset');
const uriCatalog = createAssetCatalog({
  resources: [{
    id: 'asset:uri',
    source: 'https://cdn.example.com/art//hero.blend',
    outputs: ['s3://bucket//hero.glb']
  }]
});
assert.deepStrictEqual(uriCatalog.resources[0].sourceFiles, ['https://cdn.example.com/art/hero.blend']);
assert.strictEqual(uriCatalog.resources[0].outputs[0].uri, 's3://bucket/hero.glb');
assert.strictEqual(catalog.summary.resourceCount, 7);
assert.strictEqual(catalog.summary.assetCount, 1);
assert.strictEqual(catalog.summary.shaderCount, 1);
assert.strictEqual(catalog.summary.materialCount, 1);
assert.strictEqual(catalog.summary.routeCount, 1);
assert.strictEqual(catalog.summary.variantCount, 2);

const validation = validateAssetCatalog(catalog);
assert.strictEqual(validation.valid, true);
const invalid = validateAssetCatalog({
  id: 'bad',
  resources: [{ id: 'asset:self', dependsOn: ['asset:self'] }]
});
assert.strictEqual(invalid.valid, false);

const compiled = compileAssetCatalog(catalog);
assert.strictEqual(compiled.get('asset:overworld.tree').outputs.length, 2);
assert.deepStrictEqual(compiled.dependents('shader:foliage').map((resource) => resource.id).sort(), [
  'asset:overworld.tree',
  'material:leaf',
]);
assert.deepStrictEqual(queryAssetCatalog(compiled, { kinds: ['shader'] }).ids, ['shader:foliage']);
assert.deepStrictEqual(queryAssetCatalog(compiled, { outputs: ['tree.glb'] }).ids, [
  'task:asset.build-tree',
  'asset:overworld.tree'
]);
assert.deepStrictEqual(queryAssetCatalog(catalog, { files: ['art/tree.blend'] }).ids, ['asset:overworld.tree']);

const impact = traceAssetImpact(compiled, { changedResources: ['shader:foliage'] });
assert.ok(impact.resourceIds.includes('asset:overworld.tree'));
assert.ok(impact.resourceIds.includes('scene:overworld'));
assert.ok(impact.routeIds.includes('route:/editor/assets'));
assert.ok(impact.routeIds.includes('route:/play/overworld'));
assert.ok(impact.testIds.includes('test:overworld.smoke'));
assert.ok(impact.outputUris.includes('tree-thumb.png'));

const fileImpact = traceAssetImpact(compiled, { changedFiles: ['art/tree.blend'] });
assert.deepStrictEqual(fileImpact.assetIds, ['asset:overworld.tree']);
assert.ok(fileImpact.sceneIds.includes('scene:overworld'));

const review = planAssetReview(compiled, { changedResources: ['material:leaf'], now: 1000 });
assert.ok(review.reviewItems.some((item) => item.id === 'asset:overworld.tree'));
assert.ok(review.reviewItems.some((item) => item.id === 'route:/play/overworld'));
assert.strictEqual(review.createdAt, 1000);

const graph = createAssetRegistryGraph(catalog, { generatedAt: 1100 });
assert.ok(graph.entries.some((entry) => entry.id === 'asset-resource:asset:overworld.tree'));
assert.ok(graph.edges.some((edge) => edge.kind === 'produces' && edge.to === 'asset:overworld.tree.glb'));
assert.ok(graph.edges.some((edge) => edge.kind === 'depends-on' && edge.to === 'shader:foliage'));

const jsonl = encodeAssetJsonl([impact, review]);
assert.strictEqual(decodeAssetJsonl(jsonl).length, 2);
assert.notStrictEqual(createAssetProof(catalog, { generatedAt: 1 }).hash.length, 0);
assert.strictEqual(JSON.stringify(redactAssetValue(catalog)).includes('secret'), false);
