import type { JsonObject, JsonValue } from '@shapeshift-labs/frontier';
import { cloneJson } from '@shapeshift-labs/frontier/clone';
import {
  createFrontierRegistryGraph,
  type FrontierRegistryEdge,
  type FrontierRegistryEntry,
  type FrontierRegistryGraph,
  type FrontierRegistryImpact,
  type FrontierRegistrySource
} from '@shapeshift-labs/frontier/registry';

export const FRONTIER_ASSET_CATALOG_KIND = 'frontier.assets.catalog';
export const FRONTIER_ASSET_CATALOG_VERSION = 1;
export const FRONTIER_ASSET_RECORD_KIND = 'frontier.assets.record';
export const FRONTIER_ASSET_RECORD_VERSION = 1;
export const FRONTIER_ASSET_IMPACT_KIND = 'frontier.assets.impact';
export const FRONTIER_ASSET_IMPACT_VERSION = 1;
export const FRONTIER_ASSET_REVIEW_KIND = 'frontier.assets.review-plan';
export const FRONTIER_ASSET_REVIEW_VERSION = 1;
export const FRONTIER_ASSET_PROOF_KIND = 'frontier.assets.proof';
export const FRONTIER_ASSET_PROOF_VERSION = 1;

export type FrontierAssetKind =
  | 'asset'
  | 'source'
  | 'variant'
  | 'thumbnail'
  | 'lod'
  | 'shader'
  | 'material'
  | 'scene'
  | 'route'
  | 'document'
  | 'test'
  | 'task'
  | 'bundle'
  | 'resource'
  | string;

export interface FrontierAssetOutputInput {
  id?: string;
  kind?: FrontierAssetKind;
  uri?: string;
  path?: string;
  contentHash?: string;
  contentType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  dependsOn?: readonly string[];
  generatedBy?: string;
  metadata?: unknown;
}

export interface FrontierAssetOutput {
  id: string;
  kind: FrontierAssetKind;
  uri: string;
  contentHash?: string;
  contentType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  dependsOn: string[];
  generatedBy?: string;
  metadata?: JsonObject;
}

export interface FrontierAssetTransformInput {
  id: string;
  kind?: string;
  command?: string;
  inputs?: readonly string[];
  outputs?: readonly string[];
  dependsOn?: readonly string[];
  generatedBy?: string;
  metadata?: unknown;
}

export interface FrontierAssetTransform {
  id: string;
  kind: string;
  command?: string;
  inputs: string[];
  outputs: string[];
  dependsOn: string[];
  generatedBy?: string;
  metadata?: JsonObject;
}

export interface FrontierAssetRecordInput {
  id: string;
  kind?: FrontierAssetKind;
  title?: string;
  description?: string;
  uri?: string;
  source?: string | FrontierRegistrySource;
  sourceFile?: string;
  sourceFiles?: readonly string[];
  sourceHash?: string;
  contentHash?: string;
  contentType?: string;
  sizeBytes?: number;
  outputs?: readonly (string | FrontierAssetOutputInput)[];
  variants?: readonly (string | FrontierAssetOutputInput)[];
  transforms?: readonly FrontierAssetTransformInput[];
  dependsOn?: readonly string[];
  usedBy?: readonly string[];
  generatedBy?: string;
  owner?: string;
  owners?: readonly string[];
  package?: string;
  feature?: string;
  tags?: readonly string[];
  registrySource?: FrontierRegistrySource;
  metadata?: unknown;
}

export interface FrontierAssetRecord {
  kind: typeof FRONTIER_ASSET_RECORD_KIND;
  version: typeof FRONTIER_ASSET_RECORD_VERSION;
  id: string;
  assetKind: FrontierAssetKind;
  title: string;
  description?: string;
  uri?: string;
  sourceFile?: string;
  sourceFiles: string[];
  sourceHash?: string;
  contentHash?: string;
  contentType?: string;
  sizeBytes?: number;
  outputs: FrontierAssetOutput[];
  variants: FrontierAssetOutput[];
  transforms: FrontierAssetTransform[];
  dependsOn: string[];
  usedBy: string[];
  generatedBy?: string;
  owners: string[];
  package?: string;
  feature?: string;
  tags: string[];
  source?: FrontierRegistrySource;
  metadata?: JsonObject;
}

export interface FrontierAssetCatalogInput {
  id?: string;
  title?: string;
  description?: string;
  package?: string;
  feature?: string;
  owner?: string;
  resources?: readonly FrontierAssetRecordInput[];
  assets?: readonly FrontierAssetRecordInput[];
  tags?: readonly string[];
  source?: FrontierRegistrySource;
  generatedAt?: number;
  metadata?: unknown;
}

export interface FrontierAssetCatalog {
  kind: typeof FRONTIER_ASSET_CATALOG_KIND;
  version: typeof FRONTIER_ASSET_CATALOG_VERSION;
  id: string;
  title?: string;
  description?: string;
  package?: string;
  feature?: string;
  owner?: string;
  resources: FrontierAssetRecord[];
  sourceFiles: string[];
  outputUris: string[];
  dependencyIds: string[];
  consumerIds: string[];
  generatedAt?: number;
  tags: string[];
  source?: FrontierRegistrySource;
  metadata?: JsonObject;
  summary: FrontierAssetSummary;
}

export interface FrontierAssetSummary {
  resourceCount: number;
  assetCount: number;
  sourceCount: number;
  variantCount: number;
  outputCount: number;
  transformCount: number;
  shaderCount: number;
  materialCount: number;
  sceneCount: number;
  routeCount: number;
  taskCount: number;
  testCount: number;
  sourceFileCount: number;
  dependencyCount: number;
  consumerCount: number;
}

export interface FrontierAssetValidationIssue {
  code: string;
  message: string;
  resourceId?: string;
  targetId?: string;
  severity: 'error' | 'warning';
}

