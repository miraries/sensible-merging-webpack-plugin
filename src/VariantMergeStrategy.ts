import { Options } from './SensibleMergingPlugin';

type GenerateVariantsFn = (modules: string[]) => {
  path?: string
  variant?: string
}[];

const VariantMergeStrategy = (generateVariants: GenerateVariantsFn) => {
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

  const mergeStrategy: Options['mergeStrategy'] = (aModules, bModules) => {
    const variantsA = uniqueModules(generateVariants(aModules));
    const variantsB = uniqueModules(generateVariants(bModules));

    for (const vA of variantsA) {
      for (const vB of variantsB) {
        if (vA.path === vB.path && vA.variant !== vB.variant) {          
          return {
            allowMerge: false,
            reason: `Same asset but differing variants: ${vA.path} - ${vA.variant} / ${vB.variant}`,
          };
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