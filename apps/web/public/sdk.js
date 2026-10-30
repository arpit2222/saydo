var $e = Object.defineProperty;
var Le = (a, e, t) => e in a ? $e(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var T = (a, e, t) => Le(a, typeof e != "symbol" ? e + "" : e, t);
var _;
(function(a) {
  a.assertEqual = (n) => {
  };
  function e(n) {
  }
  a.assertIs = e;
  function t(n) {
    throw new Error();
  }
  a.assertNever = t, a.arrayToEnum = (n) => {
    const r = {};
    for (const i of n)
      r[i] = i;
    return r;
  }, a.getValidEnumValues = (n) => {
    const r = a.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), i = {};
    for (const o of r)
      i[o] = n[o];
    return a.objectValues(i);
  }, a.objectValues = (n) => a.objectKeys(n).map(function(r) {
    return n[r];
  }), a.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const r = [];
    for (const i in n)
      Object.prototype.hasOwnProperty.call(n, i) && r.push(i);
    return r;
  }, a.find = (n, r) => {
    for (const i of n)
      if (r(i))
        return i;
  }, a.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function s(n, r = " | ") {
    return n.map((i) => typeof i == "string" ? `'${i}'` : i).join(r);
  }
  a.joinValues = s, a.jsonStringifyReplacer = (n, r) => typeof r == "bigint" ? r.toString() : r;
})(_ || (_ = {}));
var he;
(function(a) {
  a.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(he || (he = {}));
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
]), I = (a) => {
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
class A extends Error {
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
    const t = e || function(r) {
      return r.message;
    }, s = { _errors: [] }, n = (r) => {
      for (const i of r.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(n);
        else if (i.code === "invalid_return_type")
          n(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          n(i.argumentsError);
        else if (i.path.length === 0)
          s._errors.push(t(i));
        else {
          let o = s, h = 0;
          for (; h < i.path.length; ) {
            const u = i.path[h];
            h === i.path.length - 1 ? (o[u] = o[u] || { _errors: [] }, o[u]._errors.push(t(i))) : o[u] = o[u] || { _errors: [] }, o = o[u], h++;
          }
        }
    };
    return n(this), s;
  }
  static assert(e) {
    if (!(e instanceof A))
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
    for (const n of this.issues)
      if (n.path.length > 0) {
        const r = n.path[0];
        t[r] = t[r] || [], t[r].push(e(n));
      } else
        s.push(e(n));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
A.create = (a) => new A(a);
const ne = (a, e) => {
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
let ze = ne;
function Pe() {
  return ze;
}
const De = (a) => {
  const { data: e, path: t, errorMaps: s, issueData: n } = a, r = [...t, ...n.path || []], i = {
    ...n,
    path: r
  };
  if (n.message !== void 0)
    return {
      ...n,
      path: r,
      message: n.message
    };
  let o = "";
  const h = s.filter((u) => !!u).slice().reverse();
  for (const u of h)
    o = u(i, { data: e, defaultError: o }).message;
  return {
    ...n,
    path: r,
    message: o
  };
};
function c(a, e) {
  const t = Pe(), s = De({
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
      t === ne ? void 0 : ne
      // then global default map
    ].filter((n) => !!n)
  });
  a.common.issues.push(s);
}
class k {
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
    for (const n of t) {
      if (n.status === "aborted")
        return m;
      n.status === "dirty" && e.dirty(), s.push(n.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const n of t) {
      const r = await n.key, i = await n.value;
      s.push({
        key: r,
        value: i
      });
    }
    return k.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const n of t) {
      const { key: r, value: i } = n;
      if (r.status === "aborted" || i.status === "aborted")
        return m;
      r.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), r.value !== "__proto__" && (typeof i.value < "u" || n.alwaysSet) && (s[r.value] = i.value);
    }
    return { status: e.value, value: s };
  }
}
const m = Object.freeze({
  status: "aborted"
}), q = (a) => ({ status: "dirty", value: a }), w = (a) => ({ status: "valid", value: a }), fe = (a) => a.status === "aborted", pe = (a) => a.status === "dirty", D = (a) => a.status === "valid", Y = (a) => typeof Promise < "u" && a instanceof Promise;
var f;
(function(a) {
  a.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, a.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(f || (f = {}));
class S {
  constructor(e, t, s, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const me = (a, e) => {
  if (D(e))
    return { success: !0, data: e.value };
  if (!a.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new A(a.common.issues);
      return this._error = t, this._error;
    }
  };
};
function g(a) {
  if (!a)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: n } = a;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (i, o) => {
    const { message: h } = a;
    return i.code === "invalid_enum_value" ? { message: h ?? o.defaultError } : typeof o.data > "u" ? { message: h ?? s ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: h ?? t ?? o.defaultError };
  }, description: n };
}
class v {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return I(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: I(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new k(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: I(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Y(t))
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
      parsedType: I(e)
    }, n = this._parseSync({ data: e, path: s.path, parent: s });
    return me(s, n);
  }
  "~validate"(e) {
    var s, n;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: I(e)
    };
    if (!this["~standard"].async)
      try {
        const r = this._parseSync({ data: e, path: [], parent: t });
        return D(r) ? {
          value: r.value
        } : {
          issues: t.common.issues
        };
      } catch (r) {
        (n = (s = r == null ? void 0 : r.message) == null ? void 0 : s.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((r) => D(r) ? {
      value: r.value
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
      parsedType: I(e)
    }, n = this._parse({ data: e, path: s.path, parent: s }), r = await (Y(n) ? n : Promise.resolve(n));
    return me(s, r);
  }
  refine(e, t) {
    const s = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, r) => {
      const i = e(n), o = () => r.addIssue({
        code: d.custom,
        ...s(n)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((h) => h ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, n) => e(s) ? !0 : (n.addIssue(typeof t == "function" ? t(s, n) : t), !1));
  }
  _refinement(e) {
    return new V({
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
    return N.create(this, this._def);
  }
  nullable() {
    return U.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return R.create(this);
  }
  promise() {
    return se.create(this, this._def);
  }
  or(e) {
    return Q.create([this, e], this._def);
  }
  and(e) {
    return ee.create(this, e, this._def);
  }
  transform(e) {
    return new V({
      ...g(this._def),
      schema: this,
      typeName: p.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new de({
      ...g(this._def),
      innerType: this,
      defaultValue: t,
      typeName: p.ZodDefault
    });
  }
  brand() {
    return new dt({
      typeName: p.ZodBranded,
      type: this,
      ...g(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ce({
      ...g(this._def),
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
    return ue.create(this, e);
  }
  readonly() {
    return le.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Me = /^c[^\s-]{8,}$/i, Be = /^[0-9a-z]+$/, Ve = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Ue = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, qe = /^[a-z0-9_-]{21}$/i, Fe = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, We = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Xe = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, He = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let ae;
const Ke = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Je = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Ye = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Ge = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Qe = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, et = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Se = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", tt = new RegExp(`^${Se}$`);
function Ee(a) {
  let e = "[0-5]\\d";
  a.precision ? e = `${e}\\.\\d{${a.precision}}` : a.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = a.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function st(a) {
  return new RegExp(`^${Ee(a)}$`);
}
function at(a) {
  let e = `${Se}T${Ee(a)}`;
  const t = [];
  return t.push(a.local ? "Z?" : "Z"), a.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function nt(a, e) {
  return !!((e === "v4" || !e) && Ke.test(a) || (e === "v6" || !e) && Ye.test(a));
}
function rt(a, e) {
  if (!Fe.test(a))
    return !1;
  try {
    const [t] = a.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(s));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function it(a, e) {
  return !!((e === "v4" || !e) && Je.test(a) || (e === "v6" || !e) && Ge.test(a));
}
class E extends v {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== l.string) {
      const r = this._getOrReturnCtx(e);
      return c(r, {
        code: d.invalid_type,
        expected: l.string,
        received: r.parsedType
      }), m;
    }
    const s = new k();
    let n;
    for (const r of this._def.checks)
      if (r.kind === "min")
        e.data.length < r.value && (n = this._getOrReturnCtx(e, n), c(n, {
          code: d.too_small,
          minimum: r.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: r.message
        }), s.dirty());
      else if (r.kind === "max")
        e.data.length > r.value && (n = this._getOrReturnCtx(e, n), c(n, {
          code: d.too_big,
          maximum: r.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: r.message
        }), s.dirty());
      else if (r.kind === "length") {
        const i = e.data.length > r.value, o = e.data.length < r.value;
        (i || o) && (n = this._getOrReturnCtx(e, n), i ? c(n, {
          code: d.too_big,
          maximum: r.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: r.message
        }) : o && c(n, {
          code: d.too_small,
          minimum: r.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: r.message
        }), s.dirty());
      } else if (r.kind === "email")
        Xe.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "email",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "emoji")
        ae || (ae = new RegExp(He, "u")), ae.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "emoji",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "uuid")
        Ue.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "uuid",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "nanoid")
        qe.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "nanoid",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "cuid")
        Me.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "cuid",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "cuid2")
        Be.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "cuid2",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "ulid")
        Ve.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
          validation: "ulid",
          code: d.invalid_string,
          message: r.message
        }), s.dirty());
      else if (r.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), c(n, {
            validation: "url",
            code: d.invalid_string,
            message: r.message
          }), s.dirty();
        }
      else r.kind === "regex" ? (r.regex.lastIndex = 0, r.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "regex",
        code: d.invalid_string,
        message: r.message
      }), s.dirty())) : r.kind === "trim" ? e.data = e.data.trim() : r.kind === "includes" ? e.data.includes(r.value, r.position) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: { includes: r.value, position: r.position },
        message: r.message
      }), s.dirty()) : r.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : r.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : r.kind === "startsWith" ? e.data.startsWith(r.value) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: { startsWith: r.value },
        message: r.message
      }), s.dirty()) : r.kind === "endsWith" ? e.data.endsWith(r.value) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: { endsWith: r.value },
        message: r.message
      }), s.dirty()) : r.kind === "datetime" ? at(r).test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: "datetime",
        message: r.message
      }), s.dirty()) : r.kind === "date" ? tt.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: "date",
        message: r.message
      }), s.dirty()) : r.kind === "time" ? st(r).test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.invalid_string,
        validation: "time",
        message: r.message
      }), s.dirty()) : r.kind === "duration" ? We.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "duration",
        code: d.invalid_string,
        message: r.message
      }), s.dirty()) : r.kind === "ip" ? nt(e.data, r.version) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "ip",
        code: d.invalid_string,
        message: r.message
      }), s.dirty()) : r.kind === "jwt" ? rt(e.data, r.alg) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "jwt",
        code: d.invalid_string,
        message: r.message
      }), s.dirty()) : r.kind === "cidr" ? it(e.data, r.version) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "cidr",
        code: d.invalid_string,
        message: r.message
      }), s.dirty()) : r.kind === "base64" ? Qe.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "base64",
        code: d.invalid_string,
        message: r.message
      }), s.dirty()) : r.kind === "base64url" ? et.test(e.data) || (n = this._getOrReturnCtx(e, n), c(n, {
        validation: "base64url",
        code: d.invalid_string,
        message: r.message
      }), s.dirty()) : _.assertNever(r);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: d.invalid_string,
      ...f.errToObj(s)
    });
  }
  _addCheck(e) {
    return new E({
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
    return new E({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new E({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new E({
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
E.create = (a) => new E({
  checks: [],
  typeName: p.ZodString,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...g(a)
});
function ot(a, e) {
  const t = (a.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, n = t > s ? t : s, r = Number.parseInt(a.toFixed(n).replace(".", "")), i = Number.parseInt(e.toFixed(n).replace(".", ""));
  return r % i / 10 ** n;
}
class M extends v {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== l.number) {
      const r = this._getOrReturnCtx(e);
      return c(r, {
        code: d.invalid_type,
        expected: l.number,
        received: r.parsedType
      }), m;
    }
    let s;
    const n = new k();
    for (const r of this._def.checks)
      r.kind === "int" ? _.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.invalid_type,
        expected: "integer",
        received: "float",
        message: r.message
      }), n.dirty()) : r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        minimum: r.value,
        type: "number",
        inclusive: r.inclusive,
        exact: !1,
        message: r.message
      }), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        maximum: r.value,
        type: "number",
        inclusive: r.inclusive,
        exact: !1,
        message: r.message
      }), n.dirty()) : r.kind === "multipleOf" ? ot(e.data, r.value) !== 0 && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: r.value,
        message: r.message
      }), n.dirty()) : r.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_finite,
        message: r.message
      }), n.dirty()) : _.assertNever(r);
    return { status: n.value, value: e.data };
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
  setLimit(e, t, s, n) {
    return new M({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: f.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new M({
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
M.create = (a) => new M({
  checks: [],
  typeName: p.ZodNumber,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...g(a)
});
class X extends v {
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
    const n = new k();
    for (const r of this._def.checks)
      r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        type: "bigint",
        minimum: r.value,
        inclusive: r.inclusive,
        message: r.message
      }), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        type: "bigint",
        maximum: r.value,
        inclusive: r.inclusive,
        message: r.message
      }), n.dirty()) : r.kind === "multipleOf" ? e.data % r.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: r.value,
        message: r.message
      }), n.dirty()) : _.assertNever(r);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.bigint,
      received: t.parsedType
    }), m;
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
  setLimit(e, t, s, n) {
    return new X({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: f.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new X({
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
X.create = (a) => new X({
  checks: [],
  typeName: p.ZodBigInt,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...g(a)
});
class re extends v {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== l.boolean) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.boolean,
        received: s.parsedType
      }), m;
    }
    return w(e.data);
  }
}
re.create = (a) => new re({
  typeName: p.ZodBoolean,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...g(a)
});
class G extends v {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== l.date) {
      const r = this._getOrReturnCtx(e);
      return c(r, {
        code: d.invalid_type,
        expected: l.date,
        received: r.parsedType
      }), m;
    }
    if (Number.isNaN(e.data.getTime())) {
      const r = this._getOrReturnCtx(e);
      return c(r, {
        code: d.invalid_date
      }), m;
    }
    const s = new k();
    let n;
    for (const r of this._def.checks)
      r.kind === "min" ? e.data.getTime() < r.value && (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.too_small,
        message: r.message,
        inclusive: !0,
        exact: !1,
        minimum: r.value,
        type: "date"
      }), s.dirty()) : r.kind === "max" ? e.data.getTime() > r.value && (n = this._getOrReturnCtx(e, n), c(n, {
        code: d.too_big,
        message: r.message,
        inclusive: !0,
        exact: !1,
        maximum: r.value,
        type: "date"
      }), s.dirty()) : _.assertNever(r);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new G({
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
G.create = (a) => new G({
  checks: [],
  coerce: (a == null ? void 0 : a.coerce) || !1,
  typeName: p.ZodDate,
  ...g(a)
});
class ye extends v {
  _parse(e) {
    if (this._getType(e) !== l.symbol) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.symbol,
        received: s.parsedType
      }), m;
    }
    return w(e.data);
  }
}
ye.create = (a) => new ye({
  typeName: p.ZodSymbol,
  ...g(a)
});
class ge extends v {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.undefined,
        received: s.parsedType
      }), m;
    }
    return w(e.data);
  }
}
ge.create = (a) => new ge({
  typeName: p.ZodUndefined,
  ...g(a)
});
class ve extends v {
  _parse(e) {
    if (this._getType(e) !== l.null) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.null,
        received: s.parsedType
      }), m;
    }
    return w(e.data);
  }
}
ve.create = (a) => new ve({
  typeName: p.ZodNull,
  ...g(a)
});
class ie extends v {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return w(e.data);
  }
}
ie.create = (a) => new ie({
  typeName: p.ZodAny,
  ...g(a)
});
class _e extends v {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return w(e.data);
  }
}
_e.create = (a) => new _e({
  typeName: p.ZodUnknown,
  ...g(a)
});
class Z extends v {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.never,
      received: t.parsedType
    }), m;
  }
}
Z.create = (a) => new Z({
  typeName: p.ZodNever,
  ...g(a)
});
class xe extends v {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.void,
        received: s.parsedType
      }), m;
    }
    return w(e.data);
  }
}
xe.create = (a) => new xe({
  typeName: p.ZodVoid,
  ...g(a)
});
class R extends v {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== l.array)
      return c(t, {
        code: d.invalid_type,
        expected: l.array,
        received: t.parsedType
      }), m;
    if (n.exactLength !== null) {
      const i = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (i || o) && (c(t, {
        code: i ? d.too_big : d.too_small,
        minimum: o ? n.exactLength.value : void 0,
        maximum: i ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), s.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (c(t, {
      code: d.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), s.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (c(t, {
      code: d.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => n.type._parseAsync(new S(t, i, t.path, o)))).then((i) => k.mergeArray(s, i));
    const r = [...t.data].map((i, o) => n.type._parseSync(new S(t, i, t.path, o)));
    return k.mergeArray(s, r);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new R({
      ...this._def,
      minLength: { value: e, message: f.toString(t) }
    });
  }
  max(e, t) {
    return new R({
      ...this._def,
      maxLength: { value: e, message: f.toString(t) }
    });
  }
  length(e, t) {
    return new R({
      ...this._def,
      exactLength: { value: e, message: f.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
R.create = (a, e) => new R({
  type: a,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: p.ZodArray,
  ...g(e)
});
function P(a) {
  if (a instanceof b) {
    const e = {};
    for (const t in a.shape) {
      const s = a.shape[t];
      e[t] = N.create(P(s));
    }
    return new b({
      ...a._def,
      shape: () => e
    });
  } else return a instanceof R ? new R({
    ...a._def,
    type: P(a.element)
  }) : a instanceof N ? N.create(P(a.unwrap())) : a instanceof U ? U.create(P(a.unwrap())) : a instanceof L ? L.create(a.items.map((e) => P(e))) : a;
}
class b extends v {
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
      const u = this._getOrReturnCtx(e);
      return c(u, {
        code: d.invalid_type,
        expected: l.object,
        received: u.parsedType
      }), m;
    }
    const { status: s, ctx: n } = this._processInputParams(e), { shape: r, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof Z && this._def.unknownKeys === "strip"))
      for (const u in n.data)
        i.includes(u) || o.push(u);
    const h = [];
    for (const u of i) {
      const y = r[u], j = n.data[u];
      h.push({
        key: { status: "valid", value: u },
        value: y._parse(new S(n, j, n.path, u)),
        alwaysSet: u in n.data
      });
    }
    if (this._def.catchall instanceof Z) {
      const u = this._def.unknownKeys;
      if (u === "passthrough")
        for (const y of o)
          h.push({
            key: { status: "valid", value: y },
            value: { status: "valid", value: n.data[y] }
          });
      else if (u === "strict")
        o.length > 0 && (c(n, {
          code: d.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (u !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const u = this._def.catchall;
      for (const y of o) {
        const j = n.data[y];
        h.push({
          key: { status: "valid", value: y },
          value: u._parse(
            new S(n, j, n.path, y)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: y in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const u = [];
      for (const y of h) {
        const j = await y.key, J = await y.value;
        u.push({
          key: j,
          value: J,
          alwaysSet: y.alwaysSet
        });
      }
      return u;
    }).then((u) => k.mergeObjectSync(s, u)) : k.mergeObjectSync(s, h);
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
          var r, i;
          const n = ((i = (r = this._def).errorMap) == null ? void 0 : i.call(r, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: f.errToObj(e).message ?? n
          } : {
            message: n
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
    return P(this);
  }
  partial(e) {
    const t = {};
    for (const s of _.objectKeys(this.shape)) {
      const n = this.shape[s];
      e && !e[s] ? t[s] = n : t[s] = n.optional();
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
        let r = this.shape[s];
        for (; r instanceof N; )
          r = r._def.innerType;
        t[s] = r;
      }
    return new b({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Ce(_.objectKeys(this.shape));
  }
}
b.create = (a, e) => new b({
  shape: () => a,
  unknownKeys: "strip",
  catchall: Z.create(),
  typeName: p.ZodObject,
  ...g(e)
});
b.strictCreate = (a, e) => new b({
  shape: () => a,
  unknownKeys: "strict",
  catchall: Z.create(),
  typeName: p.ZodObject,
  ...g(e)
});
b.lazycreate = (a, e) => new b({
  shape: a,
  unknownKeys: "strip",
  catchall: Z.create(),
  typeName: p.ZodObject,
  ...g(e)
});
class Q extends v {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function n(r) {
      for (const o of r)
        if (o.result.status === "valid")
          return o.result;
      for (const o of r)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = r.map((o) => new A(o.ctx.common.issues));
      return c(t, {
        code: d.invalid_union,
        unionErrors: i
      }), m;
    }
    if (t.common.async)
      return Promise.all(s.map(async (r) => {
        const i = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await r._parseAsync({
            data: t.data,
            path: t.path,
            parent: i
          }),
          ctx: i
        };
      })).then(n);
    {
      let r;
      const i = [];
      for (const h of s) {
        const u = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, y = h._parseSync({
          data: t.data,
          path: t.path,
          parent: u
        });
        if (y.status === "valid")
          return y;
        y.status === "dirty" && !r && (r = { result: y, ctx: u }), u.common.issues.length && i.push(u.common.issues);
      }
      if (r)
        return t.common.issues.push(...r.ctx.common.issues), r.result;
      const o = i.map((h) => new A(h));
      return c(t, {
        code: d.invalid_union,
        unionErrors: o
      }), m;
    }
  }
  get options() {
    return this._def.options;
  }
}
Q.create = (a, e) => new Q({
  options: a,
  typeName: p.ZodUnion,
  ...g(e)
});
function oe(a, e) {
  const t = I(a), s = I(e);
  if (a === e)
    return { valid: !0, data: a };
  if (t === l.object && s === l.object) {
    const n = _.objectKeys(e), r = _.objectKeys(a).filter((o) => n.indexOf(o) !== -1), i = { ...a, ...e };
    for (const o of r) {
      const h = oe(a[o], e[o]);
      if (!h.valid)
        return { valid: !1 };
      i[o] = h.data;
    }
    return { valid: !0, data: i };
  } else if (t === l.array && s === l.array) {
    if (a.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let r = 0; r < a.length; r++) {
      const i = a[r], o = e[r], h = oe(i, o);
      if (!h.valid)
        return { valid: !1 };
      n.push(h.data);
    }
    return { valid: !0, data: n };
  } else return t === l.date && s === l.date && +a == +e ? { valid: !0, data: a } : { valid: !1 };
}
class ee extends v {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = (r, i) => {
      if (fe(r) || fe(i))
        return m;
      const o = oe(r.value, i.value);
      return o.valid ? ((pe(r) || pe(i)) && t.dirty(), { status: t.value, value: o.data }) : (c(s, {
        code: d.invalid_intersection_types
      }), m);
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
    ]).then(([r, i]) => n(r, i)) : n(this._def.left._parseSync({
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
ee.create = (a, e, t) => new ee({
  left: a,
  right: e,
  typeName: p.ZodIntersection,
  ...g(t)
});
class L extends v {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.array)
      return c(s, {
        code: d.invalid_type,
        expected: l.array,
        received: s.parsedType
      }), m;
    if (s.data.length < this._def.items.length)
      return c(s, {
        code: d.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), m;
    !this._def.rest && s.data.length > this._def.items.length && (c(s, {
      code: d.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const r = [...s.data].map((i, o) => {
      const h = this._def.items[o] || this._def.rest;
      return h ? h._parse(new S(s, i, s.path, o)) : null;
    }).filter((i) => !!i);
    return s.common.async ? Promise.all(r).then((i) => k.mergeArray(t, i)) : k.mergeArray(t, r);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new L({
      ...this._def,
      rest: e
    });
  }
}
L.create = (a, e) => {
  if (!Array.isArray(a))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new L({
    items: a,
    typeName: p.ZodTuple,
    rest: null,
    ...g(e)
  });
};
class te extends v {
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
      }), m;
    const n = [], r = this._def.keyType, i = this._def.valueType;
    for (const o in s.data)
      n.push({
        key: r._parse(new S(s, o, s.path, o)),
        value: i._parse(new S(s, s.data[o], s.path, o)),
        alwaysSet: o in s.data
      });
    return s.common.async ? k.mergeObjectAsync(t, n) : k.mergeObjectSync(t, n);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, s) {
    return t instanceof v ? new te({
      keyType: e,
      valueType: t,
      typeName: p.ZodRecord,
      ...g(s)
    }) : new te({
      keyType: E.create(),
      valueType: e,
      typeName: p.ZodRecord,
      ...g(t)
    });
  }
}
class be extends v {
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
      }), m;
    const n = this._def.keyType, r = this._def.valueType, i = [...s.data.entries()].map(([o, h], u) => ({
      key: n._parse(new S(s, o, s.path, [u, "key"])),
      value: r._parse(new S(s, h, s.path, [u, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const h of i) {
          const u = await h.key, y = await h.value;
          if (u.status === "aborted" || y.status === "aborted")
            return m;
          (u.status === "dirty" || y.status === "dirty") && t.dirty(), o.set(u.value, y.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const h of i) {
        const u = h.key, y = h.value;
        if (u.status === "aborted" || y.status === "aborted")
          return m;
        (u.status === "dirty" || y.status === "dirty") && t.dirty(), o.set(u.value, y.value);
      }
      return { status: t.value, value: o };
    }
  }
}
be.create = (a, e, t) => new be({
  valueType: e,
  keyType: a,
  typeName: p.ZodMap,
  ...g(t)
});
class H extends v {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.set)
      return c(s, {
        code: d.invalid_type,
        expected: l.set,
        received: s.parsedType
      }), m;
    const n = this._def;
    n.minSize !== null && s.data.size < n.minSize.value && (c(s, {
      code: d.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && s.data.size > n.maxSize.value && (c(s, {
      code: d.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const r = this._def.valueType;
    function i(h) {
      const u = /* @__PURE__ */ new Set();
      for (const y of h) {
        if (y.status === "aborted")
          return m;
        y.status === "dirty" && t.dirty(), u.add(y.value);
      }
      return { status: t.value, value: u };
    }
    const o = [...s.data.values()].map((h, u) => r._parse(new S(s, h, s.path, u)));
    return s.common.async ? Promise.all(o).then((h) => i(h)) : i(o);
  }
  min(e, t) {
    return new H({
      ...this._def,
      minSize: { value: e, message: f.toString(t) }
    });
  }
  max(e, t) {
    return new H({
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
H.create = (a, e) => new H({
  valueType: a,
  minSize: null,
  maxSize: null,
  typeName: p.ZodSet,
  ...g(e)
});
class ke extends v {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
ke.create = (a, e) => new ke({
  getter: a,
  typeName: p.ZodLazy,
  ...g(e)
});
class we extends v {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return c(t, {
        received: t.data,
        code: d.invalid_literal,
        expected: this._def.value
      }), m;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
we.create = (a, e) => new we({
  value: a,
  typeName: p.ZodLiteral,
  ...g(e)
});
function Ce(a, e) {
  return new B({
    values: a,
    typeName: p.ZodEnum,
    ...g(e)
  });
}
class B extends v {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        expected: _.joinValues(s),
        received: t.parsedType,
        code: d.invalid_type
      }), m;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        received: t.data,
        code: d.invalid_enum_value,
        options: s
      }), m;
    }
    return w(e.data);
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
    return B.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return B.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
B.create = Ce;
class Te extends v {
  _parse(e) {
    const t = _.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== l.string && s.parsedType !== l.number) {
      const n = _.objectValues(t);
      return c(s, {
        expected: _.joinValues(n),
        received: s.parsedType,
        code: d.invalid_type
      }), m;
    }
    if (this._cache || (this._cache = new Set(_.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = _.objectValues(t);
      return c(s, {
        received: s.data,
        code: d.invalid_enum_value,
        options: n
      }), m;
    }
    return w(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Te.create = (a, e) => new Te({
  values: a,
  typeName: p.ZodNativeEnum,
  ...g(e)
});
class se extends v {
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
      }), m;
    const s = t.parsedType === l.promise ? t.data : Promise.resolve(t.data);
    return w(s.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
se.create = (a, e) => new se({
  type: a,
  typeName: p.ZodPromise,
  ...g(e)
});
class V extends v {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === p.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = this._def.effect || null, r = {
      addIssue: (i) => {
        c(s, i), i.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (r.addIssue = r.addIssue.bind(r), n.type === "preprocess") {
      const i = n.transform(s.data, r);
      if (s.common.async)
        return Promise.resolve(i).then(async (o) => {
          if (t.value === "aborted")
            return m;
          const h = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return h.status === "aborted" ? m : h.status === "dirty" || t.value === "dirty" ? q(h.value) : h;
        });
      {
        if (t.value === "aborted")
          return m;
        const o = this._def.schema._parseSync({
          data: i,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? m : o.status === "dirty" || t.value === "dirty" ? q(o.value) : o;
      }
    }
    if (n.type === "refinement") {
      const i = (o) => {
        const h = n.refinement(o, r);
        if (s.common.async)
          return Promise.resolve(h);
        if (h instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (n.type === "transform")
      if (s.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!D(i))
          return m;
        const o = n.transform(i.value, r);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((i) => D(i) ? Promise.resolve(n.transform(i.value, r)).then((o) => ({
          status: t.value,
          value: o
        })) : m);
    _.assertNever(n);
  }
}
V.create = (a, e, t) => new V({
  schema: a,
  typeName: p.ZodEffects,
  effect: e,
  ...g(t)
});
V.createWithPreprocess = (a, e, t) => new V({
  schema: e,
  effect: { type: "preprocess", transform: a },
  typeName: p.ZodEffects,
  ...g(t)
});
class N extends v {
  _parse(e) {
    return this._getType(e) === l.undefined ? w(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
N.create = (a, e) => new N({
  innerType: a,
  typeName: p.ZodOptional,
  ...g(e)
});
class U extends v {
  _parse(e) {
    return this._getType(e) === l.null ? w(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
U.create = (a, e) => new U({
  innerType: a,
  typeName: p.ZodNullable,
  ...g(e)
});
class de extends v {
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
de.create = (a, e) => new de({
  innerType: a,
  typeName: p.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...g(e)
});
class ce extends v {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return Y(n) ? n.then((r) => ({
      status: "valid",
      value: r.status === "valid" ? r.value : this._def.catchValue({
        get error() {
          return new A(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new A(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ce.create = (a, e) => new ce({
  innerType: a,
  typeName: p.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...g(e)
});
class Re extends v {
  _parse(e) {
    if (this._getType(e) !== l.nan) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.nan,
        received: s.parsedType
      }), m;
    }
    return { status: "valid", value: e.data };
  }
}
Re.create = (a) => new Re({
  typeName: p.ZodNaN,
  ...g(a)
});
class dt extends v {
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
class ue extends v {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const r = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return r.status === "aborted" ? m : r.status === "dirty" ? (t.dirty(), q(r.value)) : this._def.out._parseAsync({
          data: r.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return n.status === "aborted" ? m : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new ue({
      in: e,
      out: t,
      typeName: p.ZodPipeline
    });
  }
}
class le extends v {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (n) => (D(n) && (n.value = Object.freeze(n.value)), n);
    return Y(t) ? t.then((n) => s(n)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
le.create = (a, e) => new le({
  innerType: a,
  typeName: p.ZodReadonly,
  ...g(e)
});
var p;
(function(a) {
  a.ZodString = "ZodString", a.ZodNumber = "ZodNumber", a.ZodNaN = "ZodNaN", a.ZodBigInt = "ZodBigInt", a.ZodBoolean = "ZodBoolean", a.ZodDate = "ZodDate", a.ZodSymbol = "ZodSymbol", a.ZodUndefined = "ZodUndefined", a.ZodNull = "ZodNull", a.ZodAny = "ZodAny", a.ZodUnknown = "ZodUnknown", a.ZodNever = "ZodNever", a.ZodVoid = "ZodVoid", a.ZodArray = "ZodArray", a.ZodObject = "ZodObject", a.ZodUnion = "ZodUnion", a.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", a.ZodIntersection = "ZodIntersection", a.ZodTuple = "ZodTuple", a.ZodRecord = "ZodRecord", a.ZodMap = "ZodMap", a.ZodSet = "ZodSet", a.ZodFunction = "ZodFunction", a.ZodLazy = "ZodLazy", a.ZodLiteral = "ZodLiteral", a.ZodEnum = "ZodEnum", a.ZodEffects = "ZodEffects", a.ZodNativeEnum = "ZodNativeEnum", a.ZodOptional = "ZodOptional", a.ZodNullable = "ZodNullable", a.ZodDefault = "ZodDefault", a.ZodCatch = "ZodCatch", a.ZodPromise = "ZodPromise", a.ZodBranded = "ZodBranded", a.ZodPipeline = "ZodPipeline", a.ZodReadonly = "ZodReadonly";
})(p || (p = {}));
const x = E.create, $ = M.create, Ae = re.create, z = ie.create;
Z.create;
const C = R.create, O = b.create, ct = Q.create;
ee.create;
L.create;
const F = te.create, K = B.create;
se.create;
N.create;
U.create;
const Oe = K(["GET", "POST", "PUT", "PATCH", "DELETE"]), lt = K(["confirm", "block", "limit", "require", "role"]), ut = K([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "contains"
]), ht = K(["voice", "docs", "compile"]), Ie = O({
  id: x().uuid().optional(),
  app_id: x().uuid().optional(),
  skill_name: x(),
  kind: lt,
  field: x().nullable().optional(),
  op: ut.nullable().optional(),
  value: z().optional(),
  message: x(),
  spoken: x().nullable().optional(),
  source: ht.default("voice"),
  created_at: x().optional()
}), ft = O({
  type: x(),
  required: Ae().default(!1),
  enum: C(x()).optional(),
  description: x().optional(),
  default: z().optional()
}), Ne = O({
  id: x().uuid().optional(),
  app_id: x().uuid().optional(),
  name: x().regex(/^[a-z0-9_]+$/i, "Skill name must be alphanumeric with underscores"),
  version: $().int().default(1),
  title: x(),
  description: x().optional(),
  method: Oe,
  path: x(),
  query_params: C(x()).default([]),
  inputs: F(ft).default({}),
  constants: F(z()).default({}),
  outputs: F(z()).default({}),
  depends_on: C(x()).default([]),
  is_write: Ae().default(!1),
  verify_with: x().nullable().optional(),
  source_recording: x().uuid().nullable().optional(),
  narration: x().nullable().optional(),
  status: K(["active", "drifted", "disabled"]).default("active")
});
O({
  method: Oe,
  path: x(),
  query: F(x()).optional(),
  requestBody: z().optional(),
  status: $().int(),
  responseBody: z().optional(),
  ts: $()
});
const pt = O({
  from_event: $().int(),
  from_path: x(),
  to_event: $().int(),
  to_field: x(),
  value: ct([x(), $()])
});
O({
  skills: C(Ne),
  suggested_policies: C(Ie).default([])
});
O({
  skills: C(Ne),
  suggested_policies: C(Ie).default([]),
  tracer_edges: C(pt).default([])
});
const mt = O({
  idx: $().int(),
  skill_name: x(),
  description: x(),
  args: F(z()).default({})
});
O({
  steps: C(mt),
  summary: x()
});
const yt = /token|secret|password|authorization|cookie|otp|card|aadhaar|pan/i, gt = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, vt = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, _t = 8192;
function W(a) {
  if (a == null)
    return a;
  if (typeof a == "string") {
    let e = a.replace(gt, (t) => {
      const [s, n] = t.split("@");
      return `${s.length > 2 ? `${s[0]}***${s[s.length - 1]}` : `${s[0]}***`}@${n}`;
    });
    return e = e.replace(vt, (t) => {
      const s = t.replace(/\D/g, "");
      return s.length >= 7 ? `+XX-XXXX-${s.slice(-4)}` : t;
    }), e;
  }
  if (Array.isArray(a))
    return a.map((e) => W(e));
  if (typeof a == "object") {
    const e = {};
    for (const [t, s] of Object.entries(a))
      yt.test(t) ? e[t] = "[REDACTED]" : e[t] = W(s);
    return e;
  }
  return a;
}
function xt(a) {
  let e = W(a.responseBody);
  if (e != null)
    try {
      const t = JSON.stringify(e);
      t.length > _t && (e = {
        _truncated: !0,
        sample: typeof e == "object" && e !== null ? Array.isArray(e) ? e.slice(0, 3) : Object.fromEntries(Object.entries(e).slice(0, 5)) : "[Large payload truncated]",
        total_bytes: t.length
      });
    } catch {
    }
  return {
    method: a.method,
    path: a.path,
    query: a.query ? W(a.query) : void 0,
    requestBody: a.requestBody ? W(a.requestBody) : void 0,
    status: a.status,
    responseBody: e,
    ts: a.ts || Date.now()
  };
}
function bt(a) {
  return a.map(xt);
}
class kt {
  constructor() {
    T(this, "config", {
      publicKey: "pk_demo_dehix",
      apiUrl: "http://localhost:4000",
      apiPrefix: "/api/"
    });
    T(this, "shadowRoot", null);
    T(this, "isRecording", !1);
    T(this, "recordedEvents", []);
    T(this, "activeTab", "ask");
    T(this, "isOpen", !1);
    T(this, "isListening", !1);
    T(this, "speechRecognition", null);
    T(this, "narrationText", "");
    T(this, "recordingTitle", "");
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
    window.fetch = async function(...r) {
      var o, h;
      const i = await t.apply(this, r);
      if (e.isRecording)
        try {
          const u = typeof r[0] == "string" ? r[0] : r[0].url, y = new URL(u, window.location.origin);
          if (y.origin === window.location.origin && y.pathname.startsWith(e.config.apiPrefix || "/api/")) {
            const j = i.clone();
            let J = null;
            try {
              J = await j.json();
            } catch {
            }
            const Ze = (o = r[1]) == null ? void 0 : o.body, je = e.safeParseBody(Ze);
            e.addCapturedEvent({
              method: (((h = r[1]) == null ? void 0 : h.method) || "GET").toUpperCase(),
              path: y.pathname,
              query: Object.fromEntries(y.searchParams.entries()),
              requestBody: je,
              status: i.status,
              responseBody: J,
              ts: Date.now()
            });
          }
        } catch (u) {
          console.warn("[SayDo] Fetch interceptor error:", u);
        }
      return i;
    };
    const s = XMLHttpRequest.prototype.open, n = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(r, i, ...o) {
      return this._saydoMethod = r, this._saydoUrl = i.toString(), s.apply(this, [r, i, ...o]);
    }, XMLHttpRequest.prototype.send = function(r) {
      return e.isRecording && this._saydoUrl && this.addEventListener("load", () => {
        try {
          const i = new URL(this._saydoUrl, window.location.origin);
          if (i.origin === window.location.origin && i.pathname.startsWith(e.config.apiPrefix || "/api/")) {
            let o = null;
            try {
              o = JSON.parse(this.responseText);
            } catch {
            }
            e.addCapturedEvent({
              method: (this._saydoMethod || "GET").toUpperCase(),
              path: i.pathname,
              query: Object.fromEntries(i.searchParams.entries()),
              requestBody: e.safeParseBody(r),
              status: this.status,
              responseBody: o,
              ts: Date.now()
            });
          }
        } catch (i) {
          console.warn("[SayDo] XHR interceptor error:", i);
        }
      }), n.apply(this, [r]);
    };
  }
  addCapturedEvent(e) {
    this.recordedEvents.push(e), console.log("[SayDo SDK] Captured network event:", e.method, e.path, e.status), this.updateEventListUI();
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
      for (let n = t.resultIndex; n < t.results.length; n++)
        s += t.results[n][0].transcript;
      this.narrationText = (this.narrationText + " " + s).trim(), this.updateNarrationUI();
    }, this.speechRecognition.onerror = (t) => {
      console.warn("[SayDo Speech] Speech recognition error:", t.error), this.isListening = !1, this.updateMicButtonUI();
    }, this.speechRecognition.onend = () => {
      this.isListening = !1, this.updateMicButtonUI();
    });
  }
  toggleSpeech() {
    if (!this.speechRecognition) {
      alert("Web Speech API is not supported in this browser. You can type directly in the Tell box.");
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
    this.updateMicButtonUI();
  }
  mountWidget() {
    if (typeof document > "u") return;
    let e = document.getElementById("saydo-root");
    e || (e = document.createElement("div"), e.id = "saydo-root", document.body.appendChild(e)), this.shadowRoot = e.attachShadow({ mode: "open" });
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

        /* Floating Launcher */
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
          background: ${this.isRecording ? "#ef4444" : "#10b981"};
          box-shadow: 0 0 8px ${this.isRecording ? "#ef4444" : "#10b981"};
          animation: ${this.isRecording ? "pulse 1s infinite" : "none"};
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        /* Modal Panel */
        .saydo-panel {
          position: fixed;
          bottom: 76px;
          right: 24px;
          width: 380px;
          max-height: 560px;
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
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

        /* Panel Header */
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

        /* Tab Content Body */
        .saydo-body {
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 440px;
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
          transition: all 0.15s ease;
        }
        .saydo-rec-btn.start {
          background: #ef4444;
          color: #ffffff;
        }
        .saydo-rec-btn.stop {
          background: #334155;
          color: #f1f5f9;
        }

        /* Form Inputs */
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
        .saydo-input:focus, .saydo-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        /* Tell Box & Mic */
        .saydo-tell-box {
          position: relative;
        }
        .saydo-mic-btn {
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: ${this.isListening ? "#ef4444" : "#1e293b"};
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        .saydo-mic-btn:hover {
          background: ${this.isListening ? "#dc2626" : "#2563eb"};
        }

        /* Captured Events Feed */
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
        .saydo-method {
          font-weight: bold;
          color: #60a5fa;
        }
        .saydo-path {
          color: #cbd5e1;
          margin-left: 6px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .saydo-status {
          font-size: 10px;
          color: #10b981;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.1);
        }

        /* Save Button */
        .saydo-save-btn {
          padding: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .saydo-save-btn:hover {
          background: #1d4ed8;
        }
        .saydo-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Ask View */
        .saydo-ask-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: center;
          padding: 10px 0;
        }
        .saydo-ask-hint {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
      </style>

      <!-- Launcher Button -->
      <button class="saydo-launcher" id="saydo-launcher">
        <span class="saydo-indicator"></span>
        <span>${this.isRecording ? "Recording (SayDo)" : "SayDo Agent"}</span>
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

        <div class="saydo-body">
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
              <div class="saydo-tell-box">
                <textarea 
                  class="saydo-textarea" 
                  id="textarea-narration" 
                  rows="3" 
                  placeholder="Talk aloud while doing the task... e.g. 'I am setting the budget to 2 lakh and creating the project.'"
                >${this.narrationText}</textarea>
                <button class="saydo-mic-btn" id="btn-mic" title="Dictate by voice (Web Speech API / Wispr)">
                  ${this.isListening ? "🛑" : "🎙️"}
                </button>
              </div>
            </div>

            <div>
              <div class="saydo-label">Captured Network Calls (${this.recordedEvents.length})</div>
              <div class="saydo-events-box" id="events-list">
                ${this.recordedEvents.length === 0 ? `<div style="font-size: 11px; color: #64748b; font-style: italic; padding: 4px;">Click 'Record Task' and interact with DEHIX-lite. API calls appear here live.</div>` : this.recordedEvents.map(
      (t) => `
                        <div class="saydo-event-item">
                          <div>
                            <span class="saydo-method">${t.method}</span>
                            <span class="saydo-path" title="${t.path}">${t.path}</span>
                          </div>
                          <span class="saydo-status">${t.status}</span>
                        </div>
                      `
    ).join("")}
              </div>
            </div>

            <button 
              class="saydo-save-btn" 
              id="btn-save-recording" 
              ${this.recordedEvents.length === 0 ? "disabled" : ""}
            >
              Stop & Save to SayDo
            </button>
          ` : `
            <!-- Ask View -->
            <div class="saydo-ask-container">
              <div style="font-size: 28px;">🤖</div>
              <div style="font-weight: 700; color: #ffffff; font-size: 15px;">Ask SayDo Agent</div>
              <p class="saydo-ask-hint">
                SayDo knows this app's typed skills and spoken policies. Ask anything by voice or text.
              </p>
              <textarea 
                class="saydo-textarea" 
                rows="3" 
                placeholder="e.g. 'Create a new project for Website Revamp with 2 lakh budget'"
              ></textarea>
              <button class="saydo-save-btn">Run with User Session</button>
            </div>
          `}
        </div>
      </div>
    `, this.attachEventListeners();
  }
  attachEventListeners() {
    if (!this.shadowRoot) return;
    const e = this.shadowRoot.getElementById("saydo-launcher");
    e == null || e.addEventListener("click", () => {
      this.isOpen = !this.isOpen, this.render();
    });
    const t = this.shadowRoot.getElementById("saydo-close");
    t == null || t.addEventListener("click", () => {
      this.isOpen = !1, this.render();
    });
    const s = this.shadowRoot.getElementById("tab-ask");
    s == null || s.addEventListener("click", () => {
      this.activeTab = "ask", this.render();
    });
    const n = this.shadowRoot.getElementById("tab-teach");
    n == null || n.addEventListener("click", () => {
      this.activeTab = "teach", this.render();
    });
    const r = this.shadowRoot.getElementById("btn-toggle-rec");
    r == null || r.addEventListener("click", () => {
      this.isRecording ? this.stopRecording() : this.startRecording(), this.render();
    });
    const i = this.shadowRoot.getElementById("btn-mic");
    i == null || i.addEventListener("click", () => {
      this.toggleSpeech();
    });
    const o = this.shadowRoot.getElementById("input-title");
    o == null || o.addEventListener("input", (y) => {
      this.recordingTitle = y.target.value;
    });
    const h = this.shadowRoot.getElementById("textarea-narration");
    h == null || h.addEventListener("input", (y) => {
      this.narrationText = y.target.value;
    });
    const u = this.shadowRoot.getElementById("btn-save-recording");
    u == null || u.addEventListener("click", () => {
      this.saveRecording();
    });
  }
  updateEventListUI() {
    if (!this.shadowRoot) return;
    const e = this.shadowRoot.getElementById("events-list"), t = this.shadowRoot.getElementById("btn-save-recording");
    e && (e.innerHTML = this.recordedEvents.map(
      (s) => `
        <div class="saydo-event-item">
          <div>
            <span class="saydo-method">${s.method}</span>
            <span class="saydo-path" title="${s.path}">${s.path}</span>
          </div>
          <span class="saydo-status">${s.status}</span>
        </div>
      `
    ).join("")), t && (t.disabled = this.recordedEvents.length === 0);
  }
  updateNarrationUI() {
    if (!this.shadowRoot) return;
    const e = this.shadowRoot.getElementById("textarea-narration");
    e && (e.value = this.narrationText);
  }
  updateMicButtonUI() {
    if (!this.shadowRoot) return;
    const e = this.shadowRoot.getElementById("btn-mic");
    e && (e.textContent = this.isListening ? "🛑" : "🎙️", e.style.background = this.isListening ? "#ef4444" : "#1e293b");
  }
  startRecording() {
    this.isRecording = !0, this.recordedEvents = [], console.log("[SayDo SDK] Recording started...");
  }
  stopRecording() {
    this.isRecording = !1, console.log("[SayDo SDK] Recording stopped. Total events:", this.recordedEvents.length);
  }
  async saveRecording() {
    this.stopRecording();
    const e = this.recordingTitle.trim() || "Recorded Task " + (/* @__PURE__ */ new Date()).toLocaleTimeString(), t = this.narrationText.trim(), s = bt(this.recordedEvents), n = {
      publicKey: this.config.publicKey,
      title: e,
      events: s,
      narration: t
    };
    try {
      const r = await fetch(`${this.config.apiUrl}/v1/recordings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SayDo-Public-Key": this.config.publicKey
        },
        body: JSON.stringify(n)
      }), i = await r.json();
      if (!r.ok)
        throw new Error(i.error || "Failed to save recording");
      alert(`✅ Recording "${e}" successfully stored in SayDo! (${i.event_count} sanitized events)`), this.recordedEvents = [], this.recordingTitle = "", this.narrationText = "", this.render();
    } catch (r) {
      alert(`❌ Failed to save recording: ${r.message}`);
    }
  }
}
const wt = new kt();
typeof window < "u" && (window.SayDo = wt);
export {
  wt as default
};