export interface FrontierAssetValidation {
  valid: boolean;
  issues: FrontierAssetValidationIssue[];
}

export interface FrontierCompiledAssetCatalog {
  kind: 'frontier.assets.compiled';
  version: 1;
  catalog: FrontierAssetCatalog;
  resourcesById: ReadonlyMap<string, FrontierAssetRecord>;
  dependenciesById: ReadonlyMap<string, readonly string[]>;
  dependentsById: ReadonlyMap<string, readonly string[]>;
  resourcesByKind: ReadonlyMap<string, readonly string[]>;
  resourcesByFile: ReadonlyMap<string, readonly string[]>;
  resourcesByOutput: ReadonlyMap<string, readonly string[]>;
  resourcesByHash: ReadonlyMap<string, readonly string[]>;
  validation: FrontierAssetValidation;
  get(resourceId: string): FrontierAssetRecord;
  dependents(resourceId: string): FrontierAssetRecord[];
  dependencies(resourceId: string): FrontierAssetRecord[];
}

export interface FrontierAssetQueryInput {
  ids?: readonly string[];
  kinds?: readonly string[];
  files?: readonly string[];
  outputs?: readonly string[];
  dependsOn?: readonly string[];
  usedBy?: readonly string[];
  generatedBy?: readonly string[];
  owners?: readonly string[];
  packages?: readonly string[];
  features?: readonly string[];
  tags?: readonly string[];
  contentHashes?: readonly string[];
  limit?: number;
}

export interface FrontierAssetQueryResult {
  kind: 'frontier.assets.query';
  version: 1;
  ids: string[];
  resources: FrontierAssetRecord[];
}

export interface FrontierAssetImpactInput {
  ids?: readonly string[];
  resources?: readonly string[];
  nodes?: readonly string[];
  changedResources?: readonly string[];
  changedFiles?: readonly string[];
  changedOutputs?: readonly string[];
  changedHashes?: readonly string[];
  kinds?: readonly string[];
  owners?: readonly string[];
  packages?: readonly string[];
  features?: readonly string[];
  tags?: readonly string[];
  direction?: 'forward' | 'reverse' | 'both';
}

export interface FrontierAssetImpactReason {
  resourceId: string;
  targetId?: string;
  reason: string;
}

export interface FrontierAssetImpact extends Omit<FrontierRegistryImpact, 'kind' | 'version'> {
  kind: typeof FRONTIER_ASSET_IMPACT_KIND;
  version: typeof FRONTIER_ASSET_IMPACT_VERSION;
  catalogId: string;
  resourceIds: string[];
  assetIds: string[];
  sourceFiles: string[];
  outputUris: string[];
  variantIds: string[];
  shaderIds: string[];
  materialIds: string[];
  sceneIds: string[];
  routeIds: string[];
  taskIds: string[];
  testIds: string[];
  consumerIds: string[];
  reasons: FrontierAssetImpactReason[];
}

export interface FrontierAssetReviewItem {
  id: string;
  kind: string;
  reason: string;
  owners: string[];
  resources: string[];
}

export interface FrontierAssetReviewPlan {
  kind: typeof FRONTIER_ASSET_REVIEW_KIND;
  version: typeof FRONTIER_ASSET_REVIEW_VERSION;
  id: string;
  catalogId: string;
  createdAt: number;
  resourceIds: string[];
  reviewItems: FrontierAssetReviewItem[];
  summary: FrontierAssetSummary;
  impact: FrontierAssetImpact;
  metadata?: JsonObject;
}

export interface FrontierAssetProof {
  kind: typeof FRONTIER_ASSET_PROOF_KIND;
  version: typeof FRONTIER_ASSET_PROOF_VERSION;
  catalogId: string;
  generatedAt: number;
  hash: string;
  summary: FrontierAssetSummary;
  validation?: FrontierAssetValidation;
  metadata?: JsonObject;
}

export function defineAsset(input: FrontierAssetRecordInput): FrontierAssetRecord {
  return normalizeRecord(input);
}

export function defineAssetCatalog(input: FrontierAssetCatalogInput): FrontierAssetCatalog {
  return createAssetCatalog(input);
}

export function createAssetCatalog(input: FrontierAssetCatalogInput = {}): FrontierAssetCatalog {
  const resources = (input.resources ?? input.assets ?? []).map(normalizeRecord);
  const sourceFileSet = new Set<string>();
  const outputUriSet = new Set<string>();
  const dependencyIdSet = new Set<string>();
  const consumerIdSet = new Set<string>();
  for (const resource of resources) {
    pushSetUnique(sourceFileSet, resource.sourceFiles);
    pushSetUnique(outputUriSet, outputUrisOf(resource));
    pushSetUnique(dependencyIdSet, dependenciesOf(resource));
    pushSetUnique(consumerIdSet, resource.usedBy);
  }
  const sourceFiles = Array.from(sourceFileSet);
  const outputUris = Array.from(outputUriSet);
  const dependencyIds = Array.from(dependencyIdSet);
  const consumerIds = Array.from(consumerIdSet);
  return {
    kind: FRONTIER_ASSET_CATALOG_KIND,
    version: FRONTIER_ASSET_CATALOG_VERSION,
    id: normalizeId(input.id ?? 'assets', 'asset catalog id'),
    ...(input.title ? { title: input.title } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.package ? { package: input.package } : {}),
    ...(input.feature ? { feature: input.feature } : {}),
    ...(input.owner ? { owner: input.owner } : {}),
    resources,
    sourceFiles,
    outputUris,
    dependencyIds,
    consumerIds,
    ...(input.generatedAt !== undefined ? { generatedAt: input.generatedAt } : {}),
    tags: uniqueStrings(input.tags),
    ...(input.source ? { source: input.source } : {}),
    ...optionalObject('metadata', input.metadata),
    summary: summarizeAssets(resources, sourceFiles, outputUris, dependencyIds, consumerIds)
  };
}

