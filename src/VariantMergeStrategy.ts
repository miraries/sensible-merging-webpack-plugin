import { Options } from './SensibleMergingPlugin';

type PathVariant = {
  path?: string
  variant?: string
};

type GenerateVariantsFn = (modules: string[]) => PathVariant[];

const VariantMergeStrategy = ({generateVariants, preventAllVariantMerges = false}: {generateVariants: GenerateVariantsFn, preventAllVariantMerges?: boolean}) => {
  const uniqueModules = (arr: any[]) => {
    const res: any[] = [];
    const cache: Record<any, any> = {};
  
    for (let i = 0, l = arr.length; i < l; i++) {
      const x = arr[i];
      if (cache[x.path]?.[x.variant] === undefined) {
        if (cache[x.path]) {
          cache[x.path][x.variant] = 1;
        } else {
          cache[x.path] = {[x.variant]: 1};
        }

        res.push(x);
      }
    }
  
    return res;
  }

  const variantsCache: Record<string, PathVariant[]> = {};

  const getVariants = (chunkName: string, chunkModules: string[]) => {
    if (variantsCache[chunkName]) {
      return variantsCache[chunkName];
    }

    variantsCache[chunkName] = uniqueModules(generateVariants(chunkModules))

    return variantsCache[chunkName];
  }

  const mergeStrategy: Options['mergeStrategy'] = ({aModules, aName, bModules, bName}) => {
    const variantsA = getVariants(aName, aModules);
    const variantsB = getVariants(bName, bModules);

    for (const vA of variantsA) {
      for (const vB of variantsB) {
        if (preventAllVariantMerges) {
          if (vA.path !== vB.path || vA.variant !== vB.variant) {          
            return {
              allowMerge: false,
              reason: `Preventing all differing variant merges: ${vA.path} - ${vA.variant} / ${vB.variant}`,
            };
          }
        } else {
          if (vA.path === vB.path && vA.variant !== vB.variant) {          
            return {
              allowMerge: false,
              reason: `Same asset but differing variants: ${vA.path} - ${vA.variant} / ${vB.variant}`,
            };
          }
        }
      }
    }

    return {
      allowMerge: true,
    }
  }

  return mergeStrategy;
};

export default VariantMergeStrategy;