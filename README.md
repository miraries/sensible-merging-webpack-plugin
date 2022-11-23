[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

# sensible-merging-webpack-plugin

The *not so aggresive* alternative to webpack's `AggresiveMergingPlugin`.  
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

// no config makes it work the same as AggresiveMergingPlugin
module.exports = {
  plugins: [new SensibleMergingPlugin()],
};
```

and make sure to remove the existing `AggresiveMergingPlugin`. This depends on your setup but generally you should be able to do:

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
Same functionality as in the `AggresiveMergingPlugin`.

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
type mergeStrategy?: (aModules: string[], bModules: string[]) => { allowMerge: boolean, reason?: string }
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

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/sensible-merging-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/sensible-merging-webpack-plugin
[node]: https://img.shields.io/node/v/sensible-merging-webpack-plugin.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=sensible-merging-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=sensible-merging-webpack-plugin