export const createContentCatalog = createAssetCatalog;
export const defineContentCatalog = defineAssetCatalog;

export function compileAssetCatalog(catalogOrInput: FrontierAssetCatalog | FrontierAssetCatalogInput): FrontierCompiledAssetCatalog {
  const catalog = isAssetCatalog(catalogOrInput) ? cloneAssetCatalog(catalogOrInput) : createAssetCatalog(catalogOrInput);
  const resourcesById = new Map<string, FrontierAssetRecord>();
  const dependenciesById = new Map<string, string[]>();
  const dependentsById = new Map<string, string[]>();
  const resourcesByKind = new Map<string, string[]>();
  const resourcesByFile = new Map<string, string[]>();
  const resourcesByOutput = new Map<string, string[]>();
  const resourcesByHash = new Map<string, string[]>();

  for (const resource of catalog.resources) {
    resourcesById.set(resource.id, resource);
    pushMap(resourcesByKind, resource.assetKind, resource.id);
    for (const file of resource.sourceFiles) pushMap(resourcesByFile, file, resource.id);
    for (const output of resource.outputs.concat(resource.variants)) {
      pushMap(resourcesByOutput, output.uri, resource.id);
      pushMap(resourcesByOutput, output.id, resource.id);
      if (output.contentHash) pushMap(resourcesByHash, output.contentHash, resource.id);
    }
    if (resource.contentHash) pushMap(resourcesByHash, resource.contentHash, resource.id);
    if (resource.sourceHash) pushMap(resourcesByHash, resource.sourceHash, resource.id);
    const deps = dependenciesOf(resource);
    dependenciesById.set(resource.id, deps);
    for (const dep of deps) pushMap(dependentsById, dep, resource.id);
    for (const consumer of resource.usedBy) pushMap(dependentsById, resource.id, consumer);
  }

  const validation = validateAssetCatalog(catalog);
  return {
    kind: 'frontier.assets.compiled',
    version: 1,
    catalog,
    resourcesById,
    dependenciesById: freezeMapLists(dependenciesById),
    dependentsById: freezeMapLists(dependentsById),
    resourcesByKind: freezeMapLists(resourcesByKind),
    resourcesByFile: freezeMapLists(resourcesByFile),
    resourcesByOutput: freezeMapLists(resourcesByOutput),
    resourcesByHash: freezeMapLists(resourcesByHash),
    validation,
    get(resourceId) {
      const id = normalizeId(resourceId, 'asset resource id');
      const resource = resourcesById.get(id);
      if (!resource) throw new TypeError('unknown asset resource: ' + resourceId);
      return resource;
    },
    dependents(resourceId) {
      return recordsForIds(resourcesById, dependentsById.get(normalizeId(resourceId, 'asset resource id')) ?? []);
    },
    dependencies(resourceId) {
      return recordsForIds(resourcesById, dependenciesById.get(normalizeId(resourceId, 'asset resource id')) ?? []);
    }
  };
}

export const compileAssets = compileAssetCatalog;

export function validateAssetCatalog(catalogOrInput: FrontierAssetCatalog | FrontierAssetCatalogInput): FrontierAssetValidation {
  const catalog = isAssetCatalog(catalogOrInput) ? catalogOrInput : createAssetCatalog(catalogOrInput);
  const issues: FrontierAssetValidationIssue[] = [];
  const seen = new Set<string>();
  const resourcesById = new Map<string, FrontierAssetRecord>();
  const outputIds = new Set<string>();
  for (const resource of catalog.resources) {
    if (seen.has(resource.id)) issues.push({ code: 'duplicate-resource', message: 'duplicate asset resource id: ' + resource.id, resourceId: resource.id, severity: 'error' });
    seen.add(resource.id);
    resourcesById.set(resource.id, resource);
    if (resource.dependsOn.includes(resource.id)) issues.push({ code: 'self-dependency', message: 'asset resource depends on itself: ' + resource.id, resourceId: resource.id, severity: 'error' });
    if (resource.generatedBy === resource.id) issues.push({ code: 'self-generated', message: 'asset resource generatedBy points at itself: ' + resource.id, resourceId: resource.id, severity: 'error' });
    for (const output of resource.outputs.concat(resource.variants)) {
      if (outputIds.has(output.id)) issues.push({ code: 'duplicate-output', message: 'duplicate output or variant id: ' + output.id, resourceId: resource.id, targetId: output.id, severity: 'warning' });
      outputIds.add(output.id);
    }
  }
  for (const resource of catalog.resources) {
    for (const dependency of dependenciesOf(resource)) {
      if (dependency.startsWith('asset:') && !resourcesById.has(dependency)) {
        issues.push({ code: 'unknown-asset-dependency', message: 'asset dependency is not declared: ' + dependency, resourceId: resource.id, targetId: dependency, severity: 'warning' });
      }
    }
  }
  const cycle = findCycle(catalog.resources, new Map(catalog.resources.map((resource) => [
    resource.id,
    dependenciesOf(resource).filter((id) => resourcesById.has(id))
  ])));
  if (cycle.length) issues.push({ code: 'cycle', message: 'asset dependency graph contains a cycle: ' + cycle.join(' -> '), resourceId: cycle[0], severity: 'error' });
  return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
}

