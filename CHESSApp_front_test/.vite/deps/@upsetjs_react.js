import {
  require_react
} from "./chunk-ZAUFE7H7.js";
import {
  __commonJS,
  __toESM
} from "./chunk-UXIASGQL.js";

// node_modules/lz-string/libs/lz-string.js
var require_lz_string = __commonJS({
  "node_modules/lz-string/libs/lz-string.js"(exports, module) {
    var LZString2 = function() {
      var f = String.fromCharCode;
      var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
      var baseReverseDic = {};
      function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
          baseReverseDic[alphabet] = {};
          for (var i = 0; i < alphabet.length; i++) {
            baseReverseDic[alphabet][alphabet.charAt(i)] = i;
          }
        }
        return baseReverseDic[alphabet][character];
      }
      var LZString3 = {
        compressToBase64: function(input) {
          if (input == null)
            return "";
          var res = LZString3._compress(input, 6, function(a) {
            return keyStrBase64.charAt(a);
          });
          switch (res.length % 4) {
            default:
            case 0:
              return res;
            case 1:
              return res + "===";
            case 2:
              return res + "==";
            case 3:
              return res + "=";
          }
        },
        decompressFromBase64: function(input) {
          if (input == null)
            return "";
          if (input == "")
            return null;
          return LZString3._decompress(input.length, 32, function(index) {
            return getBaseValue(keyStrBase64, input.charAt(index));
          });
        },
        compressToUTF16: function(input) {
          if (input == null)
            return "";
          return LZString3._compress(input, 15, function(a) {
            return f(a + 32);
          }) + " ";
        },
        decompressFromUTF16: function(compressed) {
          if (compressed == null)
            return "";
          if (compressed == "")
            return null;
          return LZString3._decompress(compressed.length, 16384, function(index) {
            return compressed.charCodeAt(index) - 32;
          });
        },
        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function(uncompressed) {
          var compressed = LZString3.compress(uncompressed);
          var buf = new Uint8Array(compressed.length * 2);
          for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
            var current_value = compressed.charCodeAt(i);
            buf[i * 2] = current_value >>> 8;
            buf[i * 2 + 1] = current_value % 256;
          }
          return buf;
        },
        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function(compressed) {
          if (compressed === null || compressed === void 0) {
            return LZString3.decompress(compressed);
          } else {
            var buf = new Array(compressed.length / 2);
            for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
              buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
            }
            var result = [];
            buf.forEach(function(c) {
              result.push(f(c));
            });
            return LZString3.decompress(result.join(""));
          }
        },
        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function(input) {
          if (input == null)
            return "";
          return LZString3._compress(input, 6, function(a) {
            return keyStrUriSafe.charAt(a);
          });
        },
        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function(input) {
          if (input == null)
            return "";
          if (input == "")
            return null;
          input = input.replace(/ /g, "+");
          return LZString3._decompress(input.length, 32, function(index) {
            return getBaseValue(keyStrUriSafe, input.charAt(index));
          });
        },
        compress: function(uncompressed) {
          return LZString3._compress(uncompressed, 16, function(a) {
            return f(a);
          });
        },
        _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
          if (uncompressed == null)
            return "";
          var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0, ii;
          for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
              context_dictionary[context_c] = context_dictSize++;
              context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
              context_w = context_wc;
            } else {
              if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 8; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                } else {
                  value = 1;
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1 | value;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = 0;
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 16; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                  context_enlargeIn = Math.pow(2, context_numBits);
                  context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
              } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              context_dictionary[context_wc] = context_dictSize++;
              context_w = String(context_c);
            }
          }
          if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
              if (context_w.charCodeAt(0) < 256) {
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 8; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              } else {
                value = 1;
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1 | value;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = 0;
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 16; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              delete context_dictionaryToCreate[context_w];
            } else {
              value = context_dictionary[context_w];
              for (i = 0; i < context_numBits; i++) {
                context_data_val = context_data_val << 1 | value & 1;
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
          }
          value = 2;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
          while (true) {
            context_data_val = context_data_val << 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data.push(getCharFromInt(context_data_val));
              break;
            } else
              context_data_position++;
          }
          return context_data.join("");
        },
        decompress: function(compressed) {
          if (compressed == null)
            return "";
          if (compressed == "")
            return null;
          return LZString3._decompress(compressed.length, 32768, function(index) {
            return compressed.charCodeAt(index);
          });
        },
        _decompress: function(length, resetValue, getNextValue) {
          var dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], i, w, bits, resb, maxpower, power, c, data = { val: getNextValue(0), position: resetValue, index: 1 };
          for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
          }
          bits = 0;
          maxpower = Math.pow(2, 2);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          switch (next = bits) {
            case 0:
              bits = 0;
              maxpower = Math.pow(2, 8);
              power = 1;
              while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c = f(bits);
              break;
            case 1:
              bits = 0;
              maxpower = Math.pow(2, 16);
              power = 1;
              while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c = f(bits);
              break;
            case 2:
              return "";
          }
          dictionary[3] = c;
          w = c;
          result.push(c);
          while (true) {
            if (data.index > length) {
              return "";
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }
            switch (c = bits) {
              case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;
              case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;
              case 2:
                return result.join("");
            }
            if (enlargeIn == 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
            if (dictionary[c]) {
              entry = dictionary[c];
            } else {
              if (c === dictSize) {
                entry = w + w.charAt(0);
              } else {
                return null;
              }
            }
            result.push(entry);
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn == 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
          }
        }
      };
      return LZString3;
    }();
    if (typeof define === "function" && define.amd) {
      define(function() {
        return LZString2;
      });
    } else if (typeof module !== "undefined" && module != null) {
      module.exports = LZString2;
    } else if (typeof angular !== "undefined" && angular != null) {
      angular.module("LZString", []).factory("LZString", function() {
        return LZString2;
      });
    }
  }
});

// node_modules/@upsetjs/react/dist/index.js
var import_react = __toESM(require_react());

