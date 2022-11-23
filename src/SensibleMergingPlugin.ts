import { STAGE_ADVANCED } from 'webpack/lib/OptimizationStages';
import type { Compiler, Chunk, Module as WebpackModule } from 'webpack';

export type Options = {
  minSizeReduce?: number
  mergeStrategy?: (aModules: string[], bModules: string[]) => { allowMerge: boolean, reason?: string }
}

type Module = WebpackModule & {
  resource: string
}

/*
    Original AggressiveMergingPlugin license:

    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/

export default class SensibleMergingPlugin {
  options: Options;

  constructor(options?: Options) {
    if (
      (options !== undefined && typeof options !== "object") ||
      Array.isArray(options)
    ) {
      throw new Error(
        'Argument should be an options object. To use defaults, pass in nothing.'
      );
    }
    this.options = options || {};
  }

  apply(compiler: Compiler): void {
    const options = this.options;
    const minSizeReduce = options.minSizeReduce || 1.5;
    const mergeStrategy = options.mergeStrategy || null;

    compiler.hooks.thisCompilation.tap(
      'SensibleMergingPlugin',
      compilation => {
        const logger = compilation.getLogger('SensibleMergingPlugin');

        compilation.hooks.optimizeChunks.tap(
          {
            name: "SensibleMergingPlugin",
            stage: STAGE_ADVANCED
          },
          chunks => {
            const chunkGraph = compilation.chunkGraph;

            let combinations: { a: Chunk, b: Chunk, improvement: number }[] = [];

            for (const a of chunks) {
              if (a.canBeInitial()) continue;

              for (const b of chunks) {
                if (b.canBeInitial()) continue;
                if (b === a) break;
                if (!chunkGraph.canChunksBeIntegrated(a, b)) continue;
 
                if (mergeStrategy) {
                  const aModules = chunkGraph.getChunkModules(a).map(m => (m as Module).resource).filter(Boolean);
                  const bModules = chunkGraph.getChunkModules(b).map(m => (m as Module).resource).filter(Boolean);

                  if (aModules.length && bModules.length) {
                    const { allowMerge, reason } = mergeStrategy(aModules, bModules);

                    if (!allowMerge) {
                      logger.info('Preventing merge ' + (reason ?? ''));

                      continue;
                    }
                  }
                }

                const aSize = chunkGraph.getChunkSize(b, {
                  chunkOverhead: 0
                });
                const bSize = chunkGraph.getChunkSize(a, {
                  chunkOverhead: 0
                });
                const abSize = chunkGraph.getIntegratedChunksSize(b, a, {
                  chunkOverhead: 0
                });
                const improvement = (aSize + bSize) / abSize;

                combinations.push({ a, b, improvement });
              }
            }

            combinations.sort((a, b) => {
              return b.improvement - a.improvement;
            });

            const pair = combinations[0];

            if (!pair) return;
            if (pair.improvement < minSizeReduce) return;

            chunkGraph.integrateChunks(pair.b, pair.a);
            compilation.chunks.delete(pair.a);
            return true;
          }
        );
      }
    );
  }
}