export function queryAssetCatalog(
  catalogOrCompiled: FrontierAssetCatalog | FrontierCompiledAssetCatalog,
  input: FrontierAssetQueryInput = {}
): FrontierAssetQueryResult {
  const compiled = isCompiledAssetCatalog(catalogOrCompiled) ? catalogOrCompiled : compileAssetCatalog(catalogOrCompiled);
  const ids = new Set<string>();
  const hasIndexedQuery = hasValues(input.ids) || hasValues(input.kinds) || hasValues(input.files) || hasValues(input.outputs) || hasValues(input.contentHashes);
  for (const id of input.ids ?? []) if (compiled.resourcesById.has(id)) ids.add(id);
  for (const kind of input.kinds ?? []) pushSet(ids, compiled.resourcesByKind.get(kind) ?? []);
  for (const file of input.files ?? []) pushSet(ids, compiled.resourcesByFile.get(normalizeFilePath(file)) ?? []);
  for (const output of input.outputs ?? []) pushSet(ids, compiled.resourcesByOutput.get(normalizeFilePath(output)) ?? compiled.resourcesByOutput.get(output) ?? []);
  for (const hash of input.contentHashes ?? []) pushSet(ids, compiled.resourcesByHash.get(hash) ?? []);
  let resources = hasIndexedQuery
    ? recordsForIds(compiled.resourcesById, Array.from(ids))
    : compiled.catalog.resources.slice();
  resources = resources.filter((resource) => matchesQuery(resource, input));
  if (input.limit !== undefined) resources = resources.slice(0, Math.max(0, input.limit));
  return { kind: 'frontier.assets.query', version: 1, ids: resources.map((resource) => resource.id), resources };
}

export function traceAssetImpact(
  catalogOrCompiled: FrontierAssetCatalog | FrontierCompiledAssetCatalog,
  input: FrontierAssetImpactInput = {}
): FrontierAssetImpact {
  const compiled = isCompiledAssetCatalog(catalogOrCompiled) ? catalogOrCompiled : compileAssetCatalog(catalogOrCompiled);
  const seedIds = new Set<string>();
  const touched = new Set<string>();
  const external = new Set<string>();
  const reasons: FrontierAssetImpactReason[] = [];
  const direction = input.direction ?? 'forward';

  for (const id of [
    ...(input.ids ?? []),
    ...(input.resources ?? []),
    ...(input.nodes ?? []),
    ...(input.changedResources ?? [])
  ]) addSeed(compiled, seedIds, touched, external, reasons, id, 'resource');

  for (const file of input.changedFiles ?? []) {
    const normalized = normalizeFilePath(file);
    seedIds.add(normalized);
    for (const id of compiled.resourcesByFile.get(normalized) ?? []) markTouched(touched, reasons, id, normalized, 'source-file');
  }
  for (const output of input.changedOutputs ?? []) {
    const normalized = normalizeFilePath(output);
    seedIds.add(normalized);
    for (const id of compiled.resourcesByOutput.get(normalized) ?? compiled.resourcesByOutput.get(output) ?? []) markTouched(touched, reasons, id, normalized, 'output');
  }
  for (const hash of input.changedHashes ?? []) {
    seedIds.add(hash);
    for (const id of compiled.resourcesByHash.get(hash) ?? []) markTouched(touched, reasons, id, hash, 'content-hash');
  }
  for (const resource of compiled.catalog.resources) {
    if (input.kinds?.includes(resource.assetKind)) markTouched(touched, reasons, resource.id, resource.assetKind, 'kind');
    if (input.owners && overlaps(input.owners, resource.owners)) markTouched(touched, reasons, resource.id, resource.owners.join(','), 'owner');
    if (input.packages?.includes(resource.package ?? compiled.catalog.package ?? '')) markTouched(touched, reasons, resource.id, resource.package, 'package');
    if (input.features?.includes(resource.feature ?? compiled.catalog.feature ?? '')) markTouched(touched, reasons, resource.id, resource.feature, 'feature');
    if (input.tags && overlaps(input.tags, resource.tags)) markTouched(touched, reasons, resource.id, input.tags.join(','), 'tag');
  }

  const queue = Array.from(touched);
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (direction !== 'reverse') {
      for (const dependent of compiled.dependentsById.get(id) ?? []) {
        if (compiled.resourcesById.has(dependent)) {
          if (!touched.has(dependent)) queue.push(dependent);
          markTouched(touched, reasons, dependent, id, 'dependent');
        } else {
          external.add(dependent);
          reasons.push({ resourceId: dependent, targetId: id, reason: 'consumer' });
        }
      }
      const resource = compiled.resourcesById.get(id);
      if (resource) {
        for (const consumer of resource.usedBy) {
          if (compiled.resourcesById.has(consumer)) {
            if (!touched.has(consumer)) queue.push(consumer);
            markTouched(touched, reasons, consumer, id, 'used-by');
          } else {
            external.add(consumer);
            reasons.push({ resourceId: consumer, targetId: id, reason: 'used-by' });
          }
        }
      }
    }
    if (direction !== 'forward') {
      for (const dependency of compiled.dependenciesById.get(id) ?? []) {
        if (compiled.resourcesById.has(dependency)) {
          if (!touched.has(dependency)) queue.push(dependency);
          markTouched(touched, reasons, dependency, id, 'dependency');
        } else {
          external.add(dependency);
        }
      }
    }
  }

  const resourceIds = compiled.catalog.resources.map((resource) => resource.id).filter((id) => touched.has(id));
  const resources = recordsForIds(compiled.resourcesById, resourceIds);
  const entries = impactEntries(compiled.catalog, resources, external);
  const edges = impactEdges(resources);
  const nodes = new Set<string>(seedIds);
  for (const entry of entries) nodes.add(entry.id);
  for (const edge of edges) {
    nodes.add(edge.from);
    nodes.add(edge.to);
  }
  const outputUris = uniqueStrings(resources.flatMap(outputUrisOf));
  const consumerIds = uniqueStrings(resources.flatMap((resource) => resource.usedBy).concat(Array.from(external).filter(isConsumerResource)));
  return {
    kind: FRONTIER_ASSET_IMPACT_KIND,
    version: FRONTIER_ASSET_IMPACT_VERSION,
    seeds: Array.from(seedIds),
    nodes: Array.from(nodes),
    entries,
    records: [],
    edges,
    catalogId: compiled.catalog.id,
    resourceIds,
    assetIds: idsByKind(resources, 'asset'),
    sourceFiles: uniqueStrings(resources.flatMap((resource) => resource.sourceFiles)),
    outputUris,
    variantIds: uniqueStrings(resources.flatMap((resource) => resource.variants.map((variant) => variant.id))),
    shaderIds: idsByKind(resources, 'shader').concat(Array.from(external).filter((id) => id.startsWith('shader:'))),
    materialIds: idsByKind(resources, 'material').concat(Array.from(external).filter((id) => id.startsWith('material:'))),
    sceneIds: idsByKind(resources, 'scene').concat(consumerIds.filter((id) => id.startsWith('scene:'))),
    routeIds: idsByKind(resources, 'route').concat(consumerIds.filter((id) => id.startsWith('route:'))),
    taskIds: idsByKind(resources, 'task').concat(uniqueStrings(resources.map((resource) => resource.generatedBy).filter((id): id is string => !!id)).filter((id) => id.startsWith('task:'))),
    testIds: idsByKind(resources, 'test').concat(consumerIds.filter((id) => id.startsWith('test:'))),
    consumerIds,
    reasons: uniqueReasons(reasons)
  };
}

