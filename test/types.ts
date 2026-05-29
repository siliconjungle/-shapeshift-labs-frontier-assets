import {
  compileAssetCatalog,
  createAssetCatalog,
  type FrontierAssetCatalog,
  type FrontierAssetImpact,
  type FrontierAssetRecord,
  type FrontierAssetReviewPlan
} from '../dist/index.js';

const catalog: FrontierAssetCatalog = createAssetCatalog({
  id: 'types.assets',
  resources: [{
    id: 'asset:tree',
    source: 'art/tree.blend',
    outputs: ['tree.glb'],
    dependsOn: ['shader:foliage'],
    usedBy: ['scene:world'],
    generatedBy: 'task:tree.build'
  }]
});

const compiled = compileAssetCatalog(catalog);
const asset: FrontierAssetRecord = compiled.get('asset:tree');
const impact: FrontierAssetImpact = {
  ...compiled.catalog.summary,
  kind: 'frontier.assets.impact',
  version: 1,
  seeds: [],
  nodes: [],
  entries: [],
  records: [],
  edges: [],
  catalogId: catalog.id,
  resourceIds: [],
  assetIds: [],
  sourceFiles: [],
  outputUris: [],
  variantIds: [],
  shaderIds: [],
  materialIds: [],
  sceneIds: [],
  routeIds: [],
  taskIds: [],
  testIds: [],
  consumerIds: [],
  reasons: []
};
const review: FrontierAssetReviewPlan = {
  kind: 'frontier.assets.review-plan',
  version: 1,
  id: 'review',
  catalogId: catalog.id,
  createdAt: 1,
  resourceIds: [],
  reviewItems: [],
  summary: catalog.summary,
  impact
};

asset.id satisfies string;
review.reviewItems.length satisfies number;
