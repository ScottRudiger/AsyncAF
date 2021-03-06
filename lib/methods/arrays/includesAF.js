import permissiveIsArrayLike from '../_internal/permissiveIsArrayLike';
import {parallel} from '../_internal/resolve';

const sameValueZero = (a, b) => a === b || (Number.isNaN(a) && Number.isNaN(b));

/**
 * determines whether an array, string, or array-like object includes a certain element or string, returning true or false as appropriate
 *
 * *Note*: when called on an array or array-like object, `includesAF` is run in parallel and all elements will be resolved even if one of the first few elements is a match; if this behavior is not desireable, consider using `series.includesAF` or its alias, `io.includesAF`
 *
 * @param {any} searchItem the element or string to search for
 * @param {Number=} fromIndex the index at which to begin searching for `searchItem`; a negative value searches from the index of `array/string.length - fromIndex`; defaults to `0`
 * @returns {Promise.<Boolean>} `Promise` that resolves to `true` if `searchItem` is found; otherwise, `false`
 * @example
 *
 * // includesAF on an array of promises
 * const nums = [1, 2, 3].map(n => Promise.resolve(n));
 *
 * AsyncAF(nums).includesAF(2); // Promise that resolves to true
 *
 * AsyncAF(nums).includesAF(5); // Promise that resolves to false
 *
 * AsyncAF(nums).includesAF(1, 1); // Promise that resolves to false
 *
 * AsyncAF(nums).includesAF(3, -1); // Promise that resolves to true
 *
 * // includesAF on a promise-wrapped string
 * const string = Promise.resolve('test string');
 *
 * AsyncAF(string).includesAF('test'); // Promise that resolves to true
 *
 * AsyncAF(string).includesAF('nope'); // Promise that resolves to false
 *
 * AsyncAF(string).includesAF('test', 5); // Promise that resolves to false
 *
 * AsyncAF(string).includesAF('string', -6); // Promise that resolves to true
 *
 * // includesAF on an array-like object
 * (async function () {
 *   if (await AsyncAF(arguments).includesAF(2)) {
 *     console.log('2 is included');
 *   }
 * })(1, 2, 3); // logs '2 is included'
 *
 * @since 3.4.0
 * @see includes (alias)
 * @see {@link AsyncAF#series series.includesAF}
 * @memberof AsyncAF#
 */
const includesAF = function (searchItem, fromIndex = 0) {
  return this.then(arrOrStr => {
    if (!permissiveIsArrayLike(arrOrStr)) throw TypeError(
      `includesAF cannot be called on ${arrOrStr}, only on an Array, String, or array-like Object`,
    );
    const length = arrOrStr.length >>> 0;
    const fromIdx = fromIndex | 0;
    return typeof arrOrStr === 'string'
      ? arrOrStr.includes(searchItem, fromIdx)
      : this.inSeries
        ? (length || false) && (function seriesIncludesAF(i) {
          return Promise.resolve(arrOrStr[i]).then(el => {
            if (sameValueZero(el, searchItem)) return true;
            if (i >= length - 1) return false;
            return seriesIncludesAF(i + 1);
          });
        }(Math.max(fromIdx >= 0 ? fromIdx : length - Math.abs(fromIdx), 0)))
        : parallel(arrOrStr).then(arr => arr.includes(searchItem, fromIdx));
  });
};

export default includesAF;