export function planAssetReview(
  catalogOrCompiled: FrontierAssetCatalog | FrontierCompiledAssetCatalog,
  input: FrontierAssetImpactInput & { now?: number | (() => number); metadata?: unknown } = {}
): FrontierAssetReviewPlan {
  const compiled = isCompiledAssetCatalog(catalogOrCompiled) ? catalogOrCompiled : compileAssetCatalog(catalogOrCompiled);
  const impact = traceAssetImpact(compiled, input);
  const resources = recordsForIds(compiled.resourcesById, impact.resourceIds);
  const reviewItems: FrontierAssetReviewItem[] = [];
  for (const resource of resources) {
    reviewItems.push({
      id: resource.id,
      kind: resource.assetKind,
      reason: reasonFor(impact.reasons, resource.id) ?? 'impacted-resource',
      owners: resource.owners,
      resources: uniqueStrings([resource.id].concat(resource.sourceFiles, outputUrisOf(resource), resource.dependsOn, resource.usedBy))
    });
  }
  for (const id of impact.consumerIds) {
    if (compiled.resourcesById.has(id)) continue;
    reviewItems.push({ id, kind: kindFromId(id), reason: reasonFor(impact.reasons, id) ?? 'consumer', owners: [], resources: [id] });
  }
  const now = readNow(input.now);
  return {
    kind: FRONTIER_ASSET_REVIEW_KIND,
    version: FRONTIER_ASSET_REVIEW_VERSION,
    id: 'asset-review:' + stableHash([compiled.catalog.id, impact.resourceIds, impact.consumerIds, now]),
    catalogId: compiled.catalog.id,
    createdAt: now,
    resourceIds: impact.resourceIds,
    reviewItems,
    summary: summarizeAssets(resources, impact.sourceFiles, impact.outputUris, uniqueStrings(resources.flatMap(dependenciesOf)), impact.consumerIds),
    impact,
    ...optionalObject('metadata', input.metadata)
  };
}

export function createAssetRegistryGraph(
  catalogOrCompiled: FrontierAssetCatalog | FrontierCompiledAssetCatalog,
  options: { generatedAt?: number; package?: string; metadata?: JsonObject } = {}
): FrontierRegistryGraph {
  const catalog = isCompiledAssetCatalog(catalogOrCompiled) ? catalogOrCompiled.catalog : catalogOrCompiled;
  const entries: FrontierRegistryEntry[] = [{
    id: 'asset-catalog:' + catalog.id,
    kind: 'asset-catalog',
    description: catalog.description ?? catalog.title,
    package: options.package ?? catalog.package,
    feature: catalog.feature,
    owner: catalog.owner,
    source: catalog.source,
    reads: catalog.sourceFiles.concat(catalog.dependencyIds),
    writes: catalog.outputUris,
    calls: catalog.resources.map((resource) => 'asset-resource:' + resource.id),
    tags: catalog.tags,
    metadata: { summary: toJsonObject(catalog.summary) }
  }];
  const edges: FrontierRegistryEdge[] = [];
  for (const resource of catalog.resources) {
    entries.push(registryEntryFor(catalog, resource));
    edges.push({ from: 'asset-catalog:' + catalog.id, to: 'asset-resource:' + resource.id, kind: 'owns' });
    for (const file of resource.sourceFiles) edges.push({ from: 'asset-resource:' + resource.id, to: file, kind: 'reads-source' });
    for (const dependency of dependenciesOf(resource)) edges.push({ from: 'asset-resource:' + resource.id, to: dependency, kind: dependency === resource.generatedBy ? 'generated-by' : 'depends-on' });
    for (const output of resource.outputs) edges.push({ from: 'asset-resource:' + resource.id, to: output.id, kind: 'produces' });
    for (const variant of resource.variants) edges.push({ from: 'asset-resource:' + resource.id, to: variant.id, kind: 'produces-variant' });
    for (const consumer of resource.usedBy) edges.push({ from: consumer, to: 'asset-resource:' + resource.id, kind: 'uses' });
  }
  return createFrontierRegistryGraph({ generatedAt: options.generatedAt, entries, edges, metadata: options.metadata });
}

export function encodeAssetJsonl(values: readonly unknown[]): string {
  return values.map((value) => JSON.stringify(value)).join('\n') + (values.length ? '\n' : '');
}

export function decodeAssetJsonl(text: string): JsonValue[] {
  return text.split(/\r?\n/).filter((line) => line.trim().length !== 0).map((line) => JSON.parse(line) as JsonValue);
}

export function redactAssetValue<T extends JsonValue | FrontierAssetCatalog | FrontierAssetReviewPlan>(
  value: T,
  redactions: readonly string[] = ['token', 'secret', 'password', 'authorization', 'cookie', 'credential', 'licenseKey']
): T {
  return redactValue(value, redactions) as T;
}