// node_modules/@upsetjs/model/dist/index.js
function len(a) {
  return a instanceof Set ? a.size : a.length;
}
function setOverlapFactory(a, toElemKey) {
  const elems = !toElemKey ? a instanceof Set ? a : new Set(a) : new Set((a instanceof Set ? Array.from(a) : a).map(toElemKey));
  const setA = elems.size;
  const same = {
    setA,
    setB: setA,
    union: setA,
    intersection: setA
  };
  return (b) => {
    if (b === a) {
      return same;
    }
    let intersection = 0;
    b.forEach((e) => {
      if (toElemKey && elems.has(toElemKey(e)) || !toElemKey && elems.has(e)) {
        intersection++;
      }
    });
    const setB = len(b);
    return {
      setA,
      setB,
      intersection,
      union: setA + setB - intersection
    };
  };
}
function setOverlap(a, b, toElemKey) {
  if (len(a) < len(b) || a instanceof Set) {
    return setOverlapFactory(a, toElemKey)(b);
  }
  const r = setOverlapFactory(b, toElemKey)(a);
  return Object.assign({}, r, {
    setA: r.setB,
    setB: r.setA
  });
}
function setElemOverlapFactory(a, toElemKey) {
  const elems = !toElemKey ? a instanceof Set ? a : new Set(a) : new Set((a instanceof Set ? Array.from(a) : a).map(toElemKey));
  const setA = Array.isArray(a) ? a : Array.from(a);
  const same = {
    setA,
    setB: setA,
    union: setA,
    intersection: setA
  };
  return (b) => {
    if (b === a) {
      return same;
    }
    const intersection = [];
    const union = setA.slice();
    b.forEach((e) => {
      if (toElemKey && elems.has(toElemKey(e)) || !toElemKey && elems.has(e)) {
        intersection.push(e);
      } else {
        union.push(e);
      }
    });
    return {
      setA,
      setB: Array.isArray(b) ? b : Array.from(b),
      intersection,
      union
    };
  };
}
function setElemOverlap(a, b, toElemKey) {
  if (len(a) < len(b) || a instanceof Set) {
    return setElemOverlapFactory(a, toElemKey)(b);
  }
  const r = setElemOverlapFactory(b, toElemKey)(a);
  return Object.assign({}, r, {
    setA: r.setB,
    setB: r.setA
  });
}
function setElemIntersectionFactory(a, toElemKey) {
  const arr = a instanceof Set ? Array.from(a) : a;
  const elems = !toElemKey ? a instanceof Set ? a : new Set(a) : new Set(arr.map(toElemKey));
  return (b) => {
    if (b === a) {
      return arr;
    }
    const intersection = [];
    b.forEach((e) => {
      if (toElemKey && elems.has(toElemKey(e)) || !toElemKey && elems.has(e)) {
        intersection.push(e);
      }
    });
    return intersection;
  };
}
function isElemQuery(q) {
  return Array.isArray(q.elems);
}
function isCalcQuery(q) {
  return typeof q.overlap === "function";
}
function isSetQuery(q) {
  return q.set != null;
}
function queryOverlap(query, what, toElemKey) {
  if (isCalcQuery(query)) {
    return query.overlap;
  }
  if (isSetQuery(query) && query.set.overlap) {
    return query.set.overlap;
  }
  const f = setOverlapFactory(isElemQuery(query) ? query.elems : query.set.elems, toElemKey);
  return (s) => {
    if (s.overlap && isElemQuery(query) && Array.isArray(query.elems)) {
      return s.overlap(query.elems);
    }
    if (s.overlap && isSetQuery(query)) {
      return s.overlap(query.set);
    }
    return f(s.elems)[what];
  };
}
function queryElemOverlap(query, what, toElemKey) {
  if (isCalcQuery(query)) {
    return () => null;
  }
  if (what === "intersection") {
    const f2 = setElemIntersectionFactory(isElemQuery(query) ? query.elems : query.set.elems, toElemKey);
    return (s) => f2(s.elems);
  }
  const f = setElemOverlapFactory(isElemQuery(query) ? query.elems : query.set.elems, toElemKey);
  return (s) => {
    return f(s.elems)[what];
  };
}
function isBaseSet(v) {
  const vt = v;
  return v != null && typeof vt.cardinality === "number" && typeof v.name === "string" && Array.isArray(v.elems);
}
function isSet(v) {
  return isBaseSet(v) && v.type === "set";
}
function isSetCombination(v) {
  const vt = v;
  return isBaseSet(v) && ["composite", "union", "intersection", "distinctIntersection"].includes(vt.type) && vt.sets instanceof Set && typeof vt.degree === "number";
}
function isSetLike(v) {
  return isSet(v) || isSetCombination(v);
}
function isGenerateSetCombinationOptions(v) {
  const vt = v;
  return v != null && (vt.type == null || ["intersection", "union"].includes(vt.type));
}
function isUpSetQuery(v) {
  const vt = v;
  return v != null && typeof vt.name === "string" && typeof vt.color === "string" && (isElemQuery(vt) || isSetQuery(vt) || isCalcQuery(vt));
}
function byName(a, b) {
  return a.name.localeCompare(b.name);
}
function byCardinality(a, b) {
  return b.cardinality - a.cardinality;
}
function byDegree(a, b) {
  return a.degree - b.degree;
}
function byComposite(func) {
  return (a, b) => {
    return func.reduce((acc, f) => acc === 0 ? f(a, b) : acc, 0);
  };
}
function negate(func) {
  return (a, b) => -func(a, b);
}
function byGroup(sets2) {
  return (a, b) => {
    const fixNotFound = (v) => v < 0 ? Number.POSITIVE_INFINITY : v;
    const aIndex = fixNotFound(sets2.findIndex((s) => a.sets.has(s)));
    const bIndex = fixNotFound(sets2.findIndex((s) => b.sets.has(s)));
    return aIndex - bIndex;
  };
}
function fromSetName(sets2, symbol = /[∩∪&|]/) {
  const byName2 = new Map(sets2.map((s) => [s.name, s]));
  return (s) => {
    return s.name.split(symbol).map((setName) => byName2.get(setName.trim()));
  };
}
function toOrder$1(sets2, order) {
  if (!order) {
    return byName;
  }
  const arr = Array.isArray(order) ? order : [order];
  if (arr.length === 0) {
    return byName;
  }
  return byComposite(arr.map((o) => {
    switch (o) {
      case "cardinality":
      case "cardinality:desc":
        return byCardinality;
      case "cardinality:asc":
        return negate(byCardinality);
      case "name:desc":
        return negate(byName);
      case "degree":
      case "degree:asc":
        return byDegree;
      case "degree:desc":
        return negate(byDegree);
      case "group":
      case "group:asc":
        return byGroup(sets2);
      case "group:desc":
        return negate(byGroup(sets2));
      default:
        return byName;
    }
  }));
}
function postprocessCombinations(sets2, combinations2, options = {}) {
  let r = combinations2;
  if (options.order) {
    r = r.sort(toOrder$1(sets2, options.order));
  }
  if (options.limit != null) {
    return r.slice(0, options.limit);
  }
  return r;
}
function asCombination(set, type, toSets) {
  const sets2 = toSets(set);
  return Object.assign({
    type,
    cardinality: set.elems.length,
    sets: new Set(sets2),
    degree: sets2.length
  }, set);
}
function asCombinations(sets2, type, toSets) {
  return sets2.map((set) => asCombination(set, type, toSets));
}
var SET_JOINERS = {
  distinctIntersection: " ∩ ",
  intersection: " ∩ ",
  union: " ∪ ",
  composite: ","
};
function parseColor(color) {
  if (!color) {
    return [255, 255, 255];
  }
  const hex = color.match(/#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
  if (hex) {
    return [Number.parseInt(hex[1], 16), Number.parseInt(hex[2], 16), Number.parseInt(hex[3], 16)];
  }
  const rgb = color.match(/\(([\d]+)[, ]([\d]+)[, ]([\d]+)\)/i);
  if (rgb) {
    return [Number.parseInt(rgb[1], 10), Number.parseInt(rgb[2], 10), Number.parseInt(rgb[3], 10)];
  }
  return [255, 255, 255];
}
function mergeColors(colors) {
  if (colors.length === 1) {
    return colors[0];
  }
  if (colors.every((d) => d == null)) {
    return void 0;
  }
  const rgb = colors.map(parseColor);
  const r = Math.floor(rgb.reduce((acc, v) => acc + v[0], 0) / rgb.length);
  const g = Math.floor(rgb.reduce((acc, v) => acc + v[1], 0) / rgb.length);
  const b = Math.floor(rgb.reduce((acc, v) => acc + v[2], 0) / rgb.length);
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}
function generateName$1(combo, setIndex, joiner) {
  const sorted = Array.from(combo).sort((a, b) => setIndex.get(a) - setIndex.get(b));
  return sorted.length === 1 ? sorted[0].name : `(${sorted.map((d) => d.name).join(joiner)})`;
}
function generateSet(type, name, combo, elems, mergeColors2) {
  return {
    type: combo.size === 0 ? "composite" : type,
    elems,
    color: mergeColors2(Array.from(combo).map((s) => s.color)),
    sets: combo,
    name,
    cardinality: elems.length,
    degree: combo.size
  };
}
function mergeIntersection(a, b, lookup, toKey2, setIndex, type, mergeColors2) {
  const merged = new Set(a.sets);
  b.sets.forEach((s) => merged.add(s));
  const name = generateName$1(merged, setIndex, SET_JOINERS[type]);
  if (a.cardinality === 0 || b.cardinality === 0) {
    return generateSet(type, name, merged, [], mergeColors2);
  }
  let small = a;
  let big = b;
  if (a.cardinality > b.cardinality) {
    small = b;
    big = a;
  }
  const keySet = /* @__PURE__ */ new Set();
  const bigLookup = lookup.get(big);
  const elems = [];
  const l = small.elems.length;
  for (let i = 0; i < l; i++) {
    const e = small.elems[i];
    const key = toKey2(e);
    if (!bigLookup.has(key)) {
      continue;
    }
    keySet.add(key);
    elems.push(e);
  }
  const r = generateSet(type, name, merged, elems, mergeColors2);
  lookup.set(r, keySet);
  return r;
}
function mergeUnion(a, b, lookup, toKey2, setIndex, type, mergeColors2) {
  const merged = new Set(a.sets);
  b.sets.forEach((s) => merged.add(s));
  const name = generateName$1(merged, setIndex, SET_JOINERS[type]);
  if (a.cardinality === 0) {
    const r2 = generateSet(type, name, merged, b.elems, mergeColors2);
    lookup.set(r2, lookup.get(b));
    return r2;
  }
  if (b.cardinality === 0) {
    const r2 = generateSet(type, name, merged, a.elems, mergeColors2);
    lookup.set(r2, lookup.get(a));
    return r2;
  }
  let small = a;
  let big = b;
  if (a.cardinality > b.cardinality) {
    small = b;
    big = a;
  }
  const keySet = new Set(lookup.get(big));
  const bigLookup = lookup.get(big);
  const elems = big.elems.slice();
  small.elems.forEach((e) => {
    const key = toKey2(e);
    if (bigLookup.has(key)) {
      return;
    }
    keySet.add(key);
    elems.push(e);
  });
  const r = generateSet(type, name, merged, elems, mergeColors2);
  lookup.set(r, keySet);
  return r;
}
function generateEmptySet(type, notPartOfAnySet, allElements, lookup, toKey2, mergeColors2) {
  if (typeof notPartOfAnySet === "number") {
    return {
      type: "composite",
      elems: [],
      color: mergeColors2 ? mergeColors2([]) : void 0,
      sets: /* @__PURE__ */ new Set(),
      name: "()",
      cardinality: notPartOfAnySet,
      overlap(s) {
        return s === this || isSetLike(s) && s.name === this.name && s.cardinality === this.cardinality ? this.cardinality : 0;
      },
      degree: 0
    };
  }
  if (Array.isArray(notPartOfAnySet)) {
    return generateSet(type, "()", /* @__PURE__ */ new Set(), notPartOfAnySet, mergeColors2);
  }
  const lookupArr = Array.from(lookup.values());
  const elems = allElements.filter((e) => {
    const k = toKey2(e);
    return lookupArr.every((s) => !s.has(k));
  });
  return generateSet(type, "()", /* @__PURE__ */ new Set(), elems, mergeColors2);
}
function generateCombinations(sets2, options = {}) {
  const { type = "intersection", min = 0, max = Number.POSITIVE_INFINITY, empty = false, elems: allElements = [], notPartOfAnySet, toElemKey, mergeColors: mergeColors$1 = mergeColors } = options;
  const combinations2 = [];
  const setIndex = new Map(sets2.map((s, i) => [s, i]));
  const setElems = new Map(sets2.map((s) => [s, toElemKey ? new Set(s.elems.map(toElemKey)) : new Set(s.elems)]));
  const setDirectElems = toElemKey ? null : setElems;
  const setKeyElems = toElemKey ? setElems : null;
  const calc = type === "union" ? mergeUnion : mergeIntersection;
  function push(s) {
    if (s.degree < min || s.degree > max || s.cardinality === 0 && !empty) {
      return;
    }
    if (type !== "distinctIntersection") {
      combinations2.push(s);
      return;
    }
    const others = sets2.filter((d) => !s.sets.has(d));
    let elems = [];
    if (toElemKey) {
      const othersSets = others.map((o) => setKeyElems.get(o));
      elems = s.elems.filter((e) => {
        const key = toElemKey(e);
        return othersSets.every((o) => !o.has(key));
      });
    } else {
      const othersSets = others.map((o) => setDirectElems.get(o));
      elems = s.elems.filter((e) => othersSets.every((o) => !o.has(e)));
    }
    if (elems.length === s.cardinality) {
      combinations2.push(s);
      return;
    }
    const sDistinct = generateSet(type, s.name, s.sets, elems, mergeColors$1);
    if (sDistinct.cardinality === 0 && !empty) {
      return;
    }
    combinations2.push(sDistinct);
  }
  function generateLevel(arr, degree, lookup, toKey2) {
    if (degree > max) {
      return;
    }
    const l = arr.length;
    for (let i = 0; i < l; i++) {
      const a = arr[i];
      const sub = [];
      for (let j = i + 1; j < l; j++) {
        const b = arr[j];
        const ab = calc(a, b, lookup, toKey2, setIndex, type, mergeColors$1);
        push(ab);
        if (type === "union" || ab.cardinality > 0 || empty) {
          sub.push(ab);
        }
      }
      if (sub.length > 1) {
        generateLevel(sub, degree + 1, lookup, toKey2);
      }
    }
  }
  if (min <= 0) {
    if (toElemKey) {
      push(generateEmptySet(type, notPartOfAnySet, allElements, setKeyElems, toElemKey, mergeColors$1));
    } else {
      push(generateEmptySet(type, notPartOfAnySet, allElements, setDirectElems, (v) => v, mergeColors$1));
    }
  }
  const degree1 = sets2.map((s) => {
    const r = generateSet(type, s.name, /* @__PURE__ */ new Set([s]), s.elems, mergeColors$1);
    setElems.set(r, setElems.get(s));
    push(r);
    return r;
  });
  if (toElemKey) {
    generateLevel(degree1, 2, setKeyElems, toElemKey);
  } else {
    generateLevel(degree1, 2, setDirectElems, (v) => v);
  }
  return postprocessCombinations(sets2, combinations2, options);
}
function asSet(set) {
  return Object.assign({
    type: "set",
    cardinality: set.elems.length
  }, set);
}
function toOrder(order) {
  if (!order) {
    return byName;
  }
  switch (order) {
    case "cardinality":
    case "cardinality:desc":
      return byComposite([byCardinality, byName]);
    case "cardinality:asc":
      return byComposite([negate(byCardinality), byName]);
    case "name:desc":
      return negate(byName);
    default:
      return byName;
  }
}
function postprocessSets(sets2, options = {}) {
  let r = sets2;
  if (options.order) {
    const order = toOrder(options.order);
    r = r.slice().sort(order);
  }
  if (options.limit != null) {
    return r.slice(0, options.limit);
  }
  return r;
}
function asSets(sets2, options = {}) {
  return postprocessSets(sets2.map(asSet), options);
}
function extractFromExpression(combinations2, accOrOptions, o = {}) {
  var _a, _b, _c;
  const acc = typeof accOrOptions === "function" ? accOrOptions : (e) => e.sets;
  const options = (_a = typeof accOrOptions !== "function" ? accOrOptions : o) !== null && _a !== void 0 ? _a : {};
  const type = (_b = options.type) !== null && _b !== void 0 ? _b : "intersection";
  const joiner = (_c = options.joiner) !== null && _c !== void 0 ? _c : SET_JOINERS[type];
  const sets2 = [];
  const setLookup = /* @__PURE__ */ new Map();
  const cs = combinations2.map((c) => {
    const containedSets = acc(c);
    const containedSetsObjects = containedSets.map((s) => {
      if (setLookup.has(s)) {
        return setLookup.get(s);
      }
      const set = {
        cardinality: 0,
        elems: [],
        name: s,
        type: "set"
      };
      sets2.push(set);
      setLookup.set(set.name, set);
      return set;
    });
    if (type === "distinctIntersection") {
      for (const s of containedSetsObjects) {
        s.cardinality += c.cardinality;
      }
    } else if (containedSets.length === 1) {
      Object.assign(containedSetsObjects[0], {
        cardinality: c.cardinality
      }, c);
    } else if (type === "intersection") {
      for (const s of containedSetsObjects) {
        s.cardinality = Math.max(s.cardinality, c.cardinality);
      }
    } else if (type === "union") {
      for (const s of containedSetsObjects) {
        s.cardinality = Math.min(s.cardinality, c.cardinality);
      }
    }
    const name = containedSets.join(joiner);
    return Object.assign({
      type,
      elems: [],
      name
    }, c, {
      cardinality: c.cardinality,
      degree: containedSets.length,
      sets: new Set(containedSetsObjects)
    });
  });
  const sortedSets = postprocessSets(sets2, {
    order: options.setOrder
  });
  const sortedCombinations = postprocessCombinations(sortedSets, cs, {
    order: options.combinationOrder
  });
  return {
    sets: sortedSets,
    combinations: sortedCombinations
  };
}
function extractSets(elements, accOrOptions, o = {}) {
  var _a;
  const acc = typeof accOrOptions === "function" ? accOrOptions : (e) => e.sets;
  const options = (_a = typeof accOrOptions !== "function" ? accOrOptions : o) !== null && _a !== void 0 ? _a : {};
  const sets2 = /* @__PURE__ */ Object.create(null);
  elements.forEach((elem) => {
    acc(elem).forEach((set) => {
      const s = typeof set === "string" ? set : String(set);
      const r = sets2[s];
      if (r == null) {
        sets2[s] = [elem];
      } else {
        r.push(elem);
      }
    });
  });
  return postprocessSets(Object.entries(sets2).map(([set, elems]) => {
    const r = {
      type: "set",
      elems,
      name: String(set),
      cardinality: elems.length
    };
    return r;
  }), options);
}
function createTree(byDegree2, getOrCreateCombination) {
  const children = /* @__PURE__ */ new Map();
  byDegree2.slice().reverse().forEach((csOfDegree) => {
    if (csOfDegree.length === 0 || csOfDegree[0].degree === 1) {
      return;
    }
    csOfDegree.forEach((c) => {
      const sets2 = Array.from(c.sets).map((d) => d.name);
      for (let i = 0; i < sets2.length; i++) {
        const subSet = sets2.slice();
        subSet.splice(i, 1);
        const parent = getOrCreateCombination(subSet);
        if (children.has(parent)) {
          children.get(parent).push(c);
        } else {
          children.set(parent, [c]);
        }
      }
    });
  });
  return children;
}
function extractCombinations(elements, accOrOptions, o = {}) {
  var _a, _b, _c, _d;
  const acc = typeof accOrOptions === "function" ? accOrOptions : (e) => e.sets;
  const options = (_a = typeof accOrOptions !== "function" ? accOrOptions : o) !== null && _a !== void 0 ? _a : {};
  const type = (_b = options.type) !== null && _b !== void 0 ? _b : "intersection";
  const sets2 = (_c = options.sets) !== null && _c !== void 0 ? _c : extractSets(elements, acc, {
    limit: options.setLimit,
    order: options.setOrder
  });
  if (type === "union") {
    return {
      sets: sets2,
      combinations: generateCombinations(sets2, {
        type: "union",
        limit: options.combinationLimit,
        order: options.combinationOrder
      })
    };
  }
  const setLookup = /* @__PURE__ */ Object.create(null);
  sets2.forEach((set, i) => {
    setLookup[set.name] = [set, i];
  });
  const isSortedAlphabetically = sets2.map((d) => d.name).sort().every((d, i) => sets2[i].name === d);
  const bySet = isSortedAlphabetically ? void 0 : (a, b) => {
    var _a2, _b2, _c2, _d2;
    const ai = (_b2 = (_a2 = setLookup[a]) === null || _a2 === void 0 ? void 0 : _a2[1]) !== null && _b2 !== void 0 ? _b2 : -1;
    const bi = (_d2 = (_c2 = setLookup[b]) === null || _c2 === void 0 ? void 0 : _c2[1]) !== null && _d2 !== void 0 ? _d2 : -1;
    return ai - bi;
  };
  const validSet = options.sets == null && options.setLimit == null ? null : new Set(sets2.map((d) => d.name));
  const joiner = (_d = options.joiner) !== null && _d !== void 0 ? _d : SET_JOINERS[type];
  const cs = [];
  const csLookup = /* @__PURE__ */ Object.create(null);
  const byDegree2 = Array(sets2.length + 1).fill(0).map((_) => []);
  function genName(setsOfElem) {
    switch (setsOfElem.length) {
      case 0:
        return "()";
      case 1:
        return setsOfElem[0];
      default:
        const sorted = setsOfElem.slice().sort(bySet);
        const joined = sorted.join(joiner);
        return "(" + joined + ")";
    }
  }
  function genKey(setsOfElem) {
    switch (setsOfElem.length) {
      case 0:
        return "";
      case 1:
        return setsOfElem[0];
      case 2: {
        if (bySet != null && bySet(setsOfElem[0], setsOfElem[1]) > 0 || bySet == null && setsOfElem[1] > setsOfElem[0]) {
          return setsOfElem[1] + "&" + setsOfElem[0];
        }
        return setsOfElem[0] + "&" + setsOfElem[1];
      }
      default:
        const sorted = setsOfElem.slice().sort(bySet);
        return sorted.join("&");
    }
  }
  function getOrCreateCombination(setsOfElem) {
    const key = genKey(setsOfElem);
    const entry = csLookup[key];
    if (entry) {
      return entry;
    }
    const newEntry = {
      type,
      name: genName(setsOfElem),
      degree: setsOfElem.length,
      sets: new Set(setsOfElem.map((s) => setLookup[s][0])),
      cardinality: 0,
      elems: []
    };
    csLookup[key] = newEntry;
    cs.push(newEntry);
    byDegree2[newEntry.degree].push(newEntry);
    return newEntry;
  }
  elements.forEach((elem) => {
    let setsOfElem = acc(elem);
    if (validSet) {
      setsOfElem = setsOfElem.filter((d) => validSet.has(d));
    }
    const c = getOrCreateCombination(setsOfElem);
    c.elems.push(elem);
    c.cardinality++;
  });
  const finalize = () => {
    return {
      sets: sets2,
      combinations: postprocessCombinations(sets2, cs, {
        order: options.combinationOrder,
        limit: options.combinationLimit
      })
    };
  };
  if (type === "distinctIntersection") {
    return finalize();
  }
  const children = createTree(byDegree2, getOrCreateCombination);
  function visit(node, visited, agg) {
    var _a2;
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    if (node.elems.length < 1e3) {
      agg[0].push(...node.elems);
    } else {
      agg.push(node.elems);
    }
    ((_a2 = children.get(node)) !== null && _a2 !== void 0 ? _a2 : []).forEach((child) => visit(child, visited, agg));
  }
  byDegree2.slice(1).forEach((level) => {
    level.forEach((node) => {
      var _a2;
      const visited = /* @__PURE__ */ new Set();
      const agg = [node.elems];
      ((_a2 = children.get(node)) !== null && _a2 !== void 0 ? _a2 : []).forEach((child) => {
        visit(child, visited, agg);
      });
      const elems = agg.length === 1 ? agg[0] : agg.flat();
      Object.assign(node, { elems, cardinality: elems.length });
    });
  });
  return finalize();
}
function toKey(s) {
  return `${s.name}:${s.type}#${s.cardinality}`;
}
function isUniverse(s) {
  return s.sets.size === 0;
}
function common(a, b, toKey$1 = toKey) {
  const r = {
    done: null,
    aKey: "",
    bKey: "",
    aIsSet: false,
    bIsSet: false,
    toKey: toKey$1
  };
  if (a === b) {
    r.done = a.cardinality;
    return r;
  }
  if (a.cardinality === 0 || b.cardinality === 0) {
    r.done = 0;
    return r;
  }
  r.aKey = toKey$1(a);
  r.bKey = toKey$1(b);
  if (r.aKey === r.bKey) {
    r.done = a.cardinality;
    return r;
  }
  r.aIsSet = isSet(a);
  r.bIsSet = isSet(b);
  if (!r.aIsSet && isUniverse(a) || !r.bIsSet && isUniverse(b)) {
    r.done = 0;
    return r;
  }
  return r;
}
function aInB(b, r) {
  if (r.bIsSet || !r.aIsSet) {
    return false;
  }
  return Array.from(b.sets).map(r.toKey).includes(r.aKey);
}
function bInA(a, r) {
  if (!r.bIsSet || r.aIsSet) {
    return false;
  }
  return Array.from(a.sets).map(r.toKey).includes(r.bKey);
}
function keyedCombinations(combinations2, toKey$1 = toKey) {
  return combinations2.map((c) => {
    const s = Array.from(c.sets).map(toKey$1).sort();
    return {
      key: s.join("&"),
      s,
      sets: new Set(s),
      degree: c.degree,
      cardinality: c.cardinality
    };
  });
}
function combinedKey(a, b, r) {
  const sets2 = /* @__PURE__ */ new Set();
  if (r.aIsSet) {
    sets2.add(r.aKey);
  } else {
    for (const s of Array.from(a.sets)) {
      sets2.add(r.toKey(s));
    }
  }
  if (r.bIsSet) {
    sets2.add(r.bKey);
  } else {
    for (const s of Array.from(b.sets)) {
      sets2.add(r.toKey(s));
    }
  }
  return Array.from(sets2).sort().join("&");
}
function generateDistinctOverlapFunction(combinations2, fallback, toKey$1 = toKey) {
  const combinationsBySet = /* @__PURE__ */ new Map();
  for (const c of keyedCombinations(combinations2, toKey$1)) {
    for (const s of c.s) {
      if (combinationsBySet.has(s)) {
        combinationsBySet.get(s).push(c);
      } else {
        combinationsBySet.set(s, [c]);
      }
    }
  }
  return (a, b) => {
    const r = common(a, b, toKey$1);
    if (r.done != null) {
      return r.done;
    }
    if (!r.aIsSet && !r.bIsSet) {
      return 0;
    }
    if (r.aIsSet && !r.bIsSet) {
      return aInB(b, r) ? b.cardinality : 0;
    }
    if (!r.aIsSet && r.bIsSet) {
      return bInA(a, r) ? a.cardinality : 0;
    }
    const hasA = combinationsBySet.get(r.aKey);
    const hasB = combinationsBySet.get(r.bKey);
    if (!hasA || !hasB) {
      return fallback(a, b);
    }
    if (hasA.length < hasB.length) {
      return hasA.reduce((acc, c) => acc + (c.sets.has(r.bKey) ? c.cardinality : 0), 0);
    }
    return hasB.reduce((acc, c) => acc + (c.sets.has(r.aKey) ? c.cardinality : 0), 0);
  };
}
function generateIntersectionOverlapFunction(combinations2, fallback, toKey$1 = toKey) {
  const combinationsByKey = new Map(keyedCombinations(combinations2, toKey$1).map((d) => [d.key, d.cardinality]));
  return (a, b) => {
    const r = common(a, b, toKey$1);
    if (r.done != null) {
      return r.done;
    }
    if (r.aIsSet && !r.bIsSet && aInB(b, r)) {
      return b.cardinality;
    }
    if (!r.aIsSet && r.bIsSet && bInA(a, r)) {
      return a.cardinality;
    }
    const key = combinedKey(a, b, r);
    if (!combinationsByKey.has(key)) {
      return fallback(a, b);
    }
    return combinationsByKey.get(key);
  };
}
function generateUnionOverlapFunction(combinations2, fallback, toKey$1 = toKey) {
  const combinationsByKey = new Map(keyedCombinations(combinations2, toKey$1).map((d) => [d.key, d.cardinality]));
  return (a, b) => {
    const r = common(a, b, toKey$1);
    if (r.done != null) {
      return r.done;
    }
    if (r.aIsSet && !r.bIsSet && aInB(b, r)) {
      return a.cardinality;
    }
    if (!r.aIsSet && r.bIsSet && bInA(a, r)) {
      return b.cardinality;
    }
    const key = combinedKey(a, b, r);
    if (!combinationsByKey.has(key)) {
      return fallback(a, b);
    }
    return a.cardinality + b.cardinality - combinationsByKey.get(key);
  };
}
function generateOverlapFunction(combinations2, fallback, toKey$1 = toKey) {
  if (combinations2.length === 0) {
    return fallback;
  }
  const firstType = combinations2[0].type;
  if (combinations2.some((s) => s.type !== firstType)) {
    return fallback;
  }
  switch (firstType) {
    case "union":
      return generateUnionOverlapFunction(combinations2, fallback, toKey$1);
    case "intersection":
      return generateIntersectionOverlapFunction(combinations2, fallback, toKey$1);
    case "distinctIntersection":
      return generateDistinctOverlapFunction(combinations2, fallback, toKey$1);
  }
  return fallback;
}
function compressLine(line) {
  if (line.length === 0) {
    return "";
  }
  const r = [];
  let start = line[0];
  let len2 = 1;
  for (let i = 1; i < line.length; i++) {
    const v = line[i];
    if (v === start) {
      len2++;
    } else {
      if (len2 > 1) {
        r.push(`${start}=${len2 - 1}`);
      } else if (start === 0) {
        r.push("");
      } else {
        r.push(start.toString());
      }
      start = v;
      len2 = 1;
    }
  }
  if (len2 > 1) {
    r.push(`${start}=${len2}`);
  } else if (start === 0) {
    r.push("");
  } else {
    r.push(start.toString());
  }
  return r.join(",");
}
function decompressLine(line) {
  if (line.length === 0) {
    return [];
  }
  return line.split(",").map((v) => {
    if (v === "") {
      return 0;
    }
    if (v.includes("=")) {
      const [value, length] = v.split("=").map((v2) => Number.parseInt(v2, 10));
      return Array(length + 1).fill(value);
    }
    return Number.parseInt(v, 10);
  }).flat();
}
function compressMatrix(matrix) {
  if (matrix.length === 0) {
    return "";
  }
  const rows = matrix.length;
  const flat = matrix.flat();
  return `${rows};${compressLine(flat)}`;
}
function decompressMatrix(matrix) {
  if (matrix.length === 0) {
    return [];
  }
  const [rowsInfo, data] = matrix.split(";");
  const rows = Number.parseInt(rowsInfo, 10);
  const values = decompressLine(data);
  const r = [];
  let acc = 0;
  for (let i = rows; i > 0; i--) {
    r.push(values.slice(acc, acc + i));
    acc += i;
  }
  return r;
}
function generateOverlapLookup(sets2, combinations2, { toElemKey, what = "intersection", compress = "auto" } = {}) {
  const data = sets2.concat(combinations2);
  function overlapF(set) {
    if (set.overlap) {
      return set.overlap;
    }
    const f = setOverlapFactory(set.elems, toElemKey);
    return (v) => {
      if (v.overlap) {
        return v.overlap(set);
      }
      return f(v.elems)[what];
    };
  }
  const matrix = data.map((set, i) => {
    const overlap = overlapF(set);
    const r = [];
    for (let j = i + 1; j < data.length; j++) {
      r.push(overlap(data[j]));
    }
    return r;
  });
  matrix.pop();
  if (compress === "no") {
    return matrix;
  }
  const compressed = compressMatrix(matrix);
  if (compress === "yes") {
    return compressed;
  }
  const encodedLength = JSON.stringify(matrix).length;
  const compressedLength = compressed.length + 2;
  return compressedLength < encodedLength * 0.6 ? compressed : matrix;
}
function generateOverlapLookupFunction(matrix, sets2, combinations2, toKey$1 = toKey) {
  const lookup = typeof matrix == "string" ? decompressMatrix(matrix) : matrix;
  const setIndex = new Map(sets2.map((set, i) => [toKey$1(set), i]));
  const combinationIndex = new Map(combinations2.map((set, i) => [toKey$1(set), i + sets2.length]));
  const compute = (a, b) => {
    if (a === b) {
      return a.cardinality;
    }
    const aKey = toKey$1(a);
    const bKey = toKey$1(b);
    const aIndex = setIndex.has(aKey) ? setIndex.get(aKey) : combinationIndex.get(aKey);
    const bIndex = setIndex.has(bKey) ? setIndex.get(bKey) : combinationIndex.get(bKey);
    if (aIndex === bIndex) {
      return a.cardinality;
    }
    const row = Math.min(aIndex, bIndex);
    const col = Math.max(aIndex, bIndex) - row - 1;
    if (row < 0 || row >= lookup.length || col < 0 || col >= lookup[row].length) {
      return 0;
    }
    return lookup[row][col];
  };
  return {
    setIndex,
    compute,
    combinationIndex
  };
}
var bandScale = (domain, size, padding) => {
  const blocks = domain.length + padding;
  const step = size / Math.max(1, blocks);
  const start = size - step * domain.length;
  const lookup = new Map(domain.map((d, i) => [d, i]));
  const bandwidth = step / (1 + padding);
  const scale = (v) => {
    const index = lookup.get(v);
    if (index == null) {
      return void 0;
    }
    return start + step * index;
  };
  scale.bandwidth = () => bandwidth;
  return scale;
};
function hasOverlap(positions, heights, stride = 1) {
  for (let i = 0; i < positions.length - stride; i += stride) {
    const pos_i = positions[i];
    const pos_n = positions[i + 1];
    if (pos_i < pos_n) {
      const right = pos_i + heights[i] / 2;
      const left = pos_n - heights[i + 1] / 2;
      if (right > left) {
        return true;
      }
    } else {
      const left = pos_i - heights[i] / 2;
      const right = pos_n + heights[i + 1] / 2;
      if (right > left) {
        return true;
      }
    }
  }
  return false;
}
function ensureLast(ticks, max, scale, heightPerTick, toStr2) {
  let last = ticks[ticks.length - 1];
  if (!last.label) {
    for (let j = ticks.length - 2; j > 0; --j) {
      if (ticks[j].label) {
        last = ticks[j];
        break;
      }
    }
  }
  if (last.value < max) {
    const pos_l = scale(last.value);
    const pos_max = scale(max);
    if (pos_l < pos_max) {
      const right = pos_l + heightPerTick(last.value) / 2;
      const left = pos_max - heightPerTick(max) / 2;
      if (right < left) {
        ticks.push({ value: max, label: toStr2(max) });
      }
    } else {
      const left = pos_l - heightPerTick(last.value) / 2;
      const right = pos_max + heightPerTick(max) / 2;
      if (right < left) {
        ticks.push({ value: max, label: toStr2(max) });
      }
    }
  }
  return ticks;
}
function genTicks(values, toStr2 = String, stride = 1) {
  return values.map((v, i) => ({
    value: v,
    label: stride === 1 || i % stride === 0 ? toStr2(v) : void 0
  }));
}
function checkValues(values, scale, heightPerTick, max, toStr2) {
  const positions = values.map((v) => scale(v));
  const heights = values.map((v) => heightPerTick(v));
  if (!hasOverlap(positions, heights)) {
    return ensureLast(genTicks(values, toStr2), max, scale, heightPerTick, toStr2);
  }
  if (!hasOverlap(positions, heights, 2)) {
    return ensureLast(genTicks(values, toStr2), max, scale, heightPerTick, toStr2);
  }
  return null;
}
function toStr$1(v) {
  return v.toLocaleString();
}
function niceFactors(max, maxCount = 11) {
  const digits = Math.max(0, Math.floor(Math.log10(max) - 0.5));
  const factor = Math.pow(10, digits);
  const factors = [1, 2, 5];
  const r = factors.map((f) => f * factor);
  if (digits > 0) {
    r.unshift(factors[factors.length - 1] * Math.pow(10, digits - 1));
  }
  r.push(factors[0] * Math.pow(10, digits + 1));
  const lower = Math.ceil(max / maxCount);
  return r.filter((d) => d >= lower && d <= max);
}
function range$1(max, inc = 1) {
  const values = [];
  for (let v = 0; v <= max; v += inc) {
    values.push(v);
  }
  return values;
}
function distributeTicks$1(max, maxCount, scale, heightPerTick) {
  if (maxCount <= 0) {
    return [];
  }
  const factors = niceFactors(max, maxCount);
  for (let i = 0; i < factors.length; i++) {
    const values = range$1(max, factors[i]);
    const r = checkValues(values, scale, heightPerTick, max, toStr$1);
    if (r) {
      return r;
    }
  }
  return genTicks([0, max], toStr$1);
}
var linearScale = (max, range2, options) => {
  const size = range2[1] - range2[0];
  const domain = max;
  const scale = (v) => {
    const cv = Math.max(0, Math.min(v, domain));
    const n = cv / domain;
    return range2[0] + n * size;
  };
  scale.ticks = (count = 10) => {
    if (options.orientation === "vertical") {
      const heightPerTick = Math.ceil(options.fontSizeHint * 1.4);
      return distributeTicks$1(max, count + 1, scale, () => heightPerTick);
    }
    const widthPerChar = options.fontSizeHint / 1.4;
    return distributeTicks$1(max, count + 1, scale, (v) => Math.ceil(toStr$1(v).length * widthPerChar));
  };
  scale.tickFormat = () => toStr$1;
  return scale;
};
function toStr(v) {
  const orders = ["", "k", "M", "G"];
  const order = Math.max(0, Math.min(Math.floor(Math.log10(v) / 3), orders.length - 1));
  const vi = Math.round(v / Math.pow(10, order * 3 - 1)) / 10;
  return `${vi.toLocaleString()}${orders[order]}`;
}
function range(max, factor) {
  const values = [];
  const inc = Math.pow(10, factor);
  for (let v = 1; v <= max; v *= inc) {
    values.push(v);
  }
  return values;
}
function generateInnerTicks(max, factor) {
  const values = [];
  const inc = 10;
  for (let v = 1, i = 0; v <= max; v *= inc, i++) {
    values.push({
      value: v,
      label: factor === 1 || i % factor === 0 ? toStr(v) : void 0
    });
    for (let vv = v + v; vv < v * inc && vv < max; vv += v * factor) {
      values.push({ value: vv });
    }
  }
  return values;
}
function distributeTicks(max, maxCount, scale, heightPerTick) {
  if (maxCount <= 0) {
    return [];
  }
  for (const factor of [1, 2, 5]) {
    const values = range(max, factor);
    const r = checkValues(values, scale, heightPerTick, max, toStr);
    if (r) {
      return ensureLast(generateInnerTicks(max, factor), max, scale, heightPerTick, toStr);
    }
  }
  return genTicks([0, max], toStr);
}
var logScale = (max, range2, options) => {
  const size = range2[1] - range2[0];
  const domain = max < 1 ? 1 : Math.log10(max);
  const scale = (v) => {
    const cv = Math.max(0, Math.min(v, domain));
    const n = cv <= 1 ? 0 : Math.log10(cv) / domain;
    return range2[0] + n * size;
  };
  scale.ticks = (count = 10) => {
    if (options.orientation === "vertical") {
      const heightPerTick = Math.ceil(options.fontSizeHint * 1.4);
      return distributeTicks(max, count + 1, scale, () => heightPerTick);
    }
    const widthPerChar = options.fontSizeHint / 1.4;
    return distributeTicks(max, count + 1, scale, (v) => Math.ceil(toStr(v).length * widthPerChar));
  };
  scale.tickFormat = () => toStr;
  return scale;
};
function compressIndicesArray(arr) {
  if (arr.length === 0) {
    return "";
  }
  const encoded = [];
  let startIndex = 0;
  const push = (i) => {
    if (i === startIndex + 1) {
      encoded.push(arr[startIndex].toString());
    } else if (i === startIndex + 2 && i < 10) {
      encoded.push(`${arr[startIndex]},${arr[startIndex + 1]}`);
    } else {
      encoded.push(`${arr[startIndex]}+${i - startIndex - 1}`);
    }
    return i;
  };
  for (let i = 1; i < arr.length; i++) {
    const expected = arr[i - 1] + 1;
    const v = arr[i];
    if (v !== expected) {
      startIndex = push(i);
      startIndex = i;
    }
  }
  push(arr.length);
  return encoded.join(",");
}
function toIndicesArray(arr, toIndex, { sortAble, compress = "auto" } = {}) {
  if (arr.length === 0) {
    return [];
  }
  const base = arr.map((v) => toIndex(v));
  if (compress === "no") {
    return base;
  }
  if (sortAble) {
    base.sort((a, b) => a - b);
  }
  const encoded = compressIndicesArray(base);
  const baseLength = JSON.stringify(base).length;
  const encodedLength = encoded.length + 2;
  if (encodedLength < baseLength * 0.6 || baseLength - encodedLength > 50 || compress === "yes" && encodedLength < baseLength) {
    return encoded;
  }
  return base;
}
function fromIndicesArray(indices, elements) {
  if (typeof indices === "string") {
    if (indices.length === 0) {
      return [];
    }
    return indices.split(",").map((s) => {
      if (s.includes("+")) {
        const [start, length] = s.split("+").map((si) => Number.parseInt(si, 10));
        return elements.slice(start, start + length + 1);
      }
      return elements[Number.parseInt(s, 10)];
    }).flat();
  }
  return indices.map((i) => elements[i]);
}
function withColor(v, s) {
  if (s.color) {
    v.color = s.color;
  }
  return v;
}
function fromDump(dump, elems, options = {}) {
  const sets2 = dump.sets.map((set) => asSet(Object.assign(Object.assign({}, set), { elems: fromIndicesArray(set.elems, elems) })));
  const gen = () => {
    var _a;
    return generateCombinations(sets2, Object.assign({ type: "intersection", elems, toElemKey: options.toElemKey }, (_a = dump.combinationOptions) !== null && _a !== void 0 ? _a : {}));
  };
  const combinations2 = dump.combinations ? dump.combinations.map((c) => asCombination(Object.assign(Object.assign({}, c), { elems: fromIndicesArray(c.elems, elems) }), c.type, (v) => v.sets.map((i) => sets2[i]))) : gen();
  function fromSetRef(ref) {
    if (ref.type === "set") {
      return sets2[ref.index];
    }
    return combinations2[ref.index];
  }
  return {
    sets: sets2,
    combinations: combinations2,
    selection: dump.selection ? typeof dump.selection === "string" || Array.isArray(dump.selection) ? fromIndicesArray(dump.selection, elems) : fromSetRef(dump.selection) : void 0,
    queries: dump.queries.map((query) => {
      if (query.set) {
        return {
          name: query.name,
          color: query.color,
          set: fromSetRef(query.set)
        };
      }
      return {
        name: query.name,
        color: query.color,
        elems: fromIndicesArray(query.elems, elems)
      };
    })
  };
}
function toDump(data, config = {}) {
  var _a;
  const indicesOptions = Object.assign({ sortAble: true }, config);
  const toKey$1 = (_a = config.toKey) !== null && _a !== void 0 ? _a : toKey;
  const bySetKey = new Map(data.sets.map((s, i) => [toKey$1(s), i]));
  const byCombinationKey = new Map(data.combinations.map((s, i) => [toKey$1(s), i]));
  const toSetRef = (s) => {
    if (s.type === "set") {
      return {
        type: s.type,
        index: bySetKey.get(toKey$1(s))
      };
    }
    const index = byCombinationKey.get(toKey$1(s));
    if (index == null || index < 0) {
      return toIndicesArray(s.elems, data.toElemIndex, indicesOptions);
    }
    return {
      type: s.type,
      index
    };
  };
  const setLookup = data.sets.map((s, i) => ({
    key: toKey$1(s),
    i
  }));
  return {
    sets: data.sets.map((set) => withColor({
      name: set.name,
      cardinality: set.cardinality,
      elems: toIndicesArray(set.elems, data.toElemIndex, indicesOptions)
    }, set)),
    combinations: config.compress === "no" ? data.combinations.map((c) => {
      const setKeys = new Set(Array.from(c.sets).map(toKey$1));
      return withColor({
        name: c.name,
        type: c.type,
        cardinality: c.cardinality,
        degree: c.degree,
        sets: setLookup.filter(({ key }) => setKeys.has(key)).map(({ i }) => i),
        elems: toIndicesArray(c.elems, data.toElemIndex, indicesOptions)
      }, c);
    }) : void 0,
    combinationOptions: data.combinationOptions,
    selection: data.selection ? Array.isArray(data.selection) ? toIndicesArray(data.selection, data.toElemIndex, indicesOptions) : toSetRef(data.selection) : void 0,
    queries: data.queries.map((query) => {
      const elems = isSetQuery(query) ? toSetRef(query.set) : toIndicesArray(Array.from(query.elems), data.toElemIndex, indicesOptions);
      return {
        name: query.name,
        color: query.color,
        set: typeof elems === "string" || Array.isArray(elems) ? void 0 : elems,
        elems: typeof elems === "string" || Array.isArray(elems) ? elems : void 0
      };
    })
  };
}
function generateName(sets2, type) {
  if (sets2.length === 1) {
    return sets2[0].name;
  }
  return `(${sets2.map((set) => set.name).join(SET_JOINERS[type])})`;
}
function toStaticDump(data, config = {}) {
  var _a;
  const toKey$1 = (_a = config.toKey) !== null && _a !== void 0 ? _a : toKey;
  const bySetKey = new Map(data.sets.map((s, i) => [toKey$1(s), i]));
  const byCombinationKey = new Map(data.combinations.map((s, i) => [toKey$1(s), i]));
  const toSelectionSetRef = (s) => {
    if (isSetLike(s)) {
      if (s.type === "set") {
        return {
          type: s.type,
          index: bySetKey.get(toKey$1(s))
        };
      }
      const index = byCombinationKey.get(toKey$1(s));
      if (index != null && index >= 0) {
        return {
          type: s.type,
          index
        };
      }
    }
    const overlapF = setOverlapFactory(isSetLike(s) ? s.elems : s);
    return data.sets.map((set) => overlapF(set.elems).intersection).concat(data.combinations.map((set) => overlapF(set.elems).intersection));
  };
  const setIndex = new Map(data.sets.map((set, i) => [toKey$1(set), i]));
  const overlaps = generateOverlapLookup(data.sets, data.combinations, config);
  const shortNames = config.compress === "yes";
  const compressCombination = (set) => {
    const partOf = Array.from(set.sets).map((s) => setIndex.get(toKey$1(s))).sort((a, b) => a - b);
    const r = {
      c: set.cardinality,
      s: partOf.reduce((acc, i) => acc + Math.pow(2, i), 0)
    };
    if (set.name !== generateName(partOf.map((i) => data.sets[i]), set.type)) {
      r.n = set.name;
    }
    if (set.type !== "intersection") {
      r.type = set.type[0];
    }
    if (set.color) {
      r.cc = set.color;
    }
    return r;
  };
  return {
    sets: shortNames ? data.sets.map((set) => ({ n: set.name, cc: set.color, c: set.cardinality })) : data.sets.map((set) => withColor({ name: set.name, cardinality: set.cardinality }, set)),
    combinations: shortNames ? data.combinations.map(compressCombination) : data.combinations.map((set) => withColor({
      name: set.name,
      cardinality: set.cardinality,
      type: set.type,
      sets: Array.from(set.sets).map((s) => setIndex.get(toKey$1(s))).sort((a, b) => a - b)
    }, set)),
    overlaps,
    selection: data.selection ? toSelectionSetRef(data.selection) : void 0,
    queries: data.queries.map((query) => {
      if (isSetQuery(query)) {
        const ref = toSelectionSetRef(query.set);
        if (Array.isArray(ref)) {
          return {
            name: query.name,
            color: query.color,
            overlaps: ref
          };
        }
        return {
          name: query.name,
          color: query.color,
          set: ref
        };
      }
      const overlapF = setOverlapFactory(query.elems);
      const overlaps2 = data.sets.map((set) => overlapF(set.elems).intersection).concat(data.combinations.map((set) => overlapF(set.elems).intersection));
      return {
        name: query.name,
        color: query.color,
        overlaps: overlaps2
      };
    })
  };
}
function isCompressed(s) {
  return typeof s.c === "number";
}
function isCompressedSet(s) {
  return typeof s.c === "number";
}
function fromStaticDump(dump, config = {}) {
  var _a;
  const toKey$1 = (_a = config.toKey) !== null && _a !== void 0 ? _a : toKey;
  let computeF = () => 0;
  function withOverlap(s) {
    s.overlap = (b) => computeF(s, b);
    return s;
  }
  const sets2 = dump.sets.map((set) => withOverlap({
    name: isCompressedSet(set) ? set.n : set.name,
    cardinality: isCompressedSet(set) ? set.c : set.cardinality,
    type: "set",
    elems: []
  }));
  const fromBit = (v) => {
    return sets2.filter((_, i) => {
      const position = Math.pow(2, i);
      return (v & position) === position;
    });
  };
  const combinations2 = dump.combinations.map((set) => {
    var _a2, _b;
    const partOf = isCompressed(set) ? fromBit(set.s) : set.sets.map((i) => sets2[i]);
    const lookup = {
      i: "intersection",
      u: "union",
      c: "composite",
      d: "distinctIntersection"
    };
    const type = lookup[((_a2 = set.type) !== null && _a2 !== void 0 ? _a2 : "i")[0]];
    return withOverlap({
      name: isCompressed(set) ? (_b = set.n) !== null && _b !== void 0 ? _b : generateName(partOf, type) : set.name,
      cardinality: isCompressed(set) ? set.c : set.cardinality,
      type,
      degree: partOf.length,
      sets: new Set(partOf),
      elems: []
    });
  });
  const { setIndex, combinationIndex, compute } = generateOverlapLookupFunction(dump.overlaps, sets2, combinations2, toKey$1);
  computeF = compute;
  function fromSetRef(ref) {
    if (ref.type === "set") {
      return sets2[ref.index];
    }
    return combinations2[ref.index];
  }
  function generateOverlap(lookup) {
    return (v) => {
      const key = toKey$1(v);
      const index = setIndex.has(key) ? setIndex.get(key) : combinationIndex.get(key);
      return index == null || index < 0 || index >= lookup.length ? 0 : lookup[index];
    };
  }
  return {
    sets: sets2,
    combinations: combinations2,
    selection: dump.selection ? Array.isArray(dump.selection) ? generateOverlap(dump.selection) : fromSetRef(dump.selection) : void 0,
    queries: dump.queries.map((query) => {
      if (query.set) {
        return {
          name: query.name,
          color: query.color,
          set: fromSetRef(query.set)
        };
      }
      return {
        name: query.name,
        color: query.color,
        overlap: generateOverlap(query.overlaps)
      };
    })
  };
}

// node_modules/@upsetjs/react/dist/index.js
var import_lz_string = __toESM(require_lz_string());
function extractStyleId(node) {
  return Array.from(node.classList).find((d) => d.startsWith("root-")).slice("root-".length);
}
function extractTitle(node, styleId) {
  var _a, _b;
  return (_b = (_a = node.querySelector(`titleTextStyle-${styleId}`)) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "UpSetJS";
}
function extractDescription(node, styleId) {
  var _a, _b;
  return (_b = (_a = node.querySelector(`descTextStyle-${styleId}`)) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
}
var EMPTY_OBJECT = {};
var EMPTY_ARRAY$2 = [];
var DEFAULT_FONT_SIZES = {
  setLabel: "16px",
  axisTick: "10px",
  chartLabel: "16px",
  barLabel: "10px",
  legend: "10px",
  description: "16px",
  title: "24px",
  valueLabel: "12px",
  exportLabel: "10px"
};
var DEFAULT_WIDTH_RATIO = [0.18, 0.12, 0.7];
var DEFAULT_HEIGHT_RATIO = [0.6, 0.4];
var DEFAULT_COMBINATIONS = {
  type: "intersection",
  order: ["cardinality:desc", "name:asc"]
};
var FONT_SIZES_KEYS = Object.keys(DEFAULT_FONT_SIZES);
var MULTI_STYLE_KEYS = [
  "axisTick",
  "bar",
  "barLabel",
  "chartLabel",
  "dot",
  "legend",
  "title",
  "description",
  "setLabel",
  "set",
  "valueLabel"
];
var EXPORT_OPTION_KEYS = ["dump", "png", "share", "svg", "vega"];
var OVERFLOW_OPACITY_FACTOR = [0.7, 0.4];
var OVERFLOW_PADDING_FACTOR = [0.15, 0.3];
var sets$6 = [];
var intersections$5 = [];
var bb$5 = {
  x: 0,
  y: 0,
  width: 10,
  height: 10
};
var venn0 = {
  sets: sets$6,
  intersections: intersections$5,
  bb: bb$5
};
var sets$5 = [
  {
    cx: 0,
    cy: 0,
    r: 5,
    text: {
      x: 3.5,
      y: -4
    },
    align: "start",
    verticalAlign: "bottom"
  }
];
var intersections$4 = [
  {
    sets: [
      0
    ],
    x1: 0,
    y1: 5,
    arcs: [
      {
        mode: "i",
        ref: 0,
        x2: 0,
        y2: -5,
        sweep: false,
        large: false
      },
      {
        mode: "i",
        ref: 0,
        x2: 0,
        y2: 5,
        sweep: false,
        large: false
      }
    ],
    text: {
      x: 0,
      y: 0
    }
  }
];
var bb$4 = {
  x: -5,
  y: -5,
  width: 10,
  height: 10
};
var venn1 = {
  sets: sets$5,
  intersections: intersections$4,
  bb: bb$4
};
var sets$4 = [
  {
    cx: -4,
    cy: 0,
    r: 5,
    text: {
      x: -7.5,
      y: 4
    },
    align: "end",
    verticalAlign: "top"
  },
  {
    cx: 4,
    cy: 0,
    r: 5,
    text: {
      x: 7.5,
      y: -4
    },
    align: "start",
    verticalAlign: "bottom"
  }
];
var intersections$3 = [
  {
    sets: [
      0
    ],
    x1: 0,
    y1: -3,
    arcs: [
      {
        mode: "i",
        ref: 0,
        x2: 0,
        y2: 3,
        sweep: false,
        large: true
      },
      {
        mode: "o",
        ref: 1,
        x2: 0,
        y2: -3,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: -4,
      y: 0
    }
  },
  {
    sets: [
      1
    ],
    x1: 0,
    y1: 3,
    arcs: [
      {
        mode: "i",
        ref: 1,
        x2: 0,
        y2: -3,
        sweep: false,
        large: true
      },
      {
        mode: "o",
        ref: 0,
        x2: 0,
        y2: 3,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: 4,
      y: 0
    }
  },
  {
    sets: [
      0,
      1
    ],
    x1: 0,
    y1: 3,
    arcs: [
      {
        mode: "i",
        ref: 0,
        x2: 0,
        y2: -3,
        sweep: false,
        large: false
      },
      {
        mode: "i",
        ref: 1,
        x2: 0,
        y2: 3,
        sweep: false,
        large: false
      }
    ],
    text: {
      x: 0,
      y: 0
    }
  }
];
var bb$3 = {
  x: -9,
  y: -5,
  width: 18,
  height: 10
};
var venn2 = {
  sets: sets$4,
  intersections: intersections$3,
  bb: bb$3
};
var sets$3 = [
  {
    cx: -3.464,
    cy: -2,
    r: 5,
    text: {
      x: -7,
      y: -6
    },
    align: "end",
    verticalAlign: "bottom"
  },
  {
    cx: 3.464,
    cy: -2,
    r: 5,
    text: {
      x: 7,
      y: -6
    },
    align: "start",
    verticalAlign: "bottom"
  },
  {
    cx: 0,
    cy: 4,
    r: 5,
    text: {
      x: 4,
      y: 7.5
    },
    align: "start",
    verticalAlign: "top"
  }
];
var intersections$2 = [
  {
    sets: [
      0
    ],
    x1: -4.855,
    y1: 2.803,
    arcs: [
      {
        mode: "o",
        ref: 2,
        x2: -1.39,
        y2: -0.803,
        sweep: true,
        large: false
      },
      {
        mode: "o",
        ref: 1,
        x2: 0,
        y2: -5.606,
        sweep: true,
        large: false
      },
      {
        mode: "i",
        ref: 0,
        x2: -4.855,
        y2: 2.803,
        sweep: false,
        large: true
      }
    ],
    text: {
      x: -4.216,
      y: -2.434
    }
  },
  {
    sets: [
      1
    ],
    x1: 0,
    y1: -5.606,
    arcs: [
      {
        mode: "o",
        ref: 0,
        x2: 1.39,
        y2: -0.803,
        sweep: true,
        large: false
      },
      {
        mode: "o",
        ref: 2,
        x2: 4.855,
        y2: 2.803,
        sweep: true,
        large: false
      },
      {
        mode: "i",
        ref: 1,
        x2: 0,
        y2: -5.606,
        sweep: false,
        large: true
      }
    ],
    text: {
      x: 4.216,
      y: -2.434
    }
  },
  {
    sets: [
      2
    ],
    x1: -4.855,
    y1: 2.803,
    arcs: [
      {
        mode: "o",
        ref: 0,
        x2: 0,
        y2: 1.606,
        sweep: false,
        large: false
      },
      {
        mode: "o",
        ref: 1,
        x2: 4.855,
        y2: 2.803,
        sweep: false,
        large: false
      },
      {
        mode: "i",
        ref: 2,
        x2: -4.855,
        y2: 2.803,
        sweep: true,
        large: true
      }
    ],
    text: {
      x: 0,
      y: 4.869
    }
  },
  {
    sets: [
      0,
      1
    ],
    x1: 0,
    y1: -5.606,
    arcs: [
      {
        mode: "i",
        ref: 1,
        x2: -1.39,
        y2: -0.803,
        sweep: false,
        large: false
      },
      {
        mode: "o",
        ref: 2,
        x2: 1.39,
        y2: -0.803,
        sweep: true,
        large: false
      },
      {
        mode: "i",
        ref: 0,
        x2: 0,
        y2: -5.606,
        sweep: false,
        large: false
      }
    ],
    text: {
      x: 0,
      y: -2.404
    }
  },
  {
    sets: [
      0,
      2
    ],
    x1: -4.855,
    y1: 2.803,
    arcs: [
      {
        mode: "i",
        ref: 2,
        x2: -1.39,
        y2: -0.803,
        sweep: true,
        large: false
      },
      {
        mode: "o",
        ref: 1,
        x2: 0,
        y2: 1.606,
        sweep: false,
        large: false
      },
      {
        mode: "i",
        ref: 0,
        x2: -4.855,
        y2: 2.803,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: -2.082,
      y: 1.202
    }
  },
  {
    sets: [
      1,
      2
    ],
    x1: 4.855,
    y1: 2.803,
    arcs: [
      {
        mode: "i",
        ref: 2,
        x2: 1.39,
        y2: -0.803,
        sweep: false,
        large: false
      },
      {
        mode: "o",
        ref: 0,
        x2: 0,
        y2: 1.606,
        sweep: true,
        large: false
      },
      {
        mode: "i",
        ref: 1,
        x2: 4.855,
        y2: 2.803,
        sweep: false,
        large: false
      }
    ],
    text: {
      x: 2.082,
      y: 1.202
    }
  },
  {
    sets: [
      0,
      1,
      2
    ],
    x1: 1.39,
    y1: -0.803,
    arcs: [
      {
        mode: "i",
        ref: 0,
        x2: 0,
        y2: 1.606,
        sweep: true,
        large: false
      },
      {
        mode: "i",
        ref: 1,
        x2: -1.39,
        y2: -0.803,
        sweep: true,
        large: false
      },
      {
        mode: "i",
        ref: 2,
        x2: 1.39,
        y2: -0.803,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: 0,
      y: 0
    }
  }
];
var bb$2 = {
  x: -8.464,
  y: -7,
  width: 16.928,
  height: 16
};
var venn3 = {
  sets: sets$3,
  intersections: intersections$2,
  bb: bb$2
};
var sets$2 = [
  {
    cx: 0.439,
    cy: -1.061,
    rx: 2.5,
    ry: 5,
    rotation: 45,
    text: {
      x: 4.5,
      y: -4.5
    },
    align: "start",
    verticalAlign: "bottom"
  },
  {
    cx: 2.561,
    cy: 1.061,
    rx: 2.5,
    ry: 5,
    rotation: 45,
    text: {
      x: 4,
      y: 3.75
    },
    align: "start",
    verticalAlign: "top"
  },
  {
    cx: -2.561,
    cy: 1.061,
    rx: 2.5,
    ry: 5,
    rotation: -45,
    text: {
      x: -4,
      y: 3.7
    },
    align: "end",
    verticalAlign: "top"
  },
  {
    cx: -0.439,
    cy: -1.061,
    rx: 2.5,
    ry: 5,
    rotation: -45,
    text: {
      x: -4.5,
      y: -4.5
    },
    align: "end",
    verticalAlign: "bottom"
  }
];
var intersections$1 = [
  {
    sets: [
      0
    ],
    x1: 0,
    y1: -3.94,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: 4.328,
        y2: -2.828,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 2.179,
        y2: -1.858,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 0,
        y2: -3.94,
        large: false
      }
    ],
    text: {
      x: 2.914,
      y: -3.536
    }
  },
  {
    sets: [
      1
    ],
    x1: 4.328,
    y1: -2.828,
    arcs: [
      {
        ref: 1,
        mode: "i",
        x2: 0,
        y2: 5.006,
        sweep: true,
        large: true
      },
      {
        ref: 2,
        mode: "o",
        x2: 1.328,
        y2: 2.828
      },
      {
        ref: 3,
        mode: "o",
        x2: 3.108,
        y2: -0.328
      },
      {
        ref: 0,
        mode: "o",
        x2: 4.328,
        y2: -2.828
      }
    ],
    text: {
      x: 5.036,
      y: -1.414
    }
  },
  {
    sets: [
      2
    ],
    x1: 0,
    y1: 5.006,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: -4.328,
        y2: -2.828,
        sweep: true,
        large: true
      },
      {
        ref: 3,
        mode: "o",
        x2: -3.108,
        y2: -0.328
      },
      {
        ref: 0,
        mode: "o",
        x2: -1.328,
        y2: 2.828
      },
      {
        ref: 1,
        mode: "o",
        x2: 0,
        y2: 5.006
      }
    ],
    text: {
      x: -5.036,
      y: -1.414
    }
  },
  {
    sets: [
      3
    ],
    x1: -4.328,
    y1: -2.828,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 0,
        y2: -3.94,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -2.179,
        y2: -1.858,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -4.328,
        y2: -2.828,
        large: false
      }
    ],
    text: {
      x: -2.914,
      y: -3.536
    }
  },
  {
    sets: [
      0,
      1
    ],
    x1: 4.328,
    y1: -2.828,
    arcs: [
      {
        ref: 1,
        mode: "i",
        x2: 3.108,
        y2: -0.328,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 2.179,
        y2: -1.858,
        sweep: false,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 4.328,
        y2: -2.828,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: 3.205,
      y: -1.672
    }
  },
  {
    sets: [
      0,
      2
    ],
    x1: -1.328,
    y1: 2.828,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: -3.108,
        y2: -0.328,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: -0.969,
        y2: 1.755,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -1.328,
        y2: 2.828,
        large: false
      }
    ],
    text: {
      x: -2.212,
      y: 1.591
    }
  },
  {
    sets: [
      0,
      3
    ],
    x1: 0,
    y1: -3.94,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 2.179,
        y2: -1.858,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 0,
        y2: 0.188,
        sweep: false,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -2.179,
        y2: -1.858,
        sweep: false,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 0,
        y2: -3.94,
        sweep: true
      }
    ],
    text: {
      x: 0,
      y: -1.87
    }
  },
  {
    sets: [
      1,
      2
    ],
    x1: 1.328,
    y1: 2.828,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: 0,
        y2: 5.006,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: -1.328,
        y2: 2.828,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 0,
        y2: 2.346,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 1.328,
        y2: 2.828
      }
    ],
    text: {
      x: 0,
      y: 3.393
    }
  },
  {
    sets: [
      1,
      3
    ],
    x1: 3.108,
    y1: -0.328,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 1.328,
        y2: 2.828,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: 0.969,
        y2: 1.755,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: 3.108,
        y2: -0.328,
        large: false
      }
    ],
    text: {
      x: 2.212,
      y: 1.591
    }
  },
  {
    sets: [
      2,
      3
    ],
    x1: -3.108,
    y1: -0.328,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: -4.328,
        y2: -2.828,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: -2.179,
        y2: -1.858,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -3.108,
        y2: -0.328,
        large: false
      }
    ],
    text: {
      x: -3.205,
      y: -1.672
    }
  },
  {
    sets: [
      0,
      1,
      2
    ],
    x1: 0,
    y1: 2.346,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: -1.328,
        y2: 2.828,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: -0.969,
        y2: 1.755,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 0,
        y2: 2.346,
        large: false
      }
    ],
    text: {
      x: -0.766,
      y: 2.31
    }
  },
  {
    sets: [
      0,
      1,
      3
    ],
    x1: 2.179,
    y1: -1.858,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 3.108,
        y2: -0.328,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 0.969,
        y2: 1.755,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: 0,
        y2: 0.188,
        sweep: false,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: 2.179,
        y2: -1.858,
        sweep: true
      }
    ],
    text: {
      x: 1.558,
      y: -0.056
    }
  },
  {
    sets: [
      0,
      2,
      3
    ],
    x1: -0.969,
    y1: 1.755,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: -3.108,
        y2: -0.328,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: -2.179,
        y2: -1.858,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: 0,
        y2: 0.188,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -0.969,
        y2: 1.755
      }
    ],
    text: {
      x: -1.558,
      y: -0.056
    }
  },
  {
    sets: [
      1,
      2,
      3
    ],
    x1: 1.328,
    y1: 2.828,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 0,
        y2: 2.346,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 0.969,
        y2: 1.755,
        sweep: false,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: 1.328,
        y2: 2.828,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: 0.766,
      y: 2.31
    }
  },
  {
    sets: [
      0,
      1,
      2,
      3
    ],
    x1: 0,
    y1: 0.188,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: 0.969,
        y2: 1.755,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 0,
        y2: 2.346,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: -0.969,
        y2: 1.755,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: 0,
        y2: 0.188,
        sweep: true
      }
    ],
    text: {
      x: 0,
      y: 1.43
    }
  }
];
var bb$1 = {
  x: -6.5,
  y: -5,
  width: 13,
  height: 10
};
var venn4 = {
  sets: sets$2,
  intersections: intersections$1,
  bb: bb$1
};
var sets$1 = [
  {
    cx: 0.5,
    cy: -1,
    rx: 2.5,
    ry: 5,
    rotation: 0,
    text: {
      x: 2.25,
      y: -5
    },
    align: "start",
    verticalAlign: "bottom"
  },
  {
    cx: 1.106,
    cy: 0.167,
    rx: 2.5,
    ry: 5,
    rotation: 72,
    text: {
      x: 4.5,
      y: 1.5
    },
    align: "start",
    verticalAlign: "top"
  },
  {
    cx: 0.183,
    cy: 1.103,
    rx: 2.5,
    ry: 5,
    rotation: 144,
    text: {
      x: 4,
      y: 4
    },
    align: "start",
    verticalAlign: "bottom"
  },
  {
    cx: -0.992,
    cy: 0.515,
    rx: 2.5,
    ry: 5,
    rotation: 216,
    text: {
      x: -4.7,
      y: 2
    },
    align: "end",
    verticalAlign: "bottom"
  },
  {
    cx: -0.797,
    cy: -0.785,
    rx: 2.5,
    ry: 5,
    rotation: 288,
    text: {
      x: -4,
      y: -3.6
    },
    align: "end",
    verticalAlign: "bottom"
  }
];
var intersections = [
  {
    sets: [
      0
    ],
    x1: -1.653,
    y1: -3.541,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: 2.857,
        y2: -2.666,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 2.5,
        y2: -2.648,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: -0.495,
        y2: -3.303,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: -1.653,
        y2: -3.541
      }
    ],
    text: {
      x: 0.5,
      y: -5
    }
  },
  {
    sets: [
      1
    ],
    x1: 2.857,
    y1: -2.666,
    arcs: [
      {
        ref: 1,
        mode: "i",
        x2: 3.419,
        y2: 1.893,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: 3.291,
        y2: 1.559,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: 2.988,
        y2: -1.492,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 2.857,
        y2: -2.666
      }
    ],
    text: {
      x: 4.91,
      y: -1.07
    }
  },
  {
    sets: [
      2
    ],
    x1: 3.419,
    y1: 1.893,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: -0.744,
        y2: 3.837,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: -0.466,
        y2: 3.612,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 2.342,
        y2: 2.381,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 3.419,
        y2: 1.893
      }
    ],
    text: {
      x: 2.534,
      y: 4.339
    }
  },
  {
    sets: [
      3
    ],
    x1: -0.744,
    y1: 3.837,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: -3.879,
        y2: 0.478,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: -3.579,
        y2: 0.673,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -1.54,
        y2: 2.963,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -0.744,
        y2: 3.837
      }
    ],
    text: {
      x: -3.343,
      y: 3.751
    }
  },
  {
    sets: [
      4
    ],
    x1: -3.879,
    y1: 0.478,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: -1.653,
        y2: -3.541,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -1.746,
        y2: -3.196,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -3.294,
        y2: -0.549,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: -3.879,
        y2: 0.478
      }
    ],
    text: {
      x: -4.601,
      y: -2.021
    }
  },
  {
    sets: [
      0,
      1
    ],
    x1: 2.5,
    y1: -2.648,
    arcs: [
      {
        ref: 1,
        mode: "i",
        x2: 2.857,
        y2: -2.666,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 2.988,
        y2: -1.492,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: 2.572,
        y2: -1.839,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 2.5,
        y2: -2.648
      }
    ],
    text: {
      x: 2.741,
      y: -2.152
    }
  },
  {
    sets: [
      0,
      2
    ],
    x1: 2.342,
    y1: 2.381,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: -0.466,
        y2: 3.612,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 0.257,
        y2: 2.922,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 2.342,
        y2: 2.381,
        large: false
      }
    ],
    text: {
      x: 0.5,
      y: 3.5
    }
  },
  {
    sets: [
      0,
      3
    ],
    x1: -0.495,
    y1: -3.303,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 2.5,
        y2: -2.648,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 1.51,
        y2: -2.515,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: -0.495,
        y2: -3.303,
        large: false
      }
    ],
    text: {
      x: 1.653,
      y: -3.125
    }
  },
  {
    sets: [
      0,
      4
    ],
    x1: -1.653,
    y1: -3.541,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: -0.495,
        y2: -3.303,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: -0.954,
        y2: -3.015,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -1.746,
        y2: -3.196,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: -1.653,
        y2: -3.541
      }
    ],
    text: {
      x: -1.199,
      y: -3.272
    }
  },
  {
    sets: [
      1,
      2
    ],
    x1: 3.291,
    y1: 1.559,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: 3.419,
        y2: 1.893,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: 2.342,
        y2: 2.381,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 2.544,
        y2: 1.878,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: 3.291,
        y2: 1.559
      }
    ],
    text: {
      x: 2.894,
      y: 1.942
    }
  },
  {
    sets: [
      1,
      3
    ],
    x1: -1.54,
    y1: 2.963,
    arcs: [
      {
        ref: 1,
        mode: "i",
        x2: -3.579,
        y2: 0.673,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: -2.7,
        y2: 1.147,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -1.54,
        y2: 2.963,
        large: false
      }
    ],
    text: {
      x: -3.174,
      y: 1.557
    }
  },
  {
    sets: [
      1,
      4
    ],
    x1: 2.988,
    y1: -1.492,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: 3.291,
        y2: 1.559,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: 2.858,
        y2: 0.659,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 2.988,
        y2: -1.492,
        large: false
      }
    ],
    text: {
      x: 3.483,
      y: 0.606
    }
  },
  {
    sets: [
      2,
      3
    ],
    x1: -0.466,
    y1: 3.612,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: -0.744,
        y2: 3.837,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: -1.54,
        y2: 2.963,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -1,
        y2: 3,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -0.466,
        y2: 3.612
      }
    ],
    text: {
      x: -0.953,
      y: 3.352
    }
  },
  {
    sets: [
      2,
      4
    ],
    x1: -3.294,
    y1: -0.549,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: -1.746,
        y2: -3.196,
        sweep: true
      },
      {
        ref: 0,
        mode: "o",
        x2: -1.925,
        y2: -2.213
      },
      {
        ref: 3,
        mode: "o",
        x2: -3.294,
        y2: -0.549
      }
    ],
    text: {
      x: -2.462,
      y: -2.538
    }
  },
  {
    sets: [
      3,
      4
    ],
    x1: -3.579,
    y1: 0.673,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: -3.879,
        y2: 0.478,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: -3.294,
        y2: -0.549,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -3.162,
        y2: -0.024,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -3.579,
        y2: 0.673
      }
    ],
    text: {
      x: -3.483,
      y: 0.13
    }
  },
  {
    sets: [
      0,
      1,
      2
    ],
    x1: 2.544,
    y1: 1.878,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: 2.342,
        y2: 2.381,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: 0.257,
        y2: 2.922,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 0.983,
        y2: 2.049,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: 2.544,
        y2: 1.878
      }
    ],
    text: {
      x: 1.457,
      y: 2.331
    }
  },
  {
    sets: [
      0,
      1,
      3
    ],
    x1: 1.51,
    y1: -2.515,
    arcs: [
      {
        ref: 1,
        mode: "i",
        x2: 2.5,
        y2: -2.648,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: 2.572,
        y2: -1.839,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: 1.51,
        y2: -2.515,
        large: false
      }
    ],
    text: {
      x: 2.194,
      y: -2.334
    }
  },
  {
    sets: [
      0,
      1,
      4
    ],
    x1: 2.572,
    y1: -1.839,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: 2.988,
        y2: -1.492,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 2.858,
        y2: 0.659,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: 2.253,
        y2: -0.302,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 2.572,
        y2: -1.839
      }
    ],
    text: {
      x: 2.667,
      y: -0.665
    }
  },
  {
    sets: [
      0,
      2,
      3
    ],
    x1: 0.257,
    y1: 2.922,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: -0.466,
        y2: 3.612,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: -1,
        y2: 3,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 0.257,
        y2: 2.922,
        large: false
      }
    ],
    text: {
      x: -0.403,
      y: 3.178
    }
  },
  {
    sets: [
      0,
      2,
      4
    ],
    x1: -1.746,
    y1: -3.196,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: -0.954,
        y2: -3.015,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: -1.925,
        y2: -2.213,
        sweep: false,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: -1.746,
        y2: -3.196,
        sweep: true,
        large: false
      }
    ],
    text: {
      x: -1.542,
      y: -2.808
    }
  },
  {
    sets: [
      0,
      3,
      4
    ],
    x1: -0.495,
    y1: -3.303,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: 1.51,
        y2: -2.515,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: 0.409,
        y2: -2.236,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -0.954,
        y2: -3.015,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: -0.495,
        y2: -3.303
      }
    ],
    text: {
      x: 0.192,
      y: -2.742
    }
  },
  {
    sets: [
      1,
      2,
      3
    ],
    x1: -1.54,
    y1: 2.963,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: -2.7,
        y2: 1.147,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: -1.645,
        y2: 1.568,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -1,
        y2: 3,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: -1.54,
        y2: 2.963
      }
    ],
    text: {
      x: -1.767,
      y: 2.106
    }
  },
  {
    sets: [
      1,
      2,
      4
    ],
    x1: 2.858,
    y1: 0.659,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: 3.291,
        y2: 1.559,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "i",
        x2: 2.544,
        y2: 1.878,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: 2.858,
        y2: 0.659,
        large: false
      }
    ],
    text: {
      x: 2.898,
      y: 1.365
    }
  },
  {
    sets: [
      1,
      3,
      4
    ],
    x1: -2.7,
    y1: 1.147,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: -3.579,
        y2: 0.673,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: -3.162,
        y2: -0.024,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: -2.7,
        y2: 1.147,
        large: false
      }
    ],
    text: {
      x: -3.147,
      y: 0.599
    }
  },
  {
    sets: [
      2,
      3,
      4
    ],
    x1: -3.294,
    y1: -0.549,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: -1.925,
        y2: -2.213,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -2,
        y2: -1.08,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -3.162,
        y2: -0.024,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: -3.294,
        y2: -0.549
      }
    ],
    text: {
      x: -2.548,
      y: -1.029
    }
  },
  {
    sets: [
      0,
      1,
      2,
      3
    ],
    x1: 0.983,
    y1: 2.049,
    arcs: [
      {
        ref: 3,
        mode: "i",
        x2: 0.257,
        y2: 2.922,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: -1,
        y2: 3,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: -1.645,
        y2: 1.568,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "o",
        x2: 0.983,
        y2: 2.049
      }
    ],
    text: {
      x: -0.407,
      y: 2.31
    }
  },
  {
    sets: [
      0,
      1,
      2,
      4
    ],
    x1: 2.253,
    y1: -0.302,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: 2.858,
        y2: 0.659,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: 2.544,
        y2: 1.878,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "i",
        x2: 0.983,
        y2: 2.049,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "o",
        x2: 2.253,
        y2: -0.302
      }
    ],
    text: {
      x: 2.071,
      y: 1.101
    }
  },
  {
    sets: [
      0,
      1,
      3,
      4
    ],
    x1: 1.51,
    y1: -2.515,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: 2.572,
        y2: -1.839,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: 2.253,
        y2: -0.302,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "o",
        x2: 0.409,
        y2: -2.236,
        sweep: false,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: 1.51,
        y2: -2.515,
        sweep: true
      }
    ],
    text: {
      x: 1.687,
      y: -1.63
    }
  },
  {
    sets: [
      0,
      2,
      3,
      4
    ],
    x1: -2,
    y1: -1.08,
    arcs: [
      {
        ref: 0,
        mode: "i",
        x2: -1.925,
        y2: -2.213,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: -0.954,
        y2: -3.015,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: 0.409,
        y2: -2.236,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "o",
        x2: -2,
        y2: -1.08
      }
    ],
    text: {
      x: -1.028,
      y: -2.108
    }
  },
  {
    sets: [
      1,
      2,
      3,
      4
    ],
    x1: -1.645,
    y1: 1.568,
    arcs: [
      {
        ref: 4,
        mode: "i",
        x2: -2.7,
        y2: 1.147,
        sweep: true,
        large: false
      },
      {
        ref: 2,
        mode: "i",
        x2: -3.162,
        y2: -0.024,
        sweep: true,
        large: false
      },
      {
        ref: 1,
        mode: "i",
        x2: -2,
        y2: -1.08,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "o",
        x2: -1.645,
        y2: 1.568
      }
    ],
    text: {
      x: -2.323,
      y: 0.327
    }
  },
  {
    sets: [
      0,
      1,
      2,
      3,
      4
    ],
    x1: 0.409,
    y1: -2.236,
    arcs: [
      {
        ref: 2,
        mode: "i",
        x2: 2.253,
        y2: -0.302,
        sweep: true,
        large: false
      },
      {
        ref: 3,
        mode: "i",
        x2: 0.983,
        y2: 2.049,
        sweep: true,
        large: false
      },
      {
        ref: 4,
        mode: "i",
        x2: -1.645,
        y2: 1.568,
        sweep: true,
        large: false
      },
      {
        ref: 0,
        mode: "i",
        x2: -2,
        y2: -1.08,
        sweep: true
      },
      {
        ref: 1,
        mode: "i",
        x2: 0.409,
        y2: -2.236,
        sweep: true
      }
    ],
    text: {
      x: 0,
      y: 0
    }
  }
];
var bb = {
  x: -5.5,
  y: -6,
  width: 11.6,
  height: 11.8
};
var venn5 = {
  sets: sets$1,
  intersections,
  bb
};
function isEllipse(d) {
  return typeof d.rx === "number";
}
var vennDiagramLayout = {
  maxSets: 5,
  compute(sets2, _combinations, width, height) {
    return layoutImpl(sets2.length, width, height);
  }
};
function layoutImpl(sets2, width, height) {
  const lookup = [venn0, venn1, venn2, venn3, venn4, venn5];
  const r = lookup[Math.min(lookup.length - 1, sets2)];
  const f = Math.min(width / r.bb.width, height / r.bb.height);
  const x = f * -r.bb.x + (width - f * r.bb.width) / 2;
  const y = f * -r.bb.y + (height - f * r.bb.height) / 2;
  const mx = (v) => x + f * v;
  const my = (v) => y + f * v;
  return {
    sets: r.sets.map((c) => Object.assign({}, c, {
      cx: mx(c.cx),
      cy: my(c.cy),
      text: {
        x: mx(c.text.x),
        y: my(c.text.y)
      }
    }, isEllipse(c) ? {
      rx: c.rx * f,
      ry: c.ry * f
    } : {
      r: c.r * f
    })),
    intersections: r.intersections.map((c) => ({
      text: {
        x: mx(c.text.x),
        y: my(c.text.y)
      },
      x1: mx(c.x1),
      y1: my(c.y1),
      sets: c.sets,
      arcs: c.arcs.map((a) => Object.assign({}, a, {
        x2: mx(a.x2),
        y2: my(a.y2)
      }))
    }))
  };
}
var lightTheme = {
  selectionColor: "#ffa500",
  color: "#000000",
  hasSelectionColor: "",
  opacity: 1,
  hasSelectionOpacity: -1,
  textColor: "#000000",
  hoverHintColor: "#cccccc",
  notMemberColor: "#d3d3d3",
  alternatingBackgroundColor: "rgba(0,0,0,0.05)",
  valueTextColor: "#000000",
  strokeColor: "#000000",
  backgroundColor: "#ffffff",
  filled: false
};
var darkTheme = {
  selectionColor: "#ffa500",
  color: "#cccccc",
  hasSelectionColor: "",
  opacity: 1,
  hasSelectionOpacity: -1,
  textColor: "#ffffff",
  hoverHintColor: "#d9d9d9",
  notMemberColor: "#666666",
  alternatingBackgroundColor: "rgba(255, 255, 255, 0.2)",
  valueTextColor: "#ffffff",
  strokeColor: "#ffffff",
  backgroundColor: "#303030",
  filled: false
};
var vegaTheme = {
  selectionColor: "#4c78a8",
  color: "#4c78a8",
  hasSelectionColor: "#c9d6e5",
  opacity: 1,
  hasSelectionOpacity: -1,
  textColor: "#000000",
  hoverHintColor: "#cccccc",
  notMemberColor: "#d3d3d3",
  alternatingBackgroundColor: "rgba(0,0,0,0.05)",
  valueTextColor: "#000000",
  strokeColor: "#000000",
  backgroundColor: "#ffffff",
  filled: true
};
function getDefaultTheme(theme2) {
  return theme2 === "vega" ? vegaTheme : theme2 === "dark" ? darkTheme : lightTheme;
}
function areCombinations$1(combinations2) {
  return Array.isArray(combinations2);
}
function styleFactory(rules) {
  return import_react.default.createElement("style", null, rules);
}
function fillGeneric(base, props, others = {}) {
  const theme2 = getDefaultTheme(props.theme);
  return Object.assign(base, {
    queryLegend: props.queries != null && props.queries.length > 0,
    theme: "light",
    padding: 20,
    selection: null,
    title: "",
    description: "",
    fontFamily: "sans-serif",
    queries: EMPTY_ARRAY$2,
    exportButtons: true,
    className: "",
    fontSizes: DEFAULT_FONT_SIZES,
    classNames: EMPTY_OBJECT,
    style: EMPTY_OBJECT,
    styles: EMPTY_OBJECT,
    toKey,
    tooltips: true,
    styleFactory
  }, theme2, props, others, props.fontSizes ? {
    fontSizes: Object.assign({}, DEFAULT_FONT_SIZES, props.fontSizes)
  } : EMPTY_OBJECT);
}
function fillDefaultsG(props) {
  return fillGeneric({
    barPadding: 0.3,
    dotPadding: 0.7,
    combinations: DEFAULT_COMBINATIONS,
    combinationName: props.combinations != null && !areCombinations$1(props.combinations) && props.combinations.type === "union" ? "Union Size" : "Intersection Size",
    barLabelOffset: 2,
    setNameAxisOffset: "auto",
    combinationNameAxisOffset: "auto",
    setName: "Set Size",
    widthRatios: DEFAULT_WIDTH_RATIO,
    heightRatios: DEFAULT_HEIGHT_RATIO,
    setLabelAlignment: "center",
    numericScale: "linear",
    bandScale: "band",
    childrenFactories: EMPTY_OBJECT,
    setAddons: EMPTY_ARRAY$2,
    combinationAddons: EMPTY_ARRAY$2,
    setAddonPadding: 1,
    combinationAddonPadding: 1,
    emptySelection: true
  }, props);
}
function valueFormat(v) {
  return v.toLocaleString();
}
function fillDefaults(props) {
  return fillDefaultsG(props);
}
function fillVennDiagramDefaultsG(props) {
  return fillGeneric({
    valueFormat,
    layout: vennDiagramLayout,
    setLabelOffsets: EMPTY_ARRAY$2
  }, props, {
    exportButtons: props.exportButtons === false ? false : Object.assign({}, props.exportButtons === true ? {} : props.exportButtons, { vega: false })
  });
}
function fillVennDiagramDefaults(props) {
  return fillVennDiagramDefaultsG(props);
}
function fillKarnaughMapDefaultsG(props) {
  return fillGeneric({
    numericScale: "linear",
    barPadding: 0.3,
    barLabelOffset: 2,
    combinationName: "Intersection Size",
    combinationNameAxisOffset: "auto"
  }, props, {
    exportButtons: props.exportButtons === false ? false : Object.assign({}, props.exportButtons === true ? {} : props.exportButtons, { vega: false })
  });
}
function fillKarnaughMapDefaults(props) {
  return fillKarnaughMapDefaultsG(props);
}
function createSVG(node, toRemove) {
  const clone = node.cloneNode(true);
  clone.style.backgroundColor = getDefaultTheme(node.dataset.theme).backgroundColor;
  if (toRemove) {
    Array.from(clone.querySelectorAll(toRemove)).forEach((d) => d.remove());
  }
  return new XMLSerializer().serializeToString(clone);
}
function exportSVG(node, { type = "png", title, toRemove }) {
  const b = new Blob([createSVG(node, toRemove)], {
    type: "image/svg+xml;charset=utf-8"
  });
  const styleId = extractStyleId(node);
  const chartTitle = title !== null && title !== void 0 ? title : extractTitle(node, styleId);
  const url = URL.createObjectURL(b);
  if (type === "svg") {
    downloadUrl(url, `${chartTitle}.${type}`, node.ownerDocument);
    URL.revokeObjectURL(url);
    return Promise.resolve();
  }
  return toPNG(url, node).then((purl) => {
    downloadUrl(purl, `${chartTitle}.${type}`, node.ownerDocument);
    URL.revokeObjectURL(url);
  });
}
function toPNG(url, node) {
  const canvas = node.ownerDocument.createElement("canvas");
  const bb2 = node.getBoundingClientRect();
  canvas.width = bb2.width;
  canvas.height = bb2.height;
  const ctx = canvas.getContext("2d");
  const img = new Image(canvas.width, canvas.height);
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL("image/png");
      resolve(png);
    };
    img.src = url;
  });
}
function downloadUrl(url, title, doc) {
  const a = doc.createElement("a");
  a.href = url;
  a.style.position = "absolute";
  a.style.left = "-10000px";
  a.style.top = "-10000px";
  a.download = title;
  doc.body.appendChild(a);
  a.click();
  a.remove();
}
function createVegaSpec(svg, title) {
  var _a, _b, _c, _d, _e;
  const resolveStyle = (_c = svg.getComputedStyle || ((_b = (_a = svg.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b.getComputedStyle)) !== null && _c !== void 0 ? _c : window.getComputedStyle;
  const styleId = extractStyleId(svg);
  const chartTitle = title !== null && title !== void 0 ? title : extractTitle(svg, styleId);
  const sets2 = Array.from(svg.querySelectorAll("[data-upset=sets] [data-cardinality]")).map((set) => {
    return {
      name: set.querySelector(`text.setTextStyle-${styleId}`).textContent,
      cardinality: Number.parseInt(set.dataset.cardinality, 10)
    };
  }).reverse();
  const barLabelOffset = -Number.parseFloat(svg.querySelector(`.sBarTextStyle-${styleId}`).getAttribute("dx"));
  const color = resolveStyle(svg.querySelector(`.fillPrimary-${styleId}`)).fill;
  const fillNotMember = resolveStyle(svg.querySelector(`.fillNotMember-${styleId}`)).fill;
  const textColor = resolveStyle(svg.querySelector("text")).fill;
  const csName = svg.querySelector(`.cChartTextStyle-${styleId}`).textContent;
  const setName = svg.querySelector(`.sChartTextStyle-${styleId}`).textContent;
  const combinations2 = Array.from(svg.querySelectorAll("[data-upset=cs] [data-cardinality]")).map((set) => {
    return {
      name: set.querySelector(`text.hoverBarTextStyle-${styleId}`).textContent,
      cardinality: Number.parseInt(set.dataset.cardinality, 10),
      sets: Array.from(set.querySelectorAll(`.fillPrimary-${styleId} > title`)).map((n) => n.textContent)
    };
  });
  const translateX = (v) => Number.parseFloat(v.getAttribute("transform").match(/([\d.]+),/)[1]);
  const translateY = (v) => Number.parseFloat(v.getAttribute("transform").match(/,([\d.]+)/)[1]);
  const base = svg.querySelector("[data-upset=base]");
  const padding = translateX(base);
  const setWidth = translateX(svg.querySelector("[data-upset=csaxis]"));
  const csWidth = Number.parseFloat(base.querySelector("g").firstElementChild.children[1].getAttribute("x2"));
  const csHeight = translateY(svg.querySelector("[data-upset=setaxis]"));
  const labelWidth = Number.parseFloat(svg.querySelector("defs rect").getAttribute("width"));
  const setHeight = Number.parseFloat(svg.querySelector("defs rect").getAttribute("height"));
  const radius = Number.parseFloat(svg.querySelector(`[data-cardinality] circle.fillPrimary-${styleId}`).getAttribute("r"));
  const hasPrimarySelection = svg.querySelector("[data-upset=sets-s] [data-cardinality]") != null;
  const hasQuery = svg.querySelector("[data-upset=sets-q] [data-cardinality]") != null;
  const hasSelection = hasPrimarySelection || hasQuery;
  let selectionColor = "orange";
  if (hasSelection) {
    Array.from(svg.querySelectorAll(`[data-upset=sets-${hasPrimarySelection ? "s]" : "q]:first-of-type"} [data-cardinality]`)).forEach((elem) => {
      const i = sets2.length - Number.parseInt(elem.dataset.i, 10) - 1;
      sets2[i].selection = Number.parseInt(elem.dataset.cardinality, 10);
    });
    Array.from(svg.querySelectorAll(`[data-upset=cs-${hasPrimarySelection ? "s]" : "q]:first-of-type"} [data-cardinality]`)).forEach((elem) => {
      const i = Number.parseInt(elem.dataset.i, 10);
      combinations2[i].selection = Number.parseInt(elem.dataset.cardinality, 10);
    });
    selectionColor = resolveStyle(svg.querySelector(`[data-upset=sets-${hasPrimarySelection ? "s" : "q"}] [data-cardinality]`)).fill;
  }
  const highlightedCombination = Number.parseInt((_e = (_d = svg.querySelector("[data-upset=cs-ss]")) === null || _d === void 0 ? void 0 : _d.dataset.i) !== null && _e !== void 0 ? _e : "-1", 10);
  const filter = highlightedCombination >= 0 ? {
    field: "partOf",
    oneOf: [1, 2]
  } : {
    field: "partOf",
    equal: 1
  };
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    title: chartTitle,
    description: extractDescription(svg, styleId),
    datasets: {
      sets: sets2,
      combinations: combinations2.map((c, i) => Object.assign({}, c, {
        partOf: highlightedCombination === i ? 2 : 1,
        nsets: [""]
      })).concat(combinations2.map((c) => ({
        name: c.name,
        cardinality: c.cardinality,
        // no selection!
        partOf: 0,
        sets: [""],
        nsets: sets2.filter((s) => !c.sets.includes(s.name)).map((s) => s.name)
      })))
    },
    vconcat: [
      {
        hconcat: [
          {
            mark: "bar",
            width: setWidth + labelWidth - 40,
            height: csHeight
          },
          {
            width: csWidth,
            height: csHeight,
            data: {
              name: "combinations"
            },
            transform: [
              {
                filter
              }
            ],
            layer: [
              {
                mark: {
                  type: "bar",
                  tooltip: true
                }
              },
              {
                mark: {
                  type: "text",
                  align: "center",
                  baseline: "bottom",
                  dy: -barLabelOffset
                },
                encoding: {
                  text: { field: "cardinality", type: "quantitative" }
                }
              },
              hasSelection && {
                mark: {
                  type: "bar",
                  fill: selectionColor,
                  tooltip: true
                },
                encoding: {
                  y: {
                    field: "selection",
                    type: "quantitative"
                  }
                }
              }
            ].filter(Boolean),
            encoding: {
              x: { field: "name", type: "ordinal", axis: null, sort: null },
              y: {
                field: "cardinality",
                type: "quantitative",
                axis: {
                  grid: false
                },
                title: csName
              }
            }
          }
        ]
      },
      {
        hconcat: [
          {
            width: setWidth,
            height: setHeight,
            data: {
              name: "sets"
            },
            layer: [
              {
                mark: {
                  type: "bar",
                  tooltip: true
                }
              },
              {
                mark: {
                  type: "text",
                  align: "right",
                  baseline: "middle",
                  dx: -barLabelOffset
                },
                encoding: {
                  text: { field: "cardinality", type: "quantitative" }
                }
              },
              hasSelection && {
                mark: {
                  type: "bar",
                  fill: selectionColor,
                  tooltip: true
                },
                encoding: {
                  x: {
                    field: "selection",
                    type: "quantitative"
                  }
                }
              }
            ].filter(Boolean),
            encoding: {
              y: { field: "name", type: "ordinal", axis: null, sort: null },
              x: {
                field: "cardinality",
                type: "quantitative",
                title: setName,
                sort: "descending",
                axis: {
                  grid: false
                }
              }
            }
          },
          {
            data: {
              name: "sets"
            },
            width: labelWidth,
            height: setHeight,
            mark: {
              type: "text",
              align: "center",
              baseline: "middle",
              fontSize: Number.parseInt(resolveStyle(svg.querySelector(`.setTextStyle-${styleId}`)).fontSize, 10)
            },
            encoding: {
              y: { field: "name", type: "ordinal", axis: null, sort: null },
              text: { field: "name", type: "ordinal" }
            }
          },
          {
            width: csWidth,
            height: setHeight,
            data: {
              name: "combinations"
            },
            transform: [
              {
                flatten: ["sets"],
                as: ["has_set"]
              },
              {
                flatten: ["nsets"],
                as: ["has_not_set"]
              },
              {
                calculate: "datum.has_set+datum.has_not_set",
                as: "set"
              }
            ],
            layer: [
              {
                mark: {
                  type: "circle",
                  size: radius * radius * Math.PI,
                  tooltip: true
                },
                encoding: {
                  color: {
                    field: "partOf",
                    type: "nominal",
                    legend: null,
                    scale: {
                      range: [fillNotMember, color].concat(highlightedCombination >= 0 ? [selectionColor] : [])
                    }
                  },
                  y: {
                    field: "set",
                    type: "ordinal",
                    axis: null,
                    sort: null,
                    scale: {
                      domain: sets2.map((s) => s.name)
                    }
                  }
                }
              },
              {
                mark: "rule",
                transform: [
                  {
                    filter
                  },
                  {
                    calculate: "datum.sets[datum.sets.length -1]",
                    as: "set_end"
                  }
                ],
                encoding: Object.assign({ y: { field: "sets[0]", type: "ordinal", axis: null, sort: null }, y2: { field: "set_end" } }, highlightedCombination < 0 ? {} : {
                  color: {
                    field: "partOf",
                    type: "nominal",
                    legend: null,
                    scale: {
                      range: [color, selectionColor]
                    }
                  }
                })
              }
            ],
            encoding: {
              x: { field: "name", type: "ordinal", axis: null, sort: null }
            }
          }
        ]
      }
    ],
    config: {
      padding,
      background: getDefaultTheme(svg.dataset.theme).backgroundColor,
      concat: {
        spacing: 0
      },
      view: {
        stroke: null
      },
      // scale: {
      //   bandPaddingInner: props.barPadding,
      //   bandPaddingOuter: props.barPadding,
      //   pointPadding: props.barPadding,
      // },
      bar: {
        fill: color
      },
      circle: {
        opacity: 1
      },
      rule: {
        stroke: color,
        strokeWidth: Number.parseInt(resolveStyle(svg.querySelector(`[data-upset=cs] [data-cardinality] line`)).strokeWidth, 10)
      },
      axis: {
        labelColor: textColor,
        labelFontSize: Number.parseInt(resolveStyle(svg.querySelector(`.axisTextStyle-${styleId}`)).fontSize, 10),
        titleColor: textColor,
        titleFontSize: Number.parseInt(resolveStyle(svg.querySelector(`.cChartTextStyle-${styleId}`)).fontSize, 10)
      },
      title: {
        color: textColor
      },
      text: {
        fill: textColor,
        fontSize: Number.parseInt(resolveStyle(svg.querySelector(`.sBarTextStyle-${styleId}`)).fontSize, 10)
      }
    }
  };
}
function exportVegaLite(svg, { title } = {}) {
  const spec = createVegaSpec(svg, title);
  const url = URL.createObjectURL(new Blob([JSON.stringify(spec, null, 2)], {
    type: "application/json"
  }));
  downloadUrl(url, `${spec.title}.json`, svg.ownerDocument);
  URL.revokeObjectURL(url);
}
var THEME_KEYS = [
  "selectionColor",
  "color",
  "textColor",
  "hoverHintColor",
  "notMemberColor",
  "alternatingBackgroundColor",
  "hasSelectionColor",
  "hasSelectionOpacity",
  "opacity",
  "strokeColor",
  "valueTextColor"
];
var LAYOUT_KEYS = [
  "padding",
  "barPadding",
  "dotPadding",
  "widthRatios",
  "heightRatios"
];
var STYLE_KEYS = [
  "fontSizes",
  "combinationName",
  "setName",
  "barLabelOffset",
  "setNameAxisOffset",
  "combinationNameAxisOffset",
  "theme",
  "fontFamily",
  "emptySelection",
  "exportButtons",
  "queryLegend"
];
var DUMP_KEYS = ["bandScale", "numericScale"].concat(THEME_KEYS, LAYOUT_KEYS, STYLE_KEYS);
function toDumpProps(props) {
  var _a;
  const full = fillDefaults({
    width: 0,
    height: 0,
    sets: (_a = props.sets) !== null && _a !== void 0 ? _a : [],
    combinations: props.combinations,
    theme: props.theme
  });
  const r = {};
  DUMP_KEYS.forEach((key) => {
    const value = props[key];
    const defaultValue = full[key];
    if (key === "theme" && value !== "light") {
      r[key] = value;
      return;
    }
    if (value == null || value === defaultValue) {
      return;
    }
    if (key === "fontSizes") {
      let empty = true;
      const sub = {};
      FONT_SIZES_KEYS.forEach((fKey) => {
        const fValue = value[fKey];
        const fDefaultValue = defaultValue[fKey];
        if (fValue !== fDefaultValue) {
          sub[fKey] = fValue;
          empty = false;
        }
      });
      if (!empty) {
        r[key] = sub;
      }
    } else {
      r[key] = value;
    }
  });
  return r;
}
function toUpSetJSDump(dump, elements, props, author, mode) {
  return Object.assign({
    $schema: "https://upset.js.org/schema.1.0.0.json",
    name: typeof props.title === "string" ? props.title : "UpSetJS",
    description: typeof props.description === "string" ? props.description : "",
    mode,
    author,
    elements,
    attrs: [],
    props: toDumpProps(props)
  }, dump);
}
function toUpSetJSStaticDump(dump, props, author, mode) {
  return Object.assign({
    $schema: "https://upset.js.org/schema-static.1.0.0.json",
    name: typeof props.title === "string" ? props.title : "UpSetJS",
    description: typeof props.description === "string" ? props.description : "",
    mode,
    author,
    props: toDumpProps(props)
  }, dump);
}
function exportDumpData(props, data, compress = false, mode) {
  var _a, _b;
  const elems = [];
  const lookup = /* @__PURE__ */ new Map();
  const toElemIndex = (elem) => {
    if (lookup.has(elem)) {
      return lookup.get(elem);
    }
    lookup.set(elem, elems.length);
    elems.push(elem);
    return elems.length - 1;
  };
  const dump = toDump({
    sets: props.sets,
    queries: (_b = (_a = props.queries) === null || _a === void 0 ? void 0 : _a.filter((d) => isElemQuery(d) || isSetQuery(d))) !== null && _b !== void 0 ? _b : [],
    toElemIndex,
    selection: props.selection && isSetLike(props.selection) ? props.selection : void 0,
    combinations: data.cs.v,
    combinationOptions: Array.isArray(props.combinations) ? {} : props.combinations
  }, {
    compress: compress ? "yes" : "no"
  });
  return toUpSetJSDump(dump, elems, props, void 0, mode);
}
function exportStaticDumpData(props, data, compress = false, mode) {
  var _a, _b;
  const dump = toStaticDump({
    sets: props.sets,
    queries: (_b = (_a = props.queries) === null || _a === void 0 ? void 0 : _a.filter((d) => isElemQuery(d) || isSetQuery(d))) !== null && _b !== void 0 ? _b : [],
    selection: props.selection && isSetLike(props.selection) ? props.selection : void 0,
    combinations: data.cs.v
  }, {
    compress: compress ? "yes" : "no"
  });
  return toUpSetJSStaticDump(dump, props, void 0, mode);
}
function exportDump(svg, props, data, mode) {
  const dump = exportDumpData(props, data, false, mode);
  const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], {
    type: "application/json"
  }));
  downloadUrl(url, `${dump.name}.json`, svg.ownerDocument);
  URL.revokeObjectURL(url);
}
var MAX_URL_LENGTH = 2048 * 2;
function exportSharedLink(props, data, mode) {
  const r = exportDumpData(props, data, true, mode);
  delete r.$schema;
  const arg = import_lz_string.default.compressToEncodedURIComponent(JSON.stringify(r));
  const url = new URL("https://upset.js.org/app/embed.html");
  url.searchParams.set("p", arg);
  if (url.toString().length < MAX_URL_LENGTH) {
    window.open(url.toString(), "_blank");
    return true;
  }
  const r2 = exportStaticDumpData(props, data, true, mode);
  delete r2.$schema;
  const arg2 = import_lz_string.default.compressToEncodedURIComponent(JSON.stringify(r2));
  url.searchParams.set("p", arg2);
  if (url.toString().length < MAX_URL_LENGTH) {
    window.open(url.toString(), "_blank");
    return true;
  }
  url.searchParams.delete("p");
  const w = window.open(url.toString(), "_blank");
  w === null || w === void 0 ? void 0 : w.addEventListener("load", () => {
    w === null || w === void 0 ? void 0 : w.postMessage(r, url.origin);
  });
  return false;
}
function clsx(...classNames2) {
  return classNames2.filter(Boolean).join(" ");
}
function generateId(_args) {
  return `upset-${Math.random().toString(36).slice(4)}`;
}
function isSetLike2(s) {
  return s != null && !Array.isArray(s);
}
function elemOverlapOf(query, toElemKey) {
  const f = setOverlapFactory(query, toElemKey);
  return (s) => {
    return f(s.elems).intersection;
  };
}
function noGuessPossible() {
  return -1;
}
function generateSelectionOverlap(selection2, overlapGuesser, toElemKey) {
  if (!selection2) {
    return noOverlap;
  }
  if (typeof selection2 === "function") {
    return selection2;
  }
  if (Array.isArray(selection2)) {
    return elemOverlapOf(selection2, toElemKey);
  }
  const ss = selection2;
  if (ss.overlap) {
    return ss.overlap.bind(ss);
  }
  let f = null;
  return (s) => {
    if (s.overlap) {
      return s.overlap(ss);
    }
    const guess = overlapGuesser(s, ss);
    if (guess >= 0) {
      return guess;
    }
    if (!f) {
      f = elemOverlapOf(ss.elems, toElemKey);
    }
    return f(s);
  };
}
function generateSelectionName(selection2) {
  var _a;
  return Array.isArray(selection2) ? `Array(${selection2.length})` : typeof selection2 === "function" ? "?" : (_a = selection2) === null || _a === void 0 ? void 0 : _a.name;
}
function elemElemOverlapOf(query, toElemKey) {
  const f = setElemOverlapFactory(query, toElemKey);
  return (s) => {
    return f(s.elems).intersection;
  };
}
function noOverlap() {
  return 0;
}
function parseFontSize(v) {
  if (v == null) {
    return 10;
  }
  if (v.endsWith("pt")) {
    return Math.floor(4 / 3 * Number.parseInt(v, 10));
  }
  return Number.parseInt(v, 10);
}
function toAnchor(alignment) {
  var _a;
  const alignments = {
    left: "start",
    center: "middle",
    right: "end"
  };
  return (_a = alignments[alignment]) !== null && _a !== void 0 ? _a : "middle";
}
function resolveNumericScale(factory) {
  if (factory === "linear") {
    return linearScale;
  }
  if (factory === "log") {
    return logScale;
  }
  return factory;
}
function resolveBandScale(factory) {
  return factory === "band" ? bandScale : factory;
}
function areCombinations(combinations2) {
  return Array.isArray(combinations2);
}
function deriveDataDependent(sets2, combinations2, sizes, numericScale2, bandScale3, barLabelFontSize, dotPadding, barPadding, tickFontSize, combinationAddons, toKey2, toElemKey, id, setMaxScale, combinationMaxScale) {
  var _a;
  const numericScaleFactory = resolveNumericScale(numericScale2);
  const bandScaleFactory = resolveBandScale(bandScale3);
  const cs = areCombinations(combinations2) ? combinations2 : generateCombinations(sets2, Object.assign({ toElemKey }, DEFAULT_COMBINATIONS, combinations2));
  const csKeys = cs.map(toKey2);
  const combinationX = bandScaleFactory(csKeys, sizes.cs.w, sizes.padding);
  const dataCSCardinality = cs.reduce((acc, d) => Math.max(acc, d.cardinality), 0);
  const maxCSCardinality = combinationMaxScale !== null && combinationMaxScale !== void 0 ? combinationMaxScale : dataCSCardinality;
  const combinationYEnd = maxCSCardinality > dataCSCardinality ? 0 : barLabelFontSize;
  const combinationY = numericScaleFactory(maxCSCardinality, [sizes.cs.h, combinationYEnd], {
    orientation: "vertical",
    fontSizeHint: tickFontSize
  });
  const labelSize = (text) => Math.floor(barLabelFontSize / 1.4 * 0.7 * text.length);
  const guessLabelWidth = (v) => labelSize(combinationY.tickFormat()(v));
  const dataSetCardinality = sets2.reduce((acc, d) => Math.max(acc, d.cardinality), 0);
  const maxSetCardinality = setMaxScale !== null && setMaxScale !== void 0 ? setMaxScale : dataSetCardinality;
  const largestSetLabelWidth = guessLabelWidth(maxSetCardinality);
  let largestCSLabelWidth = guessLabelWidth(maxCSCardinality);
  for (const addon of combinationAddons) {
    if (!addon.scale) {
      continue;
    }
    const ticks = addon.scale.ticks(3);
    const f = addon.scale.tickFormat();
    for (const tick of ticks) {
      const l = typeof tick === "number" ? f(tick) : (_a = tick.label) !== null && _a !== void 0 ? _a : f(tick.value);
      const size = labelSize(l);
      if (size > largestCSLabelWidth) {
        largestCSLabelWidth = size;
      }
    }
  }
  const setShift = maxSetCardinality > dataSetCardinality ? 0 : largestSetLabelWidth;
  const setX = numericScaleFactory(maxSetCardinality, [sizes.sets.w, setShift], {
    orientation: "horizontal",
    fontSizeHint: tickFontSize
  });
  const setKeys = sets2.map(toKey2);
  const setY = bandScaleFactory(
    setKeys.slice().reverse(),
    // reverse order
    sizes.sets.h,
    sizes.padding
  );
  const r = Math.min(setY.bandwidth(), combinationX.bandwidth()) / 2 * dotPadding;
  const triangleSize = Math.max(2, Math.min(setY.bandwidth(), combinationX.bandwidth()) / 2 * barPadding);
  return {
    id: id ? id : generateId(),
    r,
    triangleSize,
    sets: {
      v: sets2,
      keys: setKeys,
      rv: sets2.slice().reverse(),
      x: setX,
      xAxisWidth: sizes.sets.w - setShift,
      y: (s) => setY(toKey2(s)),
      max: maxSetCardinality,
      bandWidth: setY.bandwidth(),
      cy: setY.bandwidth() / 2 + sizes.cs.h,
      format: setX.tickFormat(),
      labelOffset: barLabelFontSize + 9 + 2
    },
    cs: {
      v: cs,
      keys: cs.map(toKey2),
      x: (s) => combinationX(toKey2(s)),
      max: maxCSCardinality,
      y: combinationY,
      yAxisWidth: sizes.cs.h - combinationYEnd,
      cx: combinationX.bandwidth() / 2,
      bandWidth: combinationX.bandwidth(),
      format: combinationY.tickFormat(),
      has: (v, s) => {
        const sk = toKey2(s);
        return Array.from(v.sets).some((ss) => toKey2(ss) === sk);
      },
      labelOffset: largestCSLabelWidth + 9 + 6
    },
    toKey: toKey2,
    toElemKey,
    overlapGuesser: generateOverlapFunction(cs, noGuessPossible, toKey2)
  };
}
function deriveSizeDependent(width, height, margin, barPadding, widthRatios2, heightRatios2, setAddons, combinationAddons, id, setAddonPadding, combinationAddonPadding) {
  const setAddonsBefore = setAddons.reduce((acc, a) => acc + (a.position === "before" ? a.size + setAddonPadding : 0), 0);
  const setAddonsAfter = setAddons.reduce((acc, a) => acc + (a.position !== "before" ? a.size + setAddonPadding : 0), 0);
  const combinationAddonsBefore = combinationAddons.reduce((acc, a) => acc + (a.position === "before" ? a.size + setAddonPadding : 0), 0);
  const combinationAddonsAfter = combinationAddons.reduce((acc, a) => acc + (a.position !== "before" ? a.size + setAddonPadding : 0), 0);
  const h = height - 2 * margin - 20 - combinationAddonsAfter - combinationAddonsBefore;
  const w = width - 2 * margin - setAddonsBefore - setAddonsAfter;
  const setWidth = widthRatios2[0] > 1 ? widthRatios2[0] : w * widthRatios2[0];
  const labelsWidth = widthRatios2[1] > 1 ? widthRatios2[1] : w * widthRatios2[1];
  const combinationHeight = heightRatios2[0] > 1 ? heightRatios2[0] : h * heightRatios2[0];
  return {
    id: id ? id : generateId(),
    cs: {
      before: combinationAddonsBefore,
      after: combinationAddonsAfter,
      x: setAddonsBefore + setWidth + labelsWidth,
      y: combinationAddonsBefore,
      w: w - setWidth - labelsWidth,
      h: combinationHeight,
      addons: combinationAddons,
      addonPadding: combinationAddonPadding
    },
    labels: {
      x: setAddonsBefore + setWidth,
      y: combinationAddonsBefore + combinationHeight,
      w: labelsWidth,
      h: h - combinationHeight
    },
    sets: {
      before: setAddonsBefore,
      after: setAddonsAfter,
      x: setAddonsBefore,
      y: combinationAddonsBefore + combinationHeight,
      w: setWidth,
      h: h - combinationHeight,
      addons: setAddons,
      addonPadding: setAddonPadding
    },
    padding: barPadding,
    legend: {
      x: width / 2
    },
    margin,
    w: width,
    h: height
  };
}
function deriveStyleDependent$1(theme2, styles2, classNames2, combinationName, combinationNameAxisOffset, setName, setNameAxisOffset, styleId, barLabelOffset, selectionColor, emptySelection, title, description, tooltips, setLabelAlignment2) {
  return {
    theme: theme2,
    styles: styles2,
    classNames: classNames2,
    cs: {
      name: combinationName,
      offset: combinationNameAxisOffset
    },
    sets: {
      name: setName,
      offset: setNameAxisOffset
    },
    emptySelection,
    id: styleId,
    barLabelOffset,
    selectionColor,
    title,
    description,
    tooltips,
    setLabelAlignment: setLabelAlignment2
  };
}
function ExportButtons({ transform, styleId, exportButtons: exportButtons2, exportChart }) {
  if (!exportButtons2) {
    return null;
  }
  const svgWidth = 26;
  const pngWidth = 26;
  const vegaWidth = 34;
  const dumpWidth = 34;
  const shareWidth = 42;
  const space = 2;
  let acc = 0;
  const buttons = [];
  if (exportButtons2 === true || exportButtons2.svg !== false) {
    acc += svgWidth;
    buttons.push(import_react.default.createElement(
      "g",
      { key: "svg", className: `exportButton-${styleId}`, onClick: exportChart, "data-type": "svg", transform: `translate(-${acc}, 0)` },
      import_react.default.createElement("title", null, "Download SVG Image"),
      import_react.default.createElement("rect", { y: -9, width: svgWidth, height: 11, rx: 2, ry: 2 }),
      import_react.default.createElement("text", { className: `exportTextStyle-${styleId}`, x: svgWidth / 2 }, "SVG")
    ));
    acc += space;
  }
  if (exportButtons2 === true || exportButtons2.png !== false) {
    acc += pngWidth;
    buttons.push(import_react.default.createElement(
      "g",
      { key: "png", className: `exportButton-${styleId}`, onClick: exportChart, "data-type": "png", transform: `translate(-${acc}, 0)` },
      import_react.default.createElement("title", null, "Download PNG Image"),
      import_react.default.createElement("rect", { y: -9, width: pngWidth, height: 11, rx: 2, ry: 2 }),
      import_react.default.createElement("text", { className: `exportTextStyle-${styleId}`, x: pngWidth / 2 }, "PNG")
    ));
    acc += space;
  }
  if (exportButtons2 === true || exportButtons2.vega !== false) {
    acc += vegaWidth;
    buttons.push(import_react.default.createElement(
      "g",
      { key: "vega", className: `exportButton-${styleId}`, onClick: exportChart, "data-type": "vega", transform: `translate(-${acc}, 0)` },
      import_react.default.createElement("title", null, "Download VEGA-Lite Specification"),
      import_react.default.createElement("rect", { y: -9, width: vegaWidth, height: 11, rx: 2, ry: 2 }),
      import_react.default.createElement("text", { className: `exportTextStyle-${styleId}`, x: vegaWidth / 2 }, "VEGA")
    ));
    acc += space;
  }
  if (exportButtons2 === true || exportButtons2.dump !== false) {
    acc += dumpWidth;
    buttons.push(import_react.default.createElement(
      "g",
      { key: "dump", className: `exportButton-${styleId}`, onClick: exportChart, "data-type": "dump", transform: `translate(-${acc}, 0)` },
      import_react.default.createElement("title", null, "Download UpSet.js JSON Dump"),
      import_react.default.createElement("rect", { y: -9, width: dumpWidth, height: 11, rx: 2, ry: 2 }),
      import_react.default.createElement("text", { className: `exportTextStyle-${styleId}`, x: dumpWidth / 2 }, "DUMP")
    ));
    acc += space;
  }
  if (exportButtons2 === true || exportButtons2.share !== false) {
    acc += shareWidth;
    buttons.push(import_react.default.createElement(
      "g",
      { key: "share", className: `exportButton-${styleId}`, onClick: exportChart, "data-type": "share", transform: `translate(-${acc}, 0)` },
      import_react.default.createElement("title", null, "Open a shareable URL"),
      import_react.default.createElement("rect", { y: -9, width: shareWidth, height: 11, rx: 2, ry: 2 }),
      import_react.default.createElement("text", { className: `exportTextStyle-${styleId}`, x: shareWidth / 2 }, "SHARE")
    ));
    acc += space;
  }
  return import_react.default.createElement("g", { className: `exportButtons-${styleId}`, transform }, buttons);
}
var QueryLegend = import_react.default.memo(function QueryLegend2({ queries: queries2, x, style: style2, data }) {
  return import_react.default.createElement("text", { transform: `translate(${x},4)`, style: style2.styles.legend, className: clsx(`legendTextStyle-${style2.id}`, style2.classNames.legend) }, queries2.map((q, i) => {
    let count = null;
    if (isSetQuery(q)) {
      count = q.set.cardinality;
    } else if (isElemQuery(q)) {
      count = q.elems instanceof Set ? q.elems.size : q.elems.length;
    }
    return import_react.default.createElement(
      import_react.default.Fragment,
      { key: q.name },
      import_react.default.createElement("tspan", { className: `fillQ${i}-${data.id}` }, "  ⬤ "),
      import_react.default.createElement(
        "tspan",
        null,
        q.name,
        count != null ? `: ${data.sets.format(count)}` : ""
      )
    );
  }));
});
var HorizontalTick = import_react.default.memo(function HorizontalTick2({ pos, spacing, tickSizeInner, orient, name, style: style2 }) {
  const k = orient === "top" || orient === "left" ? -1 : 1;
  return import_react.default.createElement(
    "g",
    { transform: `translate(0, ${pos + 0.5})` },
    name && import_react.default.createElement("text", { x: k * spacing, dy: "0.32em", className: clsx(`axisTextStyle-${style2.id}`, orient === "right" ? `startText-${style2.id}` : `endText-${style2.id}`, style2.classNames.axisTick), style: style2.styles.axisTick }, name),
    import_react.default.createElement("line", { x2: k * tickSizeInner, className: `axisLine-${style2.id}` })
  );
});
var VerticalTick = import_react.default.memo(function VerticalTick2({ pos, name, spacing, orient, tickSizeInner, style: style2 }) {
  const k = orient === "top" || orient === "left" ? -1 : 1;
  return import_react.default.createElement(
    "g",
    { transform: `translate(${pos + 0.5}, 0)` },
    name && import_react.default.createElement("text", { y: k * spacing, dy: orient === "top" ? "0em" : "0.71em", className: clsx(`axisTextStyle-${style2.id}`, style2.classNames.axisTick), style: style2.styles.axisTick }, name),
    import_react.default.createElement("line", { y2: k * tickSizeInner, className: `axisLine-${style2.id}` })
  );
});
function Axis({ scale, orient, tickSizeInner = 6, tickSizeOuter = 6, tickPadding = 3, size, start, style: style2, transform }) {
  const spacing = Math.max(tickSizeInner, 0) + tickPadding;
  const range0 = start;
  const range1 = size;
  const k = orient === "top" || orient === "left" ? -1 : 1;
  const Tick = orient === "left" || orient === "right" ? HorizontalTick : VerticalTick;
  const values = scale.ticks().map((d) => typeof d === "number" ? { value: d, label: d.toLocaleString() } : d);
  return import_react.default.createElement(
    "g",
    { transform },
    values.map((d) => import_react.default.createElement(Tick, { key: d.value, pos: scale(d.value), name: d.label, spacing, tickSizeInner, orient, style: style2 })),
    import_react.default.createElement("path", { className: `axisLine-${style2.id}`, d: orient === "left" || orient === "right" ? tickSizeOuter ? `M${k * tickSizeOuter},${range0}H0.5V${range1}H${k * tickSizeOuter}` : `M0.5,${range0}V${range1}` : tickSizeOuter ? `M${range0},${k * tickSizeOuter}V0.5H${range1}V${k * tickSizeOuter}` : `M${range0},0.5H${range1}` })
  );
}
var MultilineText = import_react.default.memo(function MultilineText2({ width, text, dy, x, style: style2, className }) {
  const ref = (0, import_react.useRef)(null);
  const [lines, setLines] = (0, import_react.useState)(typeof text === "string" ? [text] : []);
  (0, import_react.useLayoutEffect)(() => {
    if (typeof text === "string") {
      setLines([text]);
    } else {
      setLines([]);
    }
  }, [text]);
  (0, import_react.useLayoutEffect)(() => {
    if (!ref.current || ref.current.childElementCount > 0 || typeof text !== "string" || typeof ref.current.getComputedTextLength !== "function") {
      return;
    }
    const len2 = ref.current.getComputedTextLength();
    const lines2 = [];
    let lineWidth = width;
    let start = 0;
    const p = ref.current.getStartPositionOfChar(0);
    while (len2 > lineWidth) {
      p.x = lineWidth;
      const num = ref.current.getCharNumAtPosition(p);
      const space = text.lastIndexOf(" ", num);
      if (space < start) {
        break;
      }
      lines2.push(text.slice(start, space + 1));
      const used = ref.current.getEndPositionOfChar(space + 1).x;
      start = space + 1;
      lineWidth = used + width;
    }
    lines2.push(text.slice(start));
    setLines(lines2);
  }, [ref, text, width]);
  if (!text) {
    return null;
  }
  return import_react.default.createElement("tspan", { ref, dy, style: style2, x, className }, lines.length > 1 ? lines.map((l, i) => import_react.default.createElement("tspan", { key: l, x: 0, dy: i > 0 ? "1.2em" : dy }, l)) : text);
});
var UpSetTitle = import_react.default.memo(function UpSetTitle2({ width, descriptionWidth = width, style: style2 }) {
  if (!style2.title && !style2.description) {
    return null;
  }
  return import_react.default.createElement(
    "text",
    null,
    import_react.default.createElement(MultilineText, { text: style2.title, width, dy: "10px", className: clsx(`titleTextStyle-${style2.id}`, style2.classNames.title), style: style2.styles.title }),
    import_react.default.createElement(MultilineText, { x: 0, width: descriptionWidth, dy: style2.title ? "2em" : "10px", text: style2.description, className: clsx(`descTextStyle-${style2.id}`, style2.classNames.description), style: style2.styles.description })
  );
});
function noop() {
  return void 0;
}
function wrap(f) {
  if (!f) {
    return noop;
  }
  return (set, addons) => {
    return function(evt) {
      return f.call(this, set, evt.nativeEvent, addons.map((a) => a.createOnHandlerData ? a.createOnHandlerData(set) : null));
    };
  };
}
function addonPositionGenerator(total, padding) {
  let beforeAcc = 0;
  let afterAcc = 0;
  return (addon) => {
    let x = 0;
    if (addon.position === "before") {
      beforeAcc += addon.size + padding;
      x = -beforeAcc;
    } else {
      x = total + afterAcc + padding;
      afterAcc += addon.size + padding;
    }
    return x;
  };
}
function mergeColor(style2, color, prop = "fill") {
  if (!color) {
    return style2;
  }
  if (!style2) {
    return !color ? void 0 : { [prop]: color };
  }
  return Object.assign({ [prop]: color }, style2);
}
var UpSetAxis = import_react.default.memo(function UpSetAxis2({ size, style: style2, data }) {
  const setPosGen = addonPositionGenerator(size.sets.w + size.labels.w + size.cs.w, size.sets.addonPadding);
  const combinationPosGen = addonPositionGenerator(size.cs.h + size.sets.h, size.cs.addonPadding);
  const csNameOffset = style2.cs.offset === "auto" ? data.cs.labelOffset : style2.cs.offset;
  const setNameOffset = style2.sets.offset === "auto" ? data.sets.labelOffset : style2.sets.offset;
  return import_react.default.createElement(
    "g",
    null,
    import_react.default.createElement(UpSetTitle, { style: style2, width: size.cs.x - csNameOffset - 20 }),
    size.cs.h > 0 && import_react.default.createElement(
      "g",
      { transform: `translate(${size.cs.x},${size.cs.y})`, "data-upset": "csaxis" },
      import_react.default.createElement(Axis, { scale: data.cs.y, orient: "left", size: size.cs.h, start: size.cs.h - data.cs.yAxisWidth, style: style2 }),
      import_react.default.createElement("line", { x1: 0, x2: size.cs.w, y1: size.cs.h + 1, y2: size.cs.h + 1, className: `axisLine-${style2.id}` }),
      import_react.default.createElement("text", { className: clsx(`cChartTextStyle-${style2.id}`, style2.classNames.chartLabel), style: style2.styles.chartLabel, transform: `translate(${-csNameOffset}, ${size.cs.h / 2})rotate(-90)` }, style2.cs.name),
      size.cs.addons.map((addon) => {
        const pos = combinationPosGen(addon);
        const title = import_react.default.createElement("text", { key: addon.name, className: clsx(`cChartTextStyle-${style2.id}`, style2.classNames.chartLabel), style: style2.styles.chartLabel, transform: `translate(${-csNameOffset}, ${pos + addon.size / 2})rotate(-90)` }, addon.name);
        if (!addon.scale) {
          return title;
        }
        return import_react.default.createElement(
          import_react.default.Fragment,
          { key: addon.name },
          import_react.default.createElement(Axis, { scale: addon.scale, orient: "left", size: addon.size, start: 0, style: style2, transform: `translate(0,${pos})` }),
          title
        );
      })
    ),
    size.sets.w > 0 && import_react.default.createElement(
      "g",
      { transform: `translate(${size.sets.x},${size.sets.y})`, "data-upset": "setaxis" },
      import_react.default.createElement(Axis, { scale: data.sets.x, orient: "bottom", size: size.sets.w, start: size.sets.w - data.sets.xAxisWidth, transform: `translate(0, ${size.sets.h})`, style: style2 }),
      import_react.default.createElement("text", { className: clsx(`sChartTextStyle-${style2.id}`, style2.classNames.chartLabel), style: style2.styles.chartLabel, transform: `translate(${size.sets.w / 2}, ${size.sets.h + setNameOffset})` }, style2.sets.name),
      size.sets.addons.map((addon) => {
        const pos = setPosGen(addon);
        const title = import_react.default.createElement("text", { key: addon.name, className: clsx(`sChartTextStyle-${style2.id}`, style2.classNames.chartLabel), style: style2.styles.chartLabel, transform: `translate(${pos + addon.size / 2}, ${size.sets.h + setNameOffset})` }, addon.name);
        if (!addon.scale) {
          return title;
        }
        return import_react.default.createElement(
          import_react.default.Fragment,
          { key: addon.name },
          import_react.default.createElement(Axis, { scale: addon.scale, orient: "bottom", size: addon.size, start: 0, transform: `translate(${pos}, ${size.sets.h})`, style: style2 }),
          title
        );
      })
    )
  );
});
var UpSetDot = import_react.default.memo(function UpSetDot2({ cx, r, cy, name, className, style: style2, fill }) {
  return import_react.default.createElement("circle", { r, cx, cy, className, style: mergeColor(style2, fill) }, name && import_react.default.createElement("title", null, name));
});
function computeOverflowValues(value, max, scale) {
  const scaled = [scale(value)];
  for (let i = 0; i < OVERFLOW_PADDING_FACTOR.length && value > max; i++) {
    value -= max;
    scaled.push(scale(value));
  }
  return scaled;
}
var CombinationChart = import_react.default.memo(function CombinationChart2({ d, h, className, data, size, style: style2, children }) {
  const yValues = computeOverflowValues(d.cardinality, data.cs.max, data.cs.y);
  const genPosition = addonPositionGenerator(size.cs.h + size.sets.h, size.cs.addonPadding);
  return import_react.default.createElement(
    "g",
    { transform: `translate(${data.cs.x(d)}, 0)`, onMouseEnter: h.onMouseEnter(d, size.cs.addons), onMouseLeave: h.onMouseLeave, onClick: h.onClick(d, size.cs.addons), onContextMenu: h.onContextMenu(d, size.cs.addons), onMouseMove: h.onMouseMove(d, size.cs.addons), className, "data-cardinality": d.cardinality },
    style2.tooltips && import_react.default.createElement(
      "title",
      null,
      d.name,
      ": ",
      data.cs.format(d.cardinality)
    ),
    import_react.default.createElement("rect", { y: -size.cs.before, width: data.cs.bandWidth, height: size.sets.h + size.cs.h + size.cs.before + size.cs.after, className: `hoverBar-${style2.id}` }),
    size.cs.h > 0 && import_react.default.createElement(
      import_react.default.Fragment,
      null,
      yValues.map((y, i) => {
        const offset = i > 0 ? Math.floor(data.cs.bandWidth * OVERFLOW_PADDING_FACTOR[i - 1]) : 0;
        return import_react.default.createElement("rect", { key: i, x: offset, y, height: size.cs.h - y, width: data.cs.bandWidth - offset * 2, className: clsx(`fillPrimary-${style2.id}`, i < yValues.length - 1 && `fillOverflow${yValues.length - 1 - i}-${style2.id}`, style2.classNames.bar), style: mergeColor(style2.styles.bar, d.color) });
      }),
      import_react.default.createElement("text", { y: yValues[0] - style2.barLabelOffset, x: data.cs.bandWidth / 2, style: style2.styles.barLabel, className: clsx(`cBarTextStyle-${style2.id}`, style2.classNames.barLabel) }, data.cs.format(d.cardinality))
    ),
    import_react.default.createElement("text", { y: -style2.barLabelOffset - size.cs.before, x: data.cs.bandWidth / 2, style: style2.styles.barLabel, className: clsx(`hoverBarTextStyle-${style2.id}`, style2.classNames.barLabel) }, d.name),
    data.sets.v.map((s, i) => {
      if (data.cs.has(d, s)) {
        return null;
      }
      return import_react.default.createElement(UpSetDot, { key: data.sets.keys[i], r: data.r, cx: data.cs.cx, cy: data.sets.y(s) + data.sets.cy, name: style2.tooltips ? d.name : "", style: style2.styles.dot, fill: void 0, className: clsx(`fillNotMember-${style2.id}`, style2.classNames.dot) });
    }),
    d.sets.size > 1 && import_react.default.createElement("line", { x1: data.cs.cx, y1: data.sets.y(data.sets.v.find((p) => data.cs.has(d, p))) + data.sets.cy - (data.r - 1), x2: data.cs.cx, y2: data.sets.y(data.sets.rv.find((p) => data.cs.has(d, p))) + data.sets.cy + (data.r - 1), style: d.color ? { stroke: d.color } : void 0, className: `upsetLine-${data.id}` }),
    data.sets.v.map((s, i) => {
      var _a;
      if (!data.cs.has(d, s)) {
        return null;
      }
      return import_react.default.createElement(UpSetDot, { key: data.sets.keys[i], r: data.r, cx: data.cs.cx, cy: data.sets.y(s) + data.sets.cy, name: style2.tooltips ? s.name : "", style: style2.styles.dot, fill: (_a = s.color) !== null && _a !== void 0 ? _a : d.color, className: clsx(`fillPrimary-${style2.id}`, style2.classNames.dot) });
    }),
    size.cs.addons.map((addon) => import_react.default.createElement("g", { key: addon.name, transform: `translate(0,${genPosition(addon)})` }, addon.render({ set: d, width: data.cs.bandWidth, height: addon.size, theme: style2.theme }))),
    children
  );
});
var SetChart = import_react.default.memo(function SetChart2({ d, i, h, className, size, data, style: style2, children }) {
  const xValues = computeOverflowValues(d.cardinality, data.sets.max, data.sets.x);
  const genPosition = addonPositionGenerator(size.sets.w + size.labels.w + size.cs.w, size.sets.addonPadding);
  const anchorOffset = style2.setLabelAlignment === "center" ? size.labels.w / 2 : style2.setLabelAlignment === "left" ? 2 : size.labels.w - 2;
  return import_react.default.createElement(
    "g",
    { transform: `translate(0, ${data.sets.y(d)})`, onMouseEnter: h.onMouseEnter(d, size.sets.addons), onMouseLeave: h.onMouseLeave, onClick: h.onClick(d, size.sets.addons), onContextMenu: h.onContextMenu(d, size.sets.addons), onMouseMove: h.onMouseMove(d, size.sets.addons), className, "data-cardinality": d.cardinality },
    style2.tooltips && import_react.default.createElement(
      "title",
      null,
      d.name,
      ": ",
      data.sets.format(d.cardinality)
    ),
    import_react.default.createElement("rect", { x: -size.sets.before, width: size.sets.w + size.labels.w + size.cs.w + size.sets.after, height: data.sets.bandWidth, className: `hoverBar-${style2.id}` }),
    i % 2 === 1 && import_react.default.createElement("rect", { x: size.sets.w, width: size.labels.w + size.cs.w + size.sets.after, height: data.sets.bandWidth, className: `fillAlternating-${style2.id}` }),
    size.sets.w > 0 && import_react.default.createElement(
      import_react.default.Fragment,
      null,
      xValues.map((x, i2) => {
        const offset = i2 > 0 ? Math.floor(data.sets.bandWidth * OVERFLOW_PADDING_FACTOR[i2 - 1]) : 0;
        return import_react.default.createElement("rect", { key: i2, x, y: offset, width: size.sets.w - x, height: data.sets.bandWidth - offset * 2, className: clsx(`fillPrimary-${style2.id}`, i2 < xValues.length - 1 && `fillOverflow${xValues.length - 1 - i2}-${style2.id}`, style2.classNames.bar), style: mergeColor(style2.styles.bar, d.color) });
      }),
      import_react.default.createElement("text", { x: xValues[0], dx: -style2.barLabelOffset, y: data.sets.bandWidth / 2, style: style2.styles.barLabel, className: clsx(`sBarTextStyle-${style2.id}`, style2.classNames.barLabel) }, data.sets.format(d.cardinality))
    ),
    import_react.default.createElement("text", { x: size.sets.w + anchorOffset, y: data.sets.bandWidth / 2, className: clsx(`setTextStyle-${style2.id}`, style2.classNames.setLabel), style: style2.styles.setLabel, clipPath: `url(#clip-${size.id})` }, d.name),
    size.sets.addons.map((addon) => import_react.default.createElement("g", { key: addon.name, transform: `translate(${genPosition(addon)},0)` }, addon.render({ set: d, width: addon.size, height: data.sets.bandWidth, theme: style2.theme }))),
    children
  );
});
var UpSetChart = import_react.default.memo(function UpSetChart2({ data, size, style: style2, h, setChildrenFactory, combinationChildrenFactory }) {
  return import_react.default.createElement(
    "g",
    { className: h.hasClick ? `clickAble-${style2.id}` : void 0 },
    import_react.default.createElement("g", { transform: `translate(${size.sets.x},${size.sets.y})`, "data-upset": "sets" }, data.sets.v.map((d, i) => import_react.default.createElement(SetChart, { key: data.sets.keys[i], d, i, h, className: h.hasClick || h.hasHover ? `interactive-${style2.id}` : void 0, data, style: style2, size }, setChildrenFactory && setChildrenFactory(d)))),
    import_react.default.createElement("g", { transform: `translate(${size.cs.x},${size.cs.y})`, "data-upset": "cs" }, data.cs.v.map((d, i) => import_react.default.createElement(CombinationChart, { key: data.cs.keys[i], d, h, className: h.hasClick || h.hasHover ? `interactive-${style2.id}` : void 0, data, style: style2, size }, combinationChildrenFactory && combinationChildrenFactory(d))))
  );
});
function CombinationSelectionChart({ data, size, style: style2, elemOverlap, secondary, tooltip, suffix, transform, empty, combinationAddons }) {
  const width = data.cs.bandWidth;
  const totalHeight = size.cs.h + size.sets.h;
  const height = size.cs.h;
  const className = clsx(`fill${suffix}`, !tooltip && `pnone-${style2.id}`, style2.classNames.bar);
  return import_react.default.createElement("g", { transform, "data-upset": secondary ? "cs-q" : "cs-s" }, data.cs.v.map((d, i) => {
    const x = data.cs.x(d);
    const key = data.cs.keys[i];
    if (empty && !secondary) {
      return import_react.default.createElement("rect", { key, x, y: height, height: 0, width, className, style: mergeColor(style2.styles.bar, !style2.selectionColor ? d.color : void 0) }, tooltip && import_react.default.createElement("title", null));
    }
    const o = elemOverlap(d);
    if (o === 0) {
      return null;
    }
    const yValues = computeOverflowValues(o, data.cs.max, data.cs.y);
    const title = tooltip && import_react.default.createElement("title", null, `${d.name} ∩ ${tooltip}: ${o}`);
    const content = secondary ? import_react.default.createElement("path", { key, transform: `translate(${x}, ${yValues[0]})`, d: `M0,-1 l${width},0 l0,2 l${-width},0 L-${data.triangleSize},-${data.triangleSize} L-${data.triangleSize},${data.triangleSize} Z`, className, "data-i": i, "data-cardinality": o, style: mergeColor(void 0, !style2.selectionColor ? d.color : void 0) }, title) : yValues.map((y, j) => {
      const offset = j > 0 ? Math.floor(data.cs.bandWidth * OVERFLOW_PADDING_FACTOR[j - 1]) : 0;
      return import_react.default.createElement("rect", { key: j, x: x + offset, y, height: height - y, width: width - offset * 2, "data-i": j > 0 ? null : i, "data-cardinality": j > 0 ? null : o, className: clsx(className, j < yValues.length - 1 && `fillOverflow${yValues.length - 1 - j}-${style2.id}`), style: mergeColor(style2.styles.bar, !style2.selectionColor ? d.color : void 0) }, title);
    });
    const genPosition = addonPositionGenerator(totalHeight, size.cs.addonPadding);
    const addons = combinationAddons.map((addon) => {
      const v = genPosition(addon);
      const content2 = addon.render({ set: d, width, height: addon.size, theme: style2.theme });
      if (!content2) {
        return null;
      }
      return import_react.default.createElement("g", { key: addon.name, transform: `translate(${x},${v})` }, content2);
    }).filter(Boolean);
    if (addons.length === 0) {
      return content;
    }
    return import_react.default.createElement(
      "g",
      { key },
      content,
      addons
    );
  }));
}
function SetSelectionChart({ data, size, style: style2, elemOverlap, suffix, secondary, empty, tooltip, setAddons, transform }) {
  const width = size.sets.w;
  const totalWidth = size.sets.w + size.labels.w + size.cs.w;
  const height = data.sets.bandWidth;
  const className = clsx(`fill${suffix}`, !tooltip && ` pnone-${style2.id}`, style2.classNames.bar);
  return import_react.default.createElement("g", { transform, "data-upset": secondary ? "sets-q" : "sets-s" }, data.sets.v.map((d, i) => {
    const y = data.sets.y(d);
    const key = data.sets.keys[i];
    if (empty && !secondary) {
      return import_react.default.createElement("rect", { key, x: width, y, width: 0, height, className, style: mergeColor(style2.styles.bar, !style2.selectionColor ? d.color : void 0) }, style2.tooltips && tooltip && import_react.default.createElement("title", null));
    }
    const o = elemOverlap(d);
    if (o === 0) {
      return null;
    }
    const xValues = computeOverflowValues(o, data.sets.max, data.sets.x);
    const title = style2.tooltips && tooltip && import_react.default.createElement("title", null, `${d.name} ∩ ${tooltip}: ${o}`);
    const content = secondary ? import_react.default.createElement("path", { key, transform: `translate(${xValues[0]}, ${y + height})`, d: `M1,0 l0,${-height} l-2,0 l0,${height} L-${data.triangleSize},${data.triangleSize} L${data.triangleSize},${data.triangleSize} Z`, "data-i": i, "data-cardinality": o, className, style: mergeColor(void 0, !style2.selectionColor ? d.color : void 0) }, title) : xValues.map((x, j) => {
      const offset = j > 0 ? Math.floor(data.sets.bandWidth * OVERFLOW_PADDING_FACTOR[j - 1]) : 0;
      return import_react.default.createElement("rect", { key: j, "data-i": j > 0 ? null : i, "data-cardinality": j > 0 ? null : o, x, y: y + offset, width: width - x, height: height - offset * 2, className: clsx(className, j < xValues.length - 1 && `fillOverflow${xValues.length - 1 - j}-${style2.id}`), style: mergeColor(style2.styles.bar, !style2.selectionColor ? d.color : void 0) }, title);
    });
    const genPosition = addonPositionGenerator(totalWidth, size.sets.addonPadding);
    const addons = setAddons.map((addon) => {
      const v = genPosition(addon);
      const content2 = addon.render({ set: d, width: addon.size, height, theme: style2.theme });
      if (!content2) {
        return null;
      }
      return import_react.default.createElement("g", { key: addon.name, transform: `translate(${v},${y})` }, content2);
    }).filter(Boolean);
    if (addons.length === 0) {
      return content;
    }
    return import_react.default.createElement(
      "g",
      { key },
      content,
      addons
    );
  }));
}
var EMPTY_ARRAY$1 = [];
var UpSetQueries = import_react.default.memo(function UpSetQueries2({ size, data, style: style2, hasHover, secondary, queries: queries2 }) {
  const someAddon = size.sets.addons.some((s) => s.renderQuery != null) || size.cs.addons.some((s) => s.renderQuery != null);
  const qs = (0, import_react.useMemo)(() => queries2.map((q) => Object.assign(Object.assign({}, q), { overlap: queryOverlap(q, "intersection", data.toElemKey), elemOverlap: someAddon ? queryElemOverlap(q, "intersection", data.toElemKey) : null })), [queries2, someAddon, data.toElemKey]);
  function wrapAddon(addon, query, index, overlapper, secondary2) {
    return Object.assign(Object.assign({}, addon), { render: (props) => {
      const overlap = overlapper(props.set);
      return addon.renderQuery ? addon.renderQuery(Object.assign({ query, overlap, index, secondary: secondary2 }, props)) : null;
    } });
  }
  return import_react.default.createElement(
    "g",
    { className: hasHover && !secondary ? `pnone-${style2.id}` : void 0 },
    import_react.default.createElement("g", { transform: `translate(${size.sets.x},${size.sets.y})` }, qs.map((q, i) => import_react.default.createElement(SetSelectionChart, { key: q.name, data, size, style: style2, elemOverlap: q.overlap, suffix: `Q${i}-${data.id}`, secondary: secondary || i > 0, tooltip: hasHover && !(secondary || i > 0) ? void 0 : q.name, setAddons: size.sets.addons.length === 0 ? EMPTY_ARRAY$1 : size.sets.addons.map((a, i2) => wrapAddon(a, q, i2, q.elemOverlap, secondary || i2 > 0)) }))),
    import_react.default.createElement("g", { transform: `translate(${size.cs.x},${size.cs.y})` }, qs.map((q, i) => import_react.default.createElement(CombinationSelectionChart, { key: q.name, data, size, style: style2, elemOverlap: q.overlap, suffix: `Q${i}-${data.id}`, secondary: secondary || i > 0, tooltip: hasHover && !(secondary || i > 0) ? void 0 : q.name, combinationAddons: size.cs.addons.length === 0 ? EMPTY_ARRAY$1 : size.cs.addons.map((a, i2) => wrapAddon(a, q, i2, q.elemOverlap, secondary || i2 > 0)) })))
  );
});
function LabelsSelection({ data, size, style: style2, selection: selection2 }) {
  if (!selection2 || selection2.type !== "set" || !data.sets.keys.includes(data.toKey(selection2))) {
    return null;
  }
  const d = selection2;
  return import_react.default.createElement("rect", { y: data.sets.y(d), width: size.labels.w + size.cs.w + size.sets.after, height: data.sets.bandWidth, className: `selectionHint-${style2.id}` });
}
function UpSetSelectionChart({ data, size, style: style2, selection: selection2 }) {
  const cy = data.sets.bandWidth / 2;
  const cx = data.cs.cx;
  const r = data.r;
  const height = size.sets.h + size.sets.after;
  const width = data.cs.bandWidth;
  if (!selection2 || selection2.type === "set" || !data.cs) {
    return null;
  }
  const d = selection2;
  const index = data.cs.keys.indexOf(data.toKey(d));
  if (index < 0) {
    return null;
  }
  return import_react.default.createElement(
    "g",
    { transform: `translate(${size.labels.w + data.cs.x(d)}, 0)`, "data-upset": "cs-ss", "data-i": index },
    import_react.default.createElement("rect", { width, height, className: `selectionHint-${style2.id}` }),
    d.sets.size > 1 && import_react.default.createElement("line", { x1: cx, y1: data.sets.y(data.sets.v.find((p) => data.cs.has(d, p))) + cy - (data.r - 1), x2: cx, y2: data.sets.y(data.sets.rv.find((p) => data.cs.has(d, p))) + cy + (data.r - 1), className: `upsetSelectionLine-${data.id}`, style: mergeColor(void 0, !style2.selectionColor ? d.color : void 0, "stroke") }),
    data.sets.v.filter((s) => data.cs.has(d, s)).map((s) => import_react.default.createElement(UpSetDot, { key: data.toKey(s), r: r * 1.1, cx, cy: data.sets.y(s) + cy, name: style2.tooltips ? s.name : "", className: clsx(`fillSelection-${style2.id}`, `pnone-${style2.id}`, style2.classNames.dot), style: mergeColor(style2.styles.dot, !style2.selectionColor ? s.color : void 0) }))
  );
}
var EMPTY_ARRAY = [];
function UpSetSelection({ size, data, style: style2, selection: selection2, hasHover }) {
  const empty = style2.emptySelection;
  const selectionOverlap = generateSelectionOverlap(selection2, data.overlapGuesser, data.toElemKey);
  const selectionName = generateSelectionName(selection2);
  const someAddon = size.sets.addons.some((s) => s.renderSelection != null) || size.cs.addons.some((s) => s.renderSelection != null);
  const selectionElemOverlap = selection2 && typeof selection2 !== "function" && someAddon ? elemElemOverlapOf(Array.isArray(selection2) ? selection2 : selection2.elems, data.toElemKey) : null;
  function wrapAddon(addon) {
    return Object.assign(Object.assign({}, addon), { render: (props) => {
      const overlap = selectionElemOverlap ? selectionElemOverlap(props.set) : null;
      return addon.renderSelection ? addon.renderSelection(Object.assign({ selection: selection2, selectionColor: style2.selectionColor || props.set.color || "orange", overlap }, props)) : null;
    } });
  }
  return import_react.default.createElement(
    "g",
    { className: hasHover ? `pnone-${style2.id}` : void 0 },
    (selection2 || empty) && import_react.default.createElement(CombinationSelectionChart, { data, size, style: style2, transform: `translate(${size.cs.x},${size.cs.y})`, empty: empty && !selection2, elemOverlap: selectionOverlap, suffix: `Selection-${style2.id}`, tooltip: hasHover ? void 0 : selectionName, combinationAddons: size.cs.addons.length === 0 ? EMPTY_ARRAY : size.cs.addons.map(wrapAddon) }),
    (selection2 || empty) && import_react.default.createElement(SetSelectionChart, { data, size, style: style2, transform: `translate(${size.sets.x},${size.sets.y})`, empty: empty && !selection2, elemOverlap: selectionOverlap, suffix: `Selection-${style2.id}`, tooltip: hasHover ? void 0 : selectionName, setAddons: size.sets.addons.length === 0 ? EMPTY_ARRAY : size.sets.addons.map(wrapAddon) }),
    import_react.default.createElement(
      "g",
      { transform: `translate(${size.labels.x},${size.labels.y})` },
      isSetLike2(selection2) && import_react.default.createElement(LabelsSelection, { data, size, style: style2, selection: selection2 }),
      isSetLike2(selection2) && import_react.default.createElement(UpSetSelectionChart, { data, size, style: style2, selection: selection2 })
    )
  );
}
function propRule(value, prop = "font-size") {
  return value ? `${prop}: ${value};` : "";
}
function baseRules(styleId, theme2, fontFamily, fontSizes2) {
  const hasS = [];
  if (theme2.hasSelectionColor) {
    hasS.push(`fill: ${theme2.hasSelectionColor};`);
  }
  const hasSelectionOpacity = theme2.hasSelectionOpacity != null && theme2.hasSelectionOpacity >= 0;
  if (hasSelectionOpacity) {
    hasS.push(`fill-opacity: ${theme2.hasSelectionOpacity};`);
  }
  return {
    p: propRule,
    root: `
  .root-${styleId} {
    ${propRule(fontFamily, "font-family")}
  }
  `,
    text: `
  .titleTextStyle-${styleId} {
    fill: ${theme2.textColor};
    ${propRule(fontSizes2.title)}
  }
  .descTextStyle-${styleId} {
    fill: ${theme2.textColor};
    ${propRule(fontSizes2.description)}
  }

  .legendTextStyle-${styleId} {
    fill: ${theme2.textColor};
    ${propRule(fontSizes2.legend)}
    text-anchor: middle;
    dominant-baseline: hanging;
    pointer-events: none;
  }
  `,
    hasSFill: hasS.join(" "),
    hasSStroke: hasS.join(" ").replace("fill:", "stroke:").replace("fill-", "stroke-"),
    fill: `
  .fillPrimary-${styleId} { fill: ${theme2.color}; fill-opacity: ${theme2.opacity}; }
  .fillOverflow1-${styleId} { fill-opacity: ${theme2.opacity * OVERFLOW_OPACITY_FACTOR[0]}; }
  .fillOverflow2-${styleId} { fill-opacity: ${theme2.opacity * OVERFLOW_OPACITY_FACTOR[1]}; }
  ${hasS.length > 0 ? `.root-${styleId}[data-selection] .fillPrimary-${styleId} { ${hasS.join(" ")} }` : ""}
  ${hasSelectionOpacity ? `
      .root-${styleId}[data-selection] .fillOverflow1-${styleId} { fill-opacity: ${theme2.opacity * OVERFLOW_OPACITY_FACTOR[0]}; }
      .root-${styleId}[data-selection] .fillOverflow2-${styleId} { fill-opacity: ${theme2.opacity * OVERFLOW_OPACITY_FACTOR[1]}; }` : ""}
  ${theme2.selectionColor ? `.fillSelection-${styleId} { fill: ${theme2.selectionColor}; }` : ""}
  .fillTransparent-${styleId} { fill: transparent; }

  .selectionHint-${styleId} {
    fill: transparent;
    pointer-events: none;
    ${propRule(theme2.selectionColor, "stroke")}
  }
  .clickAble-${styleId} {
    cursor: pointer;
  }

  .startText-${styleId} {
    text-anchor: start;
  }
  .endText-${styleId} {
    text-anchor: end;
  }
  .pnone-${styleId} {
    pointer-events: none;
  }`,
    export: `
  .exportTextStyle-${styleId} {
    fill: ${theme2.textColor};
    ${propRule(fontSizes2.exportLabel)}
  }
  .exportButtons-${styleId} {
    text-anchor: middle;
  }
  .exportButton-${styleId} {
    cursor: pointer;
    opacity: 0.5;
  }
  .exportButton-${styleId}:hover {
    opacity: 1;
  }
  .exportButton-${styleId} > rect {
    fill: none;
    stroke: ${theme2.textColor};
  }
  `
  };
}
function useHandler(p) {
  const onClick2 = p.onClick;
  return (0, import_react.useMemo)(() => ({
    hasClick: onClick2 != null,
    hasHover: p.onHover != null,
    onClick: wrap(onClick2),
    onMouseEnter: wrap(p.onHover),
    onContextMenu: wrap(p.onContextMenu),
    onMouseLeave: p.onHover ? (evt) => p.onHover(null, evt.nativeEvent, []) : void 0,
    onMouseMove: wrap(p.onMouseMove),
    reset: (evt) => onClick2 ? onClick2(null, evt.nativeEvent, []) : null
  }), [onClick2, p.onHover, p.onContextMenu, p.onMouseMove]);
}
var UpSetJS = import_react.default.forwardRef(function UpSetJS2(props, ref) {
  var _a;
  const p = fillDefaults(props);
  const { selection: selection2 = null, queries: queries2 = [], fontSizes: fontSizes2 } = p;
  const styleId = (0, import_react.useMemo)(() => p.id ? p.id : generateId([
    p.fontFamily,
    fontSizes2.axisTick,
    fontSizes2.barLabel,
    fontSizes2.chartLabel,
    fontSizes2.legend,
    fontSizes2.setLabel,
    fontSizes2.title,
    fontSizes2.exportLabel,
    fontSizes2.description,
    p.textColor,
    p.hoverHintColor,
    p.color,
    p.hasSelectionColor,
    p.selectionColor,
    p.notMemberColor,
    p.alternatingBackgroundColor,
    p.opacity,
    p.hasSelectionOpacity
  ]), [
    p.id,
    p.fontFamily,
    fontSizes2.axisTick,
    fontSizes2.barLabel,
    fontSizes2.chartLabel,
    fontSizes2.legend,
    fontSizes2.setLabel,
    fontSizes2.title,
    fontSizes2.exportLabel,
    fontSizes2.description,
    p.textColor,
    p.hoverHintColor,
    p.color,
    p.hasSelectionColor,
    p.selectionColor,
    p.notMemberColor,
    p.alternatingBackgroundColor,
    p.opacity,
    p.hasSelectionOpacity
  ]);
  const styleInfo = (0, import_react.useMemo)(() => deriveStyleDependent$1(p.theme, p.styles, p.classNames, p.combinationName, p.combinationNameAxisOffset, p.setName, p.setNameAxisOffset, styleId, p.barLabelOffset, p.selectionColor, p.emptySelection, p.title, p.description, p.tooltips, p.setLabelAlignment), [
    p.theme,
    p.styles,
    p.classNames,
    p.barLabelOffset,
    p.combinationName,
    p.combinationNameAxisOffset,
    p.setName,
    p.setNameAxisOffset,
    styleId,
    p.selectionColor,
    p.emptySelection,
    p.title,
    p.description,
    p.tooltips,
    p.setLabelAlignment
  ]);
  const sizeInfo = (0, import_react.useMemo)(() => deriveSizeDependent(p.width, p.height, p.padding, p.barPadding, p.widthRatios, p.heightRatios, p.setAddons, p.combinationAddons, p.id, p.setAddonPadding, p.combinationAddonPadding), [
    p.width,
    p.height,
    p.padding,
    p.barPadding,
    p.widthRatios,
    p.heightRatios,
    p.setAddons,
    p.combinationAddons,
    p.id,
    p.setAddonPadding,
    p.combinationAddonPadding
  ]);
  const dataInfo = (0, import_react.useMemo)(() => deriveDataDependent(p.sets, p.combinations, sizeInfo, p.numericScale, p.bandScale, p.barLabelOffset + parseFontSize(fontSizes2.barLabel), p.dotPadding, p.barPadding, parseFontSize(fontSizes2.axisTick), p.combinationAddons, p.toKey, p.toElemKey, p.id, p.setMaxScale, p.combinationMaxScale), [
    p.sets,
    p.combinations,
    sizeInfo,
    p.numericScale,
    p.bandScale,
    p.barLabelOffset,
    fontSizes2.barLabel,
    p.dotPadding,
    p.barPadding,
    fontSizes2.axisTick,
    p.combinationAddons,
    p.toKey,
    p.toElemKey,
    p.id,
    p.setMaxScale,
    p.combinationMaxScale
  ]);
  const rulesHelper = baseRules(styleId, p, p.fontFamily, fontSizes2);
  const h = useHandler(p);
  const rules = `
  ${rulesHelper.root}
  ${rulesHelper.text}

  .axisTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.axisTick)}
    text-anchor: middle;
  }
  .barTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.barLabel)}
  }
  .cBarTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.barLabel)}
    text-anchor: middle;
  }
  .sBarTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.barLabel)}
    text-anchor: end;
    dominant-baseline: central;
  }
  .hoverBarTextStyle-${styleId} {
    ${rulesHelper.p(fontSizes2.barLabel)}
    fill: ${p.hoverHintColor};
    display: none;
    text-anchor: middle;
  }
  .setTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.setLabel)}
    text-anchor: ${toAnchor(p.setLabelAlignment)};
    dominant-baseline: central;
  }
  .cChartTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.chartLabel)}
    text-anchor: middle;
  }
  .sChartTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.chartLabel)}
    text-anchor: middle;
    dominant-baseline: hanging;
  }

  ${rulesHelper.fill}
  .fillNotMember-${styleId} { fill: ${p.notMemberColor}; }
  .fillAlternating-${styleId} { fill: ${p.alternatingBackgroundColor || "transparent"}; }

  .axisLine-${styleId} {
    fill: none;
    stroke: ${p.textColor};
  }
  .hoverBar-${styleId} {
    fill: transparent;
  }

  .interactive-${styleId}:hover > .hoverBar-${styleId} {
    stroke: ${p.hoverHintColor};
  }
  .interactive-${styleId}:hover > .hoverBarTextStyle-${styleId} {
    display: unset;
  }

  ${rulesHelper.export}

  .upsetLine-${dataInfo.id} {
    stroke-width: ${dataInfo.r * 0.6};
    stroke: ${p.color};
    stroke-opacity: ${p.opacity};
  }
  ${rulesHelper.hasSStroke ? `.root-${styleId}[data-selection] .upsetLine-${dataInfo.id} { ${rulesHelper.hasSStroke} }` : ""}

  .upsetSelectionLine-${dataInfo.id} {
    stroke-width: ${dataInfo.r * 0.6 * 1.1};
    ${rulesHelper.p(p.selectionColor, "stroke")}
    pointer-events: none;
  }

  ${queries2.map((q, i) => `.fillQ${i}-${dataInfo.id} {
    fill: ${q.color};
  }`).join("\n")}
  `;
  const exportChart = (0, import_react.useCallback)((evt) => {
    const svg = evt.currentTarget.closest("svg");
    const type = evt.currentTarget.dataset.type || "png";
    switch (type) {
      case "vega":
        exportVegaLite(svg);
        break;
      case "dump":
        exportDump(svg, props, dataInfo);
        break;
      case "share":
        exportSharedLink(props, dataInfo);
        break;
      case "svg":
      case "png":
        exportSVG(svg, {
          type,
          toRemove: `.${evt.currentTarget.getAttribute("class")}`
        });
    }
  }, [dataInfo, props]);
  const selectionName = generateSelectionName(selection2);
  return import_react.default.createElement(
    "svg",
    { id: p.id, className: clsx(`root-${styleId}`, p.className), style: p.style, width: p.width, height: p.height, ref, viewBox: `0 0 ${p.width} ${p.height}`, "data-theme": (_a = p.theme) !== null && _a !== void 0 ? _a : "light", "data-selection": selectionName ? selectionName : void 0 },
    p.styleFactory(rules),
    import_react.default.createElement(
      "defs",
      null,
      import_react.default.createElement(
        "clipPath",
        { id: `clip-${sizeInfo.id}` },
        import_react.default.createElement("rect", { x: sizeInfo.sets.w, y: 0, width: sizeInfo.labels.w, height: sizeInfo.sets.h })
      )
    ),
    p.queryLegend && import_react.default.createElement(QueryLegend, { queries: queries2, x: sizeInfo.legend.x, style: styleInfo, data: dataInfo }),
    import_react.default.createElement(ExportButtons, { transform: `translate(${sizeInfo.w - 2},${sizeInfo.h - 3})`, styleId, exportButtons: p.exportButtons, exportChart }),
    import_react.default.createElement(
      "g",
      { transform: `translate(${p.padding},${p.padding})`, "data-upset": "base" },
      p.onClick && import_react.default.createElement("rect", { width: sizeInfo.cs.x, height: sizeInfo.sets.y, onClick: h.reset, className: `fillTransparent-${styleId}` }),
      import_react.default.createElement(UpSetAxis, { size: sizeInfo, style: styleInfo, data: dataInfo }),
      import_react.default.createElement(UpSetChart, { size: sizeInfo, style: styleInfo, data: dataInfo, h, setChildrenFactory: p.setChildrenFactory, combinationChildrenFactory: p.combinationChildrenFactory }),
      import_react.default.createElement(UpSetSelection, { size: sizeInfo, style: styleInfo, data: dataInfo, hasHover: h.hasHover, selection: selection2 }),
      import_react.default.createElement(UpSetQueries, { size: sizeInfo, style: styleInfo, data: dataInfo, hasHover: h.hasHover, queries: queries2, secondary: p.onHover != null || selection2 != null })
    ),
    props.children
  );
});
function SVGWrapper({ rules, style: style2, size, p, data, tRef, children, exportChart, selectionName, h }) {
  var _a, _b;
  return import_react.default.createElement(
    "svg",
    { id: p.id, className: clsx(`root-${style2.id}`, p.className), style: p.style, width: p.width, height: p.height, ref: tRef, viewBox: `0 0 ${p.width} ${p.height}`, "data-theme": (_a = p.theme) !== null && _a !== void 0 ? _a : "light", "data-selection": selectionName ? selectionName : void 0 },
    p.styleFactory(rules),
    p.onClick && import_react.default.createElement("rect", { width: size.w, height: size.h, onClick: h.reset, className: `fillTransparent-${style2.id}` }),
    p.queryLegend && import_react.default.createElement(QueryLegend, { queries: (_b = p.queries) !== null && _b !== void 0 ? _b : [], x: size.legend.x, style: style2, data }),
    import_react.default.createElement(ExportButtons, { transform: `translate(${size.w - 2},${size.h - 3})`, styleId: style2.id, exportButtons: p.exportButtons, exportChart }),
    import_react.default.createElement("g", { transform: `translate(${p.padding},${p.padding})`, "data-upset": "base" }, children),
    p.children
  );
}
function generateArcSlicePath(s, refs, p = 0) {
  if (s.path) {
    return s.path;
  }
  return `M ${s.x1 - p},${s.y1 - p} ${s.arcs.map((arc) => {
    const ref = refs[arc.ref].l;
    const rx = isEllipse(ref) ? ref.rx : ref.r;
    const ry = isEllipse(ref) ? ref.ry : ref.r;
    const rot = isEllipse(ref) ? ref.rotation : 0;
    return `A ${rx - p} ${ry - p} ${rot} ${arc.large ? 1 : 0} ${arc.sweep ? 1 : 0} ${arc.x2 - p} ${arc.y2 - p}`;
  }).join(" ")}`;
}
function SelectionPattern(p) {
  var _a;
  if (p.v >= 1 || p.v <= 0) {
    return null;
  }
  const ratio = Math.round(p.v * 10) / 100;
  return import_react.default.createElement(
    "defs",
    null,
    import_react.default.createElement(
      "pattern",
      { id: p.id, width: "1", height: "0.1", patternContentUnits: "objectBoundingBox", patternTransform: `rotate(${(_a = p.rotate) !== null && _a !== void 0 ? _a : 0})` },
      p.bgFilled && import_react.default.createElement("rect", { x: "0", y: "0", width: "1", height: "0.1", style: { fill: p.bgFill }, className: `fillPrimary-${p.styleId}` }),
      import_react.default.createElement("rect", { x: "0", y: "0", width: "1", height: ratio, className: `fill${p.suffix}`, style: p.fill ? { fill: p.fill } : void 0 })
    )
  );
}
function sliceRotate(slice, center2) {
  if (slice.text.x === center2.cx) {
    return 0;
  }
  if (slice.text.x > center2.cx) {
    return slice.text.y <= center2.cy ? 60 : -60;
  }
  return slice.text.y <= center2.cy ? -60 : 60;
}
function generateTitle(d, s, sName, secondary, qs, queries2, data, cx) {
  const dc = data.format(d.cardinality);
  const baseName = !sName ? d.name : `${d.name} ∩ ${sName}`;
  const baseCardinality = !sName ? dc : `${data.format(s)}/${dc}`;
  if (qs.length === 0) {
    return {
      tooltip: `${baseName}: ${baseCardinality}`,
      title: d.type === "set" ? import_react.default.createElement(
        import_react.default.Fragment,
        null,
        import_react.default.createElement("tspan", { dy: "-0.6em" }, d.name),
        import_react.default.createElement("tspan", { x: cx, dy: "1.2em" }, baseCardinality)
      ) : baseCardinality
    };
  }
  if (qs.length === 1 && !secondary && !sName) {
    return {
      tooltip: `${d.name} ∩ ${queries2[0].name}: ${data.format(qs[0])}/${dc}`,
      title: d.type === "set" ? import_react.default.createElement(
        import_react.default.Fragment,
        null,
        import_react.default.createElement("tspan", { dy: "-0.6em" }, d.name),
        import_react.default.createElement("tspan", { x: cx, dy: "1.2em" }, `${data.format(qs[0])}/${dc}`)
      ) : `${data.format(qs[0])}/${dc}`
    };
  }
  const queryLine = import_react.default.createElement("tspan", { x: cx, dy: "1.2em" }, queries2.map((q, i) => import_react.default.createElement(
    import_react.default.Fragment,
    { key: q.name },
    import_react.default.createElement("tspan", { className: `fillQ${i}-${data.id}` }, "⬤"),
    import_react.default.createElement("tspan", null, ` ${data.format(qs[i])}/${dc}${i < queries2.length - 1 ? " " : ""}`)
  )));
  return {
    tooltip: `${baseName}: ${baseCardinality}
${queries2.map((q, i) => `${d.name} ∩ ${q.name}: ${data.format(qs[i])}/${dc}`).join("\n")}`,
    title: d.type === "set" ? import_react.default.createElement(
      import_react.default.Fragment,
      null,
      import_react.default.createElement("tspan", { dy: "-1.2em" }, d.name),
      import_react.default.createElement("tspan", { x: cx, dy: "1.2em" }, baseCardinality),
      queryLine
    ) : import_react.default.createElement(
      import_react.default.Fragment,
      null,
      import_react.default.createElement("tspan", { dy: "-0.6em" }, baseCardinality),
      queryLine
    )
  };
}
function VennArcSliceSelection({ slice, d, i, data, style: style2, elemOverlap, selected, selectionName, h, queries: queries2, size, fill, qs }) {
  const p = generateArcSlicePath(slice, data.sets.d);
  const rotate = sliceRotate(slice, size.area);
  const o = elemOverlap ? elemOverlap(d) : 0;
  const fillFullSelection = o === d.cardinality && d.cardinality > 0 || selected;
  const className = clsx(`arc-${style2.id}`, o === 0 && !selected && `${fill ? "fillPrimary" : "arcP"}-${style2.id}`, fillFullSelection && `fillSelection-${style2.id}`, style2.classNames.set);
  const id = `upset-${style2.id}-${i}`;
  const secondary = elemOverlap != null || h.onMouseLeave != null;
  const qsOverlaps = qs.map((q) => q(d));
  const { title, tooltip } = generateTitle(d, o, selectionName, secondary, qsOverlaps, queries2, data, slice.text.x);
  return import_react.default.createElement(
    "g",
    null,
    import_react.default.createElement(SelectionPattern, { id, v: o === 0 ? 0 : o / d.cardinality, suffix: `Selection-${style2.id}`, rotate, bgFill: d.color, bgFilled: d.color != null || fill, fill: !style2.selectionColor ? d.color : void 0, styleId: style2.id }),
    import_react.default.createElement("path", { onMouseEnter: h.onMouseEnter(d, []), onMouseLeave: h.onMouseLeave, onClick: h.onClick(d, []), onContextMenu: h.onContextMenu(d, []), onMouseMove: h.onMouseMove(d, []), d: p, className, style: mergeColor(style2.styles.set, o > 0 && o < d.cardinality ? `url(#${id})` : !fillFullSelection || !style2.selectionColor ? d.color : void 0) }, style2.tooltips && import_react.default.createElement("title", null, tooltip)),
    import_react.default.createElement("text", { x: slice.text.x, y: slice.text.y, className: clsx(
      `${d.type === "set" ? "set" : "value"}TextStyle-${style2.id}`,
      `pnone-${style2.id}`,
      d.type === "set" ? style2.classNames.setLabel : style2.classNames.valueLabel
      // circle.align === 'left' && `startText-${style.id}`,
      // circle.align === 'right' && `endText-${style.id}`
    ) }, title)
  );
}
function deriveVennDataDependent(sets2, combinations2, size, layout, format, toKey2, toElemKey, id, setLabelOffsets2) {
  const ss = sets2.length > layout.maxSets ? sets2.slice(0, layout.maxSets) : sets2;
  const { cs, setKeys, csKeys } = calculateCombinations(ss, toKey2, combinations2);
  const l = layout.compute(ss, cs, size.area.w, size.area.h);
  return {
    id: id ? id : generateId(),
    sets: {
      d: l.sets.map((l2, i) => ({
        v: ss[i],
        l: l2,
        key: setKeys[i],
        offset: setLabelOffsets2 != null && i < setLabelOffsets2.length ? setLabelOffsets2[i] : { x: 0, y: 0 }
      })),
      v: ss,
      format
    },
    format,
    cs: {
      d: l.intersections.map((l2, i) => ({ v: cs[i], l: l2, key: csKeys[i] })),
      v: cs,
      has: (v, s) => {
        const sk = toKey2(s);
        return Array.from(v.sets).some((ss2) => toKey2(ss2) === sk);
      }
    },
    toKey: toKey2,
    toElemKey,
    overlapGuesser: generateDistinctOverlapFunction(cs, noGuessPossible, toKey2)
  };
}
function calculateCombinations(ss, toKey2, combinations2, options = { min: 1 }) {
  const setKeys = ss.map(toKey2);
  let cs = [];
  if (areCombinations(combinations2)) {
    const given = new Map(combinations2.map((c) => [Array.from(c.sets).map(toKey2).sort().join("#"), c]));
    const helperSets = ss.map((s) => ({
      type: "set",
      cardinality: 0,
      elems: [],
      name: s.name,
      s
    }));
    cs = generateCombinations(helperSets, Object.assign({
      type: "distinctIntersection",
      empty: true,
      order: ["degree:asc", "group:asc"]
    }, options)).map((c) => {
      const key = Array.from(c.sets).map((s) => toKey2(s.s)).sort().join("#");
      if (given.has(key)) {
        return given.get(key);
      }
      return {
        name: c.name,
        cardinality: 0,
        degree: c.degree,
        elems: [],
        sets: new Set(Array.from(c.sets).map((s) => s.s)),
        type: "distinctIntersection"
      };
    });
  } else {
    cs = generateCombinations(ss, Object.assign({
      type: "distinctIntersection",
      empty: true,
      order: ["degree:asc", "group:asc"]
    }, options, combinations2 !== null && combinations2 !== void 0 ? combinations2 : {}));
  }
  const csKeys = cs.map(toKey2);
  return { cs, setKeys, csKeys };
}
function deriveVennSizeDependent(width, height, margin, id) {
  const h = height - 2 * margin;
  const w = width - 2 * margin;
  const r = Math.min(w, h) / 2;
  return {
    id: id ? id : generateId(),
    legend: {
      x: width / 2
    },
    area: {
      w,
      h,
      cx: w / 2,
      cy: h / 2,
      r
    },
    margin,
    w: width,
    h: height
  };
}
function deriveVennStyleDependent(theme2, styles2, classNames2, styleId, selectionColor, title, description, tooltips) {
  return {
    theme: theme2,
    styles: styles2,
    classNames: classNames2,
    id: styleId,
    selectionColor,
    title,
    description,
    tooltips
  };
}
function useCreateCommon(p) {
  const { queries: queries2 = [], fontSizes: fontSizes2 } = p;
  const styleId = (0, import_react.useMemo)(() => p.id ? p.id : generateId([
    p.fontFamily,
    fontSizes2.valueLabel,
    fontSizes2.legend,
    fontSizes2.setLabel,
    fontSizes2.title,
    fontSizes2.exportLabel,
    fontSizes2.description,
    p.textColor,
    p.color,
    p.hasSelectionColor,
    p.strokeColor,
    p.valueTextColor,
    p.selectionColor,
    p.opacity,
    p.hasSelectionOpacity
  ]), [
    p.id,
    p.fontFamily,
    fontSizes2.valueLabel,
    fontSizes2.legend,
    fontSizes2.setLabel,
    fontSizes2.title,
    fontSizes2.exportLabel,
    fontSizes2.description,
    p.textColor,
    p.color,
    p.hasSelectionColor,
    p.strokeColor,
    p.valueTextColor,
    p.selectionColor,
    p.opacity,
    p.hasSelectionOpacity
  ]);
  const styleInfo = (0, import_react.useMemo)(() => deriveVennStyleDependent(p.theme, p.styles, p.classNames, styleId, p.selectionColor, p.title, p.description, p.tooltips), [p.theme, p.styles, p.classNames, styleId, p.selectionColor, p.title, p.description, p.tooltips]);
  const sizeInfo = (0, import_react.useMemo)(() => deriveVennSizeDependent(p.width, p.height, p.padding, p.id), [p.width, p.height, p.padding, p.id]);
  const h = useHandler(p);
  const qs = import_react.default.useMemo(() => queries2.map((q) => queryOverlap(q, "intersection", p.toElemKey)), [queries2, p.toElemKey]);
  const rulesHelper = baseRules(styleId, p, p.fontFamily, fontSizes2);
  return {
    styleId,
    size: sizeInfo,
    style: styleInfo,
    h,
    qs,
    rulesHelper
  };
}
function useExportChart(dataInfo, props, mode) {
  return (0, import_react.useCallback)((evt) => {
    const svg = evt.currentTarget.closest("svg");
    const type = evt.currentTarget.dataset.type || "png";
    switch (type) {
      case "dump":
        exportDump(svg, props, dataInfo, mode);
        break;
      case "share":
        exportSharedLink(props, dataInfo, mode);
        break;
      case "svg":
      case "png":
        exportSVG(svg, {
          type,
          toRemove: `.${evt.currentTarget.getAttribute("class")}`
        });
    }
  }, [dataInfo, props, mode]);
}
var VennDiagram = import_react.default.forwardRef(function VennDiagram2(props, ref) {
  const p = fillVennDiagramDefaults(props);
  const { selection: selection2 = null, queries: queries2 = [], fontSizes: fontSizes2 } = p;
  const v = useCreateCommon(p);
  const { size, style: style2, rulesHelper } = v;
  const dataInfo = (0, import_react.useMemo)(() => deriveVennDataDependent(p.sets, p.combinations, size, p.layout, p.valueFormat, p.toKey, p.toElemKey, p.id, p.setLabelOffsets), [p.sets, p.combinations, size, p.valueFormat, p.toKey, p.toElemKey, p.id, p.layout, p.setLabelOffsets]);
  const selectionKey = selection2 != null && isSetLike(selection2) ? p.toKey(selection2) : null;
  const selectionOverlap = selection2 == null ? null : generateSelectionOverlap(selection2, dataInfo.overlapGuesser, dataInfo.toElemKey);
  const selectionName = generateSelectionName(selection2);
  const rules = `
  ${rulesHelper.root}
  ${rulesHelper.text}

  .valueTextStyle-${style2.id} {
    fill: ${p.valueTextColor};
    ${rulesHelper.p(fontSizes2.valueLabel)}
    text-anchor: middle;
    dominant-baseline: central;
  }
  .setTextStyle-${style2.id} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.setLabel)}
    text-anchor: middle;
  }

  .topText-${style2.id} {
    dominant-baseline: hanging;
  }

  .stroke-circle-${style2.id} {
    fill: none;
    stroke: ${p.strokeColor};
  }

  .arc-${style2.id} {
    fill-rule: evenodd;
  }
  .arcP-${style2.id} {
    fill: transparent;
    fill-opacity: ${p.opacity};
  }
  ${rulesHelper.fill}
  ${rulesHelper.export}

  ${rulesHelper.hasSFill ? `.root-${style2.id}[data-selection] .arcP-${style2.id} { ${rulesHelper.hasSFill} }` : ""}

  ${queries2.map((q, i) => `.fillQ${i}-${dataInfo.id} {
    fill: ${q.color};
  }`).join("\n")}
  `;
  const exportChart = useExportChart(dataInfo, p, "venn");
  const maxWidth = dataInfo.sets.d.reduce((acc, d) => Math.min(acc, d.l.cx - (isEllipse(d.l) ? d.l.rx : d.l.r)), size.area.w);
  return import_react.default.createElement(
    SVGWrapper,
    { rules, style: style2, selectionName, size, p, data: dataInfo, tRef: ref, h: v.h, exportChart },
    import_react.default.createElement(UpSetTitle, { style: style2, width: maxWidth }),
    import_react.default.createElement("g", { className: clsx(p.onClick && `clickAble-${style2.id}`) }, dataInfo.sets.d.map((d, i) => import_react.default.createElement(
      "text",
      { key: d.key, x: d.l.text.x + d.offset.x, y: d.l.text.y + d.offset.y, onClick: v.h.onClick(dataInfo.sets.v[i], []), onMouseEnter: v.h.onMouseEnter(dataInfo.sets.v[i], []), onMouseLeave: v.h.onMouseLeave, onContextMenu: v.h.onContextMenu(dataInfo.sets.v[i], []), onMouseMove: v.h.onMouseMove(dataInfo.sets.v[i], []), className: clsx(`setTextStyle-${style2.id}`, `${d.l.align}Text-${style2.id}`, `${d.l.verticalAlign}Text-${style2.id}`, style2.classNames.setLabel) },
      style2.tooltips && import_react.default.createElement(
        "title",
        null,
        dataInfo.sets.v[i].name,
        ": ",
        dataInfo.format(dataInfo.sets.v[i].cardinality)
      ),
      dataInfo.sets.v[i].name
    ))),
    import_react.default.createElement("g", { className: clsx(p.onClick && `clickAble-${style2.id}`) }, dataInfo.cs.d.map((l, i) => import_react.default.createElement(VennArcSliceSelection, { key: l.key, d: l.v, i, slice: l.l, size, style: style2, data: dataInfo, fill: p.filled, h: v.h, selectionName, selected: selectionKey === l.key || isSet(selection2) && dataInfo.cs.has(l.v, selection2), elemOverlap: selectionOverlap, queries: queries2, qs: v.qs }))),
    import_react.default.createElement("g", null, dataInfo.sets.d.map((l) => isEllipse(l.l) ? import_react.default.createElement("ellipse", { key: l.key, rx: l.l.rx, ry: l.l.ry, transform: `translate(${l.l.cx},${l.l.cy})rotate(${l.l.rotation})`, className: clsx(`stroke-circle-${style2.id}`, style2.classNames.set), style: style2.styles.set }) : import_react.default.createElement("circle", { key: l.key, cx: l.l.cx, cy: l.l.cy, r: l.l.r, className: clsx(`stroke-circle-${style2.id}`, style2.classNames.set), style: style2.styles.set })))
  );
});
var KMapCell = import_react.default.memo(function KMapCell2({ d, i, h, className, data, style: style2 }) {
  const l = data.cs.l[i];
  const y = data.cs.scale(d.cardinality);
  const x = (data.cell - data.cs.bandWidth) / 2;
  return import_react.default.createElement(
    "g",
    { transform: `translate(${l.x}, ${l.y})`, onMouseEnter: h.onMouseEnter(d, []), onMouseLeave: h.onMouseLeave, onClick: h.onClick(d, []), onContextMenu: h.onContextMenu(d, []), onMouseMove: h.onMouseMove(d, []), className, "data-cardinality": d.cardinality },
    style2.tooltips && import_react.default.createElement(
      "title",
      null,
      d.name,
      ": ",
      data.sets.format(d.cardinality)
    ),
    import_react.default.createElement("rect", { width: data.cell, height: data.cell, className: `fillTransparent-${style2.id}` }),
    import_react.default.createElement("rect", { x, y, height: data.cell - y, width: data.cs.bandWidth, className: clsx(`fillPrimary-${style2.id}`, style2.classNames.bar), style: mergeColor(style2.styles.bar, d.color) }),
    import_react.default.createElement("text", { y: y - style2.barLabelOffset, x: data.cell / 2, style: style2.styles.barLabel, className: clsx(`barTextStyle-${style2.id}`, style2.classNames.barLabel) }, data.sets.format(d.cardinality))
  );
});
function generateGridPath(cell, vCells, hCells, level) {
  const h = cell * vCells;
  const w = cell * hCells;
  return [level.x.map((x) => `M ${x * cell},0 l0,${h}`), level.y.map((y) => `M 0,${y * cell} l${w},0`)].flat().join(" ");
}
var KMapChart = import_react.default.memo(function KMapChart2({ data, style: style2, size, h }) {
  const csNameOffset = style2.cs.offset === "auto" ? data.cs.labelOffset : style2.cs.offset;
  return import_react.default.createElement(
    "g",
    null,
    import_react.default.createElement(
      "g",
      { transform: `translate(${size.w - csNameOffset - 2}, ${size.h - data.cell - 50})` },
      import_react.default.createElement(Axis, { scale: data.cs.scale, orient: "left", size: data.cell, start: data.cs.barLabelFontSize, style: style2 }),
      import_react.default.createElement("text", { className: clsx(`cChartTextStyle-${style2.id}`, style2.classNames.chartLabel), style: style2.styles.chartLabel, transform: `translate(${-csNameOffset}, ${data.cell})rotate(-90)` }, style2.cs.name)
    ),
    import_react.default.createElement(
      "g",
      null,
      data.sets.l.map((l, i) => {
        const s = data.sets.v[i];
        const name = s.name;
        return import_react.default.createElement("g", { key: name, onClick: h.onClick(s, []), onMouseEnter: h.onMouseEnter(s, []), onMouseLeave: h.onMouseLeave, onContextMenu: h.onContextMenu(s, []), onMouseMove: h.onMouseMove(s, []), className: clsx(h.hasClick && `clickAble-${style2.id}`) }, l.text.map((p, i2) => import_react.default.createElement("text", { key: i2, transform: `translate(${p.x},${p.y})${!l.hor ? "rotate(-90)" : ""}`, className: clsx(`setTextStyle-${style2.id}`) }, name)));
      }),
      data.sets.l.map((l, i) => {
        const name = data.sets.v[i].name;
        return import_react.default.createElement(import_react.default.Fragment, { key: name }, l.notText.map((p, i2) => import_react.default.createElement("text", { key: i2, transform: `translate(${p.x},${p.y})${!l.hor ? "rotate(-90)" : ""}`, className: clsx(`setTextStyle-${style2.id}`, `not-${style2.id}`) }, name)));
      })
    ),
    import_react.default.createElement("g", { className: clsx(h.hasClick && `clickAble-${style2.id}`) }, data.cs.v.map((c, i) => {
      return import_react.default.createElement(KMapCell, { key: data.cs.keys[i], d: c, i, h, style: style2, data });
    })),
    import_react.default.createElement("g", { transform: `translate(${data.grid.x}, ${data.grid.y})` }, data.grid.levels.map((l, i) => import_react.default.createElement("path", { key: i, d: generateGridPath(data.cell, data.grid.vCells, data.grid.hCells, l), className: `gridStyle-${style2.id} gridStyle-${style2.id}-${i}` })))
  );
});
function KMapQueries$1({ data, style: style2, elemOverlap, secondary, tooltip, suffix, empty }) {
  const width = data.cs.bandWidth;
  const offset = (data.cell - width) / 2;
  const className = clsx(`fill${suffix}`, !tooltip && `pnone-${style2.id}`, style2.classNames.bar);
  return import_react.default.createElement("g", { "data-upset": secondary ? "cs-q" : "cs-s" }, data.cs.v.map((d, i) => {
    const l = data.cs.l[i];
    const key = data.cs.keys[i];
    if (empty && !secondary) {
      return import_react.default.createElement("rect", { key, x: l.x + offset, y: l.y + data.cell, height: 0, width, className, style: mergeColor(style2.styles.bar, !style2.selectionColor ? d.color : void 0) }, tooltip && import_react.default.createElement("title", null));
    }
    const o = elemOverlap(d);
    if (o === 0) {
      return null;
    }
    const y = data.cs.scale(o);
    const title = tooltip && import_react.default.createElement("title", null, `${d.name} ∩ ${tooltip}: ${o}`);
    return secondary ? import_react.default.createElement("path", { key, transform: `translate(${l.x + offset}, ${l.y + y})`, d: `M0,-1 l${width},0 l0,2 l${-width},0 L-${data.triangleSize},-${data.triangleSize} L-${data.triangleSize},${data.triangleSize} Z`, className, "data-i": i, "data-cardinality": o, style: mergeColor(void 0, !style2.selectionColor ? d.color : void 0) }, title) : import_react.default.createElement("rect", { key, x: l.x + offset, y: l.y + y, height: data.cell - y, "data-i": i, "data-cardinality": o, width, className, style: mergeColor(style2.styles.bar, !style2.selectionColor ? d.color : void 0) }, title);
  }));
}
var KMapQueries = import_react.default.memo(function KMapQueries2({ data, style: style2, hasHover, secondary, queries: queries2 }) {
  const qs = (0, import_react.useMemo)(() => queries2.map((q) => Object.assign(Object.assign({}, q), { overlap: queryOverlap(q, "intersection", data.toElemKey) })), [queries2, data.toElemKey]);
  return import_react.default.createElement("g", { className: hasHover && !secondary ? `pnone-${style2.id}` : void 0 }, qs.map((q, i) => import_react.default.createElement(KMapQueries$1, { key: q.name, data, style: style2, elemOverlap: q.overlap, suffix: `Q${i}-${data.id}`, secondary: secondary || i > 0, tooltip: hasHover && !(secondary || i > 0) ? void 0 : q.name })));
});
function KMapSelection({ data, style: style2, selection: selection2, hasHover }) {
  const empty = style2.emptySelection;
  const selectionOverlap = generateSelectionOverlap(selection2, data.overlapGuesser, data.toElemKey);
  const selectionName = generateSelectionName(selection2);
  return import_react.default.createElement("g", { className: hasHover ? `pnone-${style2.id}` : void 0 }, (selection2 || empty) && import_react.default.createElement(KMapQueries$1, { data, style: style2, empty: empty && !selection2, elemOverlap: selectionOverlap, suffix: `Selection-${style2.id}`, tooltip: hasHover ? void 0 : selectionName }));
}
function ranged(count, cb) {
  return Array(count).fill(0).map((_, i) => cb(i));
}
function generateLevels(numSets) {
  const lines = Array(Math.pow(2, numSets)).fill(0);
  ranged(numSets, (i) => {
    const shift = Math.pow(2, i);
    for (let i2 = 0; i2 < lines.length; i2 += shift) {
      lines[i2]++;
    }
  });
  const levels = ranged(Math.max(numSets, 1), () => []);
  lines.forEach((l, i) => {
    const level = Math.max(0, l - 1);
    levels[level].push(i);
  });
  levels[levels.length - 1].push(lines.length);
  return levels;
}
function generate(sets2, cs, has, options) {
  const { xBefore, yBefore, cell, hCells, vCells, horizontalSets, verticalSets } = bounds(sets2.length, options);
  const s = setLabels(sets2.length, options);
  const shifts = generateShiftLookup(sets2, hCells, vCells, has);
  const c = cs.map((c2) => {
    const [i, j] = shifts.reduceRight((acc, s2) => s2(c2, acc), [0, 0]);
    return {
      x: xBefore + i * cell,
      y: yBefore + j * cell
    };
  });
  const hLevels = generateLevels(horizontalSets);
  const vLevels = generateLevels(verticalSets);
  return {
    s,
    c,
    cell,
    grid: {
      x: xBefore,
      y: yBefore,
      hCells,
      vCells,
      levels: hLevels.map((l, i) => ({
        x: l,
        y: i < vLevels.length ? vLevels[i] : []
      }))
    }
  };
}
function generateShiftLookup(sets2, hCells, vCells, has) {
  return sets2.map((s, k) => {
    const index = Math.floor(k / 2);
    const hor = k % 2 === 0;
    const numLabels = Math.pow(2, index);
    const span = (hor ? hCells : vCells) / numLabels / 2;
    return (cs, [i, j]) => {
      if (has(cs, s)) {
        return [i, j];
      }
      if (span > 1) {
        if (hor) {
          return [span - 1 - i + span, j];
        }
        return [i, span - 1 - j + span];
      }
      if (hor) {
        return [i + span, j];
      }
      return [i, j + span];
    };
  });
}
function setLabels(sets2, options) {
  const { xOffset, yOffset, cell, xBefore, yBefore, hCells, vCells } = bounds(sets2, options);
  const xAfterEnd = options.width - xOffset;
  const yAfterEnd = options.height - yOffset;
  return ranged(sets2, (k) => {
    const index = Math.floor(k / 2);
    const hor = k % 2 === 0;
    const numLabels = Math.pow(2, index);
    const span = (hor ? hCells : vCells) / numLabels / 2;
    const xPos = hor ? xBefore : yBefore;
    const labels = [
      {
        v: true,
        x: xPos + span * cell * 0.5
      },
      {
        v: false,
        x: xPos + span * cell * 1.5
      }
    ];
    for (let i = 1; i <= index; i++) {
      const offset = span * Math.pow(2, i) * cell;
      const l = labels.length - 1;
      labels.push(...labels.map((li, i2) => ({
        v: labels[l - i2].v,
        x: li.x + offset
      })));
    }
    const inAfterGroup = index % 2 === 1;
    const withinGroupIndex = Math.floor(index / 2);
    let yPos = 0;
    if (inAfterGroup) {
      const end = hor ? yAfterEnd : xAfterEnd;
      yPos = end - options.labelHeight * (0.5 + withinGroupIndex);
    } else {
      const start = hor ? yOffset : xOffset;
      yPos = start + options.labelHeight * (0.5 + withinGroupIndex);
    }
    if (hor) {
      return {
        hor: true,
        span,
        text: labels.filter((d) => d.v).map((l) => ({ x: l.x, y: yPos })),
        notText: labels.filter((d) => !d.v).map((l) => ({ x: l.x, y: yPos }))
      };
    }
    return {
      hor: false,
      span,
      text: labels.filter((d) => d.v).map((l) => ({ x: yPos, y: l.x })),
      notText: labels.filter((d) => !d.v).map((l) => ({ x: yPos, y: l.x }))
    };
  });
}
function bounds(sets2, options) {
  const horizontalSets = Math.ceil(sets2 / 2);
  const verticalSets = Math.floor(sets2 / 2);
  const hCells = Math.pow(2, horizontalSets);
  const vCells = Math.pow(2, verticalSets);
  const cell = Math.floor(Math.min((options.width - options.labelHeight * verticalSets) / hCells, (options.height - options.labelHeight * horizontalSets) / vCells));
  const xOffset = (options.width - hCells * cell - options.labelHeight * verticalSets) / 2;
  const yOffset = (options.height - vCells * cell - options.labelHeight * horizontalSets) / 2;
  const xBefore = xOffset + Math.ceil(verticalSets / 2) * options.labelHeight;
  const yBefore = yOffset + Math.ceil(horizontalSets / 2) * options.labelHeight;
  return { xOffset, horizontalSets, yOffset, verticalSets, cell, xBefore, yBefore, hCells, vCells };
}
function deriveKarnaughDataDependent(sets2, combinations2, size, numericScale2, barLabelFontSize, barPadding, setLabelFontSize, tickFontSize, toKey2, toElemKey, id, combinationMaxScale) {
  const numericScaleFactory = resolveNumericScale(numericScale2);
  const setKeys = sets2.map(toKey2);
  const cs = areCombinations(combinations2) ? combinations2 : generateCombinations(sets2, Object.assign({
    type: "distinctIntersection"
  }, combinations2 !== null && combinations2 !== void 0 ? combinations2 : {}));
  const csKeys = cs.map(toKey2);
  const has = (v, s) => {
    const sk = toKey2(s);
    return Array.from(v.sets).some((ss) => toKey2(ss) === sk);
  };
  const labelHeight = Math.ceil(setLabelFontSize * 1.2);
  const l = generate(sets2, cs, has, {
    width: size.area.w,
    height: size.area.h,
    labelHeight
  });
  const maxCSCardinality = combinationMaxScale !== null && combinationMaxScale !== void 0 ? combinationMaxScale : cs.reduce((acc, d) => Math.max(acc, d.cardinality), 0);
  const scale = numericScaleFactory(maxCSCardinality, [l.cell, barLabelFontSize], {
    orientation: "vertical",
    fontSizeHint: tickFontSize
  });
  const bandWidth = Math.round(l.cell * (1 - barPadding));
  const triangleSize = Math.min(Math.max(2, bandWidth / 2 * barPadding), 5);
  const guessLabelWidth = (v) => Math.floor(barLabelFontSize / 1.4 * 0.7 * scale.tickFormat()(v).length);
  const largestCSLabelWidth = guessLabelWidth(maxCSCardinality);
  return {
    id: id ? id : generateId(),
    grid: l.grid,
    sets: {
      keys: setKeys,
      l: l.s,
      v: sets2,
      labelHeight,
      format: scale.tickFormat()
    },
    triangleSize,
    cell: l.cell,
    cs: {
      keys: csKeys,
      l: l.c,
      v: cs,
      barLabelFontSize,
      has,
      scale,
      bandWidth,
      labelOffset: largestCSLabelWidth + 9 + 6
    },
    toKey: toKey2,
    toElemKey,
    overlapGuesser: generateOverlapFunction(cs, noGuessPossible, toKey2)
  };
}
function deriveStyleDependent(theme2, styles2, classNames2, combinationName, combinationNameAxisOffset, styleId, barLabelOffset, selectionColor, emptySelection, title, description, tooltips) {
  return {
    theme: theme2,
    styles: styles2,
    classNames: classNames2,
    emptySelection,
    id: styleId,
    barLabelOffset,
    selectionColor,
    title,
    description,
    tooltips,
    cs: {
      name: combinationName,
      offset: combinationNameAxisOffset
    }
  };
}
var KarnaughMap = import_react.default.forwardRef(function KarnaughMap2(props, ref) {
  const p = fillKarnaughMapDefaults(props);
  const { queries: queries2 = [], fontSizes: fontSizes2, selection: selection2 = null } = p;
  const styleId = (0, import_react.useMemo)(() => p.id ? p.id : generateId([
    p.fontFamily,
    fontSizes2.axisTick,
    fontSizes2.barLabel,
    fontSizes2.legend,
    fontSizes2.setLabel,
    fontSizes2.title,
    fontSizes2.exportLabel,
    fontSizes2.description,
    p.textColor,
    p.color,
    p.hasSelectionColor,
    p.strokeColor,
    p.selectionColor,
    p.opacity,
    p.hasSelectionOpacity
  ]), [
    p.id,
    p.fontFamily,
    fontSizes2.axisTick,
    fontSizes2.barLabel,
    fontSizes2.legend,
    fontSizes2.setLabel,
    fontSizes2.title,
    fontSizes2.exportLabel,
    fontSizes2.description,
    p.textColor,
    p.color,
    p.hasSelectionColor,
    p.strokeColor,
    p.selectionColor,
    p.opacity,
    p.hasSelectionOpacity
  ]);
  const style2 = (0, import_react.useMemo)(() => deriveStyleDependent(p.theme, p.styles, p.classNames, p.combinationName, p.combinationNameAxisOffset, styleId, p.barLabelOffset, p.selectionColor, p.emptySelection, p.title, p.description, p.tooltips), [
    p.theme,
    p.styles,
    p.classNames,
    p.combinationName,
    p.combinationNameAxisOffset,
    styleId,
    p.barLabelOffset,
    p.selectionColor,
    p.emptySelection,
    p.title,
    p.description,
    p.tooltips
  ]);
  const size = (0, import_react.useMemo)(() => deriveVennSizeDependent(p.width, p.height, p.padding, p.id), [p.width, p.height, p.padding, p.id]);
  const data = (0, import_react.useMemo)(() => deriveKarnaughDataDependent(p.sets, p.combinations, size, p.numericScale, p.barLabelOffset + parseFontSize(fontSizes2.barLabel), p.barPadding, parseFontSize(fontSizes2.setLabel), parseFontSize(fontSizes2.axisTick), p.toKey, p.toElemKey, p.id, p.combinationMaxScale), [
    p.sets,
    p.combinations,
    size,
    p.numericScale,
    p.barLabelOffset,
    fontSizes2.barLabel,
    p.barPadding,
    fontSizes2.axisTick,
    fontSizes2.setLabel,
    p.toKey,
    p.toElemKey,
    p.id,
    p.combinationMaxScale
  ]);
  const h = useHandler(p);
  const selectionName = generateSelectionName(selection2);
  const rulesHelper = baseRules(styleId, p, p.fontFamily, fontSizes2);
  const rules = `
  ${rulesHelper.root}
  ${rulesHelper.text}

  .axisTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.axisTick)}
    text-anchor: end;
  }
  .barTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.barLabel)}
    text-anchor: middle;
  }
  .setTextStyle-${style2.id} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.setLabel)}
    text-anchor: middle;
    dominant-baseline: central;
  }
  .cChartTextStyle-${styleId} {
    fill: ${p.textColor};
    ${rulesHelper.p(fontSizes2.chartLabel)}
  }

  .not-${style2.id} {
    text-decoration: overline;
  }

  .axisLine-${styleId} {
    fill: none;
    stroke: ${p.textColor};
  }

  .gridStyle-${style2.id} {
    fill: none;
    stroke: ${p.strokeColor};
    stroke-linecap: round;
  }
  .gridStyle-${style2.id}-1 {
    stroke-width: 2;
  }
  .gridStyle-${style2.id}-2 {
    stroke-width: 3;
  }

  ${rulesHelper.fill}
  ${rulesHelper.export}

  ${queries2.map((q, i) => `.fillQ${i}-${data.id} {
    fill: ${q.color};
  }`).join("\n")}
  `;
  const exportChart = useExportChart(data, p, "kmap");
  const maxWidth = data.sets.l.reduce((acc, d) => Math.min(acc, d.text[0].x - data.sets.labelHeight), size.area.w);
  return import_react.default.createElement(
    SVGWrapper,
    { rules, style: style2, size, p, data, tRef: ref, selectionName, h, exportChart },
    import_react.default.createElement(UpSetTitle, { style: style2, width: maxWidth }),
    import_react.default.createElement(KMapChart, { style: style2, data, h, size }),
    import_react.default.createElement(KMapSelection, { style: style2, data, hasHover: h.hasHover, selection: selection2 }),
    import_react.default.createElement(KMapQueries, { style: style2, data, hasHover: h.hasHover, queries: queries2, secondary: h.hasHover || selection2 != null })
  );
});
var defaults = {
  background: "#F4F4F4",
  color: "#A6A8AB",
  secondaryColor: "#E1E2E3"
};
function prepare(props) {
  var _a, _b, _c, _d;
  const color = (_a = props.color) !== null && _a !== void 0 ? _a : defaults.color;
  const secondary = (_b = props.secondaryColor) !== null && _b !== void 0 ? _b : defaults.secondaryColor;
  const rest = Object.assign({}, props);
  const background = (_c = props.background) !== null && _c !== void 0 ? _c : defaults.background;
  delete rest.color;
  delete rest.secondaryColor;
  delete rest.background;
  if (background) {
    rest.style = Object.assign({ background }, (_d = rest.style) !== null && _d !== void 0 ? _d : {});
  }
  return { color, secondary, rest };
}
var UpSetJSSkeleton = import_react.default.memo(
  import_react.default.forwardRef(function UpSetJSSkeleton2(props, ref) {
    const { color, secondary, rest } = prepare(props);
    const wi = 20;
    const padding = 10;
    const sWidth = 75;
    const sY = 110;
    const cHeight = 100;
    const csX = 85;
    const cOffsets = [10, 20, 35, 60, 65, 80, 90];
    const sOffsets = [50, 30, 15];
    return import_react.default.createElement(
      "svg",
      Object.assign({ viewBox: "0 0 300 200", ref }, rest),
      cOffsets.map((offset, i) => import_react.default.createElement("rect", { key: i, x: csX + i * (wi + padding), y: offset, width: wi, height: cHeight - offset, fill: color })),
      sOffsets.map((offset, i) => import_react.default.createElement("rect", { key: i, x: offset, y: sY + i * (wi + padding), width: sWidth - offset, height: wi, fill: color })),
      cOffsets.map((_, i) => sOffsets.map((_2, j) => {
        const filled = j === 2 - i || i === 3 && j > 0 || i === 4 && j !== 1 || i === 5 && j < 2 || i === 6;
        return import_react.default.createElement("circle", { key: `${i}x${j}`, cx: csX + i * (wi + padding) + wi / 2, cy: sY + j * (wi + padding) + wi / 2, r: wi / 2, fill: filled ? color : secondary });
      })),
      import_react.default.createElement("rect", { x: "182", y: "150", width: "6", height: "30", fill: color }),
      import_react.default.createElement("rect", { x: "212", y: "120", width: "6", height: "60", fill: color }),
      import_react.default.createElement("rect", { x: "242", y: "120", width: "6", height: "30", fill: color }),
      import_react.default.createElement("rect", { x: "272", y: "120", width: "6", height: "60", fill: color })
    );
  })
);
var VennDiagramSkeleton = import_react.default.memo(
  import_react.default.forwardRef(function VennDiagramSkeleton2(props, ref) {
    const { color, secondary, rest } = prepare(props);
    const padding = 10;
    const l = layoutImpl(3, 300 - padding * 2, 3200 - padding * 2);
    return import_react.default.createElement(
      "svg",
      Object.assign({ viewBox: "0 0 300 200", ref }, rest),
      l.sets.map((set, i) => import_react.default.createElement("circle", { key: i, cx: set.cx, cy: set.cy + padding, r: set.r, fill: secondary })),
      l.sets.map((set, i) => import_react.default.createElement("circle", { key: i, cx: set.cx, cy: set.cy + padding, r: set.r, stroke: color, fill: "none" }))
    );
  })
);
var KarnaughMapSkeleton = import_react.default.memo(
  import_react.default.forwardRef(function KarnaughMapSkeleton2(props, ref) {
    const { rest, color, secondary } = prepare(props);
    const { xBefore, yBefore, cell, hCells, vCells } = bounds(2, {
      width: 270,
      height: 170,
      labelHeight: 20
    });
    const gw = hCells * cell;
    const gh = vCells * cell;
    const v1 = 0.9;
    const v2 = 0.5;
    const v3 = 0.26;
    const v4 = 0.75;
    return import_react.default.createElement(
      "svg",
      Object.assign({ viewBox: "0 0 300 200", ref, fontFamily: "sans-serif" }, rest),
      import_react.default.createElement(
        "g",
        { transform: `translate(${xBefore + 10},${yBefore + 10})` },
        import_react.default.createElement("text", { x: cell * 0.5, y: -3, fill: color, textAnchor: "middle" }, "A"),
        import_react.default.createElement("text", { x: cell * 1.5, y: -3, fill: color, textAnchor: "middle", style: { textDecoration: "overline" } }, "A"),
        import_react.default.createElement("text", { x: -3, y: cell * 0.5, fill: color, textAnchor: "end", dominantBaseline: "central" }, "B"),
        import_react.default.createElement("text", { x: -3, y: cell * 1.5, fill: color, textAnchor: "end", dominantBaseline: "central", style: { textDecoration: "overline" } }, "B"),
        import_react.default.createElement("rect", { x: cell * 0.1, y: cell * (1 - v1), height: cell * v1, width: cell * 0.8, fill: secondary }),
        import_react.default.createElement("rect", { x: cell * 1.1, y: cell * (1 - v2), height: cell * v2, width: cell * 0.8, fill: secondary }),
        import_react.default.createElement("rect", { x: cell * 0.1, y: cell * (1 - v3 + 1), height: cell * v3, width: cell * 0.8, fill: secondary }),
        import_react.default.createElement("rect", { x: cell * 1.1, y: cell * (1 - v4 + 1), height: cell * v4, width: cell * 0.8, fill: secondary }),
        import_react.default.createElement("path", { d: `M0,0 l${gw},0 l0,${gh} l${-gw},0 l0,${-gh} M${gw / 2},0 l0,${gh} M0,${gh / 2} l${gw},0`, fill: "none", stroke: color })
      )
    );
  })
);
var DEG2RAD = 1 / 180 * Math.PI;
function pointAtCircle(cx, cy, radius, angle) {
  return {
    x: cx + Math.cos(angle * DEG2RAD) * radius,
    y: cy + Math.sin(angle * DEG2RAD) * radius
  };
}
function center(circles) {
  const sumX = circles.reduce((acc, a) => acc + a.x, 0);
  const sumY = circles.reduce((acc, a) => acc + a.y, 0);
  return {
    x: sumX / circles.length,
    y: sumY / circles.length
  };
}
function angleAtCircle(p, c) {
  const x = p.x - c.x;
  const y = p.y - c.y;
  return Math.atan2(y, x) / DEG2RAD;
}
function createVennJSAdapter(layout, options) {
  return {
    maxSets: Infinity,
    compute(sets2, combinations2, width, height) {
      const overlaps = combinations2.map((c) => ({ sets: Array.from(c.sets).map((s) => s.name), size: c.cardinality }));
      const r = layout(overlaps, Object.assign({}, {
        width,
        height,
        distinct: true
      }, options !== null && options !== void 0 ? options : {}));
      const singleSets = r.filter((d) => d.data.sets.length === 1);
      const setNames = new Map(sets2.map((d, i) => [d.name, i]));
      const setCircles = singleSets.map((d) => d.circles[0]);
      const eulerCenter = center(setCircles);
      const asArc = (a) => ({
        x2: a.p1.x,
        y2: a.p1.y,
        cx: a.circle.x,
        cy: a.circle.y,
        sweep: true,
        large: a.width > a.circle.radius,
        ref: setCircles.findIndex((d) => Math.abs(d.x - a.circle.x) < 0.05 && Math.abs(d.y - a.circle.y) < 0.05),
        mode: "i"
      });
      return {
        sets: singleSets.map((d) => {
          const c = d.circles[0];
          const angle = angleAtCircle(c, eulerCenter);
          return {
            cx: c.x,
            cy: c.y,
            r: c.radius,
            align: angle > 90 ? "end" : "start",
            verticalAlign: "bottom",
            text: pointAtCircle(c.x, c.y, c.radius * 1.1, angle)
          };
        }),
        intersections: r.map((d) => {
          const arcs = d.arcs;
          const text = {
            x: d.text.x,
            y: d.text.y
          };
          if (arcs.length === 0) {
            return {
              sets: d.data.sets.map((s) => setNames.get(s)),
              text,
              x1: 0,
              y1: 0,
              arcs: []
            };
          }
          if (arcs.length === 1) {
            const c = d.arcs[0].circle;
            return {
              sets: d.data.sets.map((s) => setNames.get(s)),
              text,
              x1: d.arcs[0].p2.x,
              y1: c.y - c.radius,
              arcs: [asArc(d.arcs[0]), Object.assign(asArc(d.arcs[0]), { y2: c.y - c.radius })],
              path: d.distinctPath || d.path
            };
          }
          return {
            sets: d.data.sets.map((s) => setNames.get(s)),
            text,
            x1: d.arcs[0].p2.x,
            y1: d.arcs[0].p2.y,
            arcs: d.arcs.map((e) => asArc(e)),
            path: d.distinctPath || d.path
          };
        })
      };
    }
  };
}
function widthRatios(value) {
  return value == null || Array.isArray(value) && value.length >= 2 && value.every((v) => typeof v === "number");
}
function heightRatios(value) {
  return value == null || Array.isArray(value) && value.length >= 1 && value.every((v) => typeof v === "number");
}
function setLabelAlignment(value) {
  return value == null || value === "left" || value === "center" || value === "right";
}
function sets(value) {
  return Array.isArray(value) && value.every(isSet);
}
function combinations(value) {
  return value == null || Array.isArray(value) && value.every(isSetCombination) || isGenerateSetCombinationOptions(value);
}
function selection(value) {
  return value == null || Array.isArray(value) || isSetLike(value);
}
function onHover(value) {
  return value == null || typeof value === "function";
}
function onClick(value) {
  return value == null || typeof value === "function";
}
function onContextMenu(value) {
  return value == null || typeof value === "function";
}
function onMouseMove(value) {
  return value == null || typeof value === "function";
}
function queries(value) {
  return !value || Array.isArray(value) && value.every(isUpSetQuery);
}
function stringOrFalse(value) {
  return value == null || typeof value === "string" || value === false;
}
function setLabelOffsets(value) {
  return value == null || Array.isArray(value) && value.every((v) => null);
}
function theme(value) {
  return value == null || value === "light" || value === "dark" || value === "vega";
}
function classNames(value) {
  return value == null || Object.keys(value).every((k) => MULTI_STYLE_KEYS.includes(k) && typeof value[k] === "string");
}
function fontSizes(value) {
  return value == null || Object.keys(value).every((k) => FONT_SIZES_KEYS.includes(k) && typeof value[k] === "string");
}
function numericScale(value) {
  return value == null || value === "linear" || value === "log" || typeof value === "function";
}
function bandScale2(value) {
  return value == null || value === "band" || typeof value === "function";
}
function axisOffset(value) {
  return value == null || value === "auto" || typeof value === "number";
}
function style(value) {
  return value == null || typeof value === "object";
}
function styles(value) {
  return value == null || Object.keys(value).every((k) => MULTI_STYLE_KEYS.includes(k));
}
function exportButtons(value) {
  return value == null || typeof value === "boolean" || Object.keys(value).every((k) => EXPORT_OPTION_KEYS.includes(k) && typeof value[k] === "boolean");
}
var validators = Object.freeze({
  __proto__: null,
  widthRatios,
  heightRatios,
  setLabelAlignment,
  sets,
  combinations,
  selection,
  onHover,
  onClick,
  onContextMenu,
  onMouseMove,
  queries,
  stringOrFalse,
  setLabelOffsets,
  theme,
  classNames,
  fontSizes,
  numericScale,
  bandScale: bandScale2,
  axisOffset,
  style,
  styles,
  exportButtons
});
export {
  KarnaughMap,
  KarnaughMapSkeleton,
  SET_JOINERS,
  UpSetJS,
  UpSetJSSkeleton,
  VennDiagram,
  VennDiagramSkeleton,
  asCombination,
  asCombinations,
  asSet,
  asSets,
  bandScale,
  createVennJSAdapter,
  UpSetJS as default,
  downloadUrl,
  exportSVG,
  exportVegaLite,
  extractCombinations,
  extractFromExpression,
  extractSets,
  fillDefaults,
  fillDefaultsG,
  fillKarnaughMapDefaults,
  fillKarnaughMapDefaultsG,
  fillVennDiagramDefaults,
  fillVennDiagramDefaultsG,
  fromDump,
  fromIndicesArray,
  fromSetName,
  fromStaticDump,
  generateCombinations,
  generateDistinctOverlapFunction,
  generateIntersectionOverlapFunction,
  generateOverlapFunction,
  generateOverlapLookup,
  generateOverlapLookupFunction,
  generateUnionOverlapFunction,
  getDefaultTheme,
  isCalcQuery,
  isElemQuery,
  isEllipse,
  isGenerateSetCombinationOptions,
  isSet,
  isSetCombination,
  isSetLike,
  isSetQuery,
  isUpSetQuery,
  linearScale,
  logScale,
  mergeColors,
  parseColor,
  validators as propValidators,
  queryElemOverlap,
  queryOverlap,
  setElemIntersectionFactory,
  setElemOverlap,
  setElemOverlapFactory,
  setOverlap,
  setOverlapFactory,
  toDump,
  toIndicesArray,
  toKey,
  toStaticDump,
  toUpSetJSDump,
  toUpSetJSStaticDump
};
//# sourceMappingURL=@upsetjs_react.js.map
