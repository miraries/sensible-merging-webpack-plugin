[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

# sensible-merging-webpack-plugin

The *not so aggressive* alternative to webpack's `AggressiveMergingPlugin`.  
Exposes a way to add an additional check on whether two chunks should be merged based on the modules they contain.

## Getting Started

To begin, you'll need to install `sensible-merging-webpack-plugin`:

```console
npm install sensible-merging-webpack-plugin --save-dev
```

or

```console
yarn add -D sensible-merging-webpack-plugin
```

Then add the plugin to your `webpack` config. For example:

**webpack.config.js**

```js
const SensibleMergingPlugin = require("sensible-merging-webpack-plugin");

// no config makes it work the same as AggressiveMergingPlugin
module.exports = {
  plugins: [new SensibleMergingPlugin()],
};
```

and make sure to remove the existing `AggressiveMergingPlugin`. This depends on your setup but generally you should be able to do:

```js
webpackConfig.plugins = webpackConfig.plugins.filter(p => p.constructor.name !== 'AggressiveMergingPlugin')
```

And run `webpack` via your preferred method.

## Options

- **[`minSizeReduce`](#minSizeReduce)**
- **[`mergeStrategy`](#mergeStrategy)**

### `minSizeReduce`

Type:

```ts
type minSizeReduce? = number
```

Default: `1.5`

Merge assets if their combined size is reduced by this threshold.  
Same functionality as in the `AggressiveMergingPlugin`.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      minSizeReduce: 1.3
    }),
  ],
};
```

### `mergeStrategy`

Type:

```ts
type mergeStrategy? = (aModules: string[], bModules: string[]) => { allowMerge: boolean, reason?: string }
```

Default: `undefined`

Decide whether to merge chunks based on their modules.

**webpack.config.js**

```js

const mergeStrategy = (aModules, bModules) => ({ allowMerge: true });

module.exports = {
  plugins: [
    new CompressionPlugin({
      mergeStrategy
    }),
  ],
};
```

## Merge strategies

### VariantMergeStrategy

One strategy is provided as part of the package, exported like so:

```ts
const { VariantMergeStrategy } = require("sensible-merging-webpack-plugin");
```

The idea is to prevent merging of chunks which all need to be available at runtime, but will never be used together on a single web app.  
An example is having dynamic switching of component versions, or component types, or similar - called `varaints` here.  
Since webpack may merge these by default an option is to completely remove the `AggressiveMergingPlugin`.  
In this case you can end up with other chunks which are used together, as separate chunks, whereas ideally they should be merged.

You need to provide a function which will parse a module name and return it's parsed path and variant.

For example, assuming you have versioned module names all ending up in the same chunk, like:

```
└── static/js/10.e7065f85.chunk.js (268.8 KB)
    ├── Components/Button/_versioned/V1
    ├── Components/Button/_versioned/V2
    └── Components/Button/_versioned/V3
```

you can write a strategy like

```ts
const mergeStrategy = VariantMergeStrategy((modules) => {
  return modules.flatMap(m => {
    if (!m.includes('_versioned'))
      return [];

    const [path, variant] = m.split('_versioned');

    return [{path, variant}];
  })
});
```

so modules will be split based on the variants as denoted by the `_versioned` directory.  
The final chunks will not be merged as a result:

```
└── static/js/10.e7065f85.chunk.js (137.61 KB)
    ├── Components/Button/_versioned/V1
└── static/js/11.78a328da.chunk.js (130.37 KB)
    ├── Components/Button/_versioned/V2
└── static/js/12.997bb3f0.chunk.js (75.97 KB)
    └── Components/Button/_versioned/V3
```

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/sensible-merging-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/sensible-merging-webpack-plugin
[node]: https://img.shields.io/node/v/sensible-merging-webpack-plugin.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=sensible-merging-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=sensible-merging-webpack-plugin