export function createAssetProof(
  value: FrontierAssetCatalog | FrontierAssetReviewPlan,
  options: { generatedAt?: number; metadata?: unknown } = {}
): FrontierAssetProof {
  const generatedAt = options.generatedAt ?? Date.now();
  const catalogId = isAssetCatalog(value) ? value.id : value.catalogId;
  const summary = isAssetCatalog(value) ? value.summary : value.summary;
  return {
    kind: FRONTIER_ASSET_PROOF_KIND,
    version: FRONTIER_ASSET_PROOF_VERSION,
    catalogId,
    generatedAt,
    hash: stableHash(redactAssetValue(value as JsonValue | FrontierAssetCatalog | FrontierAssetReviewPlan)),
    summary,
    ...(isAssetCatalog(value) ? { validation: validateAssetCatalog(value) } : {}),
    ...optionalObject('metadata', options.metadata)
  };
}

function normalizeRecord(input: FrontierAssetRecordInput): FrontierAssetRecord {
  const id = normalizeId(input.id, 'asset resource id');
  const sourceFile = input.sourceFile ?? (typeof input.source === 'string' ? input.source : undefined);
  const sourceFiles = uniqueStrings([sourceFile, ...(input.sourceFiles ?? [])].filter((file): file is string => !!file).map(normalizeFilePath));
  const assetKind = input.kind ?? kindFromId(id);
  return {
    kind: FRONTIER_ASSET_RECORD_KIND,
    version: FRONTIER_ASSET_RECORD_VERSION,
    id,
    assetKind,
    title: input.title ?? titleFromId(id),
    ...(input.description ? { description: input.description } : {}),
    ...(input.uri ? { uri: normalizeFilePath(input.uri) } : {}),
    ...(sourceFile ? { sourceFile: normalizeFilePath(sourceFile) } : {}),
    sourceFiles,
    ...(input.sourceHash ? { sourceHash: input.sourceHash } : {}),
    ...(input.contentHash ? { contentHash: input.contentHash } : {}),
    ...(input.contentType ? { contentType: input.contentType } : {}),
    ...(input.sizeBytes !== undefined ? { sizeBytes: Math.max(0, Math.floor(input.sizeBytes)) } : {}),
    outputs: (input.outputs ?? []).map((output) => normalizeOutput(output, 'output')),
    variants: (input.variants ?? []).map((variant) => normalizeOutput(variant, 'variant')),
    transforms: (input.transforms ?? []).map(normalizeTransform),
    dependsOn: uniqueStrings(input.dependsOn),
    usedBy: uniqueStrings(input.usedBy),
    ...(input.generatedBy ? { generatedBy: normalizeId(input.generatedBy, 'asset generatedBy id') } : {}),
    owners: uniqueStrings([input.owner, ...(input.owners ?? [])].filter((owner): owner is string => !!owner)),
    ...(input.package ? { package: input.package } : {}),
    ...(input.feature ? { feature: input.feature } : {}),
    tags: uniqueStrings(input.tags),
    ...(typeof input.source === 'object' ? { source: input.source } : input.registrySource ? { source: input.registrySource } : {}),
    ...optionalObject('metadata', input.metadata)
  };
}

function normalizeOutput(input: string | FrontierAssetOutputInput, fallbackKind: FrontierAssetKind): FrontierAssetOutput {
  if (typeof input === 'string') {
    const uri = normalizeFilePath(input);
    return { id: 'output:' + uri, kind: fallbackKind, uri, dependsOn: [] };
  }
  const uri = normalizeFilePath(input.uri ?? input.path ?? input.id ?? 'output');
  return {
    id: normalizeId(input.id ?? 'output:' + uri, 'asset output id'),
    kind: input.kind ?? fallbackKind,
    uri,
    ...(input.contentHash ? { contentHash: input.contentHash } : {}),
    ...(input.contentType ? { contentType: input.contentType } : {}),
    ...(input.sizeBytes !== undefined ? { sizeBytes: Math.max(0, Math.floor(input.sizeBytes)) } : {}),
    ...(input.width !== undefined ? { width: Math.max(0, Math.floor(input.width)) } : {}),
    ...(input.height !== undefined ? { height: Math.max(0, Math.floor(input.height)) } : {}),
    dependsOn: uniqueStrings(input.dependsOn),
    ...(input.generatedBy ? { generatedBy: normalizeId(input.generatedBy, 'asset output generatedBy id') } : {}),
    ...optionalObject('metadata', input.metadata)
  };
}

function normalizeTransform(input: FrontierAssetTransformInput): FrontierAssetTransform {
  return {
    id: normalizeId(input.id, 'asset transform id'),
    kind: input.kind ?? kindFromId(input.id),
    ...(input.command ? { command: input.command } : {}),
    inputs: uniqueStrings((input.inputs ?? []).map(normalizeFilePath)),
    outputs: uniqueStrings((input.outputs ?? []).map(normalizeFilePath)),
    dependsOn: uniqueStrings(input.dependsOn),
    ...(input.generatedBy ? { generatedBy: normalizeId(input.generatedBy, 'asset transform generatedBy id') } : {}),
    ...optionalObject('metadata', input.metadata)
  };
}

function summarizeAssets(
  resources: readonly FrontierAssetRecord[],
  sourceFiles: readonly string[],
  outputUris: readonly string[],
  dependencyIds: readonly string[],
  consumerIds: readonly string[]
): FrontierAssetSummary {
  return {
    resourceCount: resources.length,
    assetCount: resources.filter((resource) => resource.assetKind === 'asset').length,
    sourceCount: resources.filter((resource) => resource.assetKind === 'source').length,
    variantCount: resources.reduce((sum, resource) => sum + resource.variants.length, 0),
    outputCount: outputUris.length,
    transformCount: resources.reduce((sum, resource) => sum + resource.transforms.length, 0),
    shaderCount: resources.filter((resource) => resource.assetKind === 'shader').length,
    materialCount: resources.filter((resource) => resource.assetKind === 'material').length,
    sceneCount: resources.filter((resource) => resource.assetKind === 'scene').length,
    routeCount: resources.filter((resource) => resource.assetKind === 'route').length,
    taskCount: resources.filter((resource) => resource.assetKind === 'task').length,
    testCount: resources.filter((resource) => resource.assetKind === 'test').length,
    sourceFileCount: sourceFiles.length,
    dependencyCount: dependencyIds.length,
    consumerCount: consumerIds.length
  };
}

