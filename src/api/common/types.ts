import {
  RollupBuild, RollupOptions, RollupOutput, Plugin,
} from 'rollup';

export type PluginEvent = 'before-build' | 'after-build';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PluginRowBase extends Array<any> {
  0: PluginEvent;
  1: Function;
}

export interface PluginRowSimpleBefore extends PluginRowBase {
  0: 'before-build';
  1: (config: ParsedOptions, builds: RollupOptions[]) => void | Promise<void>;
}

export interface PluginRowSimpleAfter extends PluginRowBase {
  0: 'after-build';
  1: (data: RollupEvent | RollupOutput[]) => void | Promise<void>;
}

export type PluginRowSimple = PluginRowSimpleBefore | PluginRowSimpleAfter;

export type PluginRow = PluginRowSimple | PluginRowSimple[];

export type PluginRowMaker = (options: object) => PluginRow;

export interface Options {
  config: string;
  project: string;
  output: string;
  copy: string;
  exclude: string;
  watch: boolean;
  serve: boolean;
  legacy: boolean;
  chunks: boolean;
  production: boolean;
  debug: boolean;
  componentsJson: string;
  extLogic: string;
  extStyle: string;
}

export interface ServeOptions {
  port: number;
  open: boolean;
  spa: boolean;
  secure: boolean;
}

export interface LegacyOptions {
  inline: boolean;
  suffix: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuntimeOptions = Record<string, any>;

export interface StyleOptions {
  extract: boolean;
  global: boolean;
  modules: boolean;
}

export interface ParsedOptionsConfig {
  legacy: false | LegacyOptions;
  serve: false | ServeOptions;
  chunks: false | Record<string, string[]>;
  style: StyleOptions;
  runtime: RuntimeOptions;
}

export interface CopyItem {
  from: string;
  to: string;
  ignore: string[];
}

export interface ParsedOptions extends ParsedOptionsConfig {
  project: string;
  exclude: string[];
  output: string;
  copy: CopyItem[];
  watch: boolean;
  production: boolean;
  debug: boolean;
  componentsJson: string;
  extLogic: string[];
  extStyle: string[];
  plugins: PluginRow[];
}

export interface RollupEventStart {
  code: 'START';
}

export interface RollupEventEnd {
  code: 'END';
}

export interface RollupEventError {
  code: 'ERROR';
  error: Error;
}

export interface RollupEventBundleStart {
  code: 'BUNDLE_START';
  input: Record<string, string>;
  output: string[];
}

export interface RollupEventBundleEnd {
  code: 'BUNDLE_END';
  input: Record<string, string>;
  output: string[];
  duration: number;
  result: RollupBuild;
}

export type RollupEvent = RollupEventStart
| RollupEventEnd | RollupEventError | RollupEventBundleStart | RollupEventBundleEnd;

export interface PreRollupOptions extends RollupOptions {
  priorityPlugins: Plugin[];
  pluginsConfig: Record<string, object[] | undefined>;
}