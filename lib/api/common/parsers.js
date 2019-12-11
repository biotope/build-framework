"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const defaults_1 = require("./defaults");
exports.toThenable = (object) => {
    if (object && object.then && typeof object.then === 'function') {
        return new Promise((resolvePromise) => object.then(() => resolvePromise()));
    }
    return object;
};
const kebabToCamel = (string) => string.replace(/-([a-z])/g, (_, item) => item.toUpperCase());
const toArray = (obj) => obj.split(',').filter((p) => !!p);
const getConfig = (file) => require(path_1.resolve(file));
const setByPriority = (config, prop, cliValue, defaultValue, t) => {
    if (cliValue !== undefined) {
        config[prop] = t ? t(cliValue) : cliValue;
    }
    else if (config[prop] === undefined) {
        config[prop] = t ? t(defaultValue) : defaultValue;
    }
};
const setObjectByPriority = (config, prop, cliValue, defaultValue) => {
    const defaultConfig = defaults_1.defaultConfigs[prop];
    setByPriority(config, prop, cliValue, defaultValue, (value) => (value ? defaultConfig : false));
    if (config[prop] === true) {
        config[prop] = defaultConfig;
    }
    else if (typeof config[prop] === 'object') {
        config[prop] = Object.assign(Object.assign({}, defaultConfig), config[prop]);
    }
};
exports.parseOptions = (cliOptions) => {
    let configFile = {};
    if (cliOptions.config) {
        const resolved = path_1.resolve(cliOptions.config);
        if (fs_extra_1.existsSync(resolved)) {
            configFile = getConfig(resolved);
        }
        else {
            console.error(`Config file "${resolved}" does not exist…`);
        }
    }
    setByPriority(configFile, 'project', cliOptions.project, defaults_1.defaultCliOptions.project);
    setByPriority(configFile, 'exclude', cliOptions.exclude, defaults_1.defaultCliOptions.exclude, toArray);
    setByPriority(configFile, 'output', cliOptions.output, defaults_1.defaultCliOptions.output);
    setByPriority(configFile, 'copy', cliOptions.copy, defaults_1.defaultCliOptions.copy, toArray);
    setByPriority(configFile, 'watch', cliOptions.watch, defaults_1.defaultCliOptions.watch);
    setByPriority(configFile, 'production', cliOptions.production, defaults_1.defaultCliOptions.production);
    setByPriority(configFile, 'componentsJson', cliOptions.componentsJson, defaults_1.defaultCliOptions.componentsJson);
    setByPriority(configFile, 'extLogic', cliOptions.extLogic, defaults_1.defaultCliOptions.extLogic, toArray);
    setByPriority(configFile, 'extStyle', cliOptions.extStyle, defaults_1.defaultCliOptions.extStyle, toArray);
    setObjectByPriority(configFile, 'legacy', cliOptions.legacy, defaults_1.defaultCliOptions.legacy);
    setObjectByPriority(configFile, 'serve', cliOptions.serve, defaults_1.defaultCliOptions.serve);
    setObjectByPriority(configFile, 'chunks', undefined, defaults_1.defaultConfigs.chunks);
    setObjectByPriority(configFile, 'runtime', undefined, defaults_1.defaultConfigs.runtime);
    configFile.copy = configFile.copy.map((item) => ({
        from: typeof item === 'string' ? `${configFile.project}/${item}` : item.from || '',
        to: typeof item === 'string' ? `${configFile.output}/${item}` : item.to || 'vendor',
        ignore: typeof item === 'string' || !item.ignore ? [] : item.ignore,
    })).filter((item) => item.from);
    configFile.plugins = [
        ...(configFile.plugins || []),
        ...defaults_1.defaultPlugins.map((pluginName) => {
            const plugin = getConfig(`${__dirname}/../../../plugins/${pluginName}`);
            const pluginConfig = configFile[kebabToCamel(pluginName)];
            return plugin(pluginConfig !== undefined ? pluginConfig : {});
        }),
    ];
    return configFile;
};
exports.getPlugins = (plugins, name) => plugins
    .reduce((accumulator, plugin) => [
    ...accumulator,
    ...(typeof plugin[0] === 'string' ? [plugin] : plugin),
], []).filter(([event]) => event === name);