function matchesQuery(resource: FrontierAssetRecord, input: FrontierAssetQueryInput): boolean {
  if (input.dependsOn && !overlaps(input.dependsOn, dependenciesOf(resource))) return false;
  if (input.usedBy && !overlaps(input.usedBy, resource.usedBy)) return false;
  if (input.generatedBy && (!resource.generatedBy || !input.generatedBy.includes(resource.generatedBy))) return false;
  if (input.owners && !overlaps(input.owners, resource.owners)) return false;
  if (input.packages && !input.packages.includes(resource.package ?? '')) return false;
  if (input.features && !input.features.includes(resource.feature ?? '')) return false;
  if (input.tags && !overlaps(input.tags, resource.tags)) return false;
  return true;
}

function addSeed(
  compiled: FrontierCompiledAssetCatalog,
  seedIds: Set<string>,
  touched: Set<string>,
  external: Set<string>,
  reasons: FrontierAssetImpactReason[],
  rawId: string,
  reason: string
): void {
  const id = normalizeId(rawId, 'asset impact id');
  seedIds.add(id);
  if (compiled.resourcesById.has(id)) {
    markTouched(touched, reasons, id, id, reason);
    return;
  }
  for (const dependent of compiled.dependentsById.get(id) ?? []) {
    markTouched(touched, reasons, dependent, id, reason);
  }
  external.add(id);
}

function markTouched(touched: Set<string>, reasons: FrontierAssetImpactReason[], resourceId: string, targetId: string | undefined, reason: string): void {
  touched.add(resourceId);
  reasons.push({ resourceId, ...(targetId ? { targetId } : {}), reason });
}

function dependenciesOf(resource: FrontierAssetRecord): string[] {
  const deps = resource.dependsOn.slice();
  if (resource.generatedBy) deps.push(resource.generatedBy);
  for (const output of resource.outputs.concat(resource.variants)) {
    pushUnique(deps, output.dependsOn);
    if (output.generatedBy) pushUnique(deps, [output.generatedBy]);
  }
  for (const transform of resource.transforms) {
    pushUnique(deps, transform.dependsOn);
    if (transform.generatedBy) pushUnique(deps, [transform.generatedBy]);
  }
  return uniqueStrings(deps);
}

function outputUrisOf(resource: FrontierAssetRecord): string[] {
  const values = resource.outputs.concat(resource.variants).map((output) => output.uri);
  for (const transform of resource.transforms) pushUnique(values, transform.outputs);
  return uniqueStrings(values);
}

function registryEntryFor(catalog: FrontierAssetCatalog, resource: FrontierAssetRecord): FrontierRegistryEntry {
  return {
    id: 'asset-resource:' + resource.id,
    kind: resource.assetKind,
    description: resource.description ?? resource.title,
    package: resource.package ?? catalog.package,
    feature: resource.feature ?? catalog.feature,
    owner: resource.owners[0] ?? catalog.owner,
    source: resource.source,
    reads: resource.sourceFiles.concat(dependenciesOf(resource)),
    writes: outputUrisOf(resource),
    dependsOn: dependenciesOf(resource),
    produces: resource.outputs.concat(resource.variants).map((output) => output.id),
    affects: resource.usedBy,
    tags: resource.tags,
    metadata: {
      ...(resource.contentHash ? { contentHash: resource.contentHash } : {}),
      ...(resource.sourceHash ? { sourceHash: resource.sourceHash } : {}),
      outputCount: resource.outputs.length,
      variantCount: resource.variants.length,
      transformCount: resource.transforms.length
    }
  };
}

function impactEntries(catalog: FrontierAssetCatalog, resources: readonly FrontierAssetRecord[], external: ReadonlySet<string>): FrontierRegistryEntry[] {
  const entries: FrontierRegistryEntry[] = [];
  if (resources.length) {
    entries.push({
      id: 'asset-catalog:' + catalog.id,
      kind: 'asset-catalog',
      package: catalog.package,
      feature: catalog.feature,
      owner: catalog.owner,
      reads: uniqueStrings(resources.flatMap((resource) => resource.sourceFiles.concat(dependenciesOf(resource)))),
      writes: uniqueStrings(resources.flatMap(outputUrisOf)),
      tags: catalog.tags
    });
  }
  for (const resource of resources) entries.push(registryEntryFor(catalog, resource));
  for (const id of external) entries.push({ id, kind: kindFromId(id), reads: [], writes: [], tags: [] });
  return entries;
}

function impactEdges(resources: readonly FrontierAssetRecord[]): FrontierRegistryEdge[] {
  const edges: FrontierRegistryEdge[] = [];
  for (const resource of resources) {
    for (const dependency of dependenciesOf(resource)) edges.push({ from: 'asset-resource:' + resource.id, to: dependency, kind: dependency === resource.generatedBy ? 'generated-by' : 'depends-on' });
    for (const consumer of resource.usedBy) edges.push({ from: consumer, to: 'asset-resource:' + resource.id, kind: 'uses' });
    for (const output of resource.outputs) edges.push({ from: 'asset-resource:' + resource.id, to: output.id, kind: 'produces' });
    for (const variant of resource.variants) edges.push({ from: 'asset-resource:' + resource.id, to: variant.id, kind: 'produces-variant' });
  }
  return edges;
}

function idsByKind(resources: readonly FrontierAssetRecord[], kind: string): string[] {
  return resources.filter((resource) => resource.assetKind === kind).map((resource) => resource.id);
}

