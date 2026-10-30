var Ve = Object.defineProperty;
var Ue = (a, e, t) => e in a ? Ve(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var w = (a, e, t) => Ue(a, typeof e != "symbol" ? e + "" : e, t);
var _;
(function(a) {
  a.assertEqual = (i) => {
  };
  function e(i) {
  }
  a.assertIs = e;
  function t(i) {
    throw new Error();
  }
  a.assertNever = t, a.arrayToEnum = (i) => {
    const n = {};
    for (const r of i)
      n[r] = r;
    return n;
  }, a.getValidEnumValues = (i) => {
    const n = a.objectKeys(i).filter((o) => typeof i[i[o]] != "number"), r = {};
    for (const o of n)
      r[o] = i[o];
    return a.objectValues(r);
  }, a.objectValues = (i) => a.objectKeys(i).map(function(n) {
    return i[n];
  }), a.objectKeys = typeof Object.keys == "function" ? (i) => Object.keys(i) : (i) => {
    const n = [];
    for (const r in i)
      Object.prototype.hasOwnProperty.call(i, r) && n.push(r);
    return n;
  }, a.find = (i, n) => {
    for (const r of i)
      if (n(r))
        return r;
  }, a.isInteger = typeof Number.isInteger == "function" ? (i) => Number.isInteger(i) : (i) => typeof i == "number" && Number.isFinite(i) && Math.floor(i) === i;
  function s(i, n = " | ") {
    return i.map((r) => typeof r == "string" ? `'${r}'` : r).join(n);
  }
  a.joinValues = s, a.jsonStringifyReplacer = (i, n) => typeof n == "bigint" ? n.toString() : n;
})(_ || (_ = {}));
var _e;
(function(a) {
  a.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(_e || (_e = {}));
const l = _.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), j = (a) => {
  switch (typeof a) {
    case "undefined":
      return l.undefined;
    case "string":
      return l.string;
    case "number":
      return Number.isNaN(a) ? l.nan : l.number;
    case "boolean":
      return l.boolean;
    case "function":
      return l.function;
    case "bigint":
      return l.bigint;
    case "symbol":
      return l.symbol;
    case "object":
      return Array.isArray(a) ? l.array : a === null ? l.null : a.then && typeof a.then == "function" && a.catch && typeof a.catch == "function" ? l.promise : typeof Map < "u" && a instanceof Map ? l.map : typeof Set < "u" && a instanceof Set ? l.set : typeof Date < "u" && a instanceof Date ? l.date : l.object;
    default:
      return l.unknown;
  }
}, d = _.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class N extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (s) => {
      this.issues = [...this.issues, s];
    }, this.addIssues = (s = []) => {
      this.issues = [...this.issues, ...s];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(n) {
      return n.message;
    }, s = { _errors: [] }, i = (n) => {
      for (const r of n.issues)
        if (r.code === "invalid_union")
          r.unionErrors.map(i);
        else if (r.code === "invalid_return_type")
          i(r.returnTypeError);
        else if (r.code === "invalid_arguments")
          i(r.argumentsError);
        else if (r.path.length === 0)
          s._errors.push(t(r));
        else {
          let o = s, u = 0;
          for (; u < r.path.length; ) {
            const h = r.path[u];
            u === r.path.length - 1 ? (o[h] = o[h] || { _errors: [] }, o[h]._errors.push(t(r))) : o[h] = o[h] || { _errors: [] }, o = o[h], u++;
          }
        }
    };
    return i(this), s;
  }
  static assert(e) {
    if (!(e instanceof N))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, _.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, s = [];
    for (const i of this.issues)
      if (i.path.length > 0) {
        const n = i.path[0];
        t[n] = t[n] || [], t[n].push(e(i));
      } else
        s.push(e(i));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
N.create = (a) => new N(a);
const le = (a, e) => {
  let t;
  switch (a.code) {
    case d.invalid_type:
      a.received === l.undefined ? t = "Required" : t = `Expected ${a.expected}, received ${a.received}`;
      break;
    case d.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(a.expected, _.jsonStringifyReplacer)}`;
      break;
    case d.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${_.joinValues(a.keys, ", ")}`;
      break;
    case d.invalid_union:
      t = "Invalid input";
      break;
    case d.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${_.joinValues(a.options)}`;
      break;
    case d.invalid_enum_value:
      t = `Invalid enum value. Expected ${_.joinValues(a.options)}, received '${a.received}'`;
      break;
    case d.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case d.invalid_return_type:
      t = "Invalid function return type";
      break;
    case d.invalid_date:
      t = "Invalid date";
      break;
    case d.invalid_string:
      typeof a.validation == "object" ? "includes" in a.validation ? (t = `Invalid input: must include "${a.validation.includes}"`, typeof a.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${a.validation.position}`)) : "startsWith" in a.validation ? t = `Invalid input: must start with "${a.validation.startsWith}"` : "endsWith" in a.validation ? t = `Invalid input: must end with "${a.validation.endsWith}"` : _.assertNever(a.validation) : a.validation !== "regex" ? t = `Invalid ${a.validation}` : t = "Invalid";
      break;
    case d.too_small:
      a.type === "array" ? t = `Array must contain ${a.exact ? "exactly" : a.inclusive ? "at least" : "more than"} ${a.minimum} element(s)` : a.type === "string" ? t = `String must contain ${a.exact ? "exactly" : a.inclusive ? "at least" : "over"} ${a.minimum} character(s)` : a.type === "number" ? t = `Number must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${a.minimum}` : a.type === "bigint" ? t = `Number must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${a.minimum}` : a.type === "date" ? t = `Date must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(a.minimum))}` : t = "Invalid input";
      break;
    case d.too_big:
      a.type === "array" ? t = `Array must contain ${a.exact ? "exactly" : a.inclusive ? "at most" : "less than"} ${a.maximum} element(s)` : a.type === "string" ? t = `String must contain ${a.exact ? "exactly" : a.inclusive ? "at most" : "under"} ${a.maximum} character(s)` : a.type === "number" ? t = `Number must be ${a.exact ? "exactly" : a.inclusive ? "less than or equal to" : "less than"} ${a.maximum}` : a.type === "bigint" ? t = `BigInt must be ${a.exact ? "exactly" : a.inclusive ? "less than or equal to" : "less than"} ${a.maximum}` : a.type === "date" ? t = `Date must be ${a.exact ? "exactly" : a.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(a.maximum))}` : t = "Invalid input";
      break;
    case d.custom:
      t = "Invalid input";
      break;
    case d.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case d.not_multiple_of:
      t = `Number must be a multiple of ${a.multipleOf}`;
      break;
    case d.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, _.assertNever(a);
  }
  return { message: t };
};
let qe = le;
function We() {
  return qe;
}
const Fe = (a) => {
  const { data: e, path: t, errorMaps: s, issueData: i } = a, n = [...t, ...i.path || []], r = {
    ...i,
    path: n
  };
  if (i.message !== void 0)
    return {
      ...i,
      path: n,
      message: i.message
    };
  let o = "";
  const u = s.filter((h) => !!h).slice().reverse();
  for (const h of u)
    o = h(r, { data: e, defaultError: o }).message;
  return {
    ...i,
    path: n,
    message: o
  };
};
function c(a, e) {
  const t = We(), s = Fe({
    issueData: e,
    data: a.data,
    path: a.path,
    errorMaps: [
      a.common.contextualErrorMap,
      // contextual error map is first priority
      a.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === le ? void 0 : le
      // then global default map
    ].filter((i) => !!i)
  });
  a.common.issues.push(s);
}
class S {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    const s = [];
    for (const i of t) {
      if (i.status === "aborted")
        return g;
      i.status === "dirty" && e.dirty(), s.push(i.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const i of t) {
      const n = await i.key, r = await i.value;
      s.push({
        key: n,
        value: r
      });
    }
    return S.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const i of t) {
      const { key: n, value: r } = i;
      if (n.status === "aborted" || r.status === "aborted")
        return g;
      n.status === "dirty" && e.dirty(), r.status === "dirty" && e.dirty(), n.value !== "__proto__" && (typeof r.value < "u" || i.alwaysSet) && (s[n.value] = r.value);
    }
    return { status: e.value, value: s };
  }
}
const g = Object.freeze({
  status: "aborted"
}), K = (a) => ({ status: "dirty", value: a }), C = (a) => ({ status: "valid", value: a }), be = (a) => a.status === "aborted", ke = (a) => a.status === "dirty", q = (a) => a.status === "valid", se = (a) => typeof Promise < "u" && a instanceof Promise;
var f;
(function(a) {
  a.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, a.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(f || (f = {}));
class $ {
  constructor(e, t, s, i) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = i;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const we = (a, e) => {
  if (q(e))
    return { success: !0, data: e.value };
  if (!a.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new N(a.common.issues);
      return this._error = t, this._error;
    }
  };
};
function y(a) {
  if (!a)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: i } = a;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: i } : { errorMap: (r, o) => {
    const { message: u } = a;
    return r.code === "invalid_enum_value" ? { message: u ?? o.defaultError } : typeof o.data > "u" ? { message: u ?? s ?? o.defaultError } : r.code !== "invalid_type" ? { message: o.defaultError } : { message: u ?? t ?? o.defaultError };
  }, description: i };
}
class x {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return j(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: j(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new S(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: j(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (se(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const s = this.safeParse(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  safeParse(e, t) {
    const s = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: j(e)
    }, i = this._parseSync({ data: e, path: s.path, parent: s });
    return we(s, i);
  }
  "~validate"(e) {
    var s, i;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: j(e)
    };
    if (!this["~standard"].async)
      try {
        const n = this._parseSync({ data: e, path: [], parent: t });
        return q(n) ? {
          value: n.value
        } : {
          issues: t.common.issues
        };
      } catch (n) {
        (i = (s = n == null ? void 0 : n.message) == null ? void 0 : s.toLowerCase()) != null && i.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((n) => q(n) ? {
      value: n.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const s = await this.safeParseAsync(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  async safeParseAsync(e, t) {
    const s = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: j(e)
    }, i = this._parse({ data: e, path: s.path, parent: s }), n = await (se(i) ? i : Promise.resolve(i));
    return we(s, n);
  }
  refine(e, t) {
    const s = (i) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(i) : t;
    return this._refinement((i, n) => {
      const r = e(i), o = () => n.addIssue({
        code: d.custom,
        ...s(i)
      });
      return typeof Promise < "u" && r instanceof Promise ? r.then((u) => u ? !0 : (o(), !1)) : r ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, i) => e(s) ? !0 : (i.addIssue(typeof t == "function" ? t(s, i) : t), !1));
  }
  _refinement(e) {
    return new X({
      schema: this,
      typeName: p.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (t) => this["~validate"](t)
    };
  }
  optional() {
    return Z.create(this, this._def);
  }
  nullable() {
    return G.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return A.create(this);
  }
  promise() {
    return oe.create(this, this._def);
  }
  or(e) {
    return ne.create([this, e], this._def);
  }
  and(e) {
    return ie.create(this, e, this._def);
  }
  transform(e) {
    return new X({
      ...y(this._def),
      schema: this,
      typeName: p.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new me({
      ...y(this._def),
      innerType: this,
      defaultValue: t,
      typeName: p.ZodDefault
    });
  }
  brand() {
    return new mt({
      typeName: p.ZodBranded,
      type: this,
      ...y(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ge({
      ...y(this._def),
      innerType: this,
      catchValue: t,
      typeName: p.ZodCatch
    });
  }
  describe(e) {
    const t = this.constructor;
    return new t({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return ve.create(this, e);
  }
  readonly() {
    return ye.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Xe = /^c[^\s-]{8,}$/i, Ge = /^[0-9a-z]+$/, He = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Je = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Ke = /^[a-z0-9_-]{21}$/i, Ye = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Qe = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, et = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, tt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let ce;
const st = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, at = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, nt = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, it = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, rt = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ot = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Ne = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", dt = new RegExp(`^${Ne}$`);
function je(a) {
  let e = "[0-5]\\d";
  a.precision ? e = `${e}\\.\\d{${a.precision}}` : a.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = a.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function ct(a) {
  return new RegExp(`^${je(a)}$`);
}
function lt(a) {
  let e = `${Ne}T${je(a)}`;
  const t = [];
  return t.push(a.local ? "Z?" : "Z"), a.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function ut(a, e) {
  return !!((e === "v4" || !e) && st.test(a) || (e === "v6" || !e) && nt.test(a));
}
function ht(a, e) {
  if (!Ye.test(a))
    return !1;
  try {
    const [t] = a.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), i = JSON.parse(atob(s));
    return !(typeof i != "object" || i === null || "typ" in i && (i == null ? void 0 : i.typ) !== "JWT" || !i.alg || e && i.alg !== e);
  } catch {
    return !1;
  }
}
function ft(a, e) {
  return !!((e === "v4" || !e) && at.test(a) || (e === "v6" || !e) && it.test(a));
}
class O extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== l.string) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_type,
        expected: l.string,
        received: n.parsedType
      }), g;
    }
    const s = new S();
    let i;
    for (const n of this._def.checks)
      if (n.kind === "min")
        e.data.length < n.value && (i = this._getOrReturnCtx(e, i), c(i, {
          code: d.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), s.dirty());
      else if (n.kind === "max")
        e.data.length > n.value && (i = this._getOrReturnCtx(e, i), c(i, {
          code: d.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), s.dirty());
      else if (n.kind === "length") {
        const r = e.data.length > n.value, o = e.data.length < n.value;
        (r || o) && (i = this._getOrReturnCtx(e, i), r ? c(i, {
          code: d.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }) : o && c(i, {
          code: d.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }), s.dirty());
      } else if (n.kind === "email")
        et.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "email",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "emoji")
        ce || (ce = new RegExp(tt, "u")), ce.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "emoji",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "uuid")
        Je.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "uuid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "nanoid")
        Ke.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "nanoid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "cuid")
        Xe.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "cuid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "cuid2")
        Ge.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "cuid2",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "ulid")
        He.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "ulid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "url")
        try {
          new URL(e.data);
        } catch {
          i = this._getOrReturnCtx(e, i), c(i, {
            validation: "url",
            code: d.invalid_string,
            message: n.message
          }), s.dirty();
        }
      else n.kind === "regex" ? (n.regex.lastIndex = 0, n.regex.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "regex",
        code: d.invalid_string,
        message: n.message
      }), s.dirty())) : n.kind === "trim" ? e.data = e.data.trim() : n.kind === "includes" ? e.data.includes(n.value, n.position) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: { includes: n.value, position: n.position },
        message: n.message
      }), s.dirty()) : n.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : n.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : n.kind === "startsWith" ? e.data.startsWith(n.value) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: { startsWith: n.value },
        message: n.message
      }), s.dirty()) : n.kind === "endsWith" ? e.data.endsWith(n.value) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: { endsWith: n.value },
        message: n.message
      }), s.dirty()) : n.kind === "datetime" ? lt(n).test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: "datetime",
        message: n.message
      }), s.dirty()) : n.kind === "date" ? dt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: "date",
        message: n.message
      }), s.dirty()) : n.kind === "time" ? ct(n).test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: "time",
        message: n.message
      }), s.dirty()) : n.kind === "duration" ? Qe.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "duration",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "ip" ? ut(e.data, n.version) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "ip",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "jwt" ? ht(e.data, n.alg) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "jwt",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "cidr" ? ft(e.data, n.version) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "cidr",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "base64" ? rt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "base64",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "base64url" ? ot.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "base64url",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : _.assertNever(n);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((i) => e.test(i), {
      validation: t,
      code: d.invalid_string,
      ...f.errToObj(s)
    });
  }
  _addCheck(e) {
    return new O({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...f.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...f.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...f.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...f.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...f.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...f.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...f.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...f.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...f.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...f.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...f.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...f.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...f.errToObj(e) });
  }
  datetime(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      offset: (e == null ? void 0 : e.offset) ?? !1,
      local: (e == null ? void 0 : e.local) ?? !1,
      ...f.errToObj(e == null ? void 0 : e.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      ...f.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...f.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...f.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...f.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...f.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...f.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...f.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...f.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...f.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, f.errToObj(e));
  }
  trim() {
    return new O({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new O({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new O({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((e) => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((e) => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
O.create = (a) => new O({
  checks: [],
  typeName: p.ZodString,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...y(a)
});
function pt(a, e) {
  const t = (a.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, i = t > s ? t : s, n = Number.parseInt(a.toFixed(i).replace(".", "")), r = Number.parseInt(e.toFixed(i).replace(".", ""));
  return n % r / 10 ** i;
}
class W extends x {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== l.number) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_type,
        expected: l.number,
        received: n.parsedType
      }), g;
    }
    let s;
    const i = new S();
    for (const n of this._def.checks)
      n.kind === "int" ? _.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.invalid_type,
        expected: "integer",
        received: "float",
        message: n.message
      }), i.dirty()) : n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        minimum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), i.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        maximum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), i.dirty()) : n.kind === "multipleOf" ? pt(e.data, n.value) !== 0 && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), i.dirty()) : n.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_finite,
        message: n.message
      }), i.dirty()) : _.assertNever(n);
    return { status: i.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, f.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, f.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, f.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, f.toString(t));
  }
  setLimit(e, t, s, i) {
    return new W({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: f.toString(i)
        }
      ]
    });
  }
  _addCheck(e) {
    return new W({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: f.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: f.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: f.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: f.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: f.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: f.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: f.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: f.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: f.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && _.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const s of this._def.checks) {
      if (s.kind === "finite" || s.kind === "int" || s.kind === "multipleOf")
        return !0;
      s.kind === "min" ? (t === null || s.value > t) && (t = s.value) : s.kind === "max" && (e === null || s.value < e) && (e = s.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
W.create = (a) => new W({
  checks: [],
  typeName: p.ZodNumber,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...y(a)
});
class Q extends x {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce)
      try {
        e.data = BigInt(e.data);
      } catch {
        return this._getInvalidInput(e);
      }
    if (this._getType(e) !== l.bigint)
      return this._getInvalidInput(e);
    let s;
    const i = new S();
    for (const n of this._def.checks)
      n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        type: "bigint",
        minimum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), i.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        type: "bigint",
        maximum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), i.dirty()) : n.kind === "multipleOf" ? e.data % n.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), i.dirty()) : _.assertNever(n);
    return { status: i.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.bigint,
      received: t.parsedType
    }), g;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, f.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, f.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, f.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, f.toString(t));
  }
  setLimit(e, t, s, i) {
    return new Q({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: f.toString(i)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Q({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: f.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: f.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: f.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: f.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: f.toString(t)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
Q.create = (a) => new Q({
  checks: [],
  typeName: p.ZodBigInt,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...y(a)
});
class ue extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== l.boolean) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.boolean,
        received: s.parsedType
      }), g;
    }
    return C(e.data);
  }
}
ue.create = (a) => new ue({
  typeName: p.ZodBoolean,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...y(a)
});
class ae extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== l.date) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_type,
        expected: l.date,
        received: n.parsedType
      }), g;
    }
    if (Number.isNaN(e.data.getTime())) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_date
      }), g;
    }
    const s = new S();
    let i;
    for (const n of this._def.checks)
      n.kind === "min" ? e.data.getTime() < n.value && (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.too_small,
        message: n.message,
        inclusive: !0,
        exact: !1,
        minimum: n.value,
        type: "date"
      }), s.dirty()) : n.kind === "max" ? e.data.getTime() > n.value && (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.too_big,
        message: n.message,
        inclusive: !0,
        exact: !1,
        maximum: n.value,
        type: "date"
      }), s.dirty()) : _.assertNever(n);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new ae({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: f.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: f.toString(t)
    });
  }
  get minDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
}
ae.create = (a) => new ae({
  checks: [],
  coerce: (a == null ? void 0 : a.coerce) || !1,
  typeName: p.ZodDate,
  ...y(a)
});
class Te extends x {
  _parse(e) {
    if (this._getType(e) !== l.symbol) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.symbol,
        received: s.parsedType
      }), g;
    }
    return C(e.data);
  }
}
Te.create = (a) => new Te({
  typeName: p.ZodSymbol,
  ...y(a)
});
class Se extends x {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.undefined,
        received: s.parsedType
      }), g;
    }
    return C(e.data);
  }
}
Se.create = (a) => new Se({
  typeName: p.ZodUndefined,
  ...y(a)
});
class Re extends x {
  _parse(e) {
    if (this._getType(e) !== l.null) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.null,
        received: s.parsedType
      }), g;
    }
    return C(e.data);
  }
}
Re.create = (a) => new Re({
  typeName: p.ZodNull,
  ...y(a)
});
class he extends x {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return C(e.data);
  }
}
he.create = (a) => new he({
  typeName: p.ZodAny,
  ...y(a)
});
class Ce extends x {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return C(e.data);
  }
}
Ce.create = (a) => new Ce({
  typeName: p.ZodUnknown,
  ...y(a)
});
class z extends x {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.never,
      received: t.parsedType
    }), g;
  }
}
z.create = (a) => new z({
  typeName: p.ZodNever,
  ...y(a)
});
class Ee extends x {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.void,
        received: s.parsedType
      }), g;
    }
    return C(e.data);
  }
}
Ee.create = (a) => new Ee({
  typeName: p.ZodVoid,
  ...y(a)
});
class A extends x {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), i = this._def;
    if (t.parsedType !== l.array)
      return c(t, {
        code: d.invalid_type,
        expected: l.array,
        received: t.parsedType
      }), g;
    if (i.exactLength !== null) {
      const r = t.data.length > i.exactLength.value, o = t.data.length < i.exactLength.value;
      (r || o) && (c(t, {
        code: r ? d.too_big : d.too_small,
        minimum: o ? i.exactLength.value : void 0,
        maximum: r ? i.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: i.exactLength.message
      }), s.dirty());
    }
    if (i.minLength !== null && t.data.length < i.minLength.value && (c(t, {
      code: d.too_small,
      minimum: i.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: i.minLength.message
    }), s.dirty()), i.maxLength !== null && t.data.length > i.maxLength.value && (c(t, {
      code: d.too_big,
      maximum: i.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: i.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((r, o) => i.type._parseAsync(new $(t, r, t.path, o)))).then((r) => S.mergeArray(s, r));
    const n = [...t.data].map((r, o) => i.type._parseSync(new $(t, r, t.path, o)));
    return S.mergeArray(s, n);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new A({
      ...this._def,
      minLength: { value: e, message: f.toString(t) }
    });
  }
  max(e, t) {
    return new A({
      ...this._def,
      maxLength: { value: e, message: f.toString(t) }
    });
  }
  length(e, t) {
    return new A({
      ...this._def,
      exactLength: { value: e, message: f.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
A.create = (a, e) => new A({
  type: a,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: p.ZodArray,
  ...y(e)
});
function V(a) {
  if (a instanceof b) {
    const e = {};
    for (const t in a.shape) {
      const s = a.shape[t];
      e[t] = Z.create(V(s));
    }
    return new b({
      ...a._def,
      shape: () => e
    });
  } else return a instanceof A ? new A({
    ...a._def,
    type: V(a.element)
  }) : a instanceof Z ? Z.create(V(a.unwrap())) : a instanceof G ? G.create(V(a.unwrap())) : a instanceof D ? D.create(a.items.map((e) => V(e))) : a;
}
class b extends x {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = _.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== l.object) {
      const h = this._getOrReturnCtx(e);
      return c(h, {
        code: d.invalid_type,
        expected: l.object,
        received: h.parsedType
      }), g;
    }
    const { status: s, ctx: i } = this._processInputParams(e), { shape: n, keys: r } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof z && this._def.unknownKeys === "strip"))
      for (const h in i.data)
        r.includes(h) || o.push(h);
    const u = [];
    for (const h of r) {
      const v = n[h], E = i.data[h];
      u.push({
        key: { status: "valid", value: h },
        value: v._parse(new $(i, E, i.path, h)),
        alwaysSet: h in i.data
      });
    }
    if (this._def.catchall instanceof z) {
      const h = this._def.unknownKeys;
      if (h === "passthrough")
        for (const v of o)
          u.push({
            key: { status: "valid", value: v },
            value: { status: "valid", value: i.data[v] }
          });
      else if (h === "strict")
        o.length > 0 && (c(i, {
          code: d.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (h !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const h = this._def.catchall;
      for (const v of o) {
        const E = i.data[v];
        u.push({
          key: { status: "valid", value: v },
          value: h._parse(
            new $(i, E, i.path, v)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: v in i.data
        });
      }
    }
    return i.common.async ? Promise.resolve().then(async () => {
      const h = [];
      for (const v of u) {
        const E = await v.key, L = await v.value;
        h.push({
          key: E,
          value: L,
          alwaysSet: v.alwaysSet
        });
      }
      return h;
    }).then((h) => S.mergeObjectSync(s, h)) : S.mergeObjectSync(s, u);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return f.errToObj, new b({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var n, r;
          const i = ((r = (n = this._def).errorMap) == null ? void 0 : r.call(n, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: f.errToObj(e).message ?? i
          } : {
            message: i
          };
        }
      } : {}
    });
  }
  strip() {
    return new b({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new b({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new b({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new b({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: p.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new b({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of _.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new b({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of _.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new b({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return V(this);
  }
  partial(e) {
    const t = {};
    for (const s of _.objectKeys(this.shape)) {
      const i = this.shape[s];
      e && !e[s] ? t[s] = i : t[s] = i.optional();
    }
    return new b({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of _.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let n = this.shape[s];
        for (; n instanceof Z; )
          n = n._def.innerType;
        t[s] = n;
      }
    return new b({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Ze(_.objectKeys(this.shape));
  }
}
b.create = (a, e) => new b({
  shape: () => a,
  unknownKeys: "strip",
  catchall: z.create(),
  typeName: p.ZodObject,
  ...y(e)
});
b.strictCreate = (a, e) => new b({
  shape: () => a,
  unknownKeys: "strict",
  catchall: z.create(),
  typeName: p.ZodObject,
  ...y(e)
});
b.lazycreate = (a, e) => new b({
  shape: a,
  unknownKeys: "strip",
  catchall: z.create(),
  typeName: p.ZodObject,
  ...y(e)
});
class ne extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function i(n) {
      for (const o of n)
        if (o.result.status === "valid")
          return o.result;
      for (const o of n)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const r = n.map((o) => new N(o.ctx.common.issues));
      return c(t, {
        code: d.invalid_union,
        unionErrors: r
      }), g;
    }
    if (t.common.async)
      return Promise.all(s.map(async (n) => {
        const r = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await n._parseAsync({
            data: t.data,
            path: t.path,
            parent: r
          }),
          ctx: r
        };
      })).then(i);
    {
      let n;
      const r = [];
      for (const u of s) {
        const h = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, v = u._parseSync({
          data: t.data,
          path: t.path,
          parent: h
        });
        if (v.status === "valid")
          return v;
        v.status === "dirty" && !n && (n = { result: v, ctx: h }), h.common.issues.length && r.push(h.common.issues);
      }
      if (n)
        return t.common.issues.push(...n.ctx.common.issues), n.result;
      const o = r.map((u) => new N(u));
      return c(t, {
        code: d.invalid_union,
        unionErrors: o
      }), g;
    }
  }
  get options() {
    return this._def.options;
  }
}
ne.create = (a, e) => new ne({
  options: a,
  typeName: p.ZodUnion,
  ...y(e)
});
function fe(a, e) {
  const t = j(a), s = j(e);
  if (a === e)
    return { valid: !0, data: a };
  if (t === l.object && s === l.object) {
    const i = _.objectKeys(e), n = _.objectKeys(a).filter((o) => i.indexOf(o) !== -1), r = { ...a, ...e };
    for (const o of n) {
      const u = fe(a[o], e[o]);
      if (!u.valid)
        return { valid: !1 };
      r[o] = u.data;
    }
    return { valid: !0, data: r };
  } else if (t === l.array && s === l.array) {
    if (a.length !== e.length)
      return { valid: !1 };
    const i = [];
    for (let n = 0; n < a.length; n++) {
      const r = a[n], o = e[n], u = fe(r, o);
      if (!u.valid)
        return { valid: !1 };
      i.push(u.data);
    }
    return { valid: !0, data: i };
  } else return t === l.date && s === l.date && +a == +e ? { valid: !0, data: a } : { valid: !1 };
}
class ie extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), i = (n, r) => {
      if (be(n) || be(r))
        return g;
      const o = fe(n.value, r.value);
      return o.valid ? ((ke(n) || ke(r)) && t.dirty(), { status: t.value, value: o.data }) : (c(s, {
        code: d.invalid_intersection_types
      }), g);
    };
    return s.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      }),
      this._def.right._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      })
    ]).then(([n, r]) => i(n, r)) : i(this._def.left._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }), this._def.right._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }));
  }
}
ie.create = (a, e, t) => new ie({
  left: a,
  right: e,
  typeName: p.ZodIntersection,
  ...y(t)
});
class D extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.array)
      return c(s, {
        code: d.invalid_type,
        expected: l.array,
        received: s.parsedType
      }), g;
    if (s.data.length < this._def.items.length)
      return c(s, {
        code: d.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), g;
    !this._def.rest && s.data.length > this._def.items.length && (c(s, {
      code: d.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const n = [...s.data].map((r, o) => {
      const u = this._def.items[o] || this._def.rest;
      return u ? u._parse(new $(s, r, s.path, o)) : null;
    }).filter((r) => !!r);
    return s.common.async ? Promise.all(n).then((r) => S.mergeArray(t, r)) : S.mergeArray(t, n);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new D({
      ...this._def,
      rest: e
    });
  }
}
D.create = (a, e) => {
  if (!Array.isArray(a))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new D({
    items: a,
    typeName: p.ZodTuple,
    rest: null,
    ...y(e)
  });
};
class re extends x {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.object)
      return c(s, {
        code: d.invalid_type,
        expected: l.object,
        received: s.parsedType
      }), g;
    const i = [], n = this._def.keyType, r = this._def.valueType;
    for (const o in s.data)
      i.push({
        key: n._parse(new $(s, o, s.path, o)),
        value: r._parse(new $(s, s.data[o], s.path, o)),
        alwaysSet: o in s.data
      });
    return s.common.async ? S.mergeObjectAsync(t, i) : S.mergeObjectSync(t, i);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, s) {
    return t instanceof x ? new re({
      keyType: e,
      valueType: t,
      typeName: p.ZodRecord,
      ...y(s)
    }) : new re({
      keyType: O.create(),
      valueType: e,
      typeName: p.ZodRecord,
      ...y(t)
    });
  }
}
class Ae extends x {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.map)
      return c(s, {
        code: d.invalid_type,
        expected: l.map,
        received: s.parsedType
      }), g;
    const i = this._def.keyType, n = this._def.valueType, r = [...s.data.entries()].map(([o, u], h) => ({
      key: i._parse(new $(s, o, s.path, [h, "key"])),
      value: n._parse(new $(s, u, s.path, [h, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const u of r) {
          const h = await u.key, v = await u.value;
          if (h.status === "aborted" || v.status === "aborted")
            return g;
          (h.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(h.value, v.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const u of r) {
        const h = u.key, v = u.value;
        if (h.status === "aborted" || v.status === "aborted")
          return g;
        (h.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(h.value, v.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Ae.create = (a, e, t) => new Ae({
  valueType: e,
  keyType: a,
  typeName: p.ZodMap,
  ...y(t)
});
class ee extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.set)
      return c(s, {
        code: d.invalid_type,
        expected: l.set,
        received: s.parsedType
      }), g;
    const i = this._def;
    i.minSize !== null && s.data.size < i.minSize.value && (c(s, {
      code: d.too_small,
      minimum: i.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: i.minSize.message
    }), t.dirty()), i.maxSize !== null && s.data.size > i.maxSize.value && (c(s, {
      code: d.too_big,
      maximum: i.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: i.maxSize.message
    }), t.dirty());
    const n = this._def.valueType;
    function r(u) {
      const h = /* @__PURE__ */ new Set();
      for (const v of u) {
        if (v.status === "aborted")
          return g;
        v.status === "dirty" && t.dirty(), h.add(v.value);
      }
      return { status: t.value, value: h };
    }
    const o = [...s.data.values()].map((u, h) => n._parse(new $(s, u, s.path, h)));
    return s.common.async ? Promise.all(o).then((u) => r(u)) : r(o);
  }
  min(e, t) {
    return new ee({
      ...this._def,
      minSize: { value: e, message: f.toString(t) }
    });
  }
  max(e, t) {
    return new ee({
      ...this._def,
      maxSize: { value: e, message: f.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ee.create = (a, e) => new ee({
  valueType: a,
  minSize: null,
  maxSize: null,
  typeName: p.ZodSet,
  ...y(e)
});
class $e extends x {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
$e.create = (a, e) => new $e({
  getter: a,
  typeName: p.ZodLazy,
  ...y(e)
});
class pe extends x {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return c(t, {
        received: t.data,
        code: d.invalid_literal,
        expected: this._def.value
      }), g;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
pe.create = (a, e) => new pe({
  value: a,
  typeName: p.ZodLiteral,
  ...y(e)
});
function Ze(a, e) {
  return new F({
    values: a,
    typeName: p.ZodEnum,
    ...y(e)
  });
}
class F extends x {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        expected: _.joinValues(s),
        received: t.parsedType,
        code: d.invalid_type
      }), g;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        received: t.data,
        code: d.invalid_enum_value,
        options: s
      }), g;
    }
    return C(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Values() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  extract(e, t = this._def) {
    return F.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return F.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
F.create = Ze;
class Ie extends x {
  _parse(e) {
    const t = _.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== l.string && s.parsedType !== l.number) {
      const i = _.objectValues(t);
      return c(s, {
        expected: _.joinValues(i),
        received: s.parsedType,
        code: d.invalid_type
      }), g;
    }
    if (this._cache || (this._cache = new Set(_.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const i = _.objectValues(t);
      return c(s, {
        received: s.data,
        code: d.invalid_enum_value,
        options: i
      }), g;
    }
    return C(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ie.create = (a, e) => new Ie({
  values: a,
  typeName: p.ZodNativeEnum,
  ...y(e)
});
class oe extends x {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== l.promise && t.common.async === !1)
      return c(t, {
        code: d.invalid_type,
        expected: l.promise,
        received: t.parsedType
      }), g;
    const s = t.parsedType === l.promise ? t.data : Promise.resolve(t.data);
    return C(s.then((i) => this._def.type.parseAsync(i, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
oe.create = (a, e) => new oe({
  type: a,
  typeName: p.ZodPromise,
  ...y(e)
});
class X extends x {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === p.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), i = this._def.effect || null, n = {
      addIssue: (r) => {
        c(s, r), r.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (n.addIssue = n.addIssue.bind(n), i.type === "preprocess") {
      const r = i.transform(s.data, n);
      if (s.common.async)
        return Promise.resolve(r).then(async (o) => {
          if (t.value === "aborted")
            return g;
          const u = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return u.status === "aborted" ? g : u.status === "dirty" || t.value === "dirty" ? K(u.value) : u;
        });
      {
        if (t.value === "aborted")
          return g;
        const o = this._def.schema._parseSync({
          data: r,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? g : o.status === "dirty" || t.value === "dirty" ? K(o.value) : o;
      }
    }
    if (i.type === "refinement") {
      const r = (o) => {
        const u = i.refinement(o, n);
        if (s.common.async)
          return Promise.resolve(u);
        if (u instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? g : (o.status === "dirty" && t.dirty(), r(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => o.status === "aborted" ? g : (o.status === "dirty" && t.dirty(), r(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (i.type === "transform")
      if (s.common.async === !1) {
        const r = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!q(r))
          return g;
        const o = i.transform(r.value, n);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((r) => q(r) ? Promise.resolve(i.transform(r.value, n)).then((o) => ({
          status: t.value,
          value: o
        })) : g);
    _.assertNever(i);
  }
}
X.create = (a, e, t) => new X({
  schema: a,
  typeName: p.ZodEffects,
  effect: e,
  ...y(t)
});
X.createWithPreprocess = (a, e, t) => new X({
  schema: e,
  effect: { type: "preprocess", transform: a },
  typeName: p.ZodEffects,
  ...y(t)
});
class Z extends x {
  _parse(e) {
    return this._getType(e) === l.undefined ? C(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Z.create = (a, e) => new Z({
  innerType: a,
  typeName: p.ZodOptional,
  ...y(e)
});
class G extends x {
  _parse(e) {
    return this._getType(e) === l.null ? C(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
G.create = (a, e) => new G({
  innerType: a,
  typeName: p.ZodNullable,
  ...y(e)
});
class me extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === l.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
me.create = (a, e) => new me({
  innerType: a,
  typeName: p.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...y(e)
});
class ge extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, i = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return se(i) ? i.then((n) => ({
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new N(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new N(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ge.create = (a, e) => new ge({
  innerType: a,
  typeName: p.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...y(e)
});
class Oe extends x {
  _parse(e) {
    if (this._getType(e) !== l.nan) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.nan,
        received: s.parsedType
      }), g;
    }
    return { status: "valid", value: e.data };
  }
}
Oe.create = (a) => new Oe({
  typeName: p.ZodNaN,
  ...y(a)
});
class mt extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = t.data;
    return this._def.type._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class ve extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const n = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return n.status === "aborted" ? g : n.status === "dirty" ? (t.dirty(), K(n.value)) : this._def.out._parseAsync({
          data: n.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const i = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return i.status === "aborted" ? g : i.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: i.value
      }) : this._def.out._parseSync({
        data: i.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new ve({
      in: e,
      out: t,
      typeName: p.ZodPipeline
    });
  }
}
class ye extends x {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (i) => (q(i) && (i.value = Object.freeze(i.value)), i);
    return se(t) ? t.then((i) => s(i)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ye.create = (a, e) => new ye({
  innerType: a,
  typeName: p.ZodReadonly,
  ...y(e)
});
var p;
(function(a) {
  a.ZodString = "ZodString", a.ZodNumber = "ZodNumber", a.ZodNaN = "ZodNaN", a.ZodBigInt = "ZodBigInt", a.ZodBoolean = "ZodBoolean", a.ZodDate = "ZodDate", a.ZodSymbol = "ZodSymbol", a.ZodUndefined = "ZodUndefined", a.ZodNull = "ZodNull", a.ZodAny = "ZodAny", a.ZodUnknown = "ZodUnknown", a.ZodNever = "ZodNever", a.ZodVoid = "ZodVoid", a.ZodArray = "ZodArray", a.ZodObject = "ZodObject", a.ZodUnion = "ZodUnion", a.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", a.ZodIntersection = "ZodIntersection", a.ZodTuple = "ZodTuple", a.ZodRecord = "ZodRecord", a.ZodMap = "ZodMap", a.ZodSet = "ZodSet", a.ZodFunction = "ZodFunction", a.ZodLazy = "ZodLazy", a.ZodLiteral = "ZodLiteral", a.ZodEnum = "ZodEnum", a.ZodEffects = "ZodEffects", a.ZodNativeEnum = "ZodNativeEnum", a.ZodOptional = "ZodOptional", a.ZodNullable = "ZodNullable", a.ZodDefault = "ZodDefault", a.ZodCatch = "ZodCatch", a.ZodPromise = "ZodPromise", a.ZodBranded = "ZodBranded", a.ZodPipeline = "ZodPipeline", a.ZodReadonly = "ZodReadonly";
})(p || (p = {}));
const m = O.create, P = W.create, B = ue.create, I = he.create;
z.create;
const R = A.create, T = b.create, Pe = ne.create;
ie.create;
D.create;
const U = re.create, ze = pe.create, H = F.create;
oe.create;
Z.create;
G.create;
const xe = H(["GET", "POST", "PUT", "PATCH", "DELETE"]), Le = H(["confirm", "block", "limit", "require", "role"]), gt = H([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "contains"
]), yt = H(["voice", "docs", "compile"]), Be = T({
  id: m().uuid().optional(),
  app_id: m().uuid().optional(),
  skill_name: m(),
  kind: Le,
  field: m().nullable().optional(),
  op: gt.nullable().optional(),
  value: I().optional(),
  message: m(),
  spoken: m().nullable().optional(),
  source: yt.default("voice"),
  created_at: m().optional()
}), vt = T({
  type: m(),
  required: B().default(!1),
  enum: R(m()).optional(),
  description: m().optional(),
  default: I().optional()
}), De = T({
  id: m().uuid().optional(),
  app_id: m().uuid().optional(),
  name: m().regex(/^[a-z0-9_]+$/i, "Skill name must be alphanumeric with underscores"),
  version: P().int().default(1),
  title: m(),
  description: m().optional(),
  method: xe,
  path: m(),
  query_params: R(m()).default([]),
  inputs: U(vt).default({}),
  constants: U(I()).default({}),
  outputs: U(I()).default({}),
  depends_on: R(m()).default([]),
  is_write: B().default(!1),
  verify_with: m().nullable().optional(),
  source_recording: m().uuid().nullable().optional(),
  narration: m().nullable().optional(),
  status: H(["active", "drifted", "disabled", "at_risk"]).default("active")
});
T({
  method: xe,
  path: m(),
  query: U(m()).optional(),
  requestBody: I().optional(),
  status: P().int(),
  responseBody: I().optional(),
  ts: P()
});
const xt = T({
  from_event: P().int(),
  from_path: m(),
  to_event: P().int(),
  to_field: m(),
  value: Pe([m(), P()])
});
T({
  skills: R(De),
  suggested_policies: R(Be).default([])
});
T({
  skills: R(De),
  suggested_policies: R(Be).default([]),
  tracer_edges: R(xt).default([])
});
const _t = T({
  idx: P().int(),
  skill_name: m(),
  description: m(),
  args: U(I()).default({})
}), Me = T({
  steps: R(_t),
  summary: m()
}), bt = T({
  role: H(["system", "user", "assistant", "tool"]),
  content: m().default(""),
  tool_call_id: m().optional(),
  name: m().optional()
}), kt = T({
  call_id: m(),
  skill_name: m(),
  status: P().int(),
  response: I().optional()
});
T({
  app_key: m(),
  messages: R(bt),
  pending_result: kt.optional()
});
const wt = T({
  type: ze("tool_call"),
  call_id: m(),
  skill: m(),
  method: xe.optional(),
  path: m().optional(),
  args: U(I()).default({}),
  check: T({
    allowed: B(),
    needsConfirm: B(),
    violations: R(T({
      policyId: m(),
      message: m(),
      kind: Le,
      field: m().nullable().optional()
    }))
  }),
  plan: Me.optional(),
  verified: B().optional(),
  verification_note: m().optional(),
  blocked: B().optional(),
  message: m().optional()
}), Tt = T({
  type: ze("message"),
  text: m(),
  plan: Me.optional(),
  sources: R(I()).optional(),
  verified: B().optional(),
  verification_note: m().optional()
});
Pe([
  wt,
  Tt
]);
const St = /token|secret|password|authorization|cookie|otp|card|aadhaar|pan/i, Rt = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, Ct = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, Et = 8192;
function Y(a) {
  if (a == null)
    return a;
  if (typeof a == "string") {
    let e = a.replace(Rt, (t) => {
      const [s, i] = t.split("@");
      return `${s.length > 2 ? `${s[0]}***${s[s.length - 1]}` : `${s[0]}***`}@${i}`;
    });
    return e = e.replace(Ct, (t) => {
      const s = t.replace(/\D/g, "");
      return s.length >= 7 ? `+XX-XXXX-${s.slice(-4)}` : t;
    }), e;
  }
  if (Array.isArray(a))
    return a.map((e) => Y(e));
  if (typeof a == "object") {
    const e = {};
    for (const [t, s] of Object.entries(a))
      St.test(t) ? e[t] = "[REDACTED]" : e[t] = Y(s);
    return e;
  }
  return a;
}
function At(a) {
  let e = Y(a.responseBody);
  if (e != null)
    try {
      const t = JSON.stringify(e);
      t.length > Et && (e = {
        _truncated: !0,
        sample: typeof e == "object" && e !== null ? Array.isArray(e) ? e.slice(0, 3) : Object.fromEntries(Object.entries(e).slice(0, 5)) : "[Large payload truncated]",
        total_bytes: t.length
      });
    } catch {
    }
  return {
    method: a.method,
    path: a.path,
    query: a.query ? Y(a.query) : void 0,
    requestBody: a.requestBody ? Y(a.requestBody) : void 0,
    status: a.status,
    responseBody: e,
    ts: a.ts || Date.now()
  };
}
function $t(a) {
  return a.map(At);
}
class It {
  constructor() {
    w(this, "config", {
      publicKey: "pk_demo_dehix",
      apiUrl: "http://localhost:4000",
      apiPrefix: "/api/"
    });
    w(this, "shadowRoot", null);
    w(this, "isRecording", !1);
    w(this, "recordedEvents", []);
    w(this, "activeTab", "ask");
    w(this, "isOpen", !1);
    w(this, "isListening", !1);
    w(this, "speechRecognition", null);
    w(this, "narrationText", "");
    w(this, "recordingTitle", "");
    // Ask Agent State
    w(this, "chatItems", []);
    w(this, "chatInputText", "");
    w(this, "isAgentBusy", !1);
    w(this, "activePlan", null);
    w(this, "currentRunId", null);
    this.autoInit();
  }
  autoInit() {
    if (typeof window > "u") return;
    const e = document.currentScript, t = (e == null ? void 0 : e.getAttribute("data-app")) || "pk_demo_dehix", s = (e == null ? void 0 : e.getAttribute("data-api")) || (e == null ? void 0 : e.getAttribute("data-api-url")) || "http://localhost:4000";
    this.init({ publicKey: t, apiUrl: s });
  }
  init(e) {
    this.config = { ...this.config, ...e }, this.setupInterceptors(), this.initSpeechRecognition(), this.mountWidget(), (new URLSearchParams(window.location.search).get("saydo") === "teach" || localStorage.getItem("saydo_mode") === "teach") && (this.activeTab = "teach", this.isOpen = !0), this.render(), console.log("[SayDo SDK] Initialized with app:", this.config.publicKey, "API:", this.config.apiUrl);
  }
  isTeachModeAllowed() {
    return typeof window > "u" ? !1 : new URLSearchParams(window.location.search).get("saydo") === "teach" || localStorage.getItem("saydo_mode") === "teach" || window.saydoTeachMode === !0;
  }
  setupInterceptors() {
    if (typeof window > "u") return;
    const e = this, t = window.fetch;
    window.fetch = async function(...n) {
      var o, u;
      const r = await t.apply(this, n);
      if (e.isRecording)
        try {
          const h = typeof n[0] == "string" ? n[0] : n[0].url, v = new URL(h, window.location.origin);
          if (v.origin === window.location.origin && v.pathname.startsWith(e.config.apiPrefix || "/api/")) {
            const E = r.clone();
            let L = null;
            try {
              L = await E.json();
            } catch {
            }
            const te = (o = n[1]) == null ? void 0 : o.body, k = e.safeParseBody(te);
            e.addCapturedEvent({
              method: (((u = n[1]) == null ? void 0 : u.method) || "GET").toUpperCase(),
              path: v.pathname,
              query: Object.fromEntries(v.searchParams.entries()),
              requestBody: k,
              status: r.status,
              responseBody: L,
              ts: Date.now()
            });
          }
        } catch (h) {
          console.warn("[SayDo] Fetch interceptor error:", h);
        }
      return r;
    };
    const s = XMLHttpRequest.prototype.open, i = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(n, r, ...o) {
      return this._saydoMethod = n, this._saydoUrl = r.toString(), s.apply(this, [n, r, ...o]);
    }, XMLHttpRequest.prototype.send = function(n) {
      return e.isRecording && this._saydoUrl && this.addEventListener("load", () => {
        try {
          const r = new URL(this._saydoUrl, window.location.origin);
          if (r.origin === window.location.origin && r.pathname.startsWith(e.config.apiPrefix || "/api/")) {
            let o = null;
            try {
              o = JSON.parse(this.responseText);
            } catch {
            }
            e.addCapturedEvent({
              method: (this._saydoMethod || "GET").toUpperCase(),
              path: r.pathname,
              query: Object.fromEntries(r.searchParams.entries()),
              requestBody: e.safeParseBody(n),
              status: this.status,
              responseBody: o,
              ts: Date.now()
            });
          }
        } catch (r) {
          console.warn("[SayDo] XHR interceptor error:", r);
        }
      }), i.apply(this, [n]);
    };
  }
  addCapturedEvent(e) {
    this.recordedEvents.push(e), this.render();
  }
  safeParseBody(e) {
    if (e) {
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return e;
        }
      return e;
    }
  }
  initSpeechRecognition() {
    if (typeof window > "u") return;
    const e = window.SpeechRecognition || window.webkitSpeechRecognition;
    e && (this.speechRecognition = new e(), this.speechRecognition.continuous = !0, this.speechRecognition.interimResults = !0, this.speechRecognition.lang = "en-IN", this.speechRecognition.onresult = (t) => {
      let s = "";
      for (let i = t.resultIndex; i < t.results.length; i++)
        s += t.results[i][0].transcript;
      this.activeTab === "teach" ? this.narrationText = (this.narrationText + " " + s).trim() : this.chatInputText = (this.chatInputText + " " + s).trim(), this.render();
    }, this.speechRecognition.onerror = () => {
      this.isListening = !1, this.render();
    }, this.speechRecognition.onend = () => {
      this.isListening = !1, this.render();
    });
  }
  toggleSpeech() {
    if (!this.speechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type directly.");
      return;
    }
    if (this.isListening)
      this.speechRecognition.stop(), this.isListening = !1;
    else
      try {
        this.speechRecognition.start(), this.isListening = !0;
      } catch (e) {
        console.warn("Speech start error:", e);
      }
    this.render();
  }
  mountWidget() {
    if (typeof document > "u") return;
    let e = document.getElementById("saydo-root");
    e || (e = document.createElement("div"), e.id = "saydo-root", document.body.appendChild(e)), this.shadowRoot = e.attachShadow({ mode: "open" });
  }
  // Send message to SayDo Agent (/v1/chat)
  async submitUserPrompt(e) {
    if (!e.trim() || this.isAgentBusy) return;
    this.isAgentBusy = !0, this.chatInputText = "";
    const t = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: e
    };
    this.chatItems.push(t), this.render(), await this.callChatApi();
  }
  async callChatApi(e) {
    try {
      const t = this.chatItems.filter((r) => r.text && (r.role === "user" || r.role === "assistant")).map((r) => ({
        role: r.role,
        content: r.text || ""
      })), s = {
        app_key: this.config.publicKey,
        messages: t,
        pending_result: e,
        run_id: this.currentRunId,
        plan: this.activePlan
      }, i = await fetch(`${this.config.apiUrl}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s)
      }), n = await i.json();
      if (!i.ok)
        throw new Error(n.error || "Agent request failed");
      if (n.run_id && (this.currentRunId = n.run_id), n.plan && (this.activePlan = n.plan), n.type === "tool_call") {
        const r = {
          id: n.call_id || `call-${Date.now()}`,
          role: "tool",
          toolCall: {
            call_id: n.call_id,
            skill: n.skill,
            method: n.method,
            path: n.path,
            args: n.args,
            check: n.check,
            blocked: n.blocked,
            needsConfirm: n.needsConfirm,
            message: n.message,
            is_verification: n.is_verification,
            original_write: n.original_write
          },
          status: n.blocked ? "blocked" : "pending",
          verified: n.verified,
          verificationNote: n.verification_note
        };
        this.chatItems.push(r), this.render(), !n.blocked && !n.needsConfirm ? await this.executeToolCall(r) : (this.isAgentBusy = !1, this.render());
      } else n.type === "message" && (this.chatItems.push({
        id: `msg-${Date.now()}`,
        role: "assistant",
        text: n.text,
        sources: n.sources,
        verified: n.verified,
        verificationNote: n.verification_note
      }), this.activePlan && this.activePlan.steps.forEach((r) => r.completed = !0), this.isAgentBusy = !1, this.render());
    } catch (t) {
      this.chatItems.push({
        id: `err-${Date.now()}`,
        role: "assistant",
        text: `Agent Error: ${t.message}`
      }), this.isAgentBusy = !1, this.render();
    }
  }
  // Execute Tool Call in Browser Session with User Credentials
  async executeToolCall(e) {
    if (!e.toolCall) return;
    e.status = "running", this.isAgentBusy = !0, this.render();
    const t = e.toolCall, s = (t.method || "GET").toUpperCase();
    let i = t.path || "/";
    if (s === "GET" && t.args && Object.keys(t.args).length > 0) {
      const n = new URLSearchParams();
      for (const [r, o] of Object.entries(t.args))
        o != null && o !== "" && n.append(r, String(o));
      i = `${i}?${n.toString()}`;
    }
    try {
      const n = await window.fetch(i, {
        method: s,
        headers: {
          "Content-Type": "application/json"
        },
        body: s !== "GET" ? JSON.stringify(t.args) : void 0,
        credentials: "include"
      });
      let r = null;
      try {
        r = await n.json();
      } catch {
        r = { status: n.status };
      }
      if (e.status = "completed", this.activePlan) {
        const o = this.activePlan.steps.find((u) => u.skill_name === t.skill);
        o && (o.completed = !0);
      }
      s !== "GET" && window.dispatchEvent(
        new CustomEvent("saydo:changed", {
          detail: { skill: t.skill, args: t.args, response: r }
        })
      ), await this.callChatApi({
        call_id: t.call_id,
        skill_name: t.skill,
        status: n.status,
        response: r,
        args: t.args,
        is_verification: t.is_verification,
        original_write: t.original_write
      });
    } catch (n) {
      e.status = "cancelled", this.chatItems.push({
        id: `err-${Date.now()}`,
        role: "assistant",
        text: `Execution failed: ${n.message}`
      }), this.isAgentBusy = !1, this.render();
    }
  }
  cancelToolCall(e) {
    e.status = "cancelled", this.isAgentBusy = !1, this.render();
  }
  render() {
    if (!this.shadowRoot) return;
    const e = this.isTeachModeAllowed();
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: #e2e8f0;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Launcher */
        .saydo-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 9999px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          z-index: 2147483647;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
        }
        .saydo-launcher:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .saydo-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${this.isRecording ? "#ef4444" : this.isAgentBusy ? "#f59e0b" : "#10b981"};
          box-shadow: 0 0 8px ${this.isRecording ? "#ef4444" : this.isAgentBusy ? "#f59e0b" : "#10b981"};
          animation: ${this.isRecording || this.isAgentBusy ? "pulse 1s infinite" : "none"};
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        /* Panel */
        .saydo-panel {
          position: fixed;
          bottom: 76px;
          right: 24px;
          width: 420px;
          max-height: 600px;
          height: 560px;
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
          z-index: 2147483647;
          display: ${this.isOpen ? "flex" : "none"};
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .saydo-header {
          padding: 14px 18px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .saydo-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #ffffff;
          font-size: 14px;
        }
        .saydo-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 2px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .saydo-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 4px;
        }
        .saydo-close:hover { color: #ffffff; }

        /* Tabs */
        .saydo-tabs {
          display: flex;
          background: #090d16;
          border-bottom: 1px solid #1e293b;
          padding: 4px;
          gap: 4px;
        }
        .saydo-tab-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .saydo-tab-btn.active {
          background: #1e293b;
          color: #ffffff;
        }

        /* Body */
        .saydo-body {
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Ask Agent Styles */
        .saydo-plan-box {
          background: #0d1527;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 12px;
        }
        .saydo-plan-title {
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .saydo-step-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 0;
          color: #cbd5e1;
        }
        .saydo-step-done {
          color: #10b981;
          font-weight: 600;
        }

        .saydo-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 4px;
        }
        .saydo-chip {
          background: #1e293b;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 5px 10px;
          border-radius: 9999px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .saydo-chip:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #3b82f6;
        }

        /* Messages */
        .saydo-msg-user {
          align-self: flex-end;
          background: #1e3a8a;
          color: #eff6ff;
          padding: 8px 12px;
          border-radius: 14px 14px 2px 14px;
          max-width: 85%;
          font-size: 12px;
        }
        .saydo-msg-assistant {
          align-self: flex-start;
          background: #131b2e;
          border: 1px solid #1e293b;
          color: #e2e8f0;
          padding: 10px 14px;
          border-radius: 14px 14px 14px 2px;
          max-width: 90%;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Tool Cards */
        .saydo-card-confirm {
          border-radius: 12px;
          border: 1px solid #3b82f6;
          background: #0f172a;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .saydo-card-blocked {
          border-radius: 12px;
          border: 1px solid #ef4444;
          background: #450a0a;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .saydo-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          font-size: 12px;
        }
        .saydo-args-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          overflow: hidden;
        }
        .saydo-args-table td {
          padding: 4px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .saydo-card-btns {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .saydo-btn-confirm {
          flex: 1;
          background: #2563eb;
          color: #ffffff;
          padding: 8px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .saydo-btn-confirm:hover { background: #1d4ed8; }
        .saydo-btn-cancel {
          background: #334155;
          color: #cbd5e1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-btn-cancel:hover { background: #475569; }

        .saydo-badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Footer Input */
        .saydo-footer {
          padding: 10px 14px;
          background: #0f172a;
          border-top: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .saydo-chat-input {
          flex: 1;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
        }
        .saydo-chat-input:focus {
          border-color: #3b82f6;
        }
        .saydo-icon-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #cbd5e1;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }
        .saydo-icon-btn.active {
          background: #ef4444;
          color: #ffffff;
        }
        .saydo-send-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Teach View Elements */
        .saydo-rec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          background: #131b2e;
          border: 1px solid #1e293b;
        }
        .saydo-rec-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 12px;
        }
        .saydo-rec-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .saydo-rec-btn.start { background: #ef4444; color: #ffffff; }
        .saydo-rec-btn.stop { background: #334155; color: #f1f5f9; }
        .saydo-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .saydo-input, .saydo-textarea {
          width: 100%;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
          font-family: inherit;
        }
        .saydo-events-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .saydo-event-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          background: #090e1a;
          border: 1px solid #1e293b;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .saydo-method { font-weight: bold; color: #60a5fa; }
        .saydo-path { color: #cbd5e1; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
        .saydo-save-btn {
          padding: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      </style>

      <!-- Launcher Button -->
      <button class="saydo-launcher" id="saydo-launcher">
        <span class="saydo-indicator"></span>
        <span>${this.isRecording ? "Recording (SayDo)" : this.isAgentBusy ? "SayDo Working..." : "SayDo Agent"}</span>
      </button>

      <!-- Panel -->
      <div class="saydo-panel" id="saydo-panel">
        <div class="saydo-header">
          <div class="saydo-brand">
            <span>⚡ SayDo</span>
            <span class="saydo-badge">AI Skills</span>
          </div>
          <button class="saydo-close" id="saydo-close">&times;</button>
        </div>

        ${e ? `
          <div class="saydo-tabs">
            <button class="saydo-tab-btn ${this.activeTab === "ask" ? "active" : ""}" id="tab-ask">
              Ask Agent
            </button>
            <button class="saydo-tab-btn ${this.activeTab === "teach" ? "active" : ""}" id="tab-teach">
              Teach by Doing
            </button>
          </div>
        ` : ""}

        <div class="saydo-body" id="saydo-body">
          ${this.activeTab === "teach" && e ? `
            <!-- Teach View -->
            <div class="saydo-rec-bar">
              <div class="saydo-rec-status">
                <span class="saydo-indicator"></span>
                <span>${this.isRecording ? "Capturing App API Calls..." : "Recorder Ready"}</span>
              </div>
              <button class="saydo-rec-btn ${this.isRecording ? "stop" : "start"}" id="btn-toggle-rec">
                ${this.isRecording ? "Stop Recording" : "● Record Task"}
              </button>
            </div>

            <div>
              <div class="saydo-label">Task Title</div>
              <input 
                type="text" 
                class="saydo-input" 
                id="input-title" 
                placeholder="e.g. Create Website Revamp Project" 
                value="${this.recordingTitle}"
              />
            </div>

            <div>
              <div class="saydo-label">Tell Narration (Wispr / Voice Mic)</div>
              <div style="position: relative;">
                <textarea 
                  class="saydo-textarea" 
                  id="textarea-narration" 
                  rows="3" 
                  placeholder="Talk aloud while doing the task..."
                >${this.narrationText}</textarea>
                <button class="saydo-icon-btn" id="btn-mic-teach" style="position: absolute; right: 8px; bottom: 8px;" title="Dictate voice">
                  ${this.isListening ? "🛑" : "🎙️"}
                </button>
              </div>
            </div>

            <div>
              <div class="saydo-label">Captured Network Calls (${this.recordedEvents.length})</div>
              <div class="saydo-events-box">
                ${this.recordedEvents.length === 0 ? `<div style="font-size: 11px; color: #64748b; font-style: italic; padding: 4px;">Click 'Record Task' and interact with DEHIX-lite. API calls appear here live.</div>` : this.recordedEvents.map(
      (t) => `
                        <div class="saydo-event-item">
                          <div>
                            <span class="saydo-method">${t.method}</span>
                            <span class="saydo-path" title="${t.path}">${t.path}</span>
                          </div>
                          <span style="color: #10b981; font-size: 10px;">${t.status}</span>
                        </div>
                      `
    ).join("")}
              </div>
            </div>

            <button class="saydo-save-btn" id="btn-save-recording" ${this.recordedEvents.length === 0 ? "disabled" : ""}>
              Stop & Save to SayDo
            </button>
          ` : `
            <!-- Ask Agent View -->
            ${this.activePlan ? `
              <div class="saydo-plan-box">
                <div class="saydo-plan-title">
                  <span>📋 Execution Plan</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${this.activePlan.summary}</div>
                ${this.activePlan.steps.map(
      (t) => `
                  <div class="saydo-step-row ${t.completed ? "saydo-step-done" : ""}">
                    <span>${t.completed ? "✓" : "○"}</span>
                    <span><strong>Step ${t.idx}:</strong> ${t.description || t.skill_name}</span>
                  </div>
                `
    ).join("")}
              </div>
            ` : `
              <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">SUGGESTED PROMPTS</div>
              <div class="saydo-chips">
                <button class="saydo-chip" data-prompt="Can I reopen a rejected application?">
                  📚 Can I reopen a rejected application? (Tavily Docs)
                </button>
                <button class="saydo-chip" data-prompt="Create Website Revamp with 2 lakh budget and invite arpit@dehix.org as editor">
                  ⚡ Create Website Revamp (2L) & invite arpit@dehix.org
                </button>
                <button class="saydo-chip" data-prompt="Create a project with 20 lakh budget">
                  🛑 Create 20 lakh project (test policy limit)
                </button>
                <button class="saydo-chip" data-prompt="Show pending applications">
                  🔍 Show pending applications
                </button>
                <button class="saydo-chip" data-prompt="Invite arpit@dehix.org as admin">
                  🛡️ Invite arpit@dehix.org as admin (test role block)
                </button>
              </div>
            `}

            <!-- Messages Stream -->
            ${this.chatItems.map((t) => {
      if (t.role === "user")
        return `<div class="saydo-msg-user">${t.text}</div>`;
      if (t.toolCall) {
        const s = t.toolCall;
        if (s.blocked)
          return `
                      <div class="saydo-card-blocked">
                        <div class="saydo-card-header" style="color: #f87171;">
                          <span>🛑 Action Blocked by Platform Policy</span>
                          <span>${s.skill}</span>
                        </div>
                        <div style="font-size: 11px; color: #fca5a5;">${s.message || "Blocked by security policy."}</div>
                        <table class="saydo-args-table">
                          ${Object.entries(s.args || {}).map(([i, n]) => `<tr><td style="color:#94a3b8;">${i}</td><td>${n}</td></tr>`).join("")}
                        </table>
                      </div>
                    `;
        if (t.status === "pending")
          return `
                      <div class="saydo-card-confirm" data-call-id="${s.call_id}">
                        <div class="saydo-card-header" style="color: #60a5fa;">
                          <span>⚠️ Confirmation Required</span>
                          <span style="font-size: 10px; background: rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px;">WRITE</span>
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: #f8fafc;">Action: ${s.skill}</div>
                        <table class="saydo-args-table">
                          ${Object.entries(s.args || {}).map(
            ([i, n]) => `
                            <tr>
                              <td style="color: #94a3b8; width: 35%;">${i}</td>
                              <td style="color: #f8fafc; font-weight: 500;">
                                ${i === "budget" ? "₹" + Number(n).toLocaleString("en-IN") : n}
                              </td>
                            </tr>
                          `
          ).join("")}
                        </table>
                        <div style="font-size: 10px; color: #94a3b8;">
                          🔒 Policy notice: Writes execute using your browser session.
                        </div>
                        <div class="saydo-card-btns">
                          <button class="saydo-btn-confirm" data-action="confirm" data-id="${t.id}">
                            ✓ Confirm & Execute
                          </button>
                          <button class="saydo-btn-cancel" data-action="cancel" data-id="${t.id}">
                            Cancel
                          </button>
                        </div>
                      </div>
                    `;
        if (t.status === "running")
          return `
                      <div class="saydo-msg-assistant" style="opacity: 0.8;">
                        <div>⏳ Executing <strong>${s.skill}</strong> in your browser...</div>
                      </div>
                    `;
        if (t.status === "completed")
          return `
                      <div class="saydo-msg-assistant">
                        <div style="color: #94a3b8; font-size: 11px;">✓ Executed ${s.skill}</div>
                        ${t.verified ? `<div class="saydo-badge-verified">✓ ${t.verificationNote || "Verified in system"}</div>` : ""}
                      </div>
                    `;
      }
      return `
                  <div class="saydo-msg-assistant">
                    <div>${t.text}</div>
                    ${t.sources && t.sources.length > 0 ? `
                      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #334155;">
                        <div style="font-size: 10px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                          <span>🔍 Tavily Grounded Sources:</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                          ${t.sources.map(
        (s) => `
                            <a href="${s.url}" target="_blank" style="font-size: 10px; color: #60a5fa; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 6px; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="${s.content || ""}">
                              <span>📄</span>
                              <span>${s.title || "Documentation"}</span>
                            </a>
                          `
      ).join("")}
                        </div>
                      </div>
                    ` : ""}
                    ${t.verified ? `<div class="saydo-badge-verified">✓ ${t.verificationNote || "Verified in system"}</div>` : ""}
                  </div>
                `;
    }).join("")}

            ${this.isAgentBusy ? `
              <div class="saydo-msg-assistant" style="align-items: center; justify-content: center; padding: 8px;">
                <span class="saydo-indicator"></span>
                <span style="font-size: 11px; color: #94a3b8; margin-left: 6px;">SayDo is reasoning...</span>
              </div>
            ` : ""}
          `}
        </div>

        ${this.activeTab === "ask" ? `
          <!-- Footer Chat Input -->
          <div class="saydo-footer">
            <input 
              type="text" 
              class="saydo-chat-input" 
              id="input-chat" 
              placeholder="Ask by voice or text... e.g. 'Create project with 2 lakh budget'" 
              value="${this.chatInputText}"
            />
            <button class="saydo-icon-btn ${this.isListening ? "active" : ""}" id="btn-mic-ask" title="Dictate voice (Web Speech API / Wispr)">
              ${this.isListening ? "🛑" : "🎙️"}
            </button>
            <button class="saydo-send-btn" id="btn-send-chat" ${this.isAgentBusy ? "disabled" : ""}>
              Send
            </button>
          </div>
        ` : ""}
      </div>
    `, this.attachEventListeners();
  }
  attachEventListeners() {
    var s, i, n, r, o, u, h, v, E, L, te;
    if (!this.shadowRoot) return;
    (s = this.shadowRoot.getElementById("saydo-launcher")) == null || s.addEventListener("click", () => {
      this.isOpen = !this.isOpen, this.render();
    }), (i = this.shadowRoot.getElementById("saydo-close")) == null || i.addEventListener("click", () => {
      this.isOpen = !1, this.render();
    }), (n = this.shadowRoot.getElementById("tab-ask")) == null || n.addEventListener("click", () => {
      this.activeTab = "ask", this.render();
    }), (r = this.shadowRoot.getElementById("tab-teach")) == null || r.addEventListener("click", () => {
      this.activeTab = "teach", this.render();
    }), (o = this.shadowRoot.getElementById("btn-toggle-rec")) == null || o.addEventListener("click", () => {
      this.isRecording ? this.isRecording = !1 : (this.isRecording = !0, this.recordedEvents = []), this.render();
    }), (u = this.shadowRoot.getElementById("btn-mic-teach")) == null || u.addEventListener("click", () => this.toggleSpeech()), (h = this.shadowRoot.getElementById("btn-mic-ask")) == null || h.addEventListener("click", () => this.toggleSpeech()), (v = this.shadowRoot.getElementById("input-title")) == null || v.addEventListener("input", (k) => {
      this.recordingTitle = k.target.value;
    }), (E = this.shadowRoot.getElementById("textarea-narration")) == null || E.addEventListener("input", (k) => {
      this.narrationText = k.target.value;
    }), (L = this.shadowRoot.getElementById("btn-save-recording")) == null || L.addEventListener("click", () => this.saveRecording());
    const e = this.shadowRoot.getElementById("input-chat");
    e == null || e.addEventListener("input", (k) => {
      this.chatInputText = k.target.value;
    }), e == null || e.addEventListener("keydown", (k) => {
      k.key === "Enter" && this.submitUserPrompt(this.chatInputText);
    }), (te = this.shadowRoot.getElementById("btn-send-chat")) == null || te.addEventListener("click", () => {
      this.submitUserPrompt(this.chatInputText);
    }), this.shadowRoot.querySelectorAll(".saydo-chip").forEach((k) => {
      k.addEventListener("click", () => {
        const M = k.getAttribute("data-prompt");
        M && this.submitUserPrompt(M);
      });
    }), this.shadowRoot.querySelectorAll('[data-action="confirm"]').forEach((k) => {
      k.addEventListener("click", () => {
        const M = k.getAttribute("data-id"), J = this.chatItems.find((de) => de.id === M);
        J && this.executeToolCall(J);
      });
    }), this.shadowRoot.querySelectorAll('[data-action="cancel"]').forEach((k) => {
      k.addEventListener("click", () => {
        const M = k.getAttribute("data-id"), J = this.chatItems.find((de) => de.id === M);
        J && this.cancelToolCall(J);
      });
    });
    const t = this.shadowRoot.getElementById("saydo-body");
    t && (t.scrollTop = t.scrollHeight);
  }
  async saveRecording() {
    if (this.recordedEvents.length === 0) return;
    const e = this.recordingTitle.trim() || `Recording ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`, t = this.narrationText.trim(), s = $t(this.recordedEvents), i = {
      publicKey: this.config.publicKey,
      title: e,
      events: s,
      narration: t
    };
    try {
      const n = await fetch(`${this.config.apiUrl}/v1/recordings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SayDo-Public-Key": this.config.publicKey
        },
        body: JSON.stringify(i)
      }), r = await n.json();
      if (!n.ok) throw new Error(r.error || "Failed to save recording");
      alert(`✅ Recording "${e}" successfully stored in SayDo! (${r.event_count} sanitized events)`), this.recordedEvents = [], this.recordingTitle = "", this.narrationText = "", this.render();
    } catch (n) {
      alert(`❌ Failed to save recording: ${n.message}`);
    }
  }
}
const Ot = new It();
typeof window < "u" && (window.SayDo = Ot);
export {
  Ot as default
};