function kindFromId(id: string): string {
  const index = id.indexOf(':');
  if (index > 0) return id.slice(0, index);
  const lower = id.toLowerCase();
  if (lower.includes('shader')) return 'shader';
  if (lower.includes('material')) return 'material';
  if (lower.includes('route')) return 'route';
  if (lower.includes('scene')) return 'scene';
  if (lower.includes('test')) return 'test';
  if (lower.includes('task')) return 'task';
  return 'asset';
}

function isConsumerResource(id: string): boolean {
  return id.startsWith('scene:') || id.startsWith('route:') || id.startsWith('test:') || id.startsWith('doc:') || id.startsWith('view:');
}

function reasonFor(reasons: readonly FrontierAssetImpactReason[], id: string): string | undefined {
  return reasons.find((reason) => reason.resourceId === id)?.reason;
}

function cloneAssetCatalog(catalog: FrontierAssetCatalog): FrontierAssetCatalog {
  return cloneJson(catalog as unknown as JsonValue) as unknown as FrontierAssetCatalog;
}

function isAssetCatalog(value: unknown): value is FrontierAssetCatalog {
  return !!value && typeof value === 'object' && (value as { kind?: unknown }).kind === FRONTIER_ASSET_CATALOG_KIND;
}

function isCompiledAssetCatalog(value: unknown): value is FrontierCompiledAssetCatalog {
  return !!value && typeof value === 'object' && (value as { kind?: unknown }).kind === 'frontier.assets.compiled';
}

function recordsForIds(resourcesById: ReadonlyMap<string, FrontierAssetRecord>, ids: readonly string[]): FrontierAssetRecord[] {
  const out: FrontierAssetRecord[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const resource = resourcesById.get(id);
    if (resource) out.push(resource);
  }
  return out;
}

function uniqueReasons(reasons: readonly FrontierAssetImpactReason[]): FrontierAssetImpactReason[] {
  const seen = new Set<string>();
  const out: FrontierAssetImpactReason[] = [];
  for (const reason of reasons) {
    const key = reason.resourceId + '\0' + (reason.targetId ?? '') + '\0' + reason.reason;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(reason);
  }
  return out;
}

function findCycle(resources: readonly FrontierAssetRecord[], dependencies: ReadonlyMap<string, readonly string[]>): string[] {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const ids = new Set(resources.map((resource) => resource.id));
  const visit = (id: string): string[] => {
    if (visiting.has(id)) {
      const index = stack.indexOf(id);
      return index === -1 ? [id] : stack.slice(index).concat(id);
    }
    if (visited.has(id) || !ids.has(id)) return [];
    visiting.add(id);
    stack.push(id);
    for (const dependency of dependencies.get(id) ?? []) {
      const cycle = visit(dependency);
      if (cycle.length) return cycle;
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    return [];
  };
  for (const resource of resources) {
    const cycle = visit(resource.id);
    if (cycle.length) return cycle;
  }
  return [];
}

function freezeMapLists(map: Map<string, string[]>): ReadonlyMap<string, readonly string[]> {
  for (const [key, value] of map) map.set(key, uniqueStrings(value));
  return map;
}

function pushMap(map: Map<string, string[]>, key: string, value: string): void {
  const list = map.get(key);
  if (list) {
    if (!list.includes(value)) list.push(value);
  } else {
    map.set(key, [value]);
  }
}

function pushUnique(target: string[], values: readonly (string | undefined)[] | undefined): void {
  for (const value of values ?? []) {
    if (value && !target.includes(value)) target.push(value);
  }
}

function pushSet(target: Set<string>, values: readonly string[]): void {
  for (const value of values) target.add(value);
}

function pushSetUnique(target: Set<string>, values: readonly string[]): void {
  for (const value of values) {
    if (value) target.add(value);
  }
}

function uniqueStrings(values: readonly (string | undefined)[] | undefined): string[] {
  const out: string[] = [];
  for (const value of values ?? []) {
    if (!value) continue;
    if (!out.includes(value)) out.push(value);
  }
  return out;
}

function overlaps(left: readonly string[], right: readonly string[]): boolean {
  for (const value of left) if (right.includes(value)) return true;
  return false;
}

function hasValues(value: readonly unknown[] | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

function normalizeId(value: string, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(label + ' must be a non-empty string');
  return value.trim();
}

function normalizeFilePath(value: string): string {
  const trimmed = normalizeId(value, 'asset file path').replace(/\\/g, '/');
  return trimmed.replace(/([^:])\/{2,}/g, '$1/').replace(/^\.\//, '');
}

function titleFromId(id: string): string {
  const base = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id;
  return base.split(/[._/-]+/g).filter(Boolean).map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(' ') || id;
}

function optionalObject(key: string, value: unknown): Record<string, JsonObject> {
  if (value === undefined) return {};
  const json = toJsonValue(value);
  return json && typeof json === 'object' && !Array.isArray(json) ? { [key]: json as JsonObject } : { [key]: { value: json } };
}

function toJsonObject(value: unknown): JsonObject {
  const json = toJsonValue(value);
  return json && typeof json === 'object' && !Array.isArray(json) ? json as JsonObject : { value: json };
}

function toJsonValue(value: unknown): JsonValue {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function redactValue(value: unknown, redactions: readonly string[]): unknown {
  if (Array.isArray(value)) return value.map((item) => redactValue(item, redactions));
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] = redactions.some((pattern) => key.toLowerCase().includes(pattern.toLowerCase()))
      ? '[redacted]'
      : redactValue(entry, redactions);
  }
  return out;
}

function readNow(now?: number | (() => number)): number {
  return typeof now === 'function' ? now() : now ?? Date.now();
}

function stableHash(value: unknown): string {
  const text = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const object = value as Record<string, unknown>;
  return '{' + Object.keys(object).sort().map((key) => JSON.stringify(key) + ':' + stableStringify(object[key])).join(',') + '}';
}
