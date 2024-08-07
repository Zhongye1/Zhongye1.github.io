(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) s(n);
  new MutationObserver((n) => {
    for (const o of n)
      if (o.type === "childList")
        for (const r of o.addedNodes)
          r.tagName === "LINK" && r.rel === "modulepreload" && s(r);
  }).observe(document, { childList: !0, subtree: !0 });
  function i(n) {
    const o = {};
    return (
      n.integrity && (o.integrity = n.integrity),
      n.referrerpolicy && (o.referrerPolicy = n.referrerpolicy),
      n.crossorigin === "use-credentials"
        ? (o.credentials = "include")
        : n.crossorigin === "anonymous"
        ? (o.credentials = "omit")
        : (o.credentials = "same-origin"),
      o
    );
  }
  function s(n) {
    if (n.ep) return;
    n.ep = !0;
    const o = i(n);
    fetch(n.href, o);
  }
})();
function Hs(e, t) {
  const i = Object.create(null),
    s = e.split(",");
  for (let n = 0; n < s.length; n++) i[s[n]] = !0;
  return t ? (n) => !!i[n.toLowerCase()] : (n) => !!i[n];
}
function Ns(e) {
  if (N(e)) {
    const t = {};
    for (let i = 0; i < e.length; i++) {
      const s = e[i],
        n = ut(s) ? Kr(s) : Ns(s);
      if (n) for (const o in n) t[o] = n[o];
    }
    return t;
  } else {
    if (ut(e)) return e;
    if (st(e)) return e;
  }
}
const jr = /;(?![^(]*\))/g,
  Wr = /:([^]+)/,
  Vr = /\/\*.*?\*\//gs;
function Kr(e) {
  const t = {};
  return (
    e
      .replace(Vr, "")
      .split(jr)
      .forEach((i) => {
        if (i) {
          const s = i.split(Wr);
          s.length > 1 && (t[s[0].trim()] = s[1].trim());
        }
      }),
    t
  );
}
function Us(e) {
  let t = "";
  if (ut(e)) t = e;
  else if (N(e))
    for (let i = 0; i < e.length; i++) {
      const s = Us(e[i]);
      s && (t += s + " ");
    }
  else if (st(e)) for (const i in e) e[i] && (t += i + " ");
  return t.trim();
}
const qr =
    "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
  Yr = Hs(qr);
function _o(e) {
  return !!e || e === "";
}
const Qr = (e) =>
    ut(e)
      ? e
      : e == null
      ? ""
      : N(e) || (st(e) && (e.toString === Co || !j(e.toString)))
      ? JSON.stringify(e, wo, 2)
      : String(e),
  wo = (e, t) =>
    t && t.__v_isRef
      ? wo(e, t.value)
      : Ce(t)
      ? {
          [`Map(${t.size})`]: [...t.entries()].reduce(
            (i, [s, n]) => ((i[`${s} =>`] = n), i),
            {}
          ),
        }
      : xo(t)
      ? { [`Set(${t.size})`]: [...t.values()] }
      : st(t) && !N(t) && !Oo(t)
      ? String(t)
      : t,
  it = {},
  xe = [],
  St = () => {},
  Jr = () => !1,
  Xr = /^on[^a-z]/,
  Si = (e) => Xr.test(e),
  $s = (e) => e.startsWith("onUpdate:"),
  dt = Object.assign,
  js = (e, t) => {
    const i = e.indexOf(t);
    i > -1 && e.splice(i, 1);
  },
  Zr = Object.prototype.hasOwnProperty,
  K = (e, t) => Zr.call(e, t),
  N = Array.isArray,
  Ce = (e) => ki(e) === "[object Map]",
  xo = (e) => ki(e) === "[object Set]",
  j = (e) => typeof e == "function",
  ut = (e) => typeof e == "string",
  Ws = (e) => typeof e == "symbol",
  st = (e) => e !== null && typeof e == "object",
  Vs = (e) => st(e) && j(e.then) && j(e.catch),
  Co = Object.prototype.toString,
  ki = (e) => Co.call(e),
  Gr = (e) => ki(e).slice(8, -1),
  Oo = (e) => ki(e) === "[object Object]",
  Ks = (e) =>
    ut(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e,
  Ci = Hs(
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  ),
  Li = (e) => {
    const t = Object.create(null);
    return (i) => t[i] || (t[i] = e(i));
  },
  ta = /-(\w)/g,
  Nt = Li((e) => e.replace(ta, (t, i) => (i ? i.toUpperCase() : ""))),
  ea = /\B([A-Z])/g,
  Le = Li((e) => e.replace(ea, "-$1").toLowerCase()),
  Ri = Li((e) => e.charAt(0).toUpperCase() + e.slice(1)),
  ts = Li((e) => (e ? `on${Ri(e)}` : "")),
  ti = (e, t) => !Object.is(e, t),
  es = (e, t) => {
    for (let i = 0; i < e.length; i++) e[i](t);
  },
  Ei = (e, t, i) => {
    Object.defineProperty(e, t, { configurable: !0, enumerable: !1, value: i });
  },
  Fi = (e) => {
    const t = parseFloat(e);
    return isNaN(t) ? e : t;
  };
let Cn;
const ia = () =>
  Cn ||
  (Cn =
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
      ? self
      : typeof window < "u"
      ? window
      : typeof global < "u"
      ? global
      : {});
let wt;
class To {
  constructor(t = !1) {
    (this.detached = t),
      (this.active = !0),
      (this.effects = []),
      (this.cleanups = []),
      (this.parent = wt),
      !t && wt && (this.index = (wt.scopes || (wt.scopes = [])).push(this) - 1);
  }
  run(t) {
    if (this.active) {
      const i = wt;
      try {
        return (wt = this), t();
      } finally {
        wt = i;
      }
    }
  }
  on() {
    wt = this;
  }
  off() {
    wt = this.parent;
  }
  stop(t) {
    if (this.active) {
      let i, s;
      for (i = 0, s = this.effects.length; i < s; i++) this.effects[i].stop();
      for (i = 0, s = this.cleanups.length; i < s; i++) this.cleanups[i]();
      if (this.scopes)
        for (i = 0, s = this.scopes.length; i < s; i++) this.scopes[i].stop(!0);
      if (!this.detached && this.parent && !t) {
        const n = this.parent.scopes.pop();
        n &&
          n !== this &&
          ((this.parent.scopes[this.index] = n), (n.index = this.index));
      }
      (this.parent = void 0), (this.active = !1);
    }
  }
}
function Po(e) {
  return new To(e);
}
function sa(e, t = wt) {
  t && t.active && t.effects.push(e);
}
function na() {
  return wt;
}
function oa(e) {
  wt && wt.cleanups.push(e);
}
const qs = (e) => {
    const t = new Set(e);
    return (t.w = 0), (t.n = 0), t;
  },
  Eo = (e) => (e.w & ie) > 0,
  Mo = (e) => (e.n & ie) > 0,
  ra = ({ deps: e }) => {
    if (e.length) for (let t = 0; t < e.length; t++) e[t].w |= ie;
  },
  aa = (e) => {
    const { deps: t } = e;
    if (t.length) {
      let i = 0;
      for (let s = 0; s < t.length; s++) {
        const n = t[s];
        Eo(n) && !Mo(n) ? n.delete(e) : (t[i++] = n),
          (n.w &= ~ie),
          (n.n &= ~ie);
      }
      t.length = i;
    }
  },
  _s = new WeakMap();
let je = 0,
  ie = 1;
const ws = 30;
let At;
const ve = Symbol(""),
  xs = Symbol("");
class Ys {
  constructor(t, i = null, s) {
    (this.fn = t),
      (this.scheduler = i),
      (this.active = !0),
      (this.deps = []),
      (this.parent = void 0),
      sa(this, s);
  }
  run() {
    if (!this.active) return this.fn();
    let t = At,
      i = Zt;
    for (; t; ) {
      if (t === this) return;
      t = t.parent;
    }
    try {
      return (
        (this.parent = At),
        (At = this),
        (Zt = !0),
        (ie = 1 << ++je),
        je <= ws ? ra(this) : On(this),
        this.fn()
      );
    } finally {
      je <= ws && aa(this),
        (ie = 1 << --je),
        (At = this.parent),
        (Zt = i),
        (this.parent = void 0),
        this.deferStop && this.stop();
    }
  }
  stop() {
    At === this
      ? (this.deferStop = !0)
      : this.active &&
        (On(this), this.onStop && this.onStop(), (this.active = !1));
  }
}
function On(e) {
  const { deps: t } = e;
  if (t.length) {
    for (let i = 0; i < t.length; i++) t[i].delete(e);
    t.length = 0;
  }
}
let Zt = !0;
const Io = [];
function Re() {
  Io.push(Zt), (Zt = !1);
}
function Fe() {
  const e = Io.pop();
  Zt = e === void 0 ? !0 : e;
}
function Ot(e, t, i) {
  if (Zt && At) {
    let s = _s.get(e);
    s || _s.set(e, (s = new Map()));
    let n = s.get(i);
    n || s.set(i, (n = qs())), zo(n);
  }
}
function zo(e, t) {
  let i = !1;
  je <= ws ? Mo(e) || ((e.n |= ie), (i = !Eo(e))) : (i = !e.has(At)),
    i && (e.add(At), At.deps.push(e));
}
function Vt(e, t, i, s, n, o) {
  const r = _s.get(e);
  if (!r) return;
  let a = [];
  if (t === "clear") a = [...r.values()];
  else if (i === "length" && N(e)) {
    const l = Fi(s);
    r.forEach((c, h) => {
      (h === "length" || h >= l) && a.push(c);
    });
  } else
    switch ((i !== void 0 && a.push(r.get(i)), t)) {
      case "add":
        N(e)
          ? Ks(i) && a.push(r.get("length"))
          : (a.push(r.get(ve)), Ce(e) && a.push(r.get(xs)));
        break;
      case "delete":
        N(e) || (a.push(r.get(ve)), Ce(e) && a.push(r.get(xs)));
        break;
      case "set":
        Ce(e) && a.push(r.get(ve));
        break;
    }
  if (a.length === 1) a[0] && Cs(a[0]);
  else {
    const l = [];
    for (const c of a) c && l.push(...c);
    Cs(qs(l));
  }
}
function Cs(e, t) {
  const i = N(e) ? e : [...e];
  for (const s of i) s.computed && Tn(s);
  for (const s of i) s.computed || Tn(s);
}
function Tn(e, t) {
  (e !== At || e.allowRecurse) && (e.scheduler ? e.scheduler() : e.run());
}
const la = Hs("__proto__,__v_isRef,__isVue"),
  Ao = new Set(
    Object.getOwnPropertyNames(Symbol)
      .filter((e) => e !== "arguments" && e !== "caller")
      .map((e) => Symbol[e])
      .filter(Ws)
  ),
  ca = Qs(),
  ua = Qs(!1, !0),
  ha = Qs(!0),
  Pn = da();
function da() {
  const e = {};
  return (
    ["includes", "indexOf", "lastIndexOf"].forEach((t) => {
      e[t] = function (...i) {
        const s = q(this);
        for (let o = 0, r = this.length; o < r; o++) Ot(s, "get", o + "");
        const n = s[t](...i);
        return n === -1 || n === !1 ? s[t](...i.map(q)) : n;
      };
    }),
    ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
      e[t] = function (...i) {
        Re();
        const s = q(this)[t].apply(this, i);
        return Fe(), s;
      };
    }),
    e
  );
}
function Qs(e = !1, t = !1) {
  return function (s, n, o) {
    if (n === "__v_isReactive") return !e;
    if (n === "__v_isReadonly") return e;
    if (n === "__v_isShallow") return t;
    if (n === "__v_raw" && o === (e ? (t ? Ma : Fo) : t ? Ro : Lo).get(s))
      return s;
    const r = N(s);
    if (!e && r && K(Pn, n)) return Reflect.get(Pn, n, o);
    const a = Reflect.get(s, n, o);
    return (Ws(n) ? Ao.has(n) : la(n)) || (e || Ot(s, "get", n), t)
      ? a
      : lt(a)
      ? r && Ks(n)
        ? a
        : a.value
      : st(a)
      ? e
        ? Do(a)
        : Bi(a)
      : a;
  };
}
const fa = So(),
  pa = So(!0);
function So(e = !1) {
  return function (i, s, n, o) {
    let r = i[s];
    if (Ie(r) && lt(r) && !lt(n)) return !1;
    if (
      !e &&
      (!Mi(n) && !Ie(n) && ((r = q(r)), (n = q(n))), !N(i) && lt(r) && !lt(n))
    )
      return (r.value = n), !0;
    const a = N(i) && Ks(s) ? Number(s) < i.length : K(i, s),
      l = Reflect.set(i, s, n, o);
    return (
      i === q(o) && (a ? ti(n, r) && Vt(i, "set", s, n) : Vt(i, "add", s, n)), l
    );
  };
}
function ga(e, t) {
  const i = K(e, t);
  e[t];
  const s = Reflect.deleteProperty(e, t);
  return s && i && Vt(e, "delete", t, void 0), s;
}
function va(e, t) {
  const i = Reflect.has(e, t);
  return (!Ws(t) || !Ao.has(t)) && Ot(e, "has", t), i;
}
function ma(e) {
  return Ot(e, "iterate", N(e) ? "length" : ve), Reflect.ownKeys(e);
}
const ko = { get: ca, set: fa, deleteProperty: ga, has: va, ownKeys: ma },
  ya = {
    get: ha,
    set(e, t) {
      return !0;
    },
    deleteProperty(e, t) {
      return !0;
    },
  },
  ba = dt({}, ko, { get: ua, set: pa }),
  Js = (e) => e,
  Di = (e) => Reflect.getPrototypeOf(e);
function vi(e, t, i = !1, s = !1) {
  e = e.__v_raw;
  const n = q(e),
    o = q(t);
  i || (t !== o && Ot(n, "get", t), Ot(n, "get", o));
  const { has: r } = Di(n),
    a = s ? Js : i ? Gs : ei;
  if (r.call(n, t)) return a(e.get(t));
  if (r.call(n, o)) return a(e.get(o));
  e !== n && e.get(t);
}
function mi(e, t = !1) {
  const i = this.__v_raw,
    s = q(i),
    n = q(e);
  return (
    t || (e !== n && Ot(s, "has", e), Ot(s, "has", n)),
    e === n ? i.has(e) : i.has(e) || i.has(n)
  );
}
function yi(e, t = !1) {
  return (
    (e = e.__v_raw), !t && Ot(q(e), "iterate", ve), Reflect.get(e, "size", e)
  );
}
function En(e) {
  e = q(e);
  const t = q(this);
  return Di(t).has.call(t, e) || (t.add(e), Vt(t, "add", e, e)), this;
}
function Mn(e, t) {
  t = q(t);
  const i = q(this),
    { has: s, get: n } = Di(i);
  let o = s.call(i, e);
  o || ((e = q(e)), (o = s.call(i, e)));
  const r = n.call(i, e);
  return (
    i.set(e, t), o ? ti(t, r) && Vt(i, "set", e, t) : Vt(i, "add", e, t), this
  );
}
function In(e) {
  const t = q(this),
    { has: i, get: s } = Di(t);
  let n = i.call(t, e);
  n || ((e = q(e)), (n = i.call(t, e))), s && s.call(t, e);
  const o = t.delete(e);
  return n && Vt(t, "delete", e, void 0), o;
}
function zn() {
  const e = q(this),
    t = e.size !== 0,
    i = e.clear();
  return t && Vt(e, "clear", void 0, void 0), i;
}
function bi(e, t) {
  return function (s, n) {
    const o = this,
      r = o.__v_raw,
      a = q(r),
      l = t ? Js : e ? Gs : ei;
    return (
      !e && Ot(a, "iterate", ve), r.forEach((c, h) => s.call(n, l(c), l(h), o))
    );
  };
}
function _i(e, t, i) {
  return function (...s) {
    const n = this.__v_raw,
      o = q(n),
      r = Ce(o),
      a = e === "entries" || (e === Symbol.iterator && r),
      l = e === "keys" && r,
      c = n[e](...s),
      h = i ? Js : t ? Gs : ei;
    return (
      !t && Ot(o, "iterate", l ? xs : ve),
      {
        next() {
          const { value: u, done: f } = c.next();
          return f
            ? { value: u, done: f }
            : { value: a ? [h(u[0]), h(u[1])] : h(u), done: f };
        },
        [Symbol.iterator]() {
          return this;
        },
      }
    );
  };
}
function qt(e) {
  return function (...t) {
    return e === "delete" ? !1 : this;
  };
}
function _a() {
  const e = {
      get(o) {
        return vi(this, o);
      },
      get size() {
        return yi(this);
      },
      has: mi,
      add: En,
      set: Mn,
      delete: In,
      clear: zn,
      forEach: bi(!1, !1),
    },
    t = {
      get(o) {
        return vi(this, o, !1, !0);
      },
      get size() {
        return yi(this);
      },
      has: mi,
      add: En,
      set: Mn,
      delete: In,
      clear: zn,
      forEach: bi(!1, !0),
    },
    i = {
      get(o) {
        return vi(this, o, !0);
      },
      get size() {
        return yi(this, !0);
      },
      has(o) {
        return mi.call(this, o, !0);
      },
      add: qt("add"),
      set: qt("set"),
      delete: qt("delete"),
      clear: qt("clear"),
      forEach: bi(!0, !1),
    },
    s = {
      get(o) {
        return vi(this, o, !0, !0);
      },
      get size() {
        return yi(this, !0);
      },
      has(o) {
        return mi.call(this, o, !0);
      },
      add: qt("add"),
      set: qt("set"),
      delete: qt("delete"),
      clear: qt("clear"),
      forEach: bi(!0, !0),
    };
  return (
    ["keys", "values", "entries", Symbol.iterator].forEach((o) => {
      (e[o] = _i(o, !1, !1)),
        (i[o] = _i(o, !0, !1)),
        (t[o] = _i(o, !1, !0)),
        (s[o] = _i(o, !0, !0));
    }),
    [e, i, t, s]
  );
}
const [wa, xa, Ca, Oa] = _a();
function Xs(e, t) {
  const i = t ? (e ? Oa : Ca) : e ? xa : wa;
  return (s, n, o) =>
    n === "__v_isReactive"
      ? !e
      : n === "__v_isReadonly"
      ? e
      : n === "__v_raw"
      ? s
      : Reflect.get(K(i, n) && n in s ? i : s, n, o);
}
const Ta = { get: Xs(!1, !1) },
  Pa = { get: Xs(!1, !0) },
  Ea = { get: Xs(!0, !1) },
  Lo = new WeakMap(),
  Ro = new WeakMap(),
  Fo = new WeakMap(),
  Ma = new WeakMap();
function Ia(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function za(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Ia(Gr(e));
}
function Bi(e) {
  return Ie(e) ? e : Zs(e, !1, ko, Ta, Lo);
}
function Aa(e) {
  return Zs(e, !1, ba, Pa, Ro);
}
function Do(e) {
  return Zs(e, !0, ya, Ea, Fo);
}
function Zs(e, t, i, s, n) {
  if (!st(e) || (e.__v_raw && !(t && e.__v_isReactive))) return e;
  const o = n.get(e);
  if (o) return o;
  const r = za(e);
  if (r === 0) return e;
  const a = new Proxy(e, r === 2 ? s : i);
  return n.set(e, a), a;
}
function Gt(e) {
  return Ie(e) ? Gt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Ie(e) {
  return !!(e && e.__v_isReadonly);
}
function Mi(e) {
  return !!(e && e.__v_isShallow);
}
function Bo(e) {
  return Gt(e) || Ie(e);
}
function q(e) {
  const t = e && e.__v_raw;
  return t ? q(t) : e;
}
function ze(e) {
  return Ei(e, "__v_skip", !0), e;
}
const ei = (e) => (st(e) ? Bi(e) : e),
  Gs = (e) => (st(e) ? Do(e) : e);
function Ho(e) {
  Zt && At && ((e = q(e)), zo(e.dep || (e.dep = qs())));
}
function No(e, t) {
  (e = q(e)), e.dep && Cs(e.dep);
}
function lt(e) {
  return !!(e && e.__v_isRef === !0);
}
function me(e) {
  return Uo(e, !1);
}
function rd(e) {
  return Uo(e, !0);
}
function Uo(e, t) {
  return lt(e) ? e : new Sa(e, t);
}
class Sa {
  constructor(t, i) {
    (this.__v_isShallow = i),
      (this.dep = void 0),
      (this.__v_isRef = !0),
      (this._rawValue = i ? t : q(t)),
      (this._value = i ? t : ei(t));
  }
  get value() {
    return Ho(this), this._value;
  }
  set value(t) {
    const i = this.__v_isShallow || Mi(t) || Ie(t);
    (t = i ? t : q(t)),
      ti(t, this._rawValue) &&
        ((this._rawValue = t), (this._value = i ? t : ei(t)), No(this));
  }
}
function Ii(e) {
  return lt(e) ? e.value : e;
}
const ka = {
  get: (e, t, i) => Ii(Reflect.get(e, t, i)),
  set: (e, t, i, s) => {
    const n = e[t];
    return lt(n) && !lt(i) ? ((n.value = i), !0) : Reflect.set(e, t, i, s);
  },
};
function $o(e) {
  return Gt(e) ? e : new Proxy(e, ka);
}
function La(e) {
  const t = N(e) ? new Array(e.length) : {};
  for (const i in e) t[i] = Fa(e, i);
  return t;
}
class Ra {
  constructor(t, i, s) {
    (this._object = t),
      (this._key = i),
      (this._defaultValue = s),
      (this.__v_isRef = !0);
  }
  get value() {
    const t = this._object[this._key];
    return t === void 0 ? this._defaultValue : t;
  }
  set value(t) {
    this._object[this._key] = t;
  }
}
function Fa(e, t, i) {
  const s = e[t];
  return lt(s) ? s : new Ra(e, t, i);
}
var jo;
class Da {
  constructor(t, i, s, n) {
    (this._setter = i),
      (this.dep = void 0),
      (this.__v_isRef = !0),
      (this[jo] = !1),
      (this._dirty = !0),
      (this.effect = new Ys(t, () => {
        this._dirty || ((this._dirty = !0), No(this));
      })),
      (this.effect.computed = this),
      (this.effect.active = this._cacheable = !n),
      (this.__v_isReadonly = s);
  }
  get value() {
    const t = q(this);
    return (
      Ho(t),
      (t._dirty || !t._cacheable) &&
        ((t._dirty = !1), (t._value = t.effect.run())),
      t._value
    );
  }
  set value(t) {
    this._setter(t);
  }
}
jo = "__v_isReadonly";
function Ba(e, t, i = !1) {
  let s, n;
  const o = j(e);
  return (
    o ? ((s = e), (n = St)) : ((s = e.get), (n = e.set)),
    new Da(s, n, o || !n, i)
  );
}
function ad(e, ...t) {}
function te(e, t, i, s) {
  let n;
  try {
    n = s ? e(...s) : e();
  } catch (o) {
    De(o, t, i);
  }
  return n;
}
function Mt(e, t, i, s) {
  if (j(e)) {
    const o = te(e, t, i, s);
    return (
      o &&
        Vs(o) &&
        o.catch((r) => {
          De(r, t, i);
        }),
      o
    );
  }
  const n = [];
  for (let o = 0; o < e.length; o++) n.push(Mt(e[o], t, i, s));
  return n;
}
function De(e, t, i, s = !0) {
  const n = t ? t.vnode : null;
  if (t) {
    let o = t.parent;
    const r = t.proxy,
      a = i;
    for (; o; ) {
      const c = o.ec;
      if (c) {
        for (let h = 0; h < c.length; h++) if (c[h](e, r, a) === !1) return;
      }
      o = o.parent;
    }
    const l = t.appContext.config.errorHandler;
    if (l) {
      te(l, null, 10, [e, r, a]);
      return;
    }
  }
  Ha(e, i, n, s);
}
function Ha(e, t, i, s = !0) {
  console.error(e);
}
let ii = !1,
  Os = !1;
const pt = [];
let Bt = 0;
const Oe = [];
let jt = null,
  de = 0;
const Wo = Promise.resolve();
let tn = null;
function Hi(e) {
  const t = tn || Wo;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Na(e) {
  let t = Bt + 1,
    i = pt.length;
  for (; t < i; ) {
    const s = (t + i) >>> 1;
    si(pt[s]) < e ? (t = s + 1) : (i = s);
  }
  return t;
}
function Ni(e) {
  (!pt.length || !pt.includes(e, ii && e.allowRecurse ? Bt + 1 : Bt)) &&
    (e.id == null ? pt.push(e) : pt.splice(Na(e.id), 0, e), Vo());
}
function Vo() {
  !ii && !Os && ((Os = !0), (tn = Wo.then(Yo)));
}
function Ua(e) {
  const t = pt.indexOf(e);
  t > Bt && pt.splice(t, 1);
}
function Ko(e) {
  N(e)
    ? Oe.push(...e)
    : (!jt || !jt.includes(e, e.allowRecurse ? de + 1 : de)) && Oe.push(e),
    Vo();
}
function An(e, t = ii ? Bt + 1 : 0) {
  for (; t < pt.length; t++) {
    const i = pt[t];
    i && i.pre && (pt.splice(t, 1), t--, i());
  }
}
function qo(e) {
  if (Oe.length) {
    const t = [...new Set(Oe)];
    if (((Oe.length = 0), jt)) {
      jt.push(...t);
      return;
    }
    for (jt = t, jt.sort((i, s) => si(i) - si(s)), de = 0; de < jt.length; de++)
      jt[de]();
    (jt = null), (de = 0);
  }
}
const si = (e) => (e.id == null ? 1 / 0 : e.id),
  $a = (e, t) => {
    const i = si(e) - si(t);
    if (i === 0) {
      if (e.pre && !t.pre) return -1;
      if (t.pre && !e.pre) return 1;
    }
    return i;
  };
function Yo(e) {
  (Os = !1), (ii = !0), pt.sort($a);
  const t = St;
  try {
    for (Bt = 0; Bt < pt.length; Bt++) {
      const i = pt[Bt];
      i && i.active !== !1 && te(i, null, 14);
    }
  } finally {
    (Bt = 0),
      (pt.length = 0),
      qo(),
      (ii = !1),
      (tn = null),
      (pt.length || Oe.length) && Yo();
  }
}
function ja(e, t, ...i) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || it;
  let n = i;
  const o = t.startsWith("update:"),
    r = o && t.slice(7);
  if (r && r in s) {
    const h = `${r === "modelValue" ? "model" : r}Modifiers`,
      { number: u, trim: f } = s[h] || it;
    f && (n = i.map((v) => (ut(v) ? v.trim() : v))), u && (n = i.map(Fi));
  }
  let a,
    l = s[(a = ts(t))] || s[(a = ts(Nt(t)))];
  !l && o && (l = s[(a = ts(Le(t)))]), l && Mt(l, e, 6, n);
  const c = s[a + "Once"];
  if (c) {
    if (!e.emitted) e.emitted = {};
    else if (e.emitted[a]) return;
    (e.emitted[a] = !0), Mt(c, e, 6, n);
  }
}
function Qo(e, t, i = !1) {
  const s = t.emitsCache,
    n = s.get(e);
  if (n !== void 0) return n;
  const o = e.emits;
  let r = {},
    a = !1;
  if (!j(e)) {
    const l = (c) => {
      const h = Qo(c, t, !0);
      h && ((a = !0), dt(r, h));
    };
    !i && t.mixins.length && t.mixins.forEach(l),
      e.extends && l(e.extends),
      e.mixins && e.mixins.forEach(l);
  }
  return !o && !a
    ? (st(e) && s.set(e, null), null)
    : (N(o) ? o.forEach((l) => (r[l] = null)) : dt(r, o),
      st(e) && s.set(e, r),
      r);
}
function Ui(e, t) {
  return !e || !Si(t)
    ? !1
    : ((t = t.slice(2).replace(/Once$/, "")),
      K(e, t[0].toLowerCase() + t.slice(1)) || K(e, Le(t)) || K(e, t));
}
let ft = null,
  $i = null;
function zi(e) {
  const t = ft;
  return (ft = e), ($i = (e && e.type.__scopeId) || null), t;
}
function Wa(e) {
  $i = e;
}
function Va() {
  $i = null;
}
function Ts(e, t = ft, i) {
  if (!t || e._n) return e;
  const s = (...n) => {
    s._d && jn(-1);
    const o = zi(t);
    let r;
    try {
      r = e(...n);
    } finally {
      zi(o), s._d && jn(1);
    }
    return r;
  };
  return (s._n = !0), (s._c = !0), (s._d = !0), s;
}
function is(e) {
  const {
    type: t,
    vnode: i,
    proxy: s,
    withProxy: n,
    props: o,
    propsOptions: [r],
    slots: a,
    attrs: l,
    emit: c,
    render: h,
    renderCache: u,
    data: f,
    setupState: v,
    ctx: g,
    inheritAttrs: y,
  } = e;
  let E, z;
  const x = zi(e);
  try {
    if (i.shapeFlag & 4) {
      const R = n || s;
      (E = zt(h.call(R, R, u, o, v, f, g))), (z = l);
    } else {
      const R = t;
      (E = zt(
        R.length > 1 ? R(o, { attrs: l, slots: a, emit: c }) : R(o, null)
      )),
        (z = t.props ? l : qa(l));
    }
  } catch (R) {
    (Je.length = 0), De(R, e, 1), (E = rt(bt));
  }
  let C = E;
  if (z && y !== !1) {
    const R = Object.keys(z),
      { shapeFlag: k } = C;
    R.length && k & 7 && (r && R.some($s) && (z = Ya(z, r)), (C = se(C, z)));
  }
  return (
    i.dirs && ((C = se(C)), (C.dirs = C.dirs ? C.dirs.concat(i.dirs) : i.dirs)),
    i.transition && (C.transition = i.transition),
    (E = C),
    zi(x),
    E
  );
}
function Ka(e) {
  let t;
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    if (ai(s)) {
      if (s.type !== bt || s.children === "v-if") {
        if (t) return;
        t = s;
      }
    } else return;
  }
  return t;
}
const qa = (e) => {
    let t;
    for (const i in e)
      (i === "class" || i === "style" || Si(i)) && ((t || (t = {}))[i] = e[i]);
    return t;
  },
  Ya = (e, t) => {
    const i = {};
    for (const s in e) (!$s(s) || !(s.slice(9) in t)) && (i[s] = e[s]);
    return i;
  };
function Qa(e, t, i) {
  const { props: s, children: n, component: o } = e,
    { props: r, children: a, patchFlag: l } = t,
    c = o.emitsOptions;
  if (t.dirs || t.transition) return !0;
  if (i && l >= 0) {
    if (l & 1024) return !0;
    if (l & 16) return s ? Sn(s, r, c) : !!r;
    if (l & 8) {
      const h = t.dynamicProps;
      for (let u = 0; u < h.length; u++) {
        const f = h[u];
        if (r[f] !== s[f] && !Ui(c, f)) return !0;
      }
    }
  } else
    return (n || a) && (!a || !a.$stable)
      ? !0
      : s === r
      ? !1
      : s
      ? r
        ? Sn(s, r, c)
        : !0
      : !!r;
  return !1;
}
function Sn(e, t, i) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length) return !0;
  for (let n = 0; n < s.length; n++) {
    const o = s[n];
    if (t[o] !== e[o] && !Ui(i, o)) return !0;
  }
  return !1;
}
function en({ vnode: e, parent: t }, i) {
  for (; t && t.subTree === e; ) ((e = t.vnode).el = i), (t = t.parent);
}
const Ja = (e) => e.__isSuspense,
  Xa = {
    name: "Suspense",
    __isSuspense: !0,
    process(e, t, i, s, n, o, r, a, l, c) {
      e == null ? Ga(t, i, s, n, o, r, a, l, c) : tl(e, t, i, s, n, r, a, l, c);
    },
    hydrate: el,
    create: sn,
    normalize: il,
  },
  Za = Xa;
function ni(e, t) {
  const i = e.props && e.props[t];
  j(i) && i();
}
function Ga(e, t, i, s, n, o, r, a, l) {
  const {
      p: c,
      o: { createElement: h },
    } = l,
    u = h("div"),
    f = (e.suspense = sn(e, n, s, t, u, i, o, r, a, l));
  c(null, (f.pendingBranch = e.ssContent), u, null, s, f, o, r),
    f.deps > 0
      ? (ni(e, "onPending"),
        ni(e, "onFallback"),
        c(null, e.ssFallback, t, i, s, null, o, r),
        Te(f, e.ssFallback))
      : f.resolve();
}
function tl(e, t, i, s, n, o, r, a, { p: l, um: c, o: { createElement: h } }) {
  const u = (t.suspense = e.suspense);
  (u.vnode = t), (t.el = e.el);
  const f = t.ssContent,
    v = t.ssFallback,
    { activeBranch: g, pendingBranch: y, isInFallback: E, isHydrating: z } = u;
  if (y)
    (u.pendingBranch = f),
      Ht(f, y)
        ? (l(y, f, u.hiddenContainer, null, n, u, o, r, a),
          u.deps <= 0
            ? u.resolve()
            : E && (l(g, v, i, s, n, null, o, r, a), Te(u, v)))
        : (u.pendingId++,
          z ? ((u.isHydrating = !1), (u.activeBranch = y)) : c(y, n, u),
          (u.deps = 0),
          (u.effects.length = 0),
          (u.hiddenContainer = h("div")),
          E
            ? (l(null, f, u.hiddenContainer, null, n, u, o, r, a),
              u.deps <= 0
                ? u.resolve()
                : (l(g, v, i, s, n, null, o, r, a), Te(u, v)))
            : g && Ht(f, g)
            ? (l(g, f, i, s, n, u, o, r, a), u.resolve(!0))
            : (l(null, f, u.hiddenContainer, null, n, u, o, r, a),
              u.deps <= 0 && u.resolve()));
  else if (g && Ht(f, g)) l(g, f, i, s, n, u, o, r, a), Te(u, f);
  else if (
    (ni(t, "onPending"),
    (u.pendingBranch = f),
    u.pendingId++,
    l(null, f, u.hiddenContainer, null, n, u, o, r, a),
    u.deps <= 0)
  )
    u.resolve();
  else {
    const { timeout: x, pendingId: C } = u;
    x > 0
      ? setTimeout(() => {
          u.pendingId === C && u.fallback(v);
        }, x)
      : x === 0 && u.fallback(v);
  }
}
function sn(e, t, i, s, n, o, r, a, l, c, h = !1) {
  const {
      p: u,
      m: f,
      um: v,
      n: g,
      o: { parentNode: y, remove: E },
    } = c,
    z = Fi(e.props && e.props.timeout),
    x = {
      vnode: e,
      parent: t,
      parentComponent: i,
      isSVG: r,
      container: s,
      hiddenContainer: n,
      anchor: o,
      deps: 0,
      pendingId: 0,
      timeout: typeof z == "number" ? z : -1,
      activeBranch: null,
      pendingBranch: null,
      isInFallback: !0,
      isHydrating: h,
      isUnmounted: !1,
      effects: [],
      resolve(C = !1) {
        const {
          vnode: R,
          activeBranch: k,
          pendingBranch: B,
          pendingId: L,
          effects: O,
          parentComponent: H,
          container: U,
        } = x;
        if (x.isHydrating) x.isHydrating = !1;
        else if (!C) {
          const J = k && B.transition && B.transition.mode === "out-in";
          J &&
            (k.transition.afterLeave = () => {
              L === x.pendingId && f(B, U, Z, 0);
            });
          let { anchor: Z } = x;
          k && ((Z = g(k)), v(k, H, x, !0)), J || f(B, U, Z, 0);
        }
        Te(x, B), (x.pendingBranch = null), (x.isInFallback = !1);
        let W = x.parent,
          A = !1;
        for (; W; ) {
          if (W.pendingBranch) {
            W.effects.push(...O), (A = !0);
            break;
          }
          W = W.parent;
        }
        A || Ko(O), (x.effects = []), ni(R, "onResolve");
      },
      fallback(C) {
        if (!x.pendingBranch) return;
        const {
          vnode: R,
          activeBranch: k,
          parentComponent: B,
          container: L,
          isSVG: O,
        } = x;
        ni(R, "onFallback");
        const H = g(k),
          U = () => {
            !x.isInFallback || (u(null, C, L, H, B, null, O, a, l), Te(x, C));
          },
          W = C.transition && C.transition.mode === "out-in";
        W && (k.transition.afterLeave = U),
          (x.isInFallback = !0),
          v(k, B, null, !0),
          W || U();
      },
      move(C, R, k) {
        x.activeBranch && f(x.activeBranch, C, R, k), (x.container = C);
      },
      next() {
        return x.activeBranch && g(x.activeBranch);
      },
      registerDep(C, R) {
        const k = !!x.pendingBranch;
        k && x.deps++;
        const B = C.vnode.el;
        C.asyncDep
          .catch((L) => {
            De(L, C, 0);
          })
          .then((L) => {
            if (C.isUnmounted || x.isUnmounted || x.pendingId !== C.suspenseId)
              return;
            C.asyncResolved = !0;
            const { vnode: O } = C;
            Ss(C, L, !1), B && (O.el = B);
            const H = !B && C.subTree.el;
            R(C, O, y(B || C.subTree.el), B ? null : g(C.subTree), x, r, l),
              H && E(H),
              en(C, O.el),
              k && --x.deps === 0 && x.resolve();
          });
      },
      unmount(C, R) {
        (x.isUnmounted = !0),
          x.activeBranch && v(x.activeBranch, i, C, R),
          x.pendingBranch && v(x.pendingBranch, i, C, R);
      },
    };
  return x;
}
function el(e, t, i, s, n, o, r, a, l) {
  const c = (t.suspense = sn(
      t,
      s,
      i,
      e.parentNode,
      document.createElement("div"),
      null,
      n,
      o,
      r,
      a,
      !0
    )),
    h = l(e, (c.pendingBranch = t.ssContent), i, c, o, r);
  return c.deps === 0 && c.resolve(), h;
}
function il(e) {
  const { shapeFlag: t, children: i } = e,
    s = t & 32;
  (e.ssContent = kn(s ? i.default : i)),
    (e.ssFallback = s ? kn(i.fallback) : rt(bt));
}
function kn(e) {
  let t;
  if (j(e)) {
    const i = Ae && e._c;
    i && ((e._d = !1), Be()), (e = e()), i && ((e._d = !0), (t = Et), fr());
  }
  return (
    N(e) && (e = Ka(e)),
    (e = zt(e)),
    t && !e.dynamicChildren && (e.dynamicChildren = t.filter((i) => i !== e)),
    e
  );
}
function sl(e, t) {
  t && t.pendingBranch
    ? N(e)
      ? t.effects.push(...e)
      : t.effects.push(e)
    : Ko(e);
}
function Te(e, t) {
  e.activeBranch = t;
  const { vnode: i, parentComponent: s } = e,
    n = (i.el = t.el);
  s && s.subTree === i && ((s.vnode.el = n), en(s, n));
}
function nl(e, t) {
  if (ht) {
    let i = ht.provides;
    const s = ht.parent && ht.parent.provides;
    s === i && (i = ht.provides = Object.create(s)), (i[e] = t);
  }
}
function Ve(e, t, i = !1) {
  const s = ht || ft;
  if (s) {
    const n =
      s.parent == null
        ? s.vnode.appContext && s.vnode.appContext.provides
        : s.parent.provides;
    if (n && e in n) return n[e];
    if (arguments.length > 1) return i && j(t) ? t.call(s.proxy) : t;
  }
}
function ol(e, t) {
  return nn(e, null, { flush: "post" });
}
const wi = {};
function Oi(e, t, i) {
  return nn(e, t, i);
}
function nn(
  e,
  t,
  { immediate: i, deep: s, flush: n, onTrack: o, onTrigger: r } = it
) {
  const a = ht;
  let l,
    c = !1,
    h = !1;
  if (
    (lt(e)
      ? ((l = () => e.value), (c = Mi(e)))
      : Gt(e)
      ? ((l = () => e), (s = !0))
      : N(e)
      ? ((h = !0),
        (c = e.some((C) => Gt(C) || Mi(C))),
        (l = () =>
          e.map((C) => {
            if (lt(C)) return C.value;
            if (Gt(C)) return pe(C);
            if (j(C)) return te(C, a, 2);
          })))
      : j(e)
      ? t
        ? (l = () => te(e, a, 2))
        : (l = () => {
            if (!(a && a.isUnmounted)) return u && u(), Mt(e, a, 3, [f]);
          })
      : (l = St),
    t && s)
  ) {
    const C = l;
    l = () => pe(C());
  }
  let u,
    f = (C) => {
      u = z.onStop = () => {
        te(C, a, 4);
      };
    },
    v;
  if (Se)
    if (
      ((f = St),
      t ? i && Mt(t, a, 3, [l(), h ? [] : void 0, f]) : l(),
      n === "sync")
    ) {
      const C = ic();
      v = C.__watcherHandles || (C.__watcherHandles = []);
    } else return St;
  let g = h ? new Array(e.length).fill(wi) : wi;
  const y = () => {
    if (!!z.active)
      if (t) {
        const C = z.run();
        (s || c || (h ? C.some((R, k) => ti(R, g[k])) : ti(C, g))) &&
          (u && u(),
          Mt(t, a, 3, [C, g === wi ? void 0 : h && g[0] === wi ? [] : g, f]),
          (g = C));
      } else z.run();
  };
  y.allowRecurse = !!t;
  let E;
  n === "sync"
    ? (E = y)
    : n === "post"
    ? (E = () => mt(y, a && a.suspense))
    : ((y.pre = !0), a && (y.id = a.uid), (E = () => Ni(y)));
  const z = new Ys(l, E);
  t
    ? i
      ? y()
      : (g = z.run())
    : n === "post"
    ? mt(z.run.bind(z), a && a.suspense)
    : z.run();
  const x = () => {
    z.stop(), a && a.scope && js(a.scope.effects, z);
  };
  return v && v.push(x), x;
}
function rl(e, t, i) {
  const s = this.proxy,
    n = ut(e) ? (e.includes(".") ? Jo(s, e) : () => s[e]) : e.bind(s, s);
  let o;
  j(t) ? (o = t) : ((o = t.handler), (i = t));
  const r = ht;
  ne(this);
  const a = nn(n, o.bind(s), i);
  return r ? ne(r) : ee(), a;
}
function Jo(e, t) {
  const i = t.split(".");
  return () => {
    let s = e;
    for (let n = 0; n < i.length && s; n++) s = s[i[n]];
    return s;
  };
}
function pe(e, t) {
  if (!st(e) || e.__v_skip || ((t = t || new Set()), t.has(e))) return e;
  if ((t.add(e), lt(e))) pe(e.value, t);
  else if (N(e)) for (let i = 0; i < e.length; i++) pe(e[i], t);
  else if (xo(e) || Ce(e))
    e.forEach((i) => {
      pe(i, t);
    });
  else if (Oo(e)) for (const i in e) pe(e[i], t);
  return e;
}
function Xo() {
  const e = {
    isMounted: !1,
    isLeaving: !1,
    isUnmounting: !1,
    leavingVNodes: new Map(),
  };
  return (
    ui(() => {
      e.isMounted = !0;
    }),
    rn(() => {
      e.isUnmounting = !0;
    }),
    e
  );
}
const Tt = [Function, Array],
  al = {
    name: "BaseTransition",
    props: {
      mode: String,
      appear: Boolean,
      persisted: Boolean,
      onBeforeEnter: Tt,
      onEnter: Tt,
      onAfterEnter: Tt,
      onEnterCancelled: Tt,
      onBeforeLeave: Tt,
      onLeave: Tt,
      onAfterLeave: Tt,
      onLeaveCancelled: Tt,
      onBeforeAppear: Tt,
      onAppear: Tt,
      onAfterAppear: Tt,
      onAppearCancelled: Tt,
    },
    setup(e, { slots: t }) {
      const i = hi(),
        s = Xo();
      let n;
      return () => {
        const o = t.default && on(t.default(), !0);
        if (!o || !o.length) return;
        let r = o[0];
        if (o.length > 1) {
          for (const y of o)
            if (y.type !== bt) {
              r = y;
              break;
            }
        }
        const a = q(e),
          { mode: l } = a;
        if (s.isLeaving) return ss(r);
        const c = Ln(r);
        if (!c) return ss(r);
        const h = oi(c, a, s, i);
        ri(c, h);
        const u = i.subTree,
          f = u && Ln(u);
        let v = !1;
        const { getTransitionKey: g } = c.type;
        if (g) {
          const y = g();
          n === void 0 ? (n = y) : y !== n && ((n = y), (v = !0));
        }
        if (f && f.type !== bt && (!Ht(c, f) || v)) {
          const y = oi(f, a, s, i);
          if ((ri(f, y), l === "out-in"))
            return (
              (s.isLeaving = !0),
              (y.afterLeave = () => {
                (s.isLeaving = !1), i.update.active !== !1 && i.update();
              }),
              ss(r)
            );
          l === "in-out" &&
            c.type !== bt &&
            (y.delayLeave = (E, z, x) => {
              const C = Go(s, f);
              (C[String(f.key)] = f),
                (E._leaveCb = () => {
                  z(), (E._leaveCb = void 0), delete h.delayedLeave;
                }),
                (h.delayedLeave = x);
            });
        }
        return r;
      };
    },
  },
  Zo = al;
function Go(e, t) {
  const { leavingVNodes: i } = e;
  let s = i.get(t.type);
  return s || ((s = Object.create(null)), i.set(t.type, s)), s;
}
function oi(e, t, i, s) {
  const {
      appear: n,
      mode: o,
      persisted: r = !1,
      onBeforeEnter: a,
      onEnter: l,
      onAfterEnter: c,
      onEnterCancelled: h,
      onBeforeLeave: u,
      onLeave: f,
      onAfterLeave: v,
      onLeaveCancelled: g,
      onBeforeAppear: y,
      onAppear: E,
      onAfterAppear: z,
      onAppearCancelled: x,
    } = t,
    C = String(e.key),
    R = Go(i, e),
    k = (O, H) => {
      O && Mt(O, s, 9, H);
    },
    B = (O, H) => {
      const U = H[1];
      k(O, H),
        N(O) ? O.every((W) => W.length <= 1) && U() : O.length <= 1 && U();
    },
    L = {
      mode: o,
      persisted: r,
      beforeEnter(O) {
        let H = a;
        if (!i.isMounted)
          if (n) H = y || a;
          else return;
        O._leaveCb && O._leaveCb(!0);
        const U = R[C];
        U && Ht(e, U) && U.el._leaveCb && U.el._leaveCb(), k(H, [O]);
      },
      enter(O) {
        let H = l,
          U = c,
          W = h;
        if (!i.isMounted)
          if (n) (H = E || l), (U = z || c), (W = x || h);
          else return;
        let A = !1;
        const J = (O._enterCb = (Z) => {
          A ||
            ((A = !0),
            Z ? k(W, [O]) : k(U, [O]),
            L.delayedLeave && L.delayedLeave(),
            (O._enterCb = void 0));
        });
        H ? B(H, [O, J]) : J();
      },
      leave(O, H) {
        const U = String(e.key);
        if ((O._enterCb && O._enterCb(!0), i.isUnmounting)) return H();
        k(u, [O]);
        let W = !1;
        const A = (O._leaveCb = (J) => {
          W ||
            ((W = !0),
            H(),
            J ? k(g, [O]) : k(v, [O]),
            (O._leaveCb = void 0),
            R[U] === e && delete R[U]);
        });
        (R[U] = e), f ? B(f, [O, A]) : A();
      },
      clone(O) {
        return oi(O, t, i, s);
      },
    };
  return L;
}
function ss(e) {
  if (ci(e)) return (e = se(e)), (e.children = null), e;
}
function Ln(e) {
  return ci(e) ? (e.children ? e.children[0] : void 0) : e;
}
function ri(e, t) {
  e.shapeFlag & 6 && e.component
    ? ri(e.component.subTree, t)
    : e.shapeFlag & 128
    ? ((e.ssContent.transition = t.clone(e.ssContent)),
      (e.ssFallback.transition = t.clone(e.ssFallback)))
    : (e.transition = t);
}
function on(e, t = !1, i) {
  let s = [],
    n = 0;
  for (let o = 0; o < e.length; o++) {
    let r = e[o];
    const a = i == null ? r.key : String(i) + String(r.key != null ? r.key : o);
    r.type === yt
      ? (r.patchFlag & 128 && n++, (s = s.concat(on(r.children, t, a))))
      : (t || r.type !== bt) && s.push(a != null ? se(r, { key: a }) : r);
  }
  if (n > 1) for (let o = 0; o < s.length; o++) s[o].patchFlag = -2;
  return s;
}
function ji(e) {
  return j(e) ? { setup: e, name: e.name } : e;
}
const Ke = (e) => !!e.type.__asyncLoader;
function ll(e) {
  j(e) && (e = { loader: e });
  const {
    loader: t,
    loadingComponent: i,
    errorComponent: s,
    delay: n = 200,
    timeout: o,
    suspensible: r = !0,
    onError: a,
  } = e;
  let l = null,
    c,
    h = 0;
  const u = () => (h++, (l = null), f()),
    f = () => {
      let v;
      return (
        l ||
        (v = l =
          t()
            .catch((g) => {
              if (((g = g instanceof Error ? g : new Error(String(g))), a))
                return new Promise((y, E) => {
                  a(
                    g,
                    () => y(u()),
                    () => E(g),
                    h + 1
                  );
                });
              throw g;
            })
            .then((g) =>
              v !== l && l
                ? l
                : (g &&
                    (g.__esModule || g[Symbol.toStringTag] === "Module") &&
                    (g = g.default),
                  (c = g),
                  g)
            ))
      );
    };
  return ji({
    name: "AsyncComponentWrapper",
    __asyncLoader: f,
    get __asyncResolved() {
      return c;
    },
    setup() {
      const v = ht;
      if (c) return () => ns(c, v);
      const g = (x) => {
        (l = null), De(x, v, 13, !s);
      };
      if ((r && v.suspense) || Se)
        return f()
          .then((x) => () => ns(x, v))
          .catch((x) => (g(x), () => (s ? rt(s, { error: x }) : null)));
      const y = me(!1),
        E = me(),
        z = me(!!n);
      return (
        n &&
          setTimeout(() => {
            z.value = !1;
          }, n),
        o != null &&
          setTimeout(() => {
            if (!y.value && !E.value) {
              const x = new Error(`Async component timed out after ${o}ms.`);
              g(x), (E.value = x);
            }
          }, o),
        f()
          .then(() => {
            (y.value = !0),
              v.parent && ci(v.parent.vnode) && Ni(v.parent.update);
          })
          .catch((x) => {
            g(x), (E.value = x);
          }),
        () => {
          if (y.value && c) return ns(c, v);
          if (E.value && s) return rt(s, { error: E.value });
          if (i && !z.value) return rt(i);
        }
      );
    },
  });
}
function ns(e, t) {
  const { ref: i, props: s, children: n, ce: o } = t.vnode,
    r = rt(e, s, n);
  return (r.ref = i), (r.ce = o), delete t.vnode.ce, r;
}
const ci = (e) => e.type.__isKeepAlive;
function cl(e, t) {
  tr(e, "a", t);
}
function ul(e, t) {
  tr(e, "da", t);
}
function tr(e, t, i = ht) {
  const s =
    e.__wdc ||
    (e.__wdc = () => {
      let n = i;
      for (; n; ) {
        if (n.isDeactivated) return;
        n = n.parent;
      }
      return e();
    });
  if ((Wi(t, s, i), i)) {
    let n = i.parent;
    for (; n && n.parent; )
      ci(n.parent.vnode) && hl(s, t, i, n), (n = n.parent);
  }
}
function hl(e, t, i, s) {
  const n = Wi(t, e, s, !0);
  an(() => {
    js(s[t], n);
  }, i);
}
function Wi(e, t, i = ht, s = !1) {
  if (i) {
    const n = i[e] || (i[e] = []),
      o =
        t.__weh ||
        (t.__weh = (...r) => {
          if (i.isUnmounted) return;
          Re(), ne(i);
          const a = Mt(t, i, e, r);
          return ee(), Fe(), a;
        });
    return s ? n.unshift(o) : n.push(o), o;
  }
}
const Kt =
    (e) =>
    (t, i = ht) =>
      (!Se || e === "sp") && Wi(e, (...s) => t(...s), i),
  dl = Kt("bm"),
  ui = Kt("m"),
  fl = Kt("bu"),
  er = Kt("u"),
  rn = Kt("bum"),
  an = Kt("um"),
  pl = Kt("sp"),
  gl = Kt("rtg"),
  vl = Kt("rtc");
function ml(e, t = ht) {
  Wi("ec", e, t);
}
function ld(e, t) {
  const i = ft;
  if (i === null) return e;
  const s = Yi(i) || i.proxy,
    n = e.dirs || (e.dirs = []);
  for (let o = 0; o < t.length; o++) {
    let [r, a, l, c = it] = t[o];
    r &&
      (j(r) && (r = { mounted: r, updated: r }),
      r.deep && pe(a),
      n.push({
        dir: r,
        instance: s,
        value: a,
        oldValue: void 0,
        arg: l,
        modifiers: c,
      }));
  }
  return e;
}
function le(e, t, i, s) {
  const n = e.dirs,
    o = t && t.dirs;
  for (let r = 0; r < n.length; r++) {
    const a = n[r];
    o && (a.oldValue = o[r].value);
    let l = a.dir[s];
    l && (Re(), Mt(l, i, 8, [e.el, a, e, t]), Fe());
  }
}
const ir = "components",
  yl = "directives";
function cd(e, t) {
  return sr(ir, e, !0, t) || e;
}
const bl = Symbol();
function ud(e) {
  return sr(yl, e);
}
function sr(e, t, i = !0, s = !1) {
  const n = ft || ht;
  if (n) {
    const o = n.type;
    if (e === ir) {
      const a = Zl(o, !1);
      if (a && (a === t || a === Nt(t) || a === Ri(Nt(t)))) return o;
    }
    const r = Rn(n[e] || o[e], t) || Rn(n.appContext[e], t);
    return !r && s ? o : r;
  }
}
function Rn(e, t) {
  return e && (e[t] || e[Nt(t)] || e[Ri(Nt(t))]);
}
function hd(e, t, i, s) {
  let n;
  const o = i && i[s];
  if (N(e) || ut(e)) {
    n = new Array(e.length);
    for (let r = 0, a = e.length; r < a; r++)
      n[r] = t(e[r], r, void 0, o && o[r]);
  } else if (typeof e == "number") {
    n = new Array(e);
    for (let r = 0; r < e; r++) n[r] = t(r + 1, r, void 0, o && o[r]);
  } else if (st(e))
    if (e[Symbol.iterator])
      n = Array.from(e, (r, a) => t(r, a, void 0, o && o[a]));
    else {
      const r = Object.keys(e);
      n = new Array(r.length);
      for (let a = 0, l = r.length; a < l; a++) {
        const c = r[a];
        n[a] = t(e[c], c, a, o && o[a]);
      }
    }
  else n = [];
  return i && (i[s] = n), n;
}
function dd(e, t, i = {}, s, n) {
  if (ft.isCE || (ft.parent && Ke(ft.parent) && ft.parent.isCE))
    return t !== "default" && (i.name = t), rt("slot", i, s && s());
  let o = e[t];
  o && o._c && (o._d = !1), Be();
  const r = o && nr(o(i)),
    a = Ki(
      yt,
      { key: i.key || (r && r.key) || `_${t}` },
      r || (s ? s() : []),
      r && e._ === 1 ? 64 : -2
    );
  return (
    !n && a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]),
    o && o._c && (o._d = !0),
    a
  );
}
function nr(e) {
  return e.some((t) =>
    ai(t) ? !(t.type === bt || (t.type === yt && !nr(t.children))) : !0
  )
    ? e
    : null;
}
const Ps = (e) => (e ? (vr(e) ? Yi(e) || e.proxy : Ps(e.parent)) : null),
  qe = dt(Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Ps(e.parent),
    $root: (e) => Ps(e.root),
    $emit: (e) => e.emit,
    $options: (e) => ln(e),
    $forceUpdate: (e) => e.f || (e.f = () => Ni(e.update)),
    $nextTick: (e) => e.n || (e.n = Hi.bind(e.proxy)),
    $watch: (e) => rl.bind(e),
  }),
  os = (e, t) => e !== it && !e.__isScriptSetup && K(e, t),
  _l = {
    get({ _: e }, t) {
      const {
        ctx: i,
        setupState: s,
        data: n,
        props: o,
        accessCache: r,
        type: a,
        appContext: l,
      } = e;
      let c;
      if (t[0] !== "$") {
        const v = r[t];
        if (v !== void 0)
          switch (v) {
            case 1:
              return s[t];
            case 2:
              return n[t];
            case 4:
              return i[t];
            case 3:
              return o[t];
          }
        else {
          if (os(s, t)) return (r[t] = 1), s[t];
          if (n !== it && K(n, t)) return (r[t] = 2), n[t];
          if ((c = e.propsOptions[0]) && K(c, t)) return (r[t] = 3), o[t];
          if (i !== it && K(i, t)) return (r[t] = 4), i[t];
          Es && (r[t] = 0);
        }
      }
      const h = qe[t];
      let u, f;
      if (h) return t === "$attrs" && Ot(e, "get", t), h(e);
      if ((u = a.__cssModules) && (u = u[t])) return u;
      if (i !== it && K(i, t)) return (r[t] = 4), i[t];
      if (((f = l.config.globalProperties), K(f, t))) return f[t];
    },
    set({ _: e }, t, i) {
      const { data: s, setupState: n, ctx: o } = e;
      return os(n, t)
        ? ((n[t] = i), !0)
        : s !== it && K(s, t)
        ? ((s[t] = i), !0)
        : K(e.props, t) || (t[0] === "$" && t.slice(1) in e)
        ? !1
        : ((o[t] = i), !0);
    },
    has(
      {
        _: {
          data: e,
          setupState: t,
          accessCache: i,
          ctx: s,
          appContext: n,
          propsOptions: o,
        },
      },
      r
    ) {
      let a;
      return (
        !!i[r] ||
        (e !== it && K(e, r)) ||
        os(t, r) ||
        ((a = o[0]) && K(a, r)) ||
        K(s, r) ||
        K(qe, r) ||
        K(n.config.globalProperties, r)
      );
    },
    defineProperty(e, t, i) {
      return (
        i.get != null
          ? (e._.accessCache[t] = 0)
          : K(i, "value") && this.set(e, t, i.value, null),
        Reflect.defineProperty(e, t, i)
      );
    },
  };
let Es = !0;
function wl(e) {
  const t = ln(e),
    i = e.proxy,
    s = e.ctx;
  (Es = !1), t.beforeCreate && Fn(t.beforeCreate, e, "bc");
  const {
    data: n,
    computed: o,
    methods: r,
    watch: a,
    provide: l,
    inject: c,
    created: h,
    beforeMount: u,
    mounted: f,
    beforeUpdate: v,
    updated: g,
    activated: y,
    deactivated: E,
    beforeDestroy: z,
    beforeUnmount: x,
    destroyed: C,
    unmounted: R,
    render: k,
    renderTracked: B,
    renderTriggered: L,
    errorCaptured: O,
    serverPrefetch: H,
    expose: U,
    inheritAttrs: W,
    components: A,
    directives: J,
    filters: Z,
  } = t;
  if ((c && xl(c, s, null, e.appContext.config.unwrapInjectedRef), r))
    for (const Q in r) {
      const X = r[Q];
      j(X) && (s[Q] = X.bind(i));
    }
  if (n) {
    const Q = n.call(i, i);
    st(Q) && (e.data = Bi(Q));
  }
  if (((Es = !0), o))
    for (const Q in o) {
      const X = o[Q],
        re = j(X) ? X.bind(i, i) : j(X.get) ? X.get.bind(i, i) : St,
        pi = !j(X) && j(X.set) ? X.set.bind(i) : St,
        ae = dn({ get: re, set: pi });
      Object.defineProperty(s, Q, {
        enumerable: !0,
        configurable: !0,
        get: () => ae.value,
        set: (Lt) => (ae.value = Lt),
      });
    }
  if (a) for (const Q in a) or(a[Q], s, i, Q);
  if (l) {
    const Q = j(l) ? l.call(i) : l;
    Reflect.ownKeys(Q).forEach((X) => {
      nl(X, Q[X]);
    });
  }
  h && Fn(h, e, "c");
  function at(Q, X) {
    N(X) ? X.forEach((re) => Q(re.bind(i))) : X && Q(X.bind(i));
  }
  if (
    (at(dl, u),
    at(ui, f),
    at(fl, v),
    at(er, g),
    at(cl, y),
    at(ul, E),
    at(ml, O),
    at(vl, B),
    at(gl, L),
    at(rn, x),
    at(an, R),
    at(pl, H),
    N(U))
  )
    if (U.length) {
      const Q = e.exposed || (e.exposed = {});
      U.forEach((X) => {
        Object.defineProperty(Q, X, {
          get: () => i[X],
          set: (re) => (i[X] = re),
        });
      });
    } else e.exposed || (e.exposed = {});
  k && e.render === St && (e.render = k),
    W != null && (e.inheritAttrs = W),
    A && (e.components = A),
    J && (e.directives = J);
}
function xl(e, t, i = St, s = !1) {
  N(e) && (e = Ms(e));
  for (const n in e) {
    const o = e[n];
    let r;
    st(o)
      ? "default" in o
        ? (r = Ve(o.from || n, o.default, !0))
        : (r = Ve(o.from || n))
      : (r = Ve(o)),
      lt(r) && s
        ? Object.defineProperty(t, n, {
            enumerable: !0,
            configurable: !0,
            get: () => r.value,
            set: (a) => (r.value = a),
          })
        : (t[n] = r);
  }
}
function Fn(e, t, i) {
  Mt(N(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy), t, i);
}
function or(e, t, i, s) {
  const n = s.includes(".") ? Jo(i, s) : () => i[s];
  if (ut(e)) {
    const o = t[e];
    j(o) && Oi(n, o);
  } else if (j(e)) Oi(n, e.bind(i));
  else if (st(e))
    if (N(e)) e.forEach((o) => or(o, t, i, s));
    else {
      const o = j(e.handler) ? e.handler.bind(i) : t[e.handler];
      j(o) && Oi(n, o, e);
    }
}
function ln(e) {
  const t = e.type,
    { mixins: i, extends: s } = t,
    {
      mixins: n,
      optionsCache: o,
      config: { optionMergeStrategies: r },
    } = e.appContext,
    a = o.get(t);
  let l;
  return (
    a
      ? (l = a)
      : !n.length && !i && !s
      ? (l = t)
      : ((l = {}), n.length && n.forEach((c) => Ai(l, c, r, !0)), Ai(l, t, r)),
    st(t) && o.set(t, l),
    l
  );
}
function Ai(e, t, i, s = !1) {
  const { mixins: n, extends: o } = t;
  o && Ai(e, o, i, !0), n && n.forEach((r) => Ai(e, r, i, !0));
  for (const r in t)
    if (!(s && r === "expose")) {
      const a = Cl[r] || (i && i[r]);
      e[r] = a ? a(e[r], t[r]) : t[r];
    }
  return e;
}
const Cl = {
  data: Dn,
  props: he,
  emits: he,
  methods: he,
  computed: he,
  beforeCreate: vt,
  created: vt,
  beforeMount: vt,
  mounted: vt,
  beforeUpdate: vt,
  updated: vt,
  beforeDestroy: vt,
  beforeUnmount: vt,
  destroyed: vt,
  unmounted: vt,
  activated: vt,
  deactivated: vt,
  errorCaptured: vt,
  serverPrefetch: vt,
  components: he,
  directives: he,
  watch: Tl,
  provide: Dn,
  inject: Ol,
};
function Dn(e, t) {
  return t
    ? e
      ? function () {
          return dt(
            j(e) ? e.call(this, this) : e,
            j(t) ? t.call(this, this) : t
          );
        }
      : t
    : e;
}
function Ol(e, t) {
  return he(Ms(e), Ms(t));
}
function Ms(e) {
  if (N(e)) {
    const t = {};
    for (let i = 0; i < e.length; i++) t[e[i]] = e[i];
    return t;
  }
  return e;
}
function vt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function he(e, t) {
  return e ? dt(dt(Object.create(null), e), t) : t;
}
function Tl(e, t) {
  if (!e) return t;
  if (!t) return e;
  const i = dt(Object.create(null), e);
  for (const s in t) i[s] = vt(e[s], t[s]);
  return i;
}
function Pl(e, t, i, s = !1) {
  const n = {},
    o = {};
  Ei(o, qi, 1), (e.propsDefaults = Object.create(null)), rr(e, t, n, o);
  for (const r in e.propsOptions[0]) r in n || (n[r] = void 0);
  i ? (e.props = s ? n : Aa(n)) : e.type.props ? (e.props = n) : (e.props = o),
    (e.attrs = o);
}
function El(e, t, i, s) {
  const {
      props: n,
      attrs: o,
      vnode: { patchFlag: r },
    } = e,
    a = q(n),
    [l] = e.propsOptions;
  let c = !1;
  if ((s || r > 0) && !(r & 16)) {
    if (r & 8) {
      const h = e.vnode.dynamicProps;
      for (let u = 0; u < h.length; u++) {
        let f = h[u];
        if (Ui(e.emitsOptions, f)) continue;
        const v = t[f];
        if (l)
          if (K(o, f)) v !== o[f] && ((o[f] = v), (c = !0));
          else {
            const g = Nt(f);
            n[g] = Is(l, a, g, v, e, !1);
          }
        else v !== o[f] && ((o[f] = v), (c = !0));
      }
    }
  } else {
    rr(e, t, n, o) && (c = !0);
    let h;
    for (const u in a)
      (!t || (!K(t, u) && ((h = Le(u)) === u || !K(t, h)))) &&
        (l
          ? i &&
            (i[u] !== void 0 || i[h] !== void 0) &&
            (n[u] = Is(l, a, u, void 0, e, !0))
          : delete n[u]);
    if (o !== a)
      for (const u in o) (!t || (!K(t, u) && !0)) && (delete o[u], (c = !0));
  }
  c && Vt(e, "set", "$attrs");
}
function rr(e, t, i, s) {
  const [n, o] = e.propsOptions;
  let r = !1,
    a;
  if (t)
    for (let l in t) {
      if (Ci(l)) continue;
      const c = t[l];
      let h;
      n && K(n, (h = Nt(l)))
        ? !o || !o.includes(h)
          ? (i[h] = c)
          : ((a || (a = {}))[h] = c)
        : Ui(e.emitsOptions, l) ||
          ((!(l in s) || c !== s[l]) && ((s[l] = c), (r = !0)));
    }
  if (o) {
    const l = q(i),
      c = a || it;
    for (let h = 0; h < o.length; h++) {
      const u = o[h];
      i[u] = Is(n, l, u, c[u], e, !K(c, u));
    }
  }
  return r;
}
function Is(e, t, i, s, n, o) {
  const r = e[i];
  if (r != null) {
    const a = K(r, "default");
    if (a && s === void 0) {
      const l = r.default;
      if (r.type !== Function && j(l)) {
        const { propsDefaults: c } = n;
        i in c ? (s = c[i]) : (ne(n), (s = c[i] = l.call(null, t)), ee());
      } else s = l;
    }
    r[0] &&
      (o && !a ? (s = !1) : r[1] && (s === "" || s === Le(i)) && (s = !0));
  }
  return s;
}
function ar(e, t, i = !1) {
  const s = t.propsCache,
    n = s.get(e);
  if (n) return n;
  const o = e.props,
    r = {},
    a = [];
  let l = !1;
  if (!j(e)) {
    const h = (u) => {
      l = !0;
      const [f, v] = ar(u, t, !0);
      dt(r, f), v && a.push(...v);
    };
    !i && t.mixins.length && t.mixins.forEach(h),
      e.extends && h(e.extends),
      e.mixins && e.mixins.forEach(h);
  }
  if (!o && !l) return st(e) && s.set(e, xe), xe;
  if (N(o))
    for (let h = 0; h < o.length; h++) {
      const u = Nt(o[h]);
      Bn(u) && (r[u] = it);
    }
  else if (o)
    for (const h in o) {
      const u = Nt(h);
      if (Bn(u)) {
        const f = o[h],
          v = (r[u] = N(f) || j(f) ? { type: f } : Object.assign({}, f));
        if (v) {
          const g = Un(Boolean, v.type),
            y = Un(String, v.type);
          (v[0] = g > -1),
            (v[1] = y < 0 || g < y),
            (g > -1 || K(v, "default")) && a.push(u);
        }
      }
    }
  const c = [r, a];
  return st(e) && s.set(e, c), c;
}
function Bn(e) {
  return e[0] !== "$";
}
function Hn(e) {
  const t = e && e.toString().match(/^\s*function (\w+)/);
  return t ? t[1] : e === null ? "null" : "";
}
function Nn(e, t) {
  return Hn(e) === Hn(t);
}
function Un(e, t) {
  return N(t) ? t.findIndex((i) => Nn(i, e)) : j(t) && Nn(t, e) ? 0 : -1;
}
const lr = (e) => e[0] === "_" || e === "$stable",
  cn = (e) => (N(e) ? e.map(zt) : [zt(e)]),
  Ml = (e, t, i) => {
    if (t._n) return t;
    const s = Ts((...n) => cn(t(...n)), i);
    return (s._c = !1), s;
  },
  cr = (e, t, i) => {
    const s = e._ctx;
    for (const n in e) {
      if (lr(n)) continue;
      const o = e[n];
      if (j(o)) t[n] = Ml(n, o, s);
      else if (o != null) {
        const r = cn(o);
        t[n] = () => r;
      }
    }
  },
  ur = (e, t) => {
    const i = cn(t);
    e.slots.default = () => i;
  },
  Il = (e, t) => {
    if (e.vnode.shapeFlag & 32) {
      const i = t._;
      i ? ((e.slots = q(t)), Ei(t, "_", i)) : cr(t, (e.slots = {}));
    } else (e.slots = {}), t && ur(e, t);
    Ei(e.slots, qi, 1);
  },
  zl = (e, t, i) => {
    const { vnode: s, slots: n } = e;
    let o = !0,
      r = it;
    if (s.shapeFlag & 32) {
      const a = t._;
      a
        ? i && a === 1
          ? (o = !1)
          : (dt(n, t), !i && a === 1 && delete n._)
        : ((o = !t.$stable), cr(t, n)),
        (r = t);
    } else t && (ur(e, t), (r = { default: 1 }));
    if (o) for (const a in n) !lr(a) && !(a in r) && delete n[a];
  };
function hr() {
  return {
    app: null,
    config: {
      isNativeTag: Jr,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}
let Al = 0;
function Sl(e, t) {
  return function (s, n = null) {
    j(s) || (s = Object.assign({}, s)), n != null && !st(n) && (n = null);
    const o = hr(),
      r = new Set();
    let a = !1;
    const l = (o.app = {
      _uid: Al++,
      _component: s,
      _props: n,
      _container: null,
      _context: o,
      _instance: null,
      version: sc,
      get config() {
        return o.config;
      },
      set config(c) {},
      use(c, ...h) {
        return (
          r.has(c) ||
            (c && j(c.install)
              ? (r.add(c), c.install(l, ...h))
              : j(c) && (r.add(c), c(l, ...h))),
          l
        );
      },
      mixin(c) {
        return o.mixins.includes(c) || o.mixins.push(c), l;
      },
      component(c, h) {
        return h ? ((o.components[c] = h), l) : o.components[c];
      },
      directive(c, h) {
        return h ? ((o.directives[c] = h), l) : o.directives[c];
      },
      mount(c, h, u) {
        if (!a) {
          const f = rt(s, n);
          return (
            (f.appContext = o),
            h && t ? t(f, c) : e(f, c, u),
            (a = !0),
            (l._container = c),
            (c.__vue_app__ = l),
            Yi(f.component) || f.component.proxy
          );
        }
      },
      unmount() {
        a && (e(null, l._container), delete l._container.__vue_app__);
      },
      provide(c, h) {
        return (o.provides[c] = h), l;
      },
    });
    return l;
  };
}
function zs(e, t, i, s, n = !1) {
  if (N(e)) {
    e.forEach((f, v) => zs(f, t && (N(t) ? t[v] : t), i, s, n));
    return;
  }
  if (Ke(s) && !n) return;
  const o = s.shapeFlag & 4 ? Yi(s.component) || s.component.proxy : s.el,
    r = n ? null : o,
    { i: a, r: l } = e,
    c = t && t.r,
    h = a.refs === it ? (a.refs = {}) : a.refs,
    u = a.setupState;
  if (
    (c != null &&
      c !== l &&
      (ut(c)
        ? ((h[c] = null), K(u, c) && (u[c] = null))
        : lt(c) && (c.value = null)),
    j(l))
  )
    te(l, a, 12, [r, h]);
  else {
    const f = ut(l),
      v = lt(l);
    if (f || v) {
      const g = () => {
        if (e.f) {
          const y = f ? (K(u, l) ? u[l] : h[l]) : l.value;
          n
            ? N(y) && js(y, o)
            : N(y)
            ? y.includes(o) || y.push(o)
            : f
            ? ((h[l] = [o]), K(u, l) && (u[l] = h[l]))
            : ((l.value = [o]), e.k && (h[e.k] = l.value));
        } else
          f
            ? ((h[l] = r), K(u, l) && (u[l] = r))
            : v && ((l.value = r), e.k && (h[e.k] = r));
      };
      r ? ((g.id = -1), mt(g, i)) : g();
    }
  }
}
const mt = sl;
function kl(e) {
  return Ll(e);
}
function Ll(e, t) {
  const i = ia();
  i.__VUE__ = !0;
  const {
      insert: s,
      remove: n,
      patchProp: o,
      createElement: r,
      createText: a,
      createComment: l,
      setText: c,
      setElementText: h,
      parentNode: u,
      nextSibling: f,
      setScopeId: v = St,
      insertStaticContent: g,
    } = e,
    y = (
      d,
      p,
      m,
      _ = null,
      b = null,
      P = null,
      I = !1,
      T = null,
      M = !!p.dynamicChildren
    ) => {
      if (d === p) return;
      d && !Ht(d, p) && ((_ = gi(d)), Lt(d, b, P, !0), (d = null)),
        p.patchFlag === -2 && ((M = !1), (p.dynamicChildren = null));
      const { type: w, ref: F, shapeFlag: S } = p;
      switch (w) {
        case Vi:
          E(d, p, m, _);
          break;
        case bt:
          z(d, p, m, _);
          break;
        case Qe:
          d == null && x(p, m, _, I);
          break;
        case yt:
          A(d, p, m, _, b, P, I, T, M);
          break;
        default:
          S & 1
            ? k(d, p, m, _, b, P, I, T, M)
            : S & 6
            ? J(d, p, m, _, b, P, I, T, M)
            : (S & 64 || S & 128) && w.process(d, p, m, _, b, P, I, T, M, ye);
      }
      F != null && b && zs(F, d && d.ref, P, p || d, !p);
    },
    E = (d, p, m, _) => {
      if (d == null) s((p.el = a(p.children)), m, _);
      else {
        const b = (p.el = d.el);
        p.children !== d.children && c(b, p.children);
      }
    },
    z = (d, p, m, _) => {
      d == null ? s((p.el = l(p.children || "")), m, _) : (p.el = d.el);
    },
    x = (d, p, m, _) => {
      [d.el, d.anchor] = g(d.children, p, m, _, d.el, d.anchor);
    },
    C = ({ el: d, anchor: p }, m, _) => {
      let b;
      for (; d && d !== p; ) (b = f(d)), s(d, m, _), (d = b);
      s(p, m, _);
    },
    R = ({ el: d, anchor: p }) => {
      let m;
      for (; d && d !== p; ) (m = f(d)), n(d), (d = m);
      n(p);
    },
    k = (d, p, m, _, b, P, I, T, M) => {
      (I = I || p.type === "svg"),
        d == null ? B(p, m, _, b, P, I, T, M) : H(d, p, b, P, I, T, M);
    },
    B = (d, p, m, _, b, P, I, T) => {
      let M, w;
      const { type: F, props: S, shapeFlag: D, transition: $, dirs: V } = d;
      if (
        ((M = d.el = r(d.type, P, S && S.is, S)),
        D & 8
          ? h(M, d.children)
          : D & 16 &&
            O(d.children, M, null, _, b, P && F !== "foreignObject", I, T),
        V && le(d, null, _, "created"),
        S)
      ) {
        for (const G in S)
          G !== "value" &&
            !Ci(G) &&
            o(M, G, null, S[G], P, d.children, _, b, Ut);
        "value" in S && o(M, "value", null, S.value),
          (w = S.onVnodeBeforeMount) && Ft(w, _, d);
      }
      L(M, d, d.scopeId, I, _), V && le(d, null, _, "beforeMount");
      const tt = (!b || (b && !b.pendingBranch)) && $ && !$.persisted;
      tt && $.beforeEnter(M),
        s(M, p, m),
        ((w = S && S.onVnodeMounted) || tt || V) &&
          mt(() => {
            w && Ft(w, _, d), tt && $.enter(M), V && le(d, null, _, "mounted");
          }, b);
    },
    L = (d, p, m, _, b) => {
      if ((m && v(d, m), _)) for (let P = 0; P < _.length; P++) v(d, _[P]);
      if (b) {
        let P = b.subTree;
        if (p === P) {
          const I = b.vnode;
          L(d, I, I.scopeId, I.slotScopeIds, b.parent);
        }
      }
    },
    O = (d, p, m, _, b, P, I, T, M = 0) => {
      for (let w = M; w < d.length; w++) {
        const F = (d[w] = T ? Jt(d[w]) : zt(d[w]));
        y(null, F, p, m, _, b, P, I, T);
      }
    },
    H = (d, p, m, _, b, P, I) => {
      const T = (p.el = d.el);
      let { patchFlag: M, dynamicChildren: w, dirs: F } = p;
      M |= d.patchFlag & 16;
      const S = d.props || it,
        D = p.props || it;
      let $;
      m && ce(m, !1),
        ($ = D.onVnodeBeforeUpdate) && Ft($, m, p, d),
        F && le(p, d, m, "beforeUpdate"),
        m && ce(m, !0);
      const V = b && p.type !== "foreignObject";
      if (
        (w
          ? U(d.dynamicChildren, w, T, m, _, V, P)
          : I || X(d, p, T, null, m, _, V, P, !1),
        M > 0)
      ) {
        if (M & 16) W(T, p, S, D, m, _, b);
        else if (
          (M & 2 && S.class !== D.class && o(T, "class", null, D.class, b),
          M & 4 && o(T, "style", S.style, D.style, b),
          M & 8)
        ) {
          const tt = p.dynamicProps;
          for (let G = 0; G < tt.length; G++) {
            const ct = tt[G],
              It = S[ct],
              be = D[ct];
            (be !== It || ct === "value") &&
              o(T, ct, It, be, b, d.children, m, _, Ut);
          }
        }
        M & 1 && d.children !== p.children && h(T, p.children);
      } else !I && w == null && W(T, p, S, D, m, _, b);
      (($ = D.onVnodeUpdated) || F) &&
        mt(() => {
          $ && Ft($, m, p, d), F && le(p, d, m, "updated");
        }, _);
    },
    U = (d, p, m, _, b, P, I) => {
      for (let T = 0; T < p.length; T++) {
        const M = d[T],
          w = p[T],
          F =
            M.el && (M.type === yt || !Ht(M, w) || M.shapeFlag & 70)
              ? u(M.el)
              : m;
        y(M, w, F, null, _, b, P, I, !0);
      }
    },
    W = (d, p, m, _, b, P, I) => {
      if (m !== _) {
        if (m !== it)
          for (const T in m)
            !Ci(T) && !(T in _) && o(d, T, m[T], null, I, p.children, b, P, Ut);
        for (const T in _) {
          if (Ci(T)) continue;
          const M = _[T],
            w = m[T];
          M !== w && T !== "value" && o(d, T, w, M, I, p.children, b, P, Ut);
        }
        "value" in _ && o(d, "value", m.value, _.value);
      }
    },
    A = (d, p, m, _, b, P, I, T, M) => {
      const w = (p.el = d ? d.el : a("")),
        F = (p.anchor = d ? d.anchor : a(""));
      let { patchFlag: S, dynamicChildren: D, slotScopeIds: $ } = p;
      $ && (T = T ? T.concat($) : $),
        d == null
          ? (s(w, m, _), s(F, m, _), O(p.children, m, F, b, P, I, T, M))
          : S > 0 && S & 64 && D && d.dynamicChildren
          ? (U(d.dynamicChildren, D, m, b, P, I, T),
            (p.key != null || (b && p === b.subTree)) && un(d, p, !0))
          : X(d, p, m, F, b, P, I, T, M);
    },
    J = (d, p, m, _, b, P, I, T, M) => {
      (p.slotScopeIds = T),
        d == null
          ? p.shapeFlag & 512
            ? b.ctx.activate(p, m, _, I, M)
            : Z(p, m, _, b, P, I, M)
          : Y(d, p, M);
    },
    Z = (d, p, m, _, b, P, I) => {
      const T = (d.component = ql(d, _, b));
      if ((ci(d) && (T.ctx.renderer = ye), Yl(T), T.asyncDep)) {
        if ((b && b.registerDep(T, at), !d.el)) {
          const M = (T.subTree = rt(bt));
          z(null, M, p, m);
        }
        return;
      }
      at(T, d, p, m, b, P, I);
    },
    Y = (d, p, m) => {
      const _ = (p.component = d.component);
      if (Qa(d, p, m))
        if (_.asyncDep && !_.asyncResolved) {
          Q(_, p, m);
          return;
        } else (_.next = p), Ua(_.update), _.update();
      else (p.el = d.el), (_.vnode = p);
    },
    at = (d, p, m, _, b, P, I) => {
      const T = () => {
          if (d.isMounted) {
            let { next: F, bu: S, u: D, parent: $, vnode: V } = d,
              tt = F,
              G;
            ce(d, !1),
              F ? ((F.el = V.el), Q(d, F, I)) : (F = V),
              S && es(S),
              (G = F.props && F.props.onVnodeBeforeUpdate) && Ft(G, $, F, V),
              ce(d, !0);
            const ct = is(d),
              It = d.subTree;
            (d.subTree = ct),
              y(It, ct, u(It.el), gi(It), d, b, P),
              (F.el = ct.el),
              tt === null && en(d, ct.el),
              D && mt(D, b),
              (G = F.props && F.props.onVnodeUpdated) &&
                mt(() => Ft(G, $, F, V), b);
          } else {
            let F;
            const { el: S, props: D } = p,
              { bm: $, m: V, parent: tt } = d,
              G = Ke(p);
            if (
              (ce(d, !1),
              $ && es($),
              !G && (F = D && D.onVnodeBeforeMount) && Ft(F, tt, p),
              ce(d, !0),
              S && Gi)
            ) {
              const ct = () => {
                (d.subTree = is(d)), Gi(S, d.subTree, d, b, null);
              };
              G
                ? p.type.__asyncLoader().then(() => !d.isUnmounted && ct())
                : ct();
            } else {
              const ct = (d.subTree = is(d));
              y(null, ct, m, _, d, b, P), (p.el = ct.el);
            }
            if ((V && mt(V, b), !G && (F = D && D.onVnodeMounted))) {
              const ct = p;
              mt(() => Ft(F, tt, ct), b);
            }
            (p.shapeFlag & 256 ||
              (tt && Ke(tt.vnode) && tt.vnode.shapeFlag & 256)) &&
              d.a &&
              mt(d.a, b),
              (d.isMounted = !0),
              (p = m = _ = null);
          }
        },
        M = (d.effect = new Ys(T, () => Ni(w), d.scope)),
        w = (d.update = () => M.run());
      (w.id = d.uid), ce(d, !0), w();
    },
    Q = (d, p, m) => {
      p.component = d;
      const _ = d.vnode.props;
      (d.vnode = p),
        (d.next = null),
        El(d, p.props, _, m),
        zl(d, p.children, m),
        Re(),
        An(),
        Fe();
    },
    X = (d, p, m, _, b, P, I, T, M = !1) => {
      const w = d && d.children,
        F = d ? d.shapeFlag : 0,
        S = p.children,
        { patchFlag: D, shapeFlag: $ } = p;
      if (D > 0) {
        if (D & 128) {
          pi(w, S, m, _, b, P, I, T, M);
          return;
        } else if (D & 256) {
          re(w, S, m, _, b, P, I, T, M);
          return;
        }
      }
      $ & 8
        ? (F & 16 && Ut(w, b, P), S !== w && h(m, S))
        : F & 16
        ? $ & 16
          ? pi(w, S, m, _, b, P, I, T, M)
          : Ut(w, b, P, !0)
        : (F & 8 && h(m, ""), $ & 16 && O(S, m, _, b, P, I, T, M));
    },
    re = (d, p, m, _, b, P, I, T, M) => {
      (d = d || xe), (p = p || xe);
      const w = d.length,
        F = p.length,
        S = Math.min(w, F);
      let D;
      for (D = 0; D < S; D++) {
        const $ = (p[D] = M ? Jt(p[D]) : zt(p[D]));
        y(d[D], $, m, null, b, P, I, T, M);
      }
      w > F ? Ut(d, b, P, !0, !1, S) : O(p, m, _, b, P, I, T, M, S);
    },
    pi = (d, p, m, _, b, P, I, T, M) => {
      let w = 0;
      const F = p.length;
      let S = d.length - 1,
        D = F - 1;
      for (; w <= S && w <= D; ) {
        const $ = d[w],
          V = (p[w] = M ? Jt(p[w]) : zt(p[w]));
        if (Ht($, V)) y($, V, m, null, b, P, I, T, M);
        else break;
        w++;
      }
      for (; w <= S && w <= D; ) {
        const $ = d[S],
          V = (p[D] = M ? Jt(p[D]) : zt(p[D]));
        if (Ht($, V)) y($, V, m, null, b, P, I, T, M);
        else break;
        S--, D--;
      }
      if (w > S) {
        if (w <= D) {
          const $ = D + 1,
            V = $ < F ? p[$].el : _;
          for (; w <= D; )
            y(null, (p[w] = M ? Jt(p[w]) : zt(p[w])), m, V, b, P, I, T, M), w++;
        }
      } else if (w > D) for (; w <= S; ) Lt(d[w], b, P, !0), w++;
      else {
        const $ = w,
          V = w,
          tt = new Map();
        for (w = V; w <= D; w++) {
          const _t = (p[w] = M ? Jt(p[w]) : zt(p[w]));
          _t.key != null && tt.set(_t.key, w);
        }
        let G,
          ct = 0;
        const It = D - V + 1;
        let be = !1,
          _n = 0;
        const He = new Array(It);
        for (w = 0; w < It; w++) He[w] = 0;
        for (w = $; w <= S; w++) {
          const _t = d[w];
          if (ct >= It) {
            Lt(_t, b, P, !0);
            continue;
          }
          let Rt;
          if (_t.key != null) Rt = tt.get(_t.key);
          else
            for (G = V; G <= D; G++)
              if (He[G - V] === 0 && Ht(_t, p[G])) {
                Rt = G;
                break;
              }
          Rt === void 0
            ? Lt(_t, b, P, !0)
            : ((He[Rt - V] = w + 1),
              Rt >= _n ? (_n = Rt) : (be = !0),
              y(_t, p[Rt], m, null, b, P, I, T, M),
              ct++);
        }
        const wn = be ? Rl(He) : xe;
        for (G = wn.length - 1, w = It - 1; w >= 0; w--) {
          const _t = V + w,
            Rt = p[_t],
            xn = _t + 1 < F ? p[_t + 1].el : _;
          He[w] === 0
            ? y(null, Rt, m, xn, b, P, I, T, M)
            : be && (G < 0 || w !== wn[G] ? ae(Rt, m, xn, 2) : G--);
        }
      }
    },
    ae = (d, p, m, _, b = null) => {
      const { el: P, type: I, transition: T, children: M, shapeFlag: w } = d;
      if (w & 6) {
        ae(d.component.subTree, p, m, _);
        return;
      }
      if (w & 128) {
        d.suspense.move(p, m, _);
        return;
      }
      if (w & 64) {
        I.move(d, p, m, ye);
        return;
      }
      if (I === yt) {
        s(P, p, m);
        for (let S = 0; S < M.length; S++) ae(M[S], p, m, _);
        s(d.anchor, p, m);
        return;
      }
      if (I === Qe) {
        C(d, p, m);
        return;
      }
      if (_ !== 2 && w & 1 && T)
        if (_ === 0) T.beforeEnter(P), s(P, p, m), mt(() => T.enter(P), b);
        else {
          const { leave: S, delayLeave: D, afterLeave: $ } = T,
            V = () => s(P, p, m),
            tt = () => {
              S(P, () => {
                V(), $ && $();
              });
            };
          D ? D(P, V, tt) : tt();
        }
      else s(P, p, m);
    },
    Lt = (d, p, m, _ = !1, b = !1) => {
      const {
        type: P,
        props: I,
        ref: T,
        children: M,
        dynamicChildren: w,
        shapeFlag: F,
        patchFlag: S,
        dirs: D,
      } = d;
      if ((T != null && zs(T, null, m, d, !0), F & 256)) {
        p.ctx.deactivate(d);
        return;
      }
      const $ = F & 1 && D,
        V = !Ke(d);
      let tt;
      if ((V && (tt = I && I.onVnodeBeforeUnmount) && Ft(tt, p, d), F & 6))
        $r(d.component, m, _);
      else {
        if (F & 128) {
          d.suspense.unmount(m, _);
          return;
        }
        $ && le(d, null, p, "beforeUnmount"),
          F & 64
            ? d.type.remove(d, p, m, b, ye, _)
            : w && (P !== yt || (S > 0 && S & 64))
            ? Ut(w, p, m, !1, !0)
            : ((P === yt && S & 384) || (!b && F & 16)) && Ut(M, p, m),
          _ && yn(d);
      }
      ((V && (tt = I && I.onVnodeUnmounted)) || $) &&
        mt(() => {
          tt && Ft(tt, p, d), $ && le(d, null, p, "unmounted");
        }, m);
    },
    yn = (d) => {
      const { type: p, el: m, anchor: _, transition: b } = d;
      if (p === yt) {
        Ur(m, _);
        return;
      }
      if (p === Qe) {
        R(d);
        return;
      }
      const P = () => {
        n(m), b && !b.persisted && b.afterLeave && b.afterLeave();
      };
      if (d.shapeFlag & 1 && b && !b.persisted) {
        const { leave: I, delayLeave: T } = b,
          M = () => I(m, P);
        T ? T(d.el, P, M) : M();
      } else P();
    },
    Ur = (d, p) => {
      let m;
      for (; d !== p; ) (m = f(d)), n(d), (d = m);
      n(p);
    },
    $r = (d, p, m) => {
      const { bum: _, scope: b, update: P, subTree: I, um: T } = d;
      _ && es(_),
        b.stop(),
        P && ((P.active = !1), Lt(I, d, p, m)),
        T && mt(T, p),
        mt(() => {
          d.isUnmounted = !0;
        }, p),
        p &&
          p.pendingBranch &&
          !p.isUnmounted &&
          d.asyncDep &&
          !d.asyncResolved &&
          d.suspenseId === p.pendingId &&
          (p.deps--, p.deps === 0 && p.resolve());
    },
    Ut = (d, p, m, _ = !1, b = !1, P = 0) => {
      for (let I = P; I < d.length; I++) Lt(d[I], p, m, _, b);
    },
    gi = (d) =>
      d.shapeFlag & 6
        ? gi(d.component.subTree)
        : d.shapeFlag & 128
        ? d.suspense.next()
        : f(d.anchor || d.el),
    bn = (d, p, m) => {
      d == null
        ? p._vnode && Lt(p._vnode, null, null, !0)
        : y(p._vnode || null, d, p, null, null, null, m),
        An(),
        qo(),
        (p._vnode = d);
    },
    ye = {
      p: y,
      um: Lt,
      m: ae,
      r: yn,
      mt: Z,
      mc: O,
      pc: X,
      pbc: U,
      n: gi,
      o: e,
    };
  let Zi, Gi;
  return (
    t && ([Zi, Gi] = t(ye)), { render: bn, hydrate: Zi, createApp: Sl(bn, Zi) }
  );
}
function ce({ effect: e, update: t }, i) {
  e.allowRecurse = t.allowRecurse = i;
}
function un(e, t, i = !1) {
  const s = e.children,
    n = t.children;
  if (N(s) && N(n))
    for (let o = 0; o < s.length; o++) {
      const r = s[o];
      let a = n[o];
      a.shapeFlag & 1 &&
        !a.dynamicChildren &&
        ((a.patchFlag <= 0 || a.patchFlag === 32) &&
          ((a = n[o] = Jt(n[o])), (a.el = r.el)),
        i || un(r, a)),
        a.type === Vi && (a.el = r.el);
    }
}
function Rl(e) {
  const t = e.slice(),
    i = [0];
  let s, n, o, r, a;
  const l = e.length;
  for (s = 0; s < l; s++) {
    const c = e[s];
    if (c !== 0) {
      if (((n = i[i.length - 1]), e[n] < c)) {
        (t[s] = n), i.push(s);
        continue;
      }
      for (o = 0, r = i.length - 1; o < r; )
        (a = (o + r) >> 1), e[i[a]] < c ? (o = a + 1) : (r = a);
      c < e[i[o]] && (o > 0 && (t[s] = i[o - 1]), (i[o] = s));
    }
  }
  for (o = i.length, r = i[o - 1]; o-- > 0; ) (i[o] = r), (r = t[r]);
  return i;
}
const Fl = (e) => e.__isTeleport,
  Ye = (e) => e && (e.disabled || e.disabled === ""),
  $n = (e) => typeof SVGElement < "u" && e instanceof SVGElement,
  As = (e, t) => {
    const i = e && e.to;
    return ut(i) ? (t ? t(i) : null) : i;
  },
  Dl = {
    __isTeleport: !0,
    process(e, t, i, s, n, o, r, a, l, c) {
      const {
          mc: h,
          pc: u,
          pbc: f,
          o: { insert: v, querySelector: g, createText: y, createComment: E },
        } = c,
        z = Ye(t.props);
      let { shapeFlag: x, children: C, dynamicChildren: R } = t;
      if (e == null) {
        const k = (t.el = y("")),
          B = (t.anchor = y(""));
        v(k, i, s), v(B, i, s);
        const L = (t.target = As(t.props, g)),
          O = (t.targetAnchor = y(""));
        L && (v(O, L), (r = r || $n(L)));
        const H = (U, W) => {
          x & 16 && h(C, U, W, n, o, r, a, l);
        };
        z ? H(i, B) : L && H(L, O);
      } else {
        t.el = e.el;
        const k = (t.anchor = e.anchor),
          B = (t.target = e.target),
          L = (t.targetAnchor = e.targetAnchor),
          O = Ye(e.props),
          H = O ? i : B,
          U = O ? k : L;
        if (
          ((r = r || $n(B)),
          R
            ? (f(e.dynamicChildren, R, H, n, o, r, a), un(e, t, !0))
            : l || u(e, t, H, U, n, o, r, a, !1),
          z)
        )
          O || xi(t, i, k, c, 1);
        else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
          const W = (t.target = As(t.props, g));
          W && xi(t, W, null, c, 0);
        } else O && xi(t, B, L, c, 1);
      }
      dr(t);
    },
    remove(e, t, i, s, { um: n, o: { remove: o } }, r) {
      const {
        shapeFlag: a,
        children: l,
        anchor: c,
        targetAnchor: h,
        target: u,
        props: f,
      } = e;
      if ((u && o(h), (r || !Ye(f)) && (o(c), a & 16)))
        for (let v = 0; v < l.length; v++) {
          const g = l[v];
          n(g, t, i, !0, !!g.dynamicChildren);
        }
    },
    move: xi,
    hydrate: Bl,
  };
function xi(e, t, i, { o: { insert: s }, m: n }, o = 2) {
  o === 0 && s(e.targetAnchor, t, i);
  const { el: r, anchor: a, shapeFlag: l, children: c, props: h } = e,
    u = o === 2;
  if ((u && s(r, t, i), (!u || Ye(h)) && l & 16))
    for (let f = 0; f < c.length; f++) n(c[f], t, i, 2);
  u && s(a, t, i);
}
function Bl(
  e,
  t,
  i,
  s,
  n,
  o,
  { o: { nextSibling: r, parentNode: a, querySelector: l } },
  c
) {
  const h = (t.target = As(t.props, l));
  if (h) {
    const u = h._lpa || h.firstChild;
    if (t.shapeFlag & 16)
      if (Ye(t.props))
        (t.anchor = c(r(e), t, a(e), i, s, n, o)), (t.targetAnchor = u);
      else {
        t.anchor = r(e);
        let f = u;
        for (; f; )
          if (
            ((f = r(f)), f && f.nodeType === 8 && f.data === "teleport anchor")
          ) {
            (t.targetAnchor = f),
              (h._lpa = t.targetAnchor && r(t.targetAnchor));
            break;
          }
        c(u, t, h, i, s, n, o);
      }
    dr(t);
  }
  return t.anchor && r(t.anchor);
}
const Hl = Dl;
function dr(e) {
  const t = e.ctx;
  if (t && t.ut) {
    let i = e.children[0].el;
    for (; i !== e.targetAnchor; )
      i.nodeType === 1 && i.setAttribute("data-v-owner", t.uid),
        (i = i.nextSibling);
    t.ut();
  }
}
const yt = Symbol(void 0),
  Vi = Symbol(void 0),
  bt = Symbol(void 0),
  Qe = Symbol(void 0),
  Je = [];
let Et = null;
function Be(e = !1) {
  Je.push((Et = e ? null : []));
}
function fr() {
  Je.pop(), (Et = Je[Je.length - 1] || null);
}
let Ae = 1;
function jn(e) {
  Ae += e;
}
function pr(e) {
  return (
    (e.dynamicChildren = Ae > 0 ? Et || xe : null),
    fr(),
    Ae > 0 && Et && Et.push(e),
    e
  );
}
function Nl(e, t, i, s, n, o) {
  return pr(Ct(e, t, i, s, n, o, !0));
}
function Ki(e, t, i, s, n) {
  return pr(rt(e, t, i, s, n, !0));
}
function ai(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Ht(e, t) {
  return e.type === t.type && e.key === t.key;
}
const qi = "__vInternal",
  gr = ({ key: e }) => (e != null ? e : null),
  Ti = ({ ref: e, ref_key: t, ref_for: i }) =>
    e != null
      ? ut(e) || lt(e) || j(e)
        ? { i: ft, r: e, k: t, f: !!i }
        : e
      : null;
function Ct(
  e,
  t = null,
  i = null,
  s = 0,
  n = null,
  o = e === yt ? 0 : 1,
  r = !1,
  a = !1
) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && gr(t),
    ref: t && Ti(t),
    scopeId: $i,
    slotScopeIds: null,
    children: i,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: s,
    dynamicProps: n,
    dynamicChildren: null,
    appContext: null,
    ctx: ft,
  };
  return (
    a
      ? (hn(l, i), o & 128 && e.normalize(l))
      : i && (l.shapeFlag |= ut(i) ? 8 : 16),
    Ae > 0 &&
      !r &&
      Et &&
      (l.patchFlag > 0 || o & 6) &&
      l.patchFlag !== 32 &&
      Et.push(l),
    l
  );
}
const rt = Ul;
function Ul(e, t = null, i = null, s = 0, n = null, o = !1) {
  if (((!e || e === bl) && (e = bt), ai(e))) {
    const a = se(e, t, !0);
    return (
      i && hn(a, i),
      Ae > 0 &&
        !o &&
        Et &&
        (a.shapeFlag & 6 ? (Et[Et.indexOf(e)] = a) : Et.push(a)),
      (a.patchFlag |= -2),
      a
    );
  }
  if ((Gl(e) && (e = e.__vccOpts), t)) {
    t = $l(t);
    let { class: a, style: l } = t;
    a && !ut(a) && (t.class = Us(a)),
      st(l) && (Bo(l) && !N(l) && (l = dt({}, l)), (t.style = Ns(l)));
  }
  const r = ut(e) ? 1 : Ja(e) ? 128 : Fl(e) ? 64 : st(e) ? 4 : j(e) ? 2 : 0;
  return Ct(e, t, i, s, n, r, o, !0);
}
function $l(e) {
  return e ? (Bo(e) || qi in e ? dt({}, e) : e) : null;
}
function se(e, t, i = !1) {
  const { props: s, ref: n, patchFlag: o, children: r } = e,
    a = t ? Wl(s || {}, t) : s;
  return {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && gr(a),
    ref:
      t && t.ref ? (i && n ? (N(n) ? n.concat(Ti(t)) : [n, Ti(t)]) : Ti(t)) : n,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: r,
    target: e.target,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    patchFlag: t && e.type !== yt ? (o === -1 ? 16 : o | 16) : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: e.transition,
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && se(e.ssContent),
    ssFallback: e.ssFallback && se(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
  };
}
function jl(e = " ", t = 0) {
  return rt(Vi, null, e, t);
}
function fd(e, t) {
  const i = rt(Qe, null, e);
  return (i.staticCount = t), i;
}
function pd(e = "", t = !1) {
  return t ? (Be(), Ki(bt, null, e)) : rt(bt, null, e);
}
function zt(e) {
  return e == null || typeof e == "boolean"
    ? rt(bt)
    : N(e)
    ? rt(yt, null, e.slice())
    : typeof e == "object"
    ? Jt(e)
    : rt(Vi, null, String(e));
}
function Jt(e) {
  return (e.el === null && e.patchFlag !== -1) || e.memo ? e : se(e);
}
function hn(e, t) {
  let i = 0;
  const { shapeFlag: s } = e;
  if (t == null) t = null;
  else if (N(t)) i = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const n = t.default;
      n && (n._c && (n._d = !1), hn(e, n()), n._c && (n._d = !0));
      return;
    } else {
      i = 32;
      const n = t._;
      !n && !(qi in t)
        ? (t._ctx = ft)
        : n === 3 &&
          ft &&
          (ft.slots._ === 1 ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)));
    }
  else
    j(t)
      ? ((t = { default: t, _ctx: ft }), (i = 32))
      : ((t = String(t)), s & 64 ? ((i = 16), (t = [jl(t)])) : (i = 8));
  (e.children = t), (e.shapeFlag |= i);
}
function Wl(...e) {
  const t = {};
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    for (const n in s)
      if (n === "class")
        t.class !== s.class && (t.class = Us([t.class, s.class]));
      else if (n === "style") t.style = Ns([t.style, s.style]);
      else if (Si(n)) {
        const o = t[n],
          r = s[n];
        r &&
          o !== r &&
          !(N(o) && o.includes(r)) &&
          (t[n] = o ? [].concat(o, r) : r);
      } else n !== "" && (t[n] = s[n]);
  }
  return t;
}
function Ft(e, t, i, s = null) {
  Mt(e, t, 7, [i, s]);
}
const Vl = hr();
let Kl = 0;
function ql(e, t, i) {
  const s = e.type,
    n = (t ? t.appContext : e.appContext) || Vl,
    o = {
      uid: Kl++,
      vnode: e,
      type: s,
      parent: t,
      appContext: n,
      root: null,
      next: null,
      subTree: null,
      effect: null,
      update: null,
      scope: new To(!0),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: t ? t.provides : Object.create(n.provides),
      accessCache: null,
      renderCache: [],
      components: null,
      directives: null,
      propsOptions: ar(s, n),
      emitsOptions: Qo(s, n),
      emit: null,
      emitted: null,
      propsDefaults: it,
      inheritAttrs: s.inheritAttrs,
      ctx: it,
      data: it,
      props: it,
      attrs: it,
      slots: it,
      refs: it,
      setupState: it,
      setupContext: null,
      suspense: i,
      suspenseId: i ? i.pendingId : 0,
      asyncDep: null,
      asyncResolved: !1,
      isMounted: !1,
      isUnmounted: !1,
      isDeactivated: !1,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null,
    };
  return (
    (o.ctx = { _: o }),
    (o.root = t ? t.root : o),
    (o.emit = ja.bind(null, o)),
    e.ce && e.ce(o),
    o
  );
}
let ht = null;
const hi = () => ht || ft,
  ne = (e) => {
    (ht = e), e.scope.on();
  },
  ee = () => {
    ht && ht.scope.off(), (ht = null);
  };
function vr(e) {
  return e.vnode.shapeFlag & 4;
}
let Se = !1;
function Yl(e, t = !1) {
  Se = t;
  const { props: i, children: s } = e.vnode,
    n = vr(e);
  Pl(e, i, n, t), Il(e, s);
  const o = n ? Ql(e, t) : void 0;
  return (Se = !1), o;
}
function Ql(e, t) {
  const i = e.type;
  (e.accessCache = Object.create(null)), (e.proxy = ze(new Proxy(e.ctx, _l)));
  const { setup: s } = i;
  if (s) {
    const n = (e.setupContext = s.length > 1 ? Xl(e) : null);
    ne(e), Re();
    const o = te(s, e, 0, [e.props, n]);
    if ((Fe(), ee(), Vs(o))) {
      if ((o.then(ee, ee), t))
        return o
          .then((r) => {
            Ss(e, r, t);
          })
          .catch((r) => {
            De(r, e, 0);
          });
      e.asyncDep = o;
    } else Ss(e, o, t);
  } else mr(e, t);
}
function Ss(e, t, i) {
  j(t)
    ? e.type.__ssrInlineRender
      ? (e.ssrRender = t)
      : (e.render = t)
    : st(t) && (e.setupState = $o(t)),
    mr(e, i);
}
let Wn;
function mr(e, t, i) {
  const s = e.type;
  if (!e.render) {
    if (!t && Wn && !s.render) {
      const n = s.template || ln(e).template;
      if (n) {
        const { isCustomElement: o, compilerOptions: r } = e.appContext.config,
          { delimiters: a, compilerOptions: l } = s,
          c = dt(dt({ isCustomElement: o, delimiters: a }, r), l);
        s.render = Wn(n, c);
      }
    }
    e.render = s.render || St;
  }
  ne(e), Re(), wl(e), Fe(), ee();
}
function Jl(e) {
  return new Proxy(e.attrs, {
    get(t, i) {
      return Ot(e, "get", "$attrs"), t[i];
    },
  });
}
function Xl(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  let i;
  return {
    get attrs() {
      return i || (i = Jl(e));
    },
    slots: e.slots,
    emit: e.emit,
    expose: t,
  };
}
function Yi(e) {
  if (e.exposed)
    return (
      e.exposeProxy ||
      (e.exposeProxy = new Proxy($o(ze(e.exposed)), {
        get(t, i) {
          if (i in t) return t[i];
          if (i in qe) return qe[i](e);
        },
        has(t, i) {
          return i in t || i in qe;
        },
      }))
    );
}
function Zl(e, t = !0) {
  return j(e) ? e.displayName || e.name : e.name || (t && e.__name);
}
function Gl(e) {
  return j(e) && "__vccOpts" in e;
}
const dn = (e, t) => Ba(e, t, Se);
function gd(e) {
  const t = hi();
  let i = e();
  return (
    ee(),
    Vs(i) &&
      (i = i.catch((s) => {
        throw (ne(t), s);
      })),
    [i, () => ne(t)]
  );
}
function tc(e, t, i) {
  const s = arguments.length;
  return s === 2
    ? st(t) && !N(t)
      ? ai(t)
        ? rt(e, null, [t])
        : rt(e, t)
      : rt(e, null, t)
    : (s > 3
        ? (i = Array.prototype.slice.call(arguments, 2))
        : s === 3 && ai(i) && (i = [i]),
      rt(e, t, i));
}
const ec = Symbol(""),
  ic = () => Ve(ec),
  sc = "3.2.45",
  nc = "http://www.w3.org/2000/svg",
  fe = typeof document < "u" ? document : null,
  Vn = fe && fe.createElement("template"),
  oc = {
    insert: (e, t, i) => {
      t.insertBefore(e, i || null);
    },
    remove: (e) => {
      const t = e.parentNode;
      t && t.removeChild(e);
    },
    createElement: (e, t, i, s) => {
      const n = t
        ? fe.createElementNS(nc, e)
        : fe.createElement(e, i ? { is: i } : void 0);
      return (
        e === "select" &&
          s &&
          s.multiple != null &&
          n.setAttribute("multiple", s.multiple),
        n
      );
    },
    createText: (e) => fe.createTextNode(e),
    createComment: (e) => fe.createComment(e),
    setText: (e, t) => {
      e.nodeValue = t;
    },
    setElementText: (e, t) => {
      e.textContent = t;
    },
    parentNode: (e) => e.parentNode,
    nextSibling: (e) => e.nextSibling,
    querySelector: (e) => fe.querySelector(e),
    setScopeId(e, t) {
      e.setAttribute(t, "");
    },
    insertStaticContent(e, t, i, s, n, o) {
      const r = i ? i.previousSibling : t.lastChild;
      if (n && (n === o || n.nextSibling))
        for (
          ;
          t.insertBefore(n.cloneNode(!0), i),
            !(n === o || !(n = n.nextSibling));

        );
      else {
        Vn.innerHTML = s ? `<svg>${e}</svg>` : e;
        const a = Vn.content;
        if (s) {
          const l = a.firstChild;
          for (; l.firstChild; ) a.appendChild(l.firstChild);
          a.removeChild(l);
        }
        t.insertBefore(a, i);
      }
      return [
        r ? r.nextSibling : t.firstChild,
        i ? i.previousSibling : t.lastChild,
      ];
    },
  };
function rc(e, t, i) {
  const s = e._vtc;
  s && (t = (t ? [t, ...s] : [...s]).join(" ")),
    t == null
      ? e.removeAttribute("class")
      : i
      ? e.setAttribute("class", t)
      : (e.className = t);
}
function ac(e, t, i) {
  const s = e.style,
    n = ut(i);
  if (i && !n) {
    for (const o in i) ks(s, o, i[o]);
    if (t && !ut(t)) for (const o in t) i[o] == null && ks(s, o, "");
  } else {
    const o = s.display;
    n ? t !== i && (s.cssText = i) : t && e.removeAttribute("style"),
      "_vod" in e && (s.display = o);
  }
}
const Kn = /\s*!important$/;
function ks(e, t, i) {
  if (N(i)) i.forEach((s) => ks(e, t, s));
  else if ((i == null && (i = ""), t.startsWith("--"))) e.setProperty(t, i);
  else {
    const s = lc(e, t);
    Kn.test(i)
      ? e.setProperty(Le(s), i.replace(Kn, ""), "important")
      : (e[s] = i);
  }
}
const qn = ["Webkit", "Moz", "ms"],
  rs = {};
function lc(e, t) {
  const i = rs[t];
  if (i) return i;
  let s = Nt(t);
  if (s !== "filter" && s in e) return (rs[t] = s);
  s = Ri(s);
  for (let n = 0; n < qn.length; n++) {
    const o = qn[n] + s;
    if (o in e) return (rs[t] = o);
  }
  return t;
}
const Yn = "http://www.w3.org/1999/xlink";
function cc(e, t, i, s, n) {
  if (s && t.startsWith("xlink:"))
    i == null
      ? e.removeAttributeNS(Yn, t.slice(6, t.length))
      : e.setAttributeNS(Yn, t, i);
  else {
    const o = Yr(t);
    i == null || (o && !_o(i))
      ? e.removeAttribute(t)
      : e.setAttribute(t, o ? "" : i);
  }
}
function uc(e, t, i, s, n, o, r) {
  if (t === "innerHTML" || t === "textContent") {
    s && r(s, n, o), (e[t] = i == null ? "" : i);
    return;
  }
  if (t === "value" && e.tagName !== "PROGRESS" && !e.tagName.includes("-")) {
    e._value = i;
    const l = i == null ? "" : i;
    (e.value !== l || e.tagName === "OPTION") && (e.value = l),
      i == null && e.removeAttribute(t);
    return;
  }
  let a = !1;
  if (i === "" || i == null) {
    const l = typeof e[t];
    l === "boolean"
      ? (i = _o(i))
      : i == null && l === "string"
      ? ((i = ""), (a = !0))
      : l === "number" && ((i = 0), (a = !0));
  }
  try {
    e[t] = i;
  } catch {}
  a && e.removeAttribute(t);
}
function hc(e, t, i, s) {
  e.addEventListener(t, i, s);
}
function dc(e, t, i, s) {
  e.removeEventListener(t, i, s);
}
function fc(e, t, i, s, n = null) {
  const o = e._vei || (e._vei = {}),
    r = o[t];
  if (s && r) r.value = s;
  else {
    const [a, l] = pc(t);
    if (s) {
      const c = (o[t] = mc(s, n));
      hc(e, a, c, l);
    } else r && (dc(e, a, r, l), (o[t] = void 0));
  }
}
const Qn = /(?:Once|Passive|Capture)$/;
function pc(e) {
  let t;
  if (Qn.test(e)) {
    t = {};
    let s;
    for (; (s = e.match(Qn)); )
      (e = e.slice(0, e.length - s[0].length)), (t[s[0].toLowerCase()] = !0);
  }
  return [e[2] === ":" ? e.slice(3) : Le(e.slice(2)), t];
}
let as = 0;
const gc = Promise.resolve(),
  vc = () => as || (gc.then(() => (as = 0)), (as = Date.now()));
function mc(e, t) {
  const i = (s) => {
    if (!s._vts) s._vts = Date.now();
    else if (s._vts <= i.attached) return;
    Mt(yc(s, i.value), t, 5, [s]);
  };
  return (i.value = e), (i.attached = vc()), i;
}
function yc(e, t) {
  if (N(t)) {
    const i = e.stopImmediatePropagation;
    return (
      (e.stopImmediatePropagation = () => {
        i.call(e), (e._stopped = !0);
      }),
      t.map((s) => (n) => !n._stopped && s && s(n))
    );
  } else return t;
}
const Jn = /^on[a-z]/,
  bc = (e, t, i, s, n = !1, o, r, a, l) => {
    t === "class"
      ? rc(e, s, n)
      : t === "style"
      ? ac(e, i, s)
      : Si(t)
      ? $s(t) || fc(e, t, i, s, r)
      : (
          t[0] === "."
            ? ((t = t.slice(1)), !0)
            : t[0] === "^"
            ? ((t = t.slice(1)), !1)
            : _c(e, t, s, n)
        )
      ? uc(e, t, s, o, r, a, l)
      : (t === "true-value"
          ? (e._trueValue = s)
          : t === "false-value" && (e._falseValue = s),
        cc(e, t, s, n));
  };
function _c(e, t, i, s) {
  return s
    ? !!(
        t === "innerHTML" ||
        t === "textContent" ||
        (t in e && Jn.test(t) && j(i))
      )
    : t === "spellcheck" ||
      t === "draggable" ||
      t === "translate" ||
      t === "form" ||
      (t === "list" && e.tagName === "INPUT") ||
      (t === "type" && e.tagName === "TEXTAREA") ||
      (Jn.test(t) && ut(i))
    ? !1
    : t in e;
}
function wc(e) {
  const t = hi();
  if (!t) return;
  const i = (t.ut = (n = e(t.proxy)) => {
      Array.from(
        document.querySelectorAll(`[data-v-owner="${t.uid}"]`)
      ).forEach((o) => Rs(o, n));
    }),
    s = () => {
      const n = e(t.proxy);
      Ls(t.subTree, n), i(n);
    };
  ol(s),
    ui(() => {
      const n = new MutationObserver(s);
      n.observe(t.subTree.el.parentNode, { childList: !0 }),
        an(() => n.disconnect());
    });
}
function Ls(e, t) {
  if (e.shapeFlag & 128) {
    const i = e.suspense;
    (e = i.activeBranch),
      i.pendingBranch &&
        !i.isHydrating &&
        i.effects.push(() => {
          Ls(i.activeBranch, t);
        });
  }
  for (; e.component; ) e = e.component.subTree;
  if (e.shapeFlag & 1 && e.el) Rs(e.el, t);
  else if (e.type === yt) e.children.forEach((i) => Ls(i, t));
  else if (e.type === Qe) {
    let { el: i, anchor: s } = e;
    for (; i && (Rs(i, t), i !== s); ) i = i.nextSibling;
  }
}
function Rs(e, t) {
  if (e.nodeType === 1) {
    const i = e.style;
    for (const s in t) i.setProperty(`--${s}`, t[s]);
  }
}
const Yt = "transition",
  Ne = "animation",
  yr = (e, { slots: t }) => tc(Zo, _r(e), t);
yr.displayName = "Transition";
const br = {
    name: String,
    type: String,
    css: { type: Boolean, default: !0 },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String,
  },
  xc = (yr.props = dt({}, Zo.props, br)),
  ue = (e, t = []) => {
    N(e) ? e.forEach((i) => i(...t)) : e && e(...t);
  },
  Xn = (e) => (e ? (N(e) ? e.some((t) => t.length > 1) : e.length > 1) : !1);
function _r(e) {
  const t = {};
  for (const A in e) A in br || (t[A] = e[A]);
  if (e.css === !1) return t;
  const {
      name: i = "v",
      type: s,
      duration: n,
      enterFromClass: o = `${i}-enter-from`,
      enterActiveClass: r = `${i}-enter-active`,
      enterToClass: a = `${i}-enter-to`,
      appearFromClass: l = o,
      appearActiveClass: c = r,
      appearToClass: h = a,
      leaveFromClass: u = `${i}-leave-from`,
      leaveActiveClass: f = `${i}-leave-active`,
      leaveToClass: v = `${i}-leave-to`,
    } = e,
    g = Cc(n),
    y = g && g[0],
    E = g && g[1],
    {
      onBeforeEnter: z,
      onEnter: x,
      onEnterCancelled: C,
      onLeave: R,
      onLeaveCancelled: k,
      onBeforeAppear: B = z,
      onAppear: L = x,
      onAppearCancelled: O = C,
    } = t,
    H = (A, J, Z) => {
      Qt(A, J ? h : a), Qt(A, J ? c : r), Z && Z();
    },
    U = (A, J) => {
      (A._isLeaving = !1), Qt(A, u), Qt(A, v), Qt(A, f), J && J();
    },
    W = (A) => (J, Z) => {
      const Y = A ? L : x,
        at = () => H(J, A, Z);
      ue(Y, [J, at]),
        Zn(() => {
          Qt(J, A ? l : o), $t(J, A ? h : a), Xn(Y) || Gn(J, s, y, at);
        });
    };
  return dt(t, {
    onBeforeEnter(A) {
      ue(z, [A]), $t(A, o), $t(A, r);
    },
    onBeforeAppear(A) {
      ue(B, [A]), $t(A, l), $t(A, c);
    },
    onEnter: W(!1),
    onAppear: W(!0),
    onLeave(A, J) {
      A._isLeaving = !0;
      const Z = () => U(A, J);
      $t(A, u),
        xr(),
        $t(A, f),
        Zn(() => {
          !A._isLeaving || (Qt(A, u), $t(A, v), Xn(R) || Gn(A, s, E, Z));
        }),
        ue(R, [A, Z]);
    },
    onEnterCancelled(A) {
      H(A, !1), ue(C, [A]);
    },
    onAppearCancelled(A) {
      H(A, !0), ue(O, [A]);
    },
    onLeaveCancelled(A) {
      U(A), ue(k, [A]);
    },
  });
}
function Cc(e) {
  if (e == null) return null;
  if (st(e)) return [ls(e.enter), ls(e.leave)];
  {
    const t = ls(e);
    return [t, t];
  }
}
function ls(e) {
  return Fi(e);
}
function $t(e, t) {
  t.split(/\s+/).forEach((i) => i && e.classList.add(i)),
    (e._vtc || (e._vtc = new Set())).add(t);
}
function Qt(e, t) {
  t.split(/\s+/).forEach((s) => s && e.classList.remove(s));
  const { _vtc: i } = e;
  i && (i.delete(t), i.size || (e._vtc = void 0));
}
function Zn(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e);
  });
}
let Oc = 0;
function Gn(e, t, i, s) {
  const n = (e._endId = ++Oc),
    o = () => {
      n === e._endId && s();
    };
  if (i) return setTimeout(o, i);
  const { type: r, timeout: a, propCount: l } = wr(e, t);
  if (!r) return s();
  const c = r + "end";
  let h = 0;
  const u = () => {
      e.removeEventListener(c, f), o();
    },
    f = (v) => {
      v.target === e && ++h >= l && u();
    };
  setTimeout(() => {
    h < l && u();
  }, a + 1),
    e.addEventListener(c, f);
}
function wr(e, t) {
  const i = window.getComputedStyle(e),
    s = (g) => (i[g] || "").split(", "),
    n = s(`${Yt}Delay`),
    o = s(`${Yt}Duration`),
    r = to(n, o),
    a = s(`${Ne}Delay`),
    l = s(`${Ne}Duration`),
    c = to(a, l);
  let h = null,
    u = 0,
    f = 0;
  t === Yt
    ? r > 0 && ((h = Yt), (u = r), (f = o.length))
    : t === Ne
    ? c > 0 && ((h = Ne), (u = c), (f = l.length))
    : ((u = Math.max(r, c)),
      (h = u > 0 ? (r > c ? Yt : Ne) : null),
      (f = h ? (h === Yt ? o.length : l.length) : 0));
  const v =
    h === Yt && /\b(transform|all)(,|$)/.test(s(`${Yt}Property`).toString());
  return { type: h, timeout: u, propCount: f, hasTransform: v };
}
function to(e, t) {
  for (; e.length < t.length; ) e = e.concat(e);
  return Math.max(...t.map((i, s) => eo(i) + eo(e[s])));
}
function eo(e) {
  return Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function xr() {
  return document.body.offsetHeight;
}
const Cr = new WeakMap(),
  Or = new WeakMap(),
  Tc = {
    name: "TransitionGroup",
    props: dt({}, xc, { tag: String, moveClass: String }),
    setup(e, { slots: t }) {
      const i = hi(),
        s = Xo();
      let n, o;
      return (
        er(() => {
          if (!n.length) return;
          const r = e.moveClass || `${e.name || "v"}-move`;
          if (!Ic(n[0].el, i.vnode.el, r)) return;
          n.forEach(Pc), n.forEach(Ec);
          const a = n.filter(Mc);
          xr(),
            a.forEach((l) => {
              const c = l.el,
                h = c.style;
              $t(c, r),
                (h.transform = h.webkitTransform = h.transitionDuration = "");
              const u = (c._moveCb = (f) => {
                (f && f.target !== c) ||
                  ((!f || /transform$/.test(f.propertyName)) &&
                    (c.removeEventListener("transitionend", u),
                    (c._moveCb = null),
                    Qt(c, r)));
              });
              c.addEventListener("transitionend", u);
            });
        }),
        () => {
          const r = q(e),
            a = _r(r);
          let l = r.tag || yt;
          (n = o), (o = t.default ? on(t.default()) : []);
          for (let c = 0; c < o.length; c++) {
            const h = o[c];
            h.key != null && ri(h, oi(h, a, s, i));
          }
          if (n)
            for (let c = 0; c < n.length; c++) {
              const h = n[c];
              ri(h, oi(h, a, s, i)), Cr.set(h, h.el.getBoundingClientRect());
            }
          return rt(l, null, o);
        }
      );
    },
  },
  vd = Tc;
function Pc(e) {
  const t = e.el;
  t._moveCb && t._moveCb(), t._enterCb && t._enterCb();
}
function Ec(e) {
  Or.set(e, e.el.getBoundingClientRect());
}
function Mc(e) {
  const t = Cr.get(e),
    i = Or.get(e),
    s = t.left - i.left,
    n = t.top - i.top;
  if (s || n) {
    const o = e.el.style;
    return (
      (o.transform = o.webkitTransform = `translate(${s}px,${n}px)`),
      (o.transitionDuration = "0s"),
      e
    );
  }
}
function Ic(e, t, i) {
  const s = e.cloneNode();
  e._vtc &&
    e._vtc.forEach((r) => {
      r.split(/\s+/).forEach((a) => a && s.classList.remove(a));
    }),
    i.split(/\s+/).forEach((r) => r && s.classList.add(r)),
    (s.style.display = "none");
  const n = t.nodeType === 1 ? t : t.parentNode;
  n.appendChild(s);
  const { hasTransform: o } = wr(s);
  return n.removeChild(s), o;
}
const zc = ["ctrl", "shift", "alt", "meta"],
  Ac = {
    stop: (e) => e.stopPropagation(),
    prevent: (e) => e.preventDefault(),
    self: (e) => e.target !== e.currentTarget,
    ctrl: (e) => !e.ctrlKey,
    shift: (e) => !e.shiftKey,
    alt: (e) => !e.altKey,
    meta: (e) => !e.metaKey,
    left: (e) => "button" in e && e.button !== 0,
    middle: (e) => "button" in e && e.button !== 1,
    right: (e) => "button" in e && e.button !== 2,
    exact: (e, t) => zc.some((i) => e[`${i}Key`] && !t.includes(i)),
  },
  md =
    (e, t) =>
    (i, ...s) => {
      for (let n = 0; n < t.length; n++) {
        const o = Ac[t[n]];
        if (o && o(i, t)) return;
      }
      return e(i, ...s);
    },
  yd = {
    beforeMount(e, { value: t }, { transition: i }) {
      (e._vod = e.style.display === "none" ? "" : e.style.display),
        i && t ? i.beforeEnter(e) : Ue(e, t);
    },
    mounted(e, { value: t }, { transition: i }) {
      i && t && i.enter(e);
    },
    updated(e, { value: t, oldValue: i }, { transition: s }) {
      !t != !i &&
        (s
          ? t
            ? (s.beforeEnter(e), Ue(e, !0), s.enter(e))
            : s.leave(e, () => {
                Ue(e, !1);
              })
          : Ue(e, t));
    },
    beforeUnmount(e, { value: t }) {
      Ue(e, t);
    },
  };
function Ue(e, t) {
  e.style.display = t ? e._vod : "none";
}
const Sc = dt({ patchProp: bc }, oc);
let io;
function kc() {
  return io || (io = kl(Sc));
}
const Lc = (...e) => {
  const t = kc().createApp(...e),
    { mount: i } = t;
  return (
    (t.mount = (s) => {
      const n = Rc(s);
      if (!n) return;
      const o = t._component;
      !j(o) && !o.render && !o.template && (o.template = n.innerHTML),
        (n.innerHTML = "");
      const r = i(n, !1, n instanceof SVGElement);
      return (
        n instanceof Element &&
          (n.removeAttribute("v-cloak"), n.setAttribute("data-v-app", "")),
        r
      );
    }),
    t
  );
};
function Rc(e) {
  return ut(e) ? document.querySelector(e) : e;
}
const Fc = "modulepreload",
  Dc = function (e, t) {
    return new URL(e, t).href;
  },
  so = {},
  Bc = function (t, i, s) {
    if (!i || i.length === 0) return t();
    const n = document.getElementsByTagName("link");
    return Promise.all(
      i.map((o) => {
        if (((o = Dc(o, s)), o in so)) return;
        so[o] = !0;
        const r = o.endsWith(".css"),
          a = r ? '[rel="stylesheet"]' : "";
        if (!!s)
          for (let h = n.length - 1; h >= 0; h--) {
            const u = n[h];
            if (u.href === o && (!r || u.rel === "stylesheet")) return;
          }
        else if (document.querySelector(`link[href="${o}"]${a}`)) return;
        const c = document.createElement("link");
        if (
          ((c.rel = r ? "stylesheet" : Fc),
          r || ((c.as = "script"), (c.crossOrigin = "")),
          (c.href = o),
          document.head.appendChild(c),
          r)
        )
          return new Promise((h, u) => {
            c.addEventListener("load", h),
              c.addEventListener("error", () =>
                u(new Error(`Unable to preload CSS for ${o}`))
              );
          });
      })
    ).then(() => t());
  },
  Hc = "" + new URL("https://pic3.zhimg.com/80/v2-877d3f1d4b679305ba4c5974187fdb3a_720w.webp", import.meta.url).href,
  fn = (e) => (Wa("data-v-c2ff74ae"), (e = e()), Va(), e),
  Nc = { class: "loading" },
  Uc = fn(() =>
    Ct(
      "div",
      { class: "loadingGroup" },
      [
        Ct("div", { class: "loadingBar left" }),
        Ct("div", { class: "loadingBar right" }),
      ],
      -1
    )
  ),
  $c = { class: "shelter" },
  jc = { class: "loadingContent" },
  Wc = fn(() => Ct("div", { class: "logoimg" }, [Ct("img", { src: Hc })], -1)),
  Vc = { class: "loadingProgress" },
  Kc = fn(() => Ct("span", null, "%", -1)),
  qc = ji({
    __name: "Loading",
    setup(e, { expose: t }) {
      wc((o) => ({ "5e0e5b32": Ii(i) }));
      let i = me("0%"),
        s = dn(() => +i.value.split("%").join("") * 2);
      const n = (o) => {
        setTimeout(() => {
          i.value = o;
        }, 0);
      };
      return (
        ui(() => {
          n("48%");
        }),
        rn(() => {
          n("0%");
        }),
        t({ WidthUpdate: n }),
        (o, r) => (
          Be(),
          Ki(Hl, { to: "body" }, [
            Ct("div", Nc, [
              Uc,
              Ct("div", $c, [
                Ct("div", jc, [
                  Wc,
                  Ct("div", Vc, [Ct("span", null, Qr(Ii(s)), 1), Kc]),
                ]),
              ]),
            ]),
          ])
        )
      );
    },
  });
const Yc = (e, t) => {
    const i = e.__vccOpts || e;
    for (const [s, n] of t) i[s] = n;
    return i;
  },
  Qc = Yc(qc, [["__scopeId", "data-v-c2ff74ae"]]),
  Jc = ji({
    __name: "App",
    setup(e) {
      const t = ll(() =>
        Bc(
          () => import("./Index.5887348c.js"),
          ["./Index.5887348c.js", "./Index.24197767.css"],
          import.meta.url
        )
      );
      let i = me();
      return (
        ui(() => {
          Hi(() => {
            i.value.WidthUpdate("50%");
          });
        }),
        (s, n) => {
          const o = Qc;
          return (
            Be(),
            Ki(
              Za,
              { resolve: "" },
              {
                default: Ts(() => [rt(Ii(t))]),
                fallback: Ts(() => [
                  rt(o, { ref_key: "loadBar", ref: i }, null, 512),
                ]),
                _: 1,
              }
            )
          );
        }
      );
    },
  });
var Xc = !1;
/*!
 * pinia v2.0.29
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */ let Tr;
const Qi = (e) => (Tr = e),
  Pr = Symbol();
function Fs(e) {
  return (
    e &&
    typeof e == "object" &&
    Object.prototype.toString.call(e) === "[object Object]" &&
    typeof e.toJSON != "function"
  );
}
var Xe;
(function (e) {
  (e.direct = "direct"),
    (e.patchObject = "patch object"),
    (e.patchFunction = "patch function");
})(Xe || (Xe = {}));
function Zc() {
  const e = Po(!0),
    t = e.run(() => me({}));
  let i = [],
    s = [];
  const n = ze({
    install(o) {
      Qi(n),
        (n._a = o),
        o.provide(Pr, n),
        (o.config.globalProperties.$pinia = n),
        s.forEach((r) => i.push(r)),
        (s = []);
    },
    use(o) {
      return !this._a && !Xc ? s.push(o) : i.push(o), this;
    },
    _p: i,
    _a: null,
    _e: e,
    _s: new Map(),
    state: t,
  });
  return n;
}
const Er = () => {};
function no(e, t, i, s = Er) {
  e.push(t);
  const n = () => {
    const o = e.indexOf(t);
    o > -1 && (e.splice(o, 1), s());
  };
  return !i && na() && oa(n), n;
}
function _e(e, ...t) {
  e.slice().forEach((i) => {
    i(...t);
  });
}
function Ds(e, t) {
  e instanceof Map && t instanceof Map && t.forEach((i, s) => e.set(s, i)),
    e instanceof Set && t instanceof Set && t.forEach(e.add, e);
  for (const i in t) {
    if (!t.hasOwnProperty(i)) continue;
    const s = t[i],
      n = e[i];
    Fs(n) && Fs(s) && e.hasOwnProperty(i) && !lt(s) && !Gt(s)
      ? (e[i] = Ds(n, s))
      : (e[i] = s);
  }
  return e;
}
const Gc = Symbol();
function tu(e) {
  return !Fs(e) || !e.hasOwnProperty(Gc);
}
const { assign: Xt } = Object;
function eu(e) {
  return !!(lt(e) && e.effect);
}
function iu(e, t, i, s) {
  const { state: n, actions: o, getters: r } = t,
    a = i.state.value[e];
  let l;
  function c() {
    a || (i.state.value[e] = n ? n() : {});
    const h = La(i.state.value[e]);
    return Xt(
      h,
      o,
      Object.keys(r || {}).reduce(
        (u, f) => (
          (u[f] = ze(
            dn(() => {
              Qi(i);
              const v = i._s.get(e);
              return r[f].call(v, v);
            })
          )),
          u
        ),
        {}
      )
    );
  }
  return (
    (l = Mr(e, c, t, i, s, !0)),
    (l.$reset = function () {
      const u = n ? n() : {};
      this.$patch((f) => {
        Xt(f, u);
      });
    }),
    l
  );
}
function Mr(e, t, i = {}, s, n, o) {
  let r;
  const a = Xt({ actions: {} }, i),
    l = { deep: !0 };
  let c,
    h,
    u = ze([]),
    f = ze([]),
    v;
  const g = s.state.value[e];
  !o && !g && (s.state.value[e] = {}), me({});
  let y;
  function E(L) {
    let O;
    (c = h = !1),
      typeof L == "function"
        ? (L(s.state.value[e]),
          (O = { type: Xe.patchFunction, storeId: e, events: v }))
        : (Ds(s.state.value[e], L),
          (O = { type: Xe.patchObject, payload: L, storeId: e, events: v }));
    const H = (y = Symbol());
    Hi().then(() => {
      y === H && (c = !0);
    }),
      (h = !0),
      _e(u, O, s.state.value[e]);
  }
  const z = Er;
  function x() {
    r.stop(), (u = []), (f = []), s._s.delete(e);
  }
  function C(L, O) {
    return function () {
      Qi(s);
      const H = Array.from(arguments),
        U = [],
        W = [];
      function A(Y) {
        U.push(Y);
      }
      function J(Y) {
        W.push(Y);
      }
      _e(f, { args: H, name: L, store: k, after: A, onError: J });
      let Z;
      try {
        Z = O.apply(this && this.$id === e ? this : k, H);
      } catch (Y) {
        throw (_e(W, Y), Y);
      }
      return Z instanceof Promise
        ? Z.then((Y) => (_e(U, Y), Y)).catch(
            (Y) => (_e(W, Y), Promise.reject(Y))
          )
        : (_e(U, Z), Z);
    };
  }
  const R = {
      _p: s,
      $id: e,
      $onAction: no.bind(null, f),
      $patch: E,
      $reset: z,
      $subscribe(L, O = {}) {
        const H = no(u, L, O.detached, () => U()),
          U = r.run(() =>
            Oi(
              () => s.state.value[e],
              (W) => {
                (O.flush === "sync" ? h : c) &&
                  L({ storeId: e, type: Xe.direct, events: v }, W);
              },
              Xt({}, l, O)
            )
          );
        return H;
      },
      $dispose: x,
    },
    k = Bi(R);
  s._s.set(e, k);
  const B = s._e.run(() => ((r = Po()), r.run(() => t())));
  for (const L in B) {
    const O = B[L];
    if ((lt(O) && !eu(O)) || Gt(O))
      o ||
        (g && tu(O) && (lt(O) ? (O.value = g[L]) : Ds(O, g[L])),
        (s.state.value[e][L] = O));
    else if (typeof O == "function") {
      const H = C(L, O);
      (B[L] = H), (a.actions[L] = O);
    }
  }
  return (
    Xt(k, B),
    Xt(q(k), B),
    Object.defineProperty(k, "$state", {
      get: () => s.state.value[e],
      set: (L) => {
        E((O) => {
          Xt(O, L);
        });
      },
    }),
    s._p.forEach((L) => {
      Xt(
        k,
        r.run(() => L({ store: k, app: s._a, pinia: s, options: a }))
      );
    }),
    g && o && i.hydrate && i.hydrate(k.$state, g),
    (c = !0),
    (h = !0),
    k
  );
}
function bd(e, t, i) {
  let s, n;
  const o = typeof t == "function";
  typeof e == "string" ? ((s = e), (n = o ? i : t)) : ((n = e), (s = e.id));
  function r(a, l) {
    const c = hi();
    return (
      (a = a || (c && Ve(Pr, null))),
      a && Qi(a),
      (a = Tr),
      a._s.has(s) || (o ? Mr(s, t, n, a) : iu(s, n, a)),
      a._s.get(s)
    );
  }
  return (r.$id = s), r;
}
class su {
  constructor() {
    this._listeners = new Map();
  }
  addEventListener(t, i) {
    var s;
    this.removeEventListener(t, i),
      this._listeners.get(t) || this._listeners.set(t, []),
      (s = this._listeners.get(t)) === null || s === void 0 || s.push(i);
  }
  dispatchEvent(t, i) {
    var s;
    (s = this._listeners.get(t)) === null ||
      s === void 0 ||
      s.forEach((n) => n(i));
  }
  hasEventListener(t) {
    return !!this._listeners.get(t);
  }
  removeAllEventListeners(t) {
    t ? this._listeners.delete(t) : (this._listeners = new Map());
  }
  removeEventListener(t, i) {
    const s = this._listeners.get(t);
    if (!s) return;
    const n = s.length,
      o = s.indexOf(i);
    o < 0 || (n === 1 ? this._listeners.delete(t) : s.splice(o, 1));
  }
}
class xt {
  constructor(t, i, s) {
    if (typeof t != "number" && t) {
      (this.x = t.x), (this.y = t.y);
      const n = t;
      this.z = n.z ? n.z : 0;
    } else if (t !== void 0 && i !== void 0)
      (this.x = t), (this.y = i), (this.z = s != null ? s : 0);
    else throw new Error("tsParticles - Vector3d not initialized correctly");
  }
  static get origin() {
    return xt.create(0, 0, 0);
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }
  set angle(t) {
    this.updateFromAngle(t, this.length);
  }
  get length() {
    return Math.sqrt(this.getLengthSq());
  }
  set length(t) {
    this.updateFromAngle(this.angle, t);
  }
  static clone(t) {
    return xt.create(t.x, t.y, t.z);
  }
  static create(t, i, s) {
    return new xt(t, i, s);
  }
  add(t) {
    return xt.create(this.x + t.x, this.y + t.y, this.z + t.z);
  }
  addTo(t) {
    (this.x += t.x), (this.y += t.y), (this.z += t.z);
  }
  copy() {
    return xt.clone(this);
  }
  distanceTo(t) {
    return this.sub(t).length;
  }
  distanceToSq(t) {
    return this.sub(t).getLengthSq();
  }
  div(t) {
    return xt.create(this.x / t, this.y / t, this.z / t);
  }
  divTo(t) {
    (this.x /= t), (this.y /= t), (this.z /= t);
  }
  getLengthSq() {
    return this.x ** 2 + this.y ** 2;
  }
  mult(t) {
    return xt.create(this.x * t, this.y * t, this.z * t);
  }
  multTo(t) {
    (this.x *= t), (this.y *= t), (this.z *= t);
  }
  rotate(t) {
    return xt.create(
      this.x * Math.cos(t) - this.y * Math.sin(t),
      this.x * Math.sin(t) + this.y * Math.cos(t),
      0
    );
  }
  setTo(t) {
    (this.x = t.x), (this.y = t.y);
    const i = t;
    this.z = i.z ? i.z : 0;
  }
  sub(t) {
    return xt.create(this.x - t.x, this.y - t.y, this.z - t.z);
  }
  subFrom(t) {
    (this.x -= t.x), (this.y -= t.y), (this.z -= t.z);
  }
  updateFromAngle(t, i) {
    (this.x = Math.cos(t) * i), (this.y = Math.sin(t) * i);
  }
}
class Pe extends xt {
  constructor(t, i) {
    super(t, i, 0);
  }
  static get origin() {
    return Pe.create(0, 0);
  }
  static clone(t) {
    return Pe.create(t.x, t.y);
  }
  static create(t, i) {
    return new Pe(t, i);
  }
}
let nu = Math.random;
function oe() {
  return Ir(nu(), 0, 1 - 1e-16);
}
function Ir(e, t, i) {
  return Math.min(Math.max(e, t), i);
}
function Ee(e) {
  const t = gn(e);
  let i = pn(e);
  return t === i && (i = 0), oe() * (t - i) + i;
}
function nt(e) {
  return typeof e == "number" ? e : Ee(e);
}
function pn(e) {
  return typeof e == "number" ? e : e.min;
}
function gn(e) {
  return typeof e == "number" ? e : e.max;
}
function et(e, t) {
  if (e === t || (t === void 0 && typeof e == "number")) return e;
  const i = pn(e),
    s = gn(e);
  return t !== void 0 ? { min: Math.min(i, t), max: Math.max(s, t) } : et(i, s);
}
function ou(e) {
  const t = e.random,
    { enable: i, minimumValue: s } =
      typeof t == "boolean" ? { enable: t, minimumValue: 0 } : t;
  return nt(i ? et(e.value, s) : e.value);
}
function ru(e, t) {
  const i = e.x - t.x,
    s = e.y - t.y;
  return { dx: i, dy: s, distance: Math.sqrt(i * i + s * s) };
}
function vn(e, t) {
  return ru(e, t).distance;
}
function au(e, t, i) {
  if (typeof e == "number") return (e * Math.PI) / 180;
  switch (e) {
    case "top":
      return -Math.PI / 2;
    case "top-right":
      return -Math.PI / 4;
    case "right":
      return 0;
    case "bottom-right":
      return Math.PI / 4;
    case "bottom":
      return Math.PI / 2;
    case "bottom-left":
      return (3 * Math.PI) / 4;
    case "left":
      return Math.PI;
    case "top-left":
      return (-3 * Math.PI) / 4;
    case "inside":
      return Math.atan2(i.y - t.y, i.x - t.x);
    case "outside":
      return Math.atan2(t.y - i.y, t.x - i.x);
    default:
      return oe() * Math.PI * 2;
  }
}
function lu(e) {
  const t = Pe.origin;
  return (t.length = 1), (t.angle = e), t;
}
function cu(e) {
  return e.position && e.position.x !== void 0 && e.position.y !== void 0
    ? {
        x: (e.position.x * e.size.width) / 100,
        y: (e.position.y * e.size.height) / 100,
      }
    : void 0;
}
function uu(e) {
  var t, i, s, n;
  return {
    x:
      (i = (t = e.position) === null || t === void 0 ? void 0 : t.x) !== null &&
      i !== void 0
        ? i
        : oe() * e.size.width,
    y:
      (n = (s = e.position) === null || s === void 0 ? void 0 : s.y) !== null &&
      n !== void 0
        ? n
        : oe() * e.size.height,
  };
}
function zr(e) {
  return e ? (e.endsWith("%") ? parseFloat(e) / 100 : parseFloat(e)) : 1;
}
function di() {
  return (
    typeof window > "u" ||
    !window ||
    typeof window.document > "u" ||
    !window.document
  );
}
function hu() {
  return !di() && typeof matchMedia < "u";
}
function Ar(e) {
  if (hu()) return matchMedia(e);
}
function du() {
  return di()
    ? (e) => setTimeout(e)
    : (e) => (requestAnimationFrame || setTimeout)(e);
}
function fu() {
  return di()
    ? (e) => clearTimeout(e)
    : (e) => (cancelAnimationFrame || clearTimeout)(e);
}
function pu(e, t) {
  return e === t || (t instanceof Array && t.indexOf(e) > -1);
}
function gu(e) {
  return Math.floor(oe() * e.length);
}
function mn(e, t, i = !0) {
  return e[t !== void 0 && i ? t % e.length : gu(e)];
}
function gt(e, ...t) {
  for (const i of t) {
    if (i == null) continue;
    if (typeof i != "object") {
      e = i;
      continue;
    }
    const s = Array.isArray(i);
    s && (typeof e != "object" || !e || !Array.isArray(e))
      ? (e = [])
      : !s && (typeof e != "object" || !e || Array.isArray(e)) && (e = {});
    for (const n in i) {
      if (n === "__proto__") continue;
      const o = i,
        r = o[n],
        a = typeof r == "object",
        l = e;
      l[n] = a && Array.isArray(r) ? r.map((c) => gt(l[n], c)) : gt(l[n], r);
    }
  }
  return e;
}
function ke(e, t) {
  return e instanceof Array ? e.map((i) => t(i)) : t(e);
}
function Ze(e, t, i) {
  return e instanceof Array ? mn(e, t, i) : e;
}
const vu = "random",
  Ji = new Map();
function Sr(e) {
  Ji.set(e.key, e);
}
function cs(e, t, i) {
  return (
    i < 0 && (i += 1),
    i > 1 && (i -= 1),
    i < 1 / 6
      ? e + (t - e) * 6 * i
      : i < 1 / 2
      ? t
      : i < 2 / 3
      ? e + (t - e) * (2 / 3 - i) * 6
      : e
  );
}
function mu(e) {
  for (const [, o] of Ji)
    if (e.startsWith(o.stringPrefix)) return o.parseString(e);
  const t = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i,
    i = e.replace(
      t,
      (o, r, a, l, c) => r + r + a + a + l + l + (c !== void 0 ? c + c : "")
    ),
    s = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i,
    n = s.exec(i);
  return n
    ? {
        a: n[4] !== void 0 ? parseInt(n[4], 16) / 255 : 1,
        b: parseInt(n[3], 16),
        g: parseInt(n[2], 16),
        r: parseInt(n[1], 16),
      }
    : void 0;
}
function Me(e, t, i = !0) {
  if (!e) return;
  const s = typeof e == "string" ? { value: e } : e;
  if (typeof s.value == "string") return kr(s.value, t, i);
  if (s.value instanceof Array) return Me({ value: mn(s.value, t, i) });
  for (const [, n] of Ji) {
    const o = n.handleRangeColor(s);
    if (o) return o;
  }
}
function kr(e, t, i = !0) {
  if (!e) return;
  const s = typeof e == "string" ? { value: e } : e;
  if (typeof s.value == "string") return s.value === vu ? wu() : bu(s.value);
  if (s.value instanceof Array) return kr({ value: mn(s.value, t, i) });
  for (const [, n] of Ji) {
    const o = n.handleColor(s);
    if (o) return o;
  }
}
function oo(e, t, i = !0) {
  const s = Me(e, t, i);
  return s ? yu(s) : void 0;
}
function yu(e) {
  const t = e.r / 255,
    i = e.g / 255,
    s = e.b / 255,
    n = Math.max(t, i, s),
    o = Math.min(t, i, s),
    r = { h: 0, l: (n + o) / 2, s: 0 };
  return (
    n !== o &&
      ((r.s = r.l < 0.5 ? (n - o) / (n + o) : (n - o) / (2 - n - o)),
      (r.h =
        t === n
          ? (i - s) / (n - o)
          : (r.h = i === n ? 2 + (s - t) / (n - o) : 4 + (t - i) / (n - o)))),
    (r.l *= 100),
    (r.s *= 100),
    (r.h *= 60),
    r.h < 0 && (r.h += 360),
    r.h >= 360 && (r.h -= 360),
    r
  );
}
function bu(e) {
  return mu(e);
}
function Bs(e) {
  const t = { b: 0, g: 0, r: 0 },
    i = { h: e.h / 360, l: e.l / 100, s: e.s / 100 };
  if (!i.s) (t.b = i.l), (t.g = i.l), (t.r = i.l);
  else {
    const s = i.l < 0.5 ? i.l * (1 + i.s) : i.l + i.s - i.l * i.s,
      n = 2 * i.l - s;
    (t.r = cs(n, s, i.h + 1 / 3)),
      (t.g = cs(n, s, i.h)),
      (t.b = cs(n, s, i.h - 1 / 3));
  }
  return (
    (t.r = Math.floor(t.r * 255)),
    (t.g = Math.floor(t.g * 255)),
    (t.b = Math.floor(t.b * 255)),
    t
  );
}
function _u(e) {
  const t = Bs(e);
  return { a: e.a, b: t.b, g: t.g, r: t.r };
}
function wu(e) {
  const t = e != null ? e : 0;
  return {
    b: Math.floor(Ee(et(t, 256))),
    g: Math.floor(Ee(et(t, 256))),
    r: Math.floor(Ee(et(t, 256))),
  };
}
function Pi(e, t) {
  return `rgba(${e.r}, ${e.g}, ${e.b}, ${t != null ? t : 1})`;
}
function ro(e, t) {
  return `hsla(${e.h}, ${e.s}%, ${e.l}%, ${t != null ? t : 1})`;
}
function ao(e) {
  return e !== void 0 ? { h: e.h.value, s: e.s.value, l: e.l.value } : void 0;
}
function xu(e, t, i) {
  (e.fillStyle = i != null ? i : "rgba(0,0,0,0)"),
    e.fillRect(0, 0, t.width, t.height);
}
function us(e, t) {
  e.clearRect(0, 0, t.width, t.height);
}
function Cu(e) {
  var t, i, s, n, o, r;
  const {
      container: a,
      context: l,
      particle: c,
      delta: h,
      colorStyles: u,
      backgroundMask: f,
      composite: v,
      radius: g,
      opacity: y,
      shadow: E,
      transform: z,
    } = e,
    x = c.getPosition(),
    C = c.rotation + (c.pathRotation ? c.velocity.angle : 0),
    R = { sin: Math.sin(C), cos: Math.cos(C) },
    k = {
      a: R.cos * ((t = z.a) !== null && t !== void 0 ? t : 1),
      b: R.sin * ((i = z.b) !== null && i !== void 0 ? i : 1),
      c: -R.sin * ((s = z.c) !== null && s !== void 0 ? s : 1),
      d: R.cos * ((n = z.d) !== null && n !== void 0 ? n : 1),
    };
  l.setTransform(k.a, k.b, k.c, k.d, x.x, x.y),
    l.beginPath(),
    f && (l.globalCompositeOperation = v);
  const B = c.shadowColor;
  E.enable &&
    B &&
    ((l.shadowBlur = E.blur),
    (l.shadowColor = Pi(B)),
    (l.shadowOffsetX = E.offset.x),
    (l.shadowOffsetY = E.offset.y)),
    u.fill && (l.fillStyle = u.fill);
  const L = c.stroke;
  (l.lineWidth = (o = c.strokeWidth) !== null && o !== void 0 ? o : 0),
    u.stroke && (l.strokeStyle = u.stroke),
    Ou(a, l, c, g, y, h),
    ((r = L == null ? void 0 : L.width) !== null && r !== void 0 ? r : 0) > 0 &&
      l.stroke(),
    c.close && l.closePath(),
    c.fill && l.fill(),
    Tu(a, l, c, g, y, h),
    (l.globalCompositeOperation = "source-over"),
    l.setTransform(1, 0, 0, 1, 0, 0);
}
function Ou(e, t, i, s, n, o) {
  if (!i.shape) return;
  const r = e.drawers.get(i.shape);
  !r || r.draw(t, i, s, n, o, e.retina.pixelRatio);
}
function Tu(e, t, i, s, n, o) {
  if (!i.shape) return;
  const r = e.drawers.get(i.shape);
  !(r != null && r.afterEffect) ||
    r.afterEffect(t, i, s, n, o, e.retina.pixelRatio);
}
function Pu(e, t, i) {
  !t.draw || t.draw(e, i);
}
function Eu(e, t, i, s) {
  !t.drawParticle || t.drawParticle(e, i, s);
}
function Mu(e, t, i) {
  return { h: e.h, s: e.s, l: e.l + (t === "darken" ? -1 : 1) * i };
}
const Ge = "generated",
  lo = "touchend",
  Iu = "pointerdown",
  zu = "pointerup",
  co = "pointermove",
  Au = "touchstart",
  Su = "touchmove",
  uo = "pointerleave",
  ku = "pointerout",
  Lu = "touchcancel",
  Ru = "resize",
  Fu = "visibilitychange";
function Du(e, t, i) {
  var s;
  const n = t[i];
  n !== void 0 && (e[i] = ((s = e[i]) !== null && s !== void 0 ? s : 1) * n);
}
class Bu {
  constructor(t) {
    (this.container = t),
      (this.size = { height: 0, width: 0 }),
      (this._context = null),
      (this._generated = !1),
      (this._preDrawUpdaters = []),
      (this._postDrawUpdaters = []),
      (this._resizePlugins = []),
      (this._colorPlugins = []),
      (this._mutationObserver =
        !di() && typeof MutationObserver < "u"
          ? new MutationObserver((i) => {
              for (const s of i)
                s.type === "attributes" &&
                  s.attributeName === "style" &&
                  this._repairStyle();
            })
          : void 0);
  }
  get _fullScreen() {
    return this.container.actualOptions.fullScreen.enable;
  }
  clear() {
    const t = this.container.actualOptions,
      i = t.particles.move.trail;
    t.backgroundMask.enable
      ? this.paint()
      : i.enable && i.length > 0 && this._trailFillColor
      ? this._paintBase(Pi(this._trailFillColor, 1 / i.length))
      : this.draw((s) => {
          us(s, this.size);
        });
  }
  destroy() {
    var t, i;
    (t = this._mutationObserver) === null || t === void 0 || t.disconnect(),
      this._generated
        ? (i = this.element) === null || i === void 0 || i.remove()
        : this._resetOriginalStyle(),
      this.draw((s) => {
        us(s, this.size);
      }),
      (this._preDrawUpdaters = []),
      (this._postDrawUpdaters = []),
      (this._resizePlugins = []),
      (this._colorPlugins = []);
  }
  draw(t) {
    if (this._context) return t(this._context);
  }
  drawParticle(t, i) {
    var s;
    if (t.spawning || t.destroyed) return;
    const n = t.getRadius();
    if (n <= 0) return;
    const o = t.getFillColor(),
      r = (s = t.getStrokeColor()) !== null && s !== void 0 ? s : o;
    let [a, l] = this._getPluginParticleColors(t);
    a || (a = o),
      l || (l = r),
      !(!a && !l) &&
        this.draw((c) => {
          var h, u, f, v, g;
          const y = this.container.actualOptions,
            E = t.options.zIndex,
            z = (1 - t.zIndexFactor) ** E.opacityRate,
            x =
              (f =
                (h = t.bubble.opacity) !== null && h !== void 0
                  ? h
                  : (u = t.opacity) === null || u === void 0
                  ? void 0
                  : u.value) !== null && f !== void 0
                ? f
                : 1,
            C =
              (g =
                (v = t.stroke) === null || v === void 0
                  ? void 0
                  : v.opacity) !== null && g !== void 0
                ? g
                : x,
            R = x * z,
            k = C * z,
            B = {},
            L = { fill: a ? ro(a, R) : void 0 };
          (L.stroke = l ? ro(l, k) : L.fill),
            this._applyPreDrawUpdaters(c, t, n, R, L, B),
            Cu({
              container: this.container,
              context: c,
              particle: t,
              delta: i,
              colorStyles: L,
              backgroundMask: y.backgroundMask.enable,
              composite: y.backgroundMask.composite,
              radius: n * (1 - t.zIndexFactor) ** E.sizeRate,
              opacity: R,
              shadow: t.options.shadow,
              transform: B,
            }),
            this._applyPostDrawUpdaters(t);
        });
  }
  drawParticlePlugin(t, i, s) {
    this.draw((n) => {
      Eu(n, t, i, s);
    });
  }
  drawPlugin(t, i) {
    this.draw((s) => {
      Pu(s, t, i);
    });
  }
  init() {
    var t;
    this.resize(),
      this._initStyle(),
      this._initCover(),
      this._initTrail(),
      this.initBackground(),
      this.element &&
        ((t = this._mutationObserver) === null ||
          t === void 0 ||
          t.observe(this.element, { attributes: !0 })),
      this.initUpdaters(),
      this.initPlugins(),
      this.paint();
  }
  initBackground() {
    const t = this.container.actualOptions,
      i = t.background,
      s = this.element,
      n = s == null ? void 0 : s.style;
    if (n) {
      if (i.color) {
        const o = Me(i.color);
        n.backgroundColor = o ? Pi(o, i.opacity) : "";
      } else n.backgroundColor = "";
      (n.backgroundImage = i.image || ""),
        (n.backgroundPosition = i.position || ""),
        (n.backgroundRepeat = i.repeat || ""),
        (n.backgroundSize = i.size || "");
    }
  }
  initPlugins() {
    this._resizePlugins = [];
    for (const [, t] of this.container.plugins)
      t.resize && this._resizePlugins.push(t),
        (t.particleFillColor || t.particleStrokeColor) &&
          this._colorPlugins.push(t);
  }
  initUpdaters() {
    (this._preDrawUpdaters = []), (this._postDrawUpdaters = []);
    for (const t of this.container.particles.updaters)
      t.afterDraw && this._postDrawUpdaters.push(t),
        (t.getColorStyles || t.getTransformValues || t.beforeDraw) &&
          this._preDrawUpdaters.push(t);
  }
  loadCanvas(t) {
    var i, s;
    this._generated &&
      ((i = this.element) === null || i === void 0 || i.remove()),
      (this._generated =
        t.dataset && Ge in t.dataset
          ? t.dataset[Ge] === "true"
          : this._generated),
      (this.element = t),
      (this.element.ariaHidden = "true"),
      (this._originalStyle = gt({}, this.element.style)),
      (this.size.height = t.offsetHeight),
      (this.size.width = t.offsetWidth),
      (this._context = this.element.getContext("2d")),
      (s = this._mutationObserver) === null ||
        s === void 0 ||
        s.observe(this.element, { attributes: !0 }),
      this.container.retina.init(),
      this.initBackground();
  }
  paint() {
    const t = this.container.actualOptions;
    this.draw((i) => {
      t.backgroundMask.enable && t.backgroundMask.cover
        ? (us(i, this.size), this._paintBase(this._coverColorStyle))
        : this._paintBase();
    });
  }
  resize() {
    if (!this.element) return;
    const t = this.container,
      i = t.retina.pixelRatio,
      s = t.canvas.size,
      n = {
        width: this.element.offsetWidth * i,
        height: this.element.offsetHeight * i,
      };
    if (
      n.height === s.height &&
      n.width === s.width &&
      n.height === this.element.height &&
      n.width === this.element.width
    )
      return;
    const o = Object.assign({}, s);
    (this.element.width = s.width = this.element.offsetWidth * i),
      (this.element.height = s.height = this.element.offsetHeight * i),
      this.container.started &&
        (this.resizeFactor = {
          width: s.width / o.width,
          height: s.height / o.height,
        });
  }
  async windowResize() {
    if (!this.element) return;
    this.resize();
    const t = this.container,
      i = t.updateActualOptions();
    t.particles.setDensity(),
      this._applyResizePlugins(),
      i && (await t.refresh());
  }
  _applyPostDrawUpdaters(t) {
    var i;
    for (const s of this._postDrawUpdaters)
      (i = s.afterDraw) === null || i === void 0 || i.call(s, t);
  }
  _applyPreDrawUpdaters(t, i, s, n, o, r) {
    var a;
    for (const l of this._preDrawUpdaters) {
      if (l.getColorStyles) {
        const { fill: c, stroke: h } = l.getColorStyles(i, t, s, n);
        c && (o.fill = c), h && (o.stroke = h);
      }
      if (l.getTransformValues) {
        const c = l.getTransformValues(i);
        for (const h in c) Du(r, c, h);
      }
      (a = l.beforeDraw) === null || a === void 0 || a.call(l, i);
    }
  }
  _applyResizePlugins() {
    for (const t of this._resizePlugins) t.resize && t.resize();
  }
  _getPluginParticleColors(t) {
    let i, s;
    for (const n of this._colorPlugins)
      if (
        (!i && n.particleFillColor && (i = oo(n.particleFillColor(t))),
        !s && n.particleStrokeColor && (s = oo(n.particleStrokeColor(t))),
        i && s)
      )
        break;
    return [i, s];
  }
  _initCover() {
    const t = this.container.actualOptions,
      i = t.backgroundMask.cover,
      s = i.color,
      n = Me(s);
    if (n) {
      const o = { r: n.r, g: n.g, b: n.b, a: i.opacity };
      this._coverColorStyle = Pi(o, o.a);
    }
  }
  _initStyle() {
    const t = this.element,
      i = this.container.actualOptions;
    if (t) {
      this._fullScreen
        ? ((this._originalStyle = gt({}, t.style)), this._setFullScreenStyle())
        : this._resetOriginalStyle();
      for (const s in i.style) {
        if (!s || !i.style) continue;
        const n = i.style[s];
        !n || t.style.setProperty(s, n, "important");
      }
    }
  }
  _initTrail() {
    const t = this.container.actualOptions,
      i = t.particles.move.trail,
      s = Me(i.fillColor);
    if (s) {
      const n = t.particles.move.trail;
      this._trailFillColor = Object.assign(Object.assign({}, s), {
        a: 1 / n.length,
      });
    }
  }
  _paintBase(t) {
    this.draw((i) => {
      xu(i, this.size, t);
    });
  }
  _repairStyle() {
    var t, i;
    const s = this.element;
    !s ||
      ((t = this._mutationObserver) === null || t === void 0 || t.disconnect(),
      this._initStyle(),
      this.initBackground(),
      (i = this._mutationObserver) === null ||
        i === void 0 ||
        i.observe(s, { attributes: !0 }));
  }
  _resetOriginalStyle() {
    const t = this.element,
      i = this._originalStyle;
    !(t && i) ||
      ((t.style.position = i.position),
      (t.style.zIndex = i.zIndex),
      (t.style.top = i.top),
      (t.style.left = i.left),
      (t.style.width = i.width),
      (t.style.height = i.height));
  }
  _setFullScreenStyle() {
    const t = this.element;
    if (!t) return;
    const i = "important";
    t.style.setProperty("position", "fixed", i),
      t.style.setProperty(
        "z-index",
        this.container.actualOptions.fullScreen.zIndex.toString(10),
        i
      ),
      t.style.setProperty("top", "0", i),
      t.style.setProperty("left", "0", i),
      t.style.setProperty("width", "100%", i),
      t.style.setProperty("height", "100%", i);
  }
}
function Pt(e, t, i, s, n) {
  if (s) {
    let o = { passive: !0 };
    typeof n == "boolean" ? (o.capture = n) : n !== void 0 && (o = n),
      e.addEventListener(t, i, o);
  } else {
    const o = n;
    e.removeEventListener(t, i, o);
  }
}
class Hu {
  constructor(t) {
    (this.container = t),
      (this.canPush = !0),
      (this.mouseMoveHandler = (i) => this.mouseTouchMove(i)),
      (this.touchStartHandler = (i) => this.mouseTouchMove(i)),
      (this.touchMoveHandler = (i) => this.mouseTouchMove(i)),
      (this.touchEndHandler = () => this.mouseTouchFinish()),
      (this.mouseLeaveHandler = () => this.mouseTouchFinish()),
      (this.touchCancelHandler = () => this.mouseTouchFinish()),
      (this.touchEndClickHandler = (i) => this.mouseTouchClick(i)),
      (this.mouseUpHandler = (i) => this.mouseTouchClick(i)),
      (this.mouseDownHandler = () => this.mouseDown()),
      (this.visibilityChangeHandler = () => this.handleVisibilityChange()),
      (this.themeChangeHandler = (i) => this.handleThemeChange(i)),
      (this.oldThemeChangeHandler = (i) => this.handleThemeChange(i)),
      (this.resizeHandler = () => this.handleWindowResize());
  }
  addListeners() {
    this.manageListeners(!0);
  }
  removeListeners() {
    this.manageListeners(!1);
  }
  doMouseTouchClick(t) {
    const i = this.container,
      s = i.actualOptions;
    if (this.canPush) {
      const n = i.interactivity.mouse.position;
      if (!n) return;
      (i.interactivity.mouse.clickPosition = Object.assign({}, n)),
        (i.interactivity.mouse.clickTime = new Date().getTime());
      const o = s.interactivity.events.onClick;
      ke(o.mode, (r) => this.handleClickMode(r));
    }
    t.type === "touchend" && setTimeout(() => this.mouseTouchFinish(), 500);
  }
  handleClickMode(t) {
    this.container.handleClickMode(t);
  }
  handleThemeChange(t) {
    const i = t,
      s = i.matches
        ? this.container.options.defaultThemes.dark
        : this.container.options.defaultThemes.light,
      n = this.container.options.themes.find((o) => o.name === s);
    n && n.default.auto && this.container.loadTheme(s);
  }
  handleVisibilityChange() {
    const t = this.container,
      i = t.actualOptions;
    this.mouseTouchFinish(),
      i.pauseOnBlur &&
        (document != null && document.hidden
          ? ((t.pageHidden = !0), t.pause())
          : ((t.pageHidden = !1),
            t.getAnimationStatus() ? t.play(!0) : t.draw(!0)));
  }
  handleWindowResize() {
    this.resizeTimeout &&
      (clearTimeout(this.resizeTimeout), delete this.resizeTimeout),
      (this.resizeTimeout = setTimeout(async () => {
        var t;
        return (t = this.container.canvas) === null || t === void 0
          ? void 0
          : t.windowResize();
      }, 500));
  }
  manageListeners(t) {
    var i;
    const s = this.container,
      n = s.actualOptions,
      o = n.interactivity.detectsOn;
    let r = uo;
    if (o === "window") (s.interactivity.element = window), (r = ku);
    else if (o === "parent" && s.canvas.element) {
      const h = s.canvas.element;
      s.interactivity.element =
        (i = h.parentElement) !== null && i !== void 0 ? i : h.parentNode;
    } else s.interactivity.element = s.canvas.element;
    const a = Ar("(prefers-color-scheme: dark)");
    a &&
      (a.addEventListener !== void 0
        ? Pt(a, "change", this.themeChangeHandler, t)
        : a.addListener !== void 0 &&
          (t
            ? a.addListener(this.oldThemeChangeHandler)
            : a.removeListener(this.oldThemeChangeHandler)));
    const l = s.interactivity.element;
    if (!l) return;
    const c = l;
    (n.interactivity.events.onHover.enable ||
      n.interactivity.events.onClick.enable) &&
      (Pt(l, co, this.mouseMoveHandler, t),
      Pt(l, Au, this.touchStartHandler, t),
      Pt(l, Su, this.touchMoveHandler, t),
      n.interactivity.events.onClick.enable
        ? (Pt(l, lo, this.touchEndClickHandler, t),
          Pt(l, zu, this.mouseUpHandler, t),
          Pt(l, Iu, this.mouseDownHandler, t))
        : Pt(l, lo, this.touchEndHandler, t),
      Pt(l, r, this.mouseLeaveHandler, t),
      Pt(l, Lu, this.touchCancelHandler, t)),
      s.canvas.element &&
        (s.canvas.element.style.pointerEvents =
          c === s.canvas.element ? "initial" : "none"),
      n.interactivity.events.resize &&
        (typeof ResizeObserver < "u"
          ? this.resizeObserver && !t
            ? (s.canvas.element &&
                this.resizeObserver.unobserve(s.canvas.element),
              this.resizeObserver.disconnect(),
              delete this.resizeObserver)
            : !this.resizeObserver &&
              t &&
              s.canvas.element &&
              ((this.resizeObserver = new ResizeObserver((h) => {
                !h.find((u) => u.target === s.canvas.element) ||
                  this.handleWindowResize();
              })),
              this.resizeObserver.observe(s.canvas.element))
          : Pt(window, Ru, this.resizeHandler, t)),
      document && Pt(document, Fu, this.visibilityChangeHandler, t, !1);
  }
  mouseDown() {
    const t = this.container.interactivity;
    if (t) {
      const i = t.mouse;
      (i.clicking = !0), (i.downPosition = i.position);
    }
  }
  mouseTouchClick(t) {
    const i = this.container,
      s = i.actualOptions,
      n = i.interactivity.mouse;
    n.inside = !0;
    let o = !1;
    const r = n.position;
    if (!(!r || !s.interactivity.events.onClick.enable)) {
      for (const [, a] of i.plugins)
        if (!!a.clickPositionValid && ((o = a.clickPositionValid(r)), o)) break;
      o || this.doMouseTouchClick(t), (n.clicking = !1);
    }
  }
  mouseTouchFinish() {
    const t = this.container.interactivity;
    if (!t) return;
    const i = t.mouse;
    delete i.position,
      delete i.clickPosition,
      delete i.downPosition,
      (t.status = uo),
      (i.inside = !1),
      (i.clicking = !1);
  }
  mouseTouchMove(t) {
    var i, s, n, o, r, a, l;
    const c = this.container,
      h = c.actualOptions;
    if (!(!((i = c.interactivity) === null || i === void 0) && i.element))
      return;
    c.interactivity.mouse.inside = !0;
    let u;
    const f = c.canvas.element;
    if (t.type.startsWith("pointer")) {
      this.canPush = !0;
      const g = t;
      if (c.interactivity.element === window) {
        if (f) {
          const y = f.getBoundingClientRect();
          u = { x: g.clientX - y.left, y: g.clientY - y.top };
        }
      } else if (h.interactivity.detectsOn === "parent") {
        const y = g.target,
          E = g.currentTarget,
          z = c.canvas.element;
        if (y && E && z) {
          const x = y.getBoundingClientRect(),
            C = E.getBoundingClientRect(),
            R = z.getBoundingClientRect();
          u = {
            x: g.offsetX + 2 * x.left - (C.left + R.left),
            y: g.offsetY + 2 * x.top - (C.top + R.top),
          };
        } else
          u = {
            x: (s = g.offsetX) !== null && s !== void 0 ? s : g.clientX,
            y: (n = g.offsetY) !== null && n !== void 0 ? n : g.clientY,
          };
      } else
        g.target === c.canvas.element &&
          (u = {
            x: (o = g.offsetX) !== null && o !== void 0 ? o : g.clientX,
            y: (r = g.offsetY) !== null && r !== void 0 ? r : g.clientY,
          });
    } else {
      this.canPush = t.type !== "touchmove";
      const g = t,
        y = g.touches[g.touches.length - 1],
        E = f == null ? void 0 : f.getBoundingClientRect();
      u = {
        x:
          y.clientX -
          ((a = E == null ? void 0 : E.left) !== null && a !== void 0 ? a : 0),
        y:
          y.clientY -
          ((l = E == null ? void 0 : E.top) !== null && l !== void 0 ? l : 0),
      };
    }
    const v = c.retina.pixelRatio;
    u && ((u.x *= v), (u.y *= v)),
      (c.interactivity.mouse.position = u),
      (c.interactivity.status = co);
  }
}
function Nu(e, t = 60, i = !1) {
  return { value: e, factor: i ? 60 / t : (60 * e) / 1e3 };
}
class Uu {
  constructor(t) {
    this.container = t;
  }
  async nextFrame(t) {
    var i;
    try {
      const s = this.container;
      if (
        !s.smooth &&
        s.lastFrameTime !== void 0 &&
        t < s.lastFrameTime + 1e3 / s.fpsLimit
      ) {
        s.draw(!1);
        return;
      }
      ((i = s.lastFrameTime) !== null && i !== void 0) || (s.lastFrameTime = t);
      const n = Nu(t - s.lastFrameTime, s.fpsLimit, s.smooth);
      if (((s.lifeTime += n.value), (s.lastFrameTime = t), n.value > 1e3)) {
        s.draw(!1);
        return;
      }
      if (
        (await s.particles.draw(n), s.duration > 0 && s.lifeTime > s.duration)
      ) {
        s.destroy();
        return;
      }
      s.getAnimationStatus() && s.draw(!1);
    } catch (s) {
      console.error("tsParticles error in animation loop", s);
    }
  }
}
class kt {
  constructor() {
    this.value = "";
  }
  static create(t, i) {
    const s = new kt();
    return (
      s.load(t),
      i !== void 0 &&
        (typeof i == "string" || i instanceof Array
          ? s.load({ value: i })
          : s.load(i)),
      s
    );
  }
  load(t) {
    (t == null ? void 0 : t.value) !== void 0 && (this.value = t.value);
  }
}
class $u {
  constructor() {
    (this.color = new kt()),
      (this.color.value = ""),
      (this.image = ""),
      (this.position = ""),
      (this.repeat = ""),
      (this.size = ""),
      (this.opacity = 1);
  }
  load(t) {
    !t ||
      (t.color !== void 0 && (this.color = kt.create(this.color, t.color)),
      t.image !== void 0 && (this.image = t.image),
      t.position !== void 0 && (this.position = t.position),
      t.repeat !== void 0 && (this.repeat = t.repeat),
      t.size !== void 0 && (this.size = t.size),
      t.opacity !== void 0 && (this.opacity = t.opacity));
  }
}
class ju {
  constructor() {
    (this.color = new kt()), (this.color.value = "#fff"), (this.opacity = 1);
  }
  load(t) {
    !t ||
      (t.color !== void 0 && (this.color = kt.create(this.color, t.color)),
      t.opacity !== void 0 && (this.opacity = t.opacity));
  }
}
class Wu {
  constructor() {
    (this.composite = "destination-out"),
      (this.cover = new ju()),
      (this.enable = !1);
  }
  load(t) {
    if (t) {
      if (
        (t.composite !== void 0 && (this.composite = t.composite),
        t.cover !== void 0)
      ) {
        const i = t.cover,
          s = typeof t.cover == "string" ? { color: t.cover } : t.cover;
        this.cover.load(i.color !== void 0 ? i : { color: s });
      }
      t.enable !== void 0 && (this.enable = t.enable);
    }
  }
}
class Vu {
  constructor() {
    (this.enable = !0), (this.zIndex = 0);
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      t.zIndex !== void 0 && (this.zIndex = t.zIndex));
  }
}
class Ku {
  constructor() {
    (this.enable = !1), (this.mode = []);
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      t.mode !== void 0 && (this.mode = t.mode));
  }
}
class ho {
  constructor() {
    (this.selectors = []),
      (this.enable = !1),
      (this.mode = []),
      (this.type = "circle");
  }
  get el() {
    return this.elementId;
  }
  set el(t) {
    this.elementId = t;
  }
  get elementId() {
    return this.ids;
  }
  set elementId(t) {
    this.ids = t;
  }
  get ids() {
    return ke(this.selectors, (t) => t.replace("#", ""));
  }
  set ids(t) {
    this.selectors = ke(t, (i) => `#${i}`);
  }
  load(t) {
    var i, s;
    if (!t) return;
    const n =
      (s = (i = t.ids) !== null && i !== void 0 ? i : t.elementId) !== null &&
      s !== void 0
        ? s
        : t.el;
    n !== void 0 && (this.ids = n),
      t.selectors !== void 0 && (this.selectors = t.selectors),
      t.enable !== void 0 && (this.enable = t.enable),
      t.mode !== void 0 && (this.mode = t.mode),
      t.type !== void 0 && (this.type = t.type);
  }
}
class qu {
  constructor() {
    (this.enable = !1), (this.force = 2), (this.smooth = 10);
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      t.force !== void 0 && (this.force = t.force),
      t.smooth !== void 0 && (this.smooth = t.smooth));
  }
}
class Yu {
  constructor() {
    (this.enable = !1), (this.mode = []), (this.parallax = new qu());
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      t.mode !== void 0 && (this.mode = t.mode),
      this.parallax.load(t.parallax));
  }
}
class Qu {
  constructor() {
    (this.onClick = new Ku()),
      (this.onDiv = new ho()),
      (this.onHover = new Yu()),
      (this.resize = !0);
  }
  get onclick() {
    return this.onClick;
  }
  set onclick(t) {
    this.onClick = t;
  }
  get ondiv() {
    return this.onDiv;
  }
  set ondiv(t) {
    this.onDiv = t;
  }
  get onhover() {
    return this.onHover;
  }
  set onhover(t) {
    this.onHover = t;
  }
  load(t) {
    var i, s, n;
    if (!t) return;
    this.onClick.load((i = t.onClick) !== null && i !== void 0 ? i : t.onclick);
    const o = (s = t.onDiv) !== null && s !== void 0 ? s : t.ondiv;
    o !== void 0 &&
      (this.onDiv = ke(o, (r) => {
        const a = new ho();
        return a.load(r), a;
      })),
      this.onHover.load(
        (n = t.onHover) !== null && n !== void 0 ? n : t.onhover
      ),
      t.resize !== void 0 && (this.resize = t.resize);
  }
}
class Ju {
  constructor(t, i) {
    (this._engine = t), (this._container = i);
  }
  load(t) {
    if (!!t && this._container) {
      const i = this._engine.plugins.interactors.get(this._container);
      if (i) for (const s of i) s.loadModeOptions && s.loadModeOptions(this, t);
    }
  }
}
class Lr {
  constructor(t, i) {
    (this.detectsOn = "window"),
      (this.events = new Qu()),
      (this.modes = new Ju(t, i));
  }
  get detect_on() {
    return this.detectsOn;
  }
  set detect_on(t) {
    this.detectsOn = t;
  }
  load(t) {
    var i;
    if (!t) return;
    const s = (i = t.detectsOn) !== null && i !== void 0 ? i : t.detect_on;
    s !== void 0 && (this.detectsOn = s),
      this.events.load(t.events),
      this.modes.load(t.modes);
  }
}
class Xu {
  load(t) {
    var i, s;
    !t ||
      (t.position !== void 0 &&
        (this.position = {
          x: (i = t.position.x) !== null && i !== void 0 ? i : 50,
          y: (s = t.position.y) !== null && s !== void 0 ? s : 50,
        }),
      t.options !== void 0 && (this.options = gt({}, t.options)));
  }
}
class Zu {
  constructor() {
    (this.maxWidth = 1 / 0), (this.options = {}), (this.mode = "canvas");
  }
  load(t) {
    !t ||
      (t.maxWidth !== void 0 && (this.maxWidth = t.maxWidth),
      t.mode !== void 0 &&
        (t.mode === "screen" ? (this.mode = "screen") : (this.mode = "canvas")),
      t.options !== void 0 && (this.options = gt({}, t.options)));
  }
}
class Gu {
  constructor() {
    (this.auto = !1), (this.mode = "any"), (this.value = !1);
  }
  load(t) {
    !t ||
      (t.auto !== void 0 && (this.auto = t.auto),
      t.mode !== void 0 && (this.mode = t.mode),
      t.value !== void 0 && (this.value = t.value));
  }
}
class th {
  constructor() {
    (this.name = ""), (this.default = new Gu());
  }
  load(t) {
    !t ||
      (t.name !== void 0 && (this.name = t.name),
      this.default.load(t.default),
      t.options !== void 0 && (this.options = gt({}, t.options)));
  }
}
class hs {
  constructor() {
    (this.count = 0),
      (this.enable = !1),
      (this.offset = 0),
      (this.speed = 1),
      (this.decay = 0),
      (this.sync = !0);
  }
  load(t) {
    !t ||
      (t.count !== void 0 && (this.count = et(t.count)),
      t.enable !== void 0 && (this.enable = t.enable),
      t.offset !== void 0 && (this.offset = et(t.offset)),
      t.speed !== void 0 && (this.speed = et(t.speed)),
      t.decay !== void 0 && (this.decay = et(t.decay)),
      t.sync !== void 0 && (this.sync = t.sync));
  }
}
class eh {
  constructor() {
    (this.h = new hs()), (this.s = new hs()), (this.l = new hs());
  }
  load(t) {
    !t || (this.h.load(t.h), this.s.load(t.s), this.l.load(t.l));
  }
}
class li extends kt {
  constructor() {
    super(), (this.animation = new eh());
  }
  static create(t, i) {
    const s = new li();
    return (
      s.load(t),
      i !== void 0 &&
        (typeof i == "string" || i instanceof Array
          ? s.load({ value: i })
          : s.load(i)),
      s
    );
  }
  load(t) {
    if ((super.load(t), !t)) return;
    const i = t.animation;
    i !== void 0 &&
      (i.enable !== void 0
        ? this.animation.h.load(i)
        : this.animation.load(t.animation));
  }
}
class ih {
  constructor() {
    this.speed = 2;
  }
  load(t) {
    !t || (t.speed !== void 0 && (this.speed = t.speed));
  }
}
class sh {
  constructor() {
    (this.enable = !0), (this.retries = 0);
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      t.retries !== void 0 && (this.retries = t.retries));
  }
}
class nh {
  constructor() {
    (this.enable = !1), (this.minimumValue = 0);
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      t.minimumValue !== void 0 && (this.minimumValue = t.minimumValue));
  }
}
class fi {
  constructor() {
    (this.random = new nh()), (this.value = 0);
  }
  load(t) {
    !t ||
      (typeof t.random == "boolean"
        ? (this.random.enable = t.random)
        : this.random.load(t.random),
      t.value !== void 0 &&
        (this.value = et(
          t.value,
          this.random.enable ? this.random.minimumValue : void 0
        )));
  }
}
class fo extends fi {
  constructor() {
    super(), (this.random.minimumValue = 0.1), (this.value = 1);
  }
}
class Rr {
  constructor() {
    (this.horizontal = new fo()), (this.vertical = new fo());
  }
  load(t) {
    !t || (this.horizontal.load(t.horizontal), this.vertical.load(t.vertical));
  }
}
class oh {
  constructor() {
    (this.absorb = new ih()),
      (this.bounce = new Rr()),
      (this.enable = !1),
      (this.mode = "bounce"),
      (this.overlap = new sh());
  }
  load(t) {
    !t ||
      (this.absorb.load(t.absorb),
      this.bounce.load(t.bounce),
      t.enable !== void 0 && (this.enable = t.enable),
      t.mode !== void 0 && (this.mode = t.mode),
      this.overlap.load(t.overlap));
  }
}
class rh {
  constructor() {
    (this.offset = 0), (this.value = 90);
  }
  load(t) {
    !t ||
      (t.offset !== void 0 && (this.offset = et(t.offset)),
      t.value !== void 0 && (this.value = et(t.value)));
  }
}
class ah {
  constructor() {
    (this.distance = 200),
      (this.enable = !1),
      (this.rotate = { x: 3e3, y: 3e3 });
  }
  get rotateX() {
    return this.rotate.x;
  }
  set rotateX(t) {
    this.rotate.x = t;
  }
  get rotateY() {
    return this.rotate.y;
  }
  set rotateY(t) {
    this.rotate.y = t;
  }
  load(t) {
    var i, s, n, o;
    if (!t) return;
    t.distance !== void 0 && (this.distance = et(t.distance)),
      t.enable !== void 0 && (this.enable = t.enable);
    const r =
      (s = (i = t.rotate) === null || i === void 0 ? void 0 : i.x) !== null &&
      s !== void 0
        ? s
        : t.rotateX;
    r !== void 0 && (this.rotate.x = r);
    const a =
      (o = (n = t.rotate) === null || n === void 0 ? void 0 : n.y) !== null &&
      o !== void 0
        ? o
        : t.rotateY;
    a !== void 0 && (this.rotate.y = a);
  }
}
class lh {
  constructor() {
    (this.x = 50), (this.y = 50), (this.mode = "percent"), (this.radius = 0);
  }
  load(t) {
    !t ||
      (t.x !== void 0 && (this.x = t.x),
      t.y !== void 0 && (this.y = t.y),
      t.mode !== void 0 && (this.mode = t.mode),
      t.radius !== void 0 && (this.radius = t.radius));
  }
}
class ch {
  constructor() {
    (this.acceleration = 9.81),
      (this.enable = !1),
      (this.inverse = !1),
      (this.maxSpeed = 50);
  }
  load(t) {
    !t ||
      (t.acceleration !== void 0 && (this.acceleration = et(t.acceleration)),
      t.enable !== void 0 && (this.enable = t.enable),
      t.inverse !== void 0 && (this.inverse = t.inverse),
      t.maxSpeed !== void 0 && (this.maxSpeed = et(t.maxSpeed)));
  }
}
class uh {
  constructor() {
    (this.clamp = !0),
      (this.delay = new fi()),
      (this.enable = !1),
      (this.options = {});
  }
  load(t) {
    !t ||
      (t.clamp !== void 0 && (this.clamp = t.clamp),
      this.delay.load(t.delay),
      t.enable !== void 0 && (this.enable = t.enable),
      (this.generator = t.generator),
      t.options && (this.options = gt(this.options, t.options)));
  }
}
class hh {
  constructor() {
    (this.enable = !1),
      (this.length = 10),
      (this.fillColor = new kt()),
      (this.fillColor.value = "#000000");
  }
  load(t) {
    !t ||
      (t.enable !== void 0 && (this.enable = t.enable),
      (this.fillColor = kt.create(this.fillColor, t.fillColor)),
      t.length !== void 0 && (this.length = t.length));
  }
}
class dh {
  constructor() {
    this.default = "out";
  }
  load(t) {
    var i, s, n, o;
    !t ||
      (t.default !== void 0 && (this.default = t.default),
      (this.bottom = (i = t.bottom) !== null && i !== void 0 ? i : t.default),
      (this.left = (s = t.left) !== null && s !== void 0 ? s : t.default),
      (this.right = (n = t.right) !== null && n !== void 0 ? n : t.default),
      (this.top = (o = t.top) !== null && o !== void 0 ? o : t.default));
  }
}
class fh {
  constructor() {
    (this.acceleration = 0), (this.enable = !1);
  }
  load(t) {
    !t ||
      (t.acceleration !== void 0 && (this.acceleration = et(t.acceleration)),
      t.enable !== void 0 && (this.enable = t.enable),
      (this.position = t.position ? gt({}, t.position) : void 0));
  }
}
class ph {
  constructor() {
    (this.angle = new rh()),
      (this.attract = new ah()),
      (this.center = new lh()),
      (this.decay = 0),
      (this.distance = {}),
      (this.direction = "none"),
      (this.drift = 0),
      (this.enable = !1),
      (this.gravity = new ch()),
      (this.path = new uh()),
      (this.outModes = new dh()),
      (this.random = !1),
      (this.size = !1),
      (this.speed = 2),
      (this.spin = new fh()),
      (this.straight = !1),
      (this.trail = new hh()),
      (this.vibrate = !1),
      (this.warp = !1);
  }
  get bounce() {
    return this.collisions;
  }
  set bounce(t) {
    this.collisions = t;
  }
  get collisions() {
    return !1;
  }
  set collisions(t) {}
  get noise() {
    return this.path;
  }
  set noise(t) {
    this.path = t;
  }
  get outMode() {
    return this.outModes.default;
  }
  set outMode(t) {
    this.outModes.default = t;
  }
  get out_mode() {
    return this.outMode;
  }
  set out_mode(t) {
    this.outMode = t;
  }
  load(t) {
    var i, s, n;
    if (!t) return;
    this.angle.load(typeof t.angle == "number" ? { value: t.angle } : t.angle),
      this.attract.load(t.attract),
      this.center.load(t.center),
      t.decay !== void 0 && (this.decay = t.decay),
      t.direction !== void 0 && (this.direction = t.direction),
      t.distance !== void 0 &&
        (this.distance =
          typeof t.distance == "number"
            ? { horizontal: t.distance, vertical: t.distance }
            : Object.assign({}, t.distance)),
      t.drift !== void 0 && (this.drift = et(t.drift)),
      t.enable !== void 0 && (this.enable = t.enable),
      this.gravity.load(t.gravity);
    const o =
      (s = (i = t.outModes) !== null && i !== void 0 ? i : t.outMode) !==
        null && s !== void 0
        ? s
        : t.out_mode;
    o !== void 0 &&
      (typeof o == "object"
        ? this.outModes.load(o)
        : this.outModes.load({ default: o })),
      this.path.load((n = t.path) !== null && n !== void 0 ? n : t.noise),
      t.random !== void 0 && (this.random = t.random),
      t.size !== void 0 && (this.size = t.size),
      t.speed !== void 0 && (this.speed = et(t.speed)),
      this.spin.load(t.spin),
      t.straight !== void 0 && (this.straight = t.straight),
      this.trail.load(t.trail),
      t.vibrate !== void 0 && (this.vibrate = t.vibrate),
      t.warp !== void 0 && (this.warp = t.warp);
  }
}
class Fr {
  constructor() {
    (this.count = 0),
      (this.enable = !1),
      (this.speed = 1),
      (this.decay = 0),
      (this.sync = !1);
  }
  load(t) {
    !t ||
      (t.count !== void 0 && (this.count = et(t.count)),
      t.enable !== void 0 && (this.enable = t.enable),
      t.speed !== void 0 && (this.speed = et(t.speed)),
      t.decay !== void 0 && (this.decay = et(t.decay)),
      t.sync !== void 0 && (this.sync = t.sync));
  }
}
class gh extends Fr {
  constructor() {
    super(),
      (this.destroy = "none"),
      (this.enable = !1),
      (this.speed = 2),
      (this.startValue = "random"),
      (this.sync = !1);
  }
  get opacity_min() {
    return this.minimumValue;
  }
  set opacity_min(t) {
    this.minimumValue = t;
  }
  load(t) {
    var i;
    !t ||
      (super.load(t),
      t.destroy !== void 0 && (this.destroy = t.destroy),
      t.enable !== void 0 && (this.enable = t.enable),
      (this.minimumValue =
        (i = t.minimumValue) !== null && i !== void 0 ? i : t.opacity_min),
      t.speed !== void 0 && (this.speed = t.speed),
      t.startValue !== void 0 && (this.startValue = t.startValue),
      t.sync !== void 0 && (this.sync = t.sync));
  }
}
class vh extends fi {
  constructor() {
    super(),
      (this.animation = new gh()),
      (this.random.minimumValue = 0.1),
      (this.value = 1);
  }
  get anim() {
    return this.animation;
  }
  set anim(t) {
    this.animation = t;
  }
  load(t) {
    var i;
    if (!t) return;
    super.load(t);
    const s = (i = t.animation) !== null && i !== void 0 ? i : t.anim;
    s !== void 0 &&
      (this.animation.load(s),
      (this.value = et(
        this.value,
        this.animation.enable ? this.animation.minimumValue : void 0
      )));
  }
}
class mh {
  constructor() {
    (this.enable = !1), (this.area = 800), (this.factor = 1e3);
  }
  get value_area() {
    return this.area;
  }
  set value_area(t) {
    this.area = t;
  }
  load(t) {
    var i;
    if (!t) return;
    t.enable !== void 0 && (this.enable = t.enable);
    const s = (i = t.area) !== null && i !== void 0 ? i : t.value_area;
    s !== void 0 && (this.area = s),
      t.factor !== void 0 && (this.factor = t.factor);
  }
}
class yh {
  constructor() {
    (this.density = new mh()), (this.limit = 0), (this.value = 100);
  }
  get max() {
    return this.limit;
  }
  set max(t) {
    this.limit = t;
  }
  load(t) {
    var i;
    if (!t) return;
    this.density.load(t.density);
    const s = (i = t.limit) !== null && i !== void 0 ? i : t.max;
    s !== void 0 && (this.limit = s),
      t.value !== void 0 && (this.value = t.value);
  }
}
class bh {
  constructor() {
    (this.blur = 0),
      (this.color = new kt()),
      (this.enable = !1),
      (this.offset = { x: 0, y: 0 }),
      (this.color.value = "#000");
  }
  load(t) {
    !t ||
      (t.blur !== void 0 && (this.blur = t.blur),
      (this.color = kt.create(this.color, t.color)),
      t.enable !== void 0 && (this.enable = t.enable),
      t.offset !== void 0 &&
        (t.offset.x !== void 0 && (this.offset.x = t.offset.x),
        t.offset.y !== void 0 && (this.offset.y = t.offset.y)));
  }
}
const ds = "character",
  fs = "char",
  ps = "image",
  gs = "images",
  vs = "polygon",
  ms = "star";
class _h {
  constructor() {
    (this.options = {}), (this.type = "circle");
  }
  get character() {
    var t;
    return (t = this.options[ds]) !== null && t !== void 0
      ? t
      : this.options[fs];
  }
  set character(t) {
    this.options[fs] = this.options[ds] = t;
  }
  get custom() {
    return this.options;
  }
  set custom(t) {
    this.options = t;
  }
  get image() {
    var t;
    return (t = this.options[ps]) !== null && t !== void 0
      ? t
      : this.options[gs];
  }
  set image(t) {
    this.options[gs] = this.options[ps] = t;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
  get polygon() {
    var t;
    return (t = this.options[vs]) !== null && t !== void 0
      ? t
      : this.options[ms];
  }
  set polygon(t) {
    this.options[ms] = this.options[vs] = t;
  }
  get stroke() {
    return [];
  }
  set stroke(t) {}
  load(t) {
    var i, s, n;
    if (!t) return;
    const o = (i = t.options) !== null && i !== void 0 ? i : t.custom;
    if (o !== void 0)
      for (const r in o) {
        const a = o[r];
        a &&
          (this.options[r] = gt(
            (s = this.options[r]) !== null && s !== void 0 ? s : {},
            a
          ));
      }
    this.loadShape(t.character, ds, fs, !0),
      this.loadShape(t.polygon, vs, ms, !1),
      this.loadShape(
        (n = t.image) !== null && n !== void 0 ? n : t.images,
        ps,
        gs,
        !0
      ),
      t.type !== void 0 && (this.type = t.type);
  }
  loadShape(t, i, s, n) {
    var o, r;
    if (!t) return;
    const a = t instanceof Array,
      l = a ? [] : {},
      c = a !== this.options[i] instanceof Array,
      h = a !== this.options[s] instanceof Array;
    c && (this.options[i] = l),
      h && n && (this.options[s] = l),
      (this.options[i] = gt(
        (o = this.options[i]) !== null && o !== void 0 ? o : l,
        t
      )),
      (!this.options[s] || n) &&
        (this.options[s] = gt(
          (r = this.options[s]) !== null && r !== void 0 ? r : l,
          t
        ));
  }
}
class wh extends Fr {
  constructor() {
    super(),
      (this.destroy = "none"),
      (this.enable = !1),
      (this.speed = 5),
      (this.startValue = "random"),
      (this.sync = !1);
  }
  get size_min() {
    return this.minimumValue;
  }
  set size_min(t) {
    this.minimumValue = t;
  }
  load(t) {
    var i;
    super.load(t),
      t &&
        (t.destroy !== void 0 && (this.destroy = t.destroy),
        t.enable !== void 0 && (this.enable = t.enable),
        (this.minimumValue =
          (i = t.minimumValue) !== null && i !== void 0 ? i : t.size_min),
        t.speed !== void 0 && (this.speed = t.speed),
        t.startValue !== void 0 && (this.startValue = t.startValue),
        t.sync !== void 0 && (this.sync = t.sync));
  }
}
class xh extends fi {
  constructor() {
    super(),
      (this.animation = new wh()),
      (this.random.minimumValue = 1),
      (this.value = 3);
  }
  get anim() {
    return this.animation;
  }
  set anim(t) {
    this.animation = t;
  }
  load(t) {
    var i;
    if ((super.load(t), !t)) return;
    const s = (i = t.animation) !== null && i !== void 0 ? i : t.anim;
    s !== void 0 &&
      (this.animation.load(s),
      (this.value = et(
        this.value,
        this.animation.enable ? this.animation.minimumValue : void 0
      )));
  }
}
class po {
  constructor() {
    this.width = 0;
  }
  load(t) {
    !t ||
      (t.color !== void 0 && (this.color = li.create(this.color, t.color)),
      t.width !== void 0 && (this.width = t.width),
      t.opacity !== void 0 && (this.opacity = t.opacity));
  }
}
class Ch extends fi {
  constructor() {
    super(),
      (this.opacityRate = 1),
      (this.sizeRate = 1),
      (this.velocityRate = 1);
  }
  load(t) {
    super.load(t),
      t &&
        (t.opacityRate !== void 0 && (this.opacityRate = t.opacityRate),
        t.sizeRate !== void 0 && (this.sizeRate = t.sizeRate),
        t.velocityRate !== void 0 && (this.velocityRate = t.velocityRate));
  }
}
class Oh {
  constructor(t, i) {
    (this._engine = t),
      (this._container = i),
      (this.bounce = new Rr()),
      (this.collisions = new oh()),
      (this.color = new li()),
      (this.color.value = "#fff"),
      (this.groups = {}),
      (this.move = new ph()),
      (this.number = new yh()),
      (this.opacity = new vh()),
      (this.reduceDuplicates = !1),
      (this.shadow = new bh()),
      (this.shape = new _h()),
      (this.size = new xh()),
      (this.stroke = new po()),
      (this.zIndex = new Ch());
  }
  load(t) {
    var i, s, n, o, r, a;
    if (!t) return;
    if (
      (this.bounce.load(t.bounce),
      this.color.load(li.create(this.color, t.color)),
      t.groups !== void 0)
    )
      for (const h in t.groups) {
        const u = t.groups[h];
        u !== void 0 &&
          (this.groups[h] = gt(
            (i = this.groups[h]) !== null && i !== void 0 ? i : {},
            u
          ));
      }
    this.move.load(t.move),
      this.number.load(t.number),
      this.opacity.load(t.opacity),
      t.reduceDuplicates !== void 0 &&
        (this.reduceDuplicates = t.reduceDuplicates),
      this.shape.load(t.shape),
      this.size.load(t.size),
      this.shadow.load(t.shadow),
      this.zIndex.load(t.zIndex);
    const l =
      (n = (s = t.move) === null || s === void 0 ? void 0 : s.collisions) !==
        null && n !== void 0
        ? n
        : (o = t.move) === null || o === void 0
        ? void 0
        : o.bounce;
    l !== void 0 && (this.collisions.enable = l),
      this.collisions.load(t.collisions),
      t.interactivity !== void 0 &&
        (this.interactivity = gt({}, t.interactivity));
    const c =
      (r = t.stroke) !== null && r !== void 0
        ? r
        : (a = t.shape) === null || a === void 0
        ? void 0
        : a.stroke;
    if (
      (c &&
        (this.stroke = ke(c, (h) => {
          const u = new po();
          return u.load(h), u;
        })),
      this._container)
    ) {
      const h = this._engine.plugins.updaters.get(this._container);
      if (h) for (const f of h) f.loadOptions && f.loadOptions(this, t);
      const u = this._engine.plugins.interactors.get(this._container);
      if (u)
        for (const f of u)
          f.loadParticlesOptions && f.loadParticlesOptions(this, t);
    }
  }
}
function Dr(e, ...t) {
  for (const i of t) e.load(i);
}
function Br(e, t, ...i) {
  const s = new Oh(e, t);
  return Dr(s, ...i), s;
}
class Th {
  constructor(t, i) {
    (this._engine = t),
      (this._container = i),
      (this.autoPlay = !0),
      (this.background = new $u()),
      (this.backgroundMask = new Wu()),
      (this.defaultThemes = {}),
      (this.delay = 0),
      (this.fullScreen = new Vu()),
      (this.detectRetina = !0),
      (this.duration = 0),
      (this.fpsLimit = 120),
      (this.interactivity = new Lr(t, i)),
      (this.manualParticles = []),
      (this.particles = Br(this._engine, this._container)),
      (this.pauseOnBlur = !0),
      (this.pauseOnOutsideViewport = !0),
      (this.responsive = []),
      (this.smooth = !1),
      (this.style = {}),
      (this.themes = []),
      (this.zLayers = 100);
  }
  get backgroundMode() {
    return this.fullScreen;
  }
  set backgroundMode(t) {
    this.fullScreen.load(t);
  }
  get fps_limit() {
    return this.fpsLimit;
  }
  set fps_limit(t) {
    this.fpsLimit = t;
  }
  get retina_detect() {
    return this.detectRetina;
  }
  set retina_detect(t) {
    this.detectRetina = t;
  }
  load(t) {
    var i, s, n, o, r;
    if (!t) return;
    t.preset !== void 0 && ke(t.preset, (u) => this._importPreset(u)),
      t.autoPlay !== void 0 && (this.autoPlay = t.autoPlay),
      t.delay !== void 0 && (this.delay = et(t.delay));
    const a =
      (i = t.detectRetina) !== null && i !== void 0 ? i : t.retina_detect;
    a !== void 0 && (this.detectRetina = a),
      t.duration !== void 0 && (this.duration = et(t.duration));
    const l = (s = t.fpsLimit) !== null && s !== void 0 ? s : t.fps_limit;
    l !== void 0 && (this.fpsLimit = l),
      t.pauseOnBlur !== void 0 && (this.pauseOnBlur = t.pauseOnBlur),
      t.pauseOnOutsideViewport !== void 0 &&
        (this.pauseOnOutsideViewport = t.pauseOnOutsideViewport),
      t.zLayers !== void 0 && (this.zLayers = t.zLayers),
      this.background.load(t.background);
    const c =
      (n = t.fullScreen) !== null && n !== void 0 ? n : t.backgroundMode;
    typeof c == "boolean"
      ? (this.fullScreen.enable = c)
      : this.fullScreen.load(c),
      this.backgroundMask.load(t.backgroundMask),
      this.interactivity.load(t.interactivity),
      t.manualParticles !== void 0 &&
        (this.manualParticles = t.manualParticles.map((u) => {
          const f = new Xu();
          return f.load(u), f;
        })),
      this.particles.load(t.particles),
      (this.style = gt(this.style, t.style)),
      this._engine.plugins.loadOptions(this, t),
      t.smooth !== void 0 && (this.smooth = t.smooth);
    const h = this._engine.plugins.interactors.get(this._container);
    if (h) for (const u of h) u.loadOptions && u.loadOptions(this, t);
    if (t.responsive !== void 0)
      for (const u of t.responsive) {
        const f = new Zu();
        f.load(u), this.responsive.push(f);
      }
    if (
      (this.responsive.sort((u, f) => u.maxWidth - f.maxWidth),
      t.themes !== void 0)
    )
      for (const u of t.themes) {
        const f = new th();
        f.load(u), this.themes.push(f);
      }
    (this.defaultThemes.dark =
      (o = this._findDefaultTheme("dark")) === null || o === void 0
        ? void 0
        : o.name),
      (this.defaultThemes.light =
        (r = this._findDefaultTheme("light")) === null || r === void 0
          ? void 0
          : r.name);
  }
  setResponsive(t, i, s) {
    this.load(s);
    const n = this.responsive.find((o) =>
      o.mode === "screen" && screen
        ? o.maxWidth > screen.availWidth
        : o.maxWidth * i > t
    );
    return (
      this.load(n == null ? void 0 : n.options), n == null ? void 0 : n.maxWidth
    );
  }
  setTheme(t) {
    if (t) {
      const i = this.themes.find((s) => s.name === t);
      i && this.load(i.options);
    } else {
      const i = Ar("(prefers-color-scheme: dark)"),
        s = i && i.matches,
        n = this._findDefaultTheme(s ? "dark" : "light");
      n && this.load(n.options);
    }
  }
  _findDefaultTheme(t) {
    var i;
    return (i = this.themes.find(
      (s) => s.default.value && s.default.mode === t
    )) !== null && i !== void 0
      ? i
      : this.themes.find((s) => s.default.value && s.default.mode === "any");
  }
  _importPreset(t) {
    this.load(this._engine.plugins.getPreset(t));
  }
}
class Ph {
  constructor(t, i) {
    (this.container = i),
      (this._engine = t),
      (this._interactors = this._engine.plugins.getInteractors(
        this.container,
        !0
      )),
      (this._externalInteractors = []),
      (this._particleInteractors = []);
  }
  async externalInteract(t) {
    for (const i of this._externalInteractors)
      i.isEnabled() && (await i.interact(t));
  }
  handleClickMode(t) {
    for (const i of this._externalInteractors)
      i.handleClickMode && i.handleClickMode(t);
  }
  init() {
    (this._externalInteractors = []), (this._particleInteractors = []);
    for (const t of this._interactors) {
      switch (t.type) {
        case 0:
          this._externalInteractors.push(t);
          break;
        case 1:
          this._particleInteractors.push(t);
          break;
      }
      t.init();
    }
  }
  async particlesInteract(t, i) {
    for (const s of this._externalInteractors) s.clear(t, i);
    for (const s of this._particleInteractors)
      s.isEnabled(t) && (await s.interact(t, i));
  }
  async reset(t) {
    for (const i of this._externalInteractors)
      i.isEnabled() && (await i.reset(t));
    for (const i of this._particleInteractors)
      i.isEnabled(t) && (await i.reset(t));
  }
}
const go = (e) => {
  !pu(e.outMode, e.checkModes) ||
    (e.coord > e.maxCoord - e.radius * 2
      ? e.setCb(-e.radius)
      : e.coord < e.radius * 2 && e.setCb(e.radius));
};
class Eh {
  constructor(t, i, s, n, o, r) {
    (this.container = s), (this._engine = t), this.init(i, n, o, r);
  }
  destroy(t) {
    if (!(this.unbreakable || this.destroyed)) {
      (this.destroyed = !0),
        (this.bubble.inRange = !1),
        (this.slow.inRange = !1);
      for (const [, i] of this.container.plugins)
        i.particleDestroyed && i.particleDestroyed(this, t);
      for (const i of this.container.particles.updaters)
        i.particleDestroyed && i.particleDestroyed(this, t);
    }
  }
  draw(t) {
    const i = this.container;
    for (const [, s] of i.plugins) i.canvas.drawParticlePlugin(s, this, t);
    i.canvas.drawParticle(this, t);
  }
  getFillColor() {
    var t, i;
    const s =
      (t = this.bubble.color) !== null && t !== void 0 ? t : ao(this.color);
    if (s && this.roll && (this.backColor || this.roll.alter)) {
      const n = this.roll.horizontal && this.roll.vertical ? 2 : 1,
        o = this.roll.horizontal ? Math.PI / 2 : 0;
      if (
        Math.floor(
          (((i = this.roll.angle) !== null && i !== void 0 ? i : 0) + o) /
            (Math.PI / n)
        ) % 2
      ) {
        if (this.backColor) return this.backColor;
        if (this.roll.alter)
          return Mu(s, this.roll.alter.type, this.roll.alter.value);
      }
    }
    return s;
  }
  getMass() {
    return (this.getRadius() ** 2 * Math.PI) / 2;
  }
  getPosition() {
    return {
      x: this.position.x + this.offset.x,
      y: this.position.y + this.offset.y,
      z: this.position.z,
    };
  }
  getRadius() {
    var t;
    return (t = this.bubble.radius) !== null && t !== void 0
      ? t
      : this.size.value;
  }
  getStrokeColor() {
    var t, i;
    return (i =
      (t = this.bubble.color) !== null && t !== void 0
        ? t
        : ao(this.strokeColor)) !== null && i !== void 0
      ? i
      : this.getFillColor();
  }
  init(t, i, s, n) {
    var o, r, a, l, c, h, u, f, v;
    const g = this.container,
      y = this._engine;
    (this.id = t),
      (this.group = n),
      (this.fill = !0),
      (this.pathRotation = !1),
      (this.close = !0),
      (this.lastPathTime = 0),
      (this.destroyed = !1),
      (this.unbreakable = !1),
      (this.rotation = 0),
      (this.misplaced = !1),
      (this.retina = { maxDistance: {} }),
      (this.outType = "normal"),
      (this.ignoresResizeRatio = !0);
    const E = g.retina.pixelRatio,
      z = g.actualOptions,
      x = Br(this._engine, g, z.particles),
      C = x.shape.type,
      { reduceDuplicates: R } = x;
    this.shape = Ze(C, this.id, R);
    const k = x.shape;
    if (s && s.shape && s.shape.type) {
      const Q = s.shape.type,
        X = Ze(Q, this.id, R);
      X && ((this.shape = X), k.load(s.shape));
    }
    (this.shapeData = this._loadShapeData(k, R)),
      x.load(s),
      x.load(
        (o = this.shapeData) === null || o === void 0 ? void 0 : o.particles
      ),
      (this.interactivity = new Lr(y, g)),
      this.interactivity.load(g.actualOptions.interactivity),
      this.interactivity.load(x.interactivity),
      (this.fill =
        (a =
          (r = this.shapeData) === null || r === void 0 ? void 0 : r.fill) !==
          null && a !== void 0
          ? a
          : this.fill),
      (this.close =
        (c =
          (l = this.shapeData) === null || l === void 0 ? void 0 : l.close) !==
          null && c !== void 0
          ? c
          : this.close),
      (this.options = x);
    const B = this.options.move.path;
    (this.pathDelay = ou(B.delay) * 1e3),
      B.generator &&
        ((this.pathGenerator = this._engine.plugins.getPathGenerator(
          B.generator
        )),
        this.pathGenerator &&
          g.addPath(B.generator, this.pathGenerator) &&
          this.pathGenerator.init(g));
    const L = nt(this.options.zIndex.value);
    g.retina.initParticle(this);
    const O = this.options.size,
      H = O.value,
      U = O.animation;
    if (
      ((this.size = {
        enable: O.animation.enable,
        value: nt(O.value) * g.retina.pixelRatio,
        max: gn(H) * E,
        min: pn(H) * E,
        loops: 0,
        maxLoops: nt(O.animation.count),
      }),
      U.enable)
    )
      switch (
        ((this.size.status = 0),
        (this.size.decay = 1 - nt(U.decay)),
        U.startValue)
      ) {
        case "min":
          (this.size.value = this.size.min), (this.size.status = 0);
          break;
        case "random":
          (this.size.value = Ee(this.size) * E),
            (this.size.status = oe() >= 0.5 ? 0 : 1);
          break;
        case "max":
        default:
          (this.size.value = this.size.max), (this.size.status = 1);
          break;
      }
    (this.bubble = { inRange: !1 }),
      (this.slow = { inRange: !1, factor: 1 }),
      (this.position = this._calcPosition(g, i, Ir(L, 0, g.zLayers))),
      (this.initialPosition = this.position.copy());
    const W = g.canvas.size,
      A = Object.assign({}, this.options.move.center),
      J = A.mode === "percent";
    switch (
      ((this.moveCenter = {
        x: A.x * (J ? W.width / 100 : 1),
        y: A.y * (J ? W.height / 100 : 1),
        radius:
          (h = this.options.move.center.radius) !== null && h !== void 0
            ? h
            : 0,
        mode:
          (u = this.options.move.center.mode) !== null && u !== void 0
            ? u
            : "percent",
      }),
      (this.direction = au(
        this.options.move.direction,
        this.position,
        this.moveCenter
      )),
      this.options.move.direction)
    ) {
      case "inside":
        this.outType = "inside";
        break;
      case "outside":
        this.outType = "outside";
        break;
    }
    (this.initialVelocity = this._calculateVelocity()),
      (this.velocity = this.initialVelocity.copy()),
      (this.moveDecay = 1 - nt(this.options.move.decay)),
      (this.offset = Pe.origin);
    const Z = g.particles;
    (Z.needsSort = Z.needsSort || Z.lastZIndex < this.position.z),
      (Z.lastZIndex = this.position.z),
      (this.zIndexFactor = this.position.z / g.zLayers),
      (this.sides = 24);
    let Y = g.drawers.get(this.shape);
    Y ||
      ((Y = this._engine.plugins.getShapeDrawer(this.shape)),
      Y && g.drawers.set(this.shape, Y)),
      Y != null && Y.loadShape && (Y == null || Y.loadShape(this));
    const at = Y == null ? void 0 : Y.getSidesCount;
    at && (this.sides = at(this)),
      (this.spawning = !1),
      (this.shadowColor = Me(this.options.shadow.color));
    for (const Q of g.particles.updaters) Q.init(this);
    for (const Q of g.particles.movers)
      (f = Q.init) === null || f === void 0 || f.call(Q, this);
    Y != null && Y.particleInit && Y.particleInit(g, this);
    for (const [, Q] of g.plugins)
      (v = Q.particleCreated) === null || v === void 0 || v.call(Q, this);
  }
  isInsideCanvas() {
    const t = this.getRadius(),
      i = this.container.canvas.size;
    return (
      this.position.x >= -t &&
      this.position.y >= -t &&
      this.position.y <= i.height + t &&
      this.position.x <= i.width + t
    );
  }
  isVisible() {
    return !this.destroyed && !this.spawning && this.isInsideCanvas();
  }
  reset() {
    var t;
    for (const i of this.container.particles.updaters)
      (t = i.reset) === null || t === void 0 || t.call(i, this);
  }
  _calcPosition(t, i, s, n = 0) {
    var o, r, a, l;
    for (const [, E] of t.plugins) {
      const z =
        E.particlePosition !== void 0 ? E.particlePosition(i, this) : void 0;
      if (z !== void 0) return xt.create(z.x, z.y, s);
    }
    const c = t.canvas.size,
      h = uu({ size: c, position: i }),
      u = xt.create(h.x, h.y, s),
      f = this.getRadius(),
      v = this.options.move.outModes,
      g = (E) => {
        go({
          outMode: E,
          checkModes: ["bounce", "bounce-horizontal"],
          coord: u.x,
          maxCoord: t.canvas.size.width,
          setCb: (z) => (u.x += z),
          radius: f,
        });
      },
      y = (E) => {
        go({
          outMode: E,
          checkModes: ["bounce", "bounce-vertical"],
          coord: u.y,
          maxCoord: t.canvas.size.height,
          setCb: (z) => (u.y += z),
          radius: f,
        });
      };
    return (
      g((o = v.left) !== null && o !== void 0 ? o : v.default),
      g((r = v.right) !== null && r !== void 0 ? r : v.default),
      y((a = v.top) !== null && a !== void 0 ? a : v.default),
      y((l = v.bottom) !== null && l !== void 0 ? l : v.default),
      this._checkOverlap(u, n) ? this._calcPosition(t, void 0, s, n + 1) : u
    );
  }
  _calculateVelocity() {
    const t = lu(this.direction).copy(),
      i = this.options.move;
    if (i.direction === "inside" || i.direction === "outside") return t;
    const s = (Math.PI / 180) * nt(i.angle.value),
      n = (Math.PI / 180) * nt(i.angle.offset),
      o = { left: n - s / 2, right: n + s / 2 };
    return (
      i.straight || (t.angle += Ee(et(o.left, o.right))),
      i.random && typeof i.speed == "number" && (t.length *= oe()),
      t
    );
  }
  _checkOverlap(t, i = 0) {
    const s = this.options.collisions,
      n = this.getRadius();
    if (!s.enable) return !1;
    const o = s.overlap;
    if (o.enable) return !1;
    const r = o.retries;
    if (r >= 0 && i > r)
      throw new Error("Particle is overlapping and can't be placed");
    let a = !1;
    for (const l of this.container.particles.array)
      if (vn(t, l.position) < n + l.getRadius()) {
        a = !0;
        break;
      }
    return a;
  }
  _loadShapeData(t, i) {
    const s = t.options[this.shape];
    if (s) return gt({}, Ze(s, this.id, i));
  }
}
class Mh {
  constructor(t, i) {
    (this.position = t), (this.particle = i);
  }
}
class Hr {
  constructor(t, i) {
    this.position = { x: t, y: i };
  }
}
class Nr extends Hr {
  constructor(t, i, s) {
    super(t, i), (this.radius = s);
  }
  contains(t) {
    return vn(t, this.position) <= this.radius;
  }
  intersects(t) {
    const i = t,
      s = t,
      n = this.position,
      o = t.position,
      r = { x: Math.abs(o.x - n.x), y: Math.abs(o.y - n.y) },
      a = this.radius;
    if (s.radius !== void 0) {
      const l = a + s.radius,
        c = Math.sqrt(r.x ** 2 + r.y ** 2);
      return l > c;
    } else if (i.size !== void 0) {
      const l = i.size.width,
        c = i.size.height;
      return (
        Math.pow(r.x - l, 2) + Math.pow(r.y - c, 2) <= a ** 2 ||
        (r.x <= a + l && r.y <= a + c) ||
        r.x <= l ||
        r.y <= c
      );
    }
    return !1;
  }
}
class Wt extends Hr {
  constructor(t, i, s, n) {
    super(t, i), (this.size = { height: n, width: s });
  }
  contains(t) {
    const i = this.size.width,
      s = this.size.height,
      n = this.position;
    return t.x >= n.x && t.x <= n.x + i && t.y >= n.y && t.y <= n.y + s;
  }
  intersects(t) {
    t instanceof Nr && t.intersects(this);
    const i = this.size.width,
      s = this.size.height,
      n = this.position,
      o = t.position,
      r = t instanceof Wt ? t.size : { width: 0, height: 0 },
      a = r.width,
      l = r.height;
    return o.x < n.x + i && o.x + a > n.x && o.y < n.y + s && o.y + l > n.y;
  }
}
class ge {
  constructor(t, i) {
    (this.rectangle = t),
      (this.capacity = i),
      (this._points = []),
      (this._divided = !1);
  }
  insert(t) {
    var i, s, n, o, r;
    return this.rectangle.contains(t.position)
      ? this._points.length < this.capacity
        ? (this._points.push(t), !0)
        : (this._divided || this.subdivide(),
          (r =
            ((i = this._NE) === null || i === void 0 ? void 0 : i.insert(t)) ||
            ((s = this._NW) === null || s === void 0 ? void 0 : s.insert(t)) ||
            ((n = this._SE) === null || n === void 0 ? void 0 : n.insert(t)) ||
            ((o = this._SW) === null || o === void 0
              ? void 0
              : o.insert(t))) !== null && r !== void 0
            ? r
            : !1)
      : !1;
  }
  query(t, i, s) {
    var n, o, r, a;
    const l = s != null ? s : [];
    if (!t.intersects(this.rectangle)) return [];
    for (const c of this._points)
      (!t.contains(c.position) &&
        vn(t.position, c.position) > c.particle.getRadius() &&
        (!i || i(c.particle))) ||
        l.push(c.particle);
    return (
      this._divided &&
        ((n = this._NE) === null || n === void 0 || n.query(t, i, l),
        (o = this._NW) === null || o === void 0 || o.query(t, i, l),
        (r = this._SE) === null || r === void 0 || r.query(t, i, l),
        (a = this._SW) === null || a === void 0 || a.query(t, i, l)),
      l
    );
  }
  queryCircle(t, i, s) {
    return this.query(new Nr(t.x, t.y, i), s);
  }
  queryRectangle(t, i, s) {
    return this.query(new Wt(t.x, t.y, i.width, i.height), s);
  }
  subdivide() {
    const t = this.rectangle.position.x,
      i = this.rectangle.position.y,
      s = this.rectangle.size.width,
      n = this.rectangle.size.height,
      o = this.capacity;
    (this._NE = new ge(new Wt(t, i, s / 2, n / 2), o)),
      (this._NW = new ge(new Wt(t + s / 2, i, s / 2, n / 2), o)),
      (this._SE = new ge(new Wt(t, i + n / 2, s / 2, n / 2), o)),
      (this._SW = new ge(new Wt(t + s / 2, i + n / 2, s / 2, n / 2), o)),
      (this._divided = !0);
  }
}
class Ih {
  constructor(t, i) {
    (this.container = i),
      (this._engine = t),
      (this.nextId = 0),
      (this.array = []),
      (this.zArray = []),
      (this.pool = []),
      (this.limit = 0),
      (this.needsSort = !1),
      (this.lastZIndex = 0),
      (this.interactionManager = new Ph(this._engine, i));
    const s = this.container.canvas.size;
    (this.quadTree = new ge(
      new Wt(
        -s.width / 4,
        -s.height / 4,
        (s.width * 3) / 2,
        (s.height * 3) / 2
      ),
      4
    )),
      (this.movers = this._engine.plugins.getMovers(i, !0)),
      (this.updaters = this._engine.plugins.getUpdaters(i, !0));
  }
  get count() {
    return this.array.length;
  }
  addManualParticles() {
    const t = this.container,
      i = t.actualOptions;
    for (const s of i.manualParticles)
      this.addParticle(
        cu({ size: t.canvas.size, position: s.position }),
        s.options
      );
  }
  addParticle(t, i, s, n) {
    const o = this.container,
      r = o.actualOptions,
      a = r.particles.number.limit;
    if (a > 0) {
      const l = this.count + 1 - a;
      l > 0 && this.removeQuantity(l);
    }
    return this._pushParticle(t, i, s, n);
  }
  clear() {
    (this.array = []), (this.zArray = []);
  }
  destroy() {
    (this.array = []),
      (this.zArray = []),
      (this.movers = []),
      (this.updaters = []);
  }
  async draw(t) {
    const i = this.container,
      s = this.container.canvas.size;
    (this.quadTree = new ge(
      new Wt(
        -s.width / 4,
        -s.height / 4,
        (s.width * 3) / 2,
        (s.height * 3) / 2
      ),
      4
    )),
      i.canvas.clear(),
      await this.update(t),
      this.needsSort &&
        (this.zArray.sort((n, o) => o.position.z - n.position.z || n.id - o.id),
        (this.lastZIndex = this.zArray[this.zArray.length - 1].position.z),
        (this.needsSort = !1));
    for (const [, n] of i.plugins) i.canvas.drawPlugin(n, t);
    for (const n of this.zArray) n.draw(t);
  }
  handleClickMode(t) {
    this.interactionManager.handleClickMode(t);
  }
  init() {
    var t;
    const i = this.container,
      s = i.actualOptions;
    (this.lastZIndex = 0), (this.needsSort = !1);
    let n = !1;
    (this.updaters = this._engine.plugins.getUpdaters(i, !0)),
      this.interactionManager.init();
    for (const [, o] of i.plugins)
      if (
        (o.particlesInitialization !== void 0 &&
          (n = o.particlesInitialization()),
        n)
      )
        break;
    this.interactionManager.init();
    for (const [, o] of i.pathGenerators) o.init(i);
    if ((this.addManualParticles(), !n)) {
      for (const o in s.particles.groups) {
        const r = s.particles.groups[o];
        for (
          let a = this.count, l = 0;
          l < ((t = r.number) === null || t === void 0 ? void 0 : t.value) &&
          a < s.particles.number.value;
          a++, l++
        )
          this.addParticle(void 0, r, o);
      }
      for (let o = this.count; o < s.particles.number.value; o++)
        this.addParticle();
    }
  }
  push(t, i, s, n) {
    this.pushing = !0;
    for (let o = 0; o < t; o++)
      this.addParticle(i == null ? void 0 : i.position, s, n);
    this.pushing = !1;
  }
  async redraw() {
    this.clear(), this.init(), await this.draw({ value: 0, factor: 0 });
  }
  remove(t, i, s) {
    this.removeAt(this.array.indexOf(t), void 0, i, s);
  }
  removeAt(t, i = 1, s, n) {
    if (t < 0 || t > this.count) return;
    let o = 0;
    for (let r = t; o < i && r < this.count; r++) {
      const a = this.array[r];
      if (!a || a.group !== s) continue;
      a.destroy(n), this.array.splice(r--, 1);
      const l = this.zArray.indexOf(a);
      this.zArray.splice(l, 1),
        this.pool.push(a),
        o++,
        this._engine.dispatchEvent("particleRemoved", {
          container: this.container,
          data: { particle: a },
        });
    }
  }
  removeQuantity(t, i) {
    this.removeAt(0, t, i);
  }
  setDensity() {
    const t = this.container.actualOptions;
    for (const i in t.particles.groups)
      this._applyDensity(t.particles.groups[i], 0, i);
    this._applyDensity(t.particles, t.manualParticles.length);
  }
  async update(t) {
    var i, s;
    const n = this.container,
      o = [];
    for (const [, r] of n.pathGenerators) r.update();
    for (const [, r] of n.plugins)
      (i = r.update) === null || i === void 0 || i.call(r, t);
    for (const r of this.array) {
      const a = n.canvas.resizeFactor;
      a &&
        !r.ignoresResizeRatio &&
        ((r.position.x *= a.width),
        (r.position.y *= a.height),
        (r.initialPosition.x *= a.width),
        (r.initialPosition.y *= a.height)),
        (r.ignoresResizeRatio = !1),
        await this.interactionManager.reset(r);
      for (const [, l] of this.container.plugins) {
        if (r.destroyed) break;
        (s = l.particleUpdate) === null || s === void 0 || s.call(l, r, t);
      }
      for (const l of this.movers) l.isEnabled(r) && l.move(r, t);
      if (r.destroyed) {
        o.push(r);
        continue;
      }
      this.quadTree.insert(new Mh(r.getPosition(), r));
    }
    for (const r of o) this.remove(r);
    await this.interactionManager.externalInteract(t);
    for (const r of this.array) {
      for (const a of this.updaters) a.update(r, t);
      !r.destroyed &&
        !r.spawning &&
        (await this.interactionManager.particlesInteract(r, t));
    }
    delete n.canvas.resizeFactor;
  }
  _applyDensity(t, i, s) {
    var n;
    if (!(!((n = t.number.density) === null || n === void 0) && n.enable))
      return;
    const o = t.number,
      r = this._initDensityFactor(o.density),
      a = o.value,
      l = o.limit > 0 ? o.limit : a,
      c = Math.min(a, l) * r + i,
      h = Math.min(this.count, this.array.filter((u) => u.group === s).length);
    (this.limit = o.limit * r),
      h < c
        ? this.push(Math.abs(c - h), void 0, t, s)
        : h > c && this.removeQuantity(h - c, s);
  }
  _initDensityFactor(t) {
    const i = this.container;
    if (!i.canvas.element || !t.enable) return 1;
    const s = i.canvas.element,
      n = i.retina.pixelRatio;
    return (s.width * s.height) / (t.factor * n ** 2 * t.area);
  }
  _pushParticle(t, i, s, n) {
    try {
      let o = this.pool.pop();
      o
        ? o.init(this.nextId, t, i, s)
        : (o = new Eh(this._engine, this.nextId, this.container, t, i, s));
      let r = !0;
      return (
        n && (r = n(o)),
        r
          ? (this.array.push(o),
            this.zArray.push(o),
            this.nextId++,
            this._engine.dispatchEvent("particleAdded", {
              container: this.container,
              data: { particle: o },
            }),
            o)
          : void 0
      );
    } catch (o) {
      console.warn(`error adding particle: ${o}`);
      return;
    }
  }
}
class zh {
  constructor(t) {
    this.container = t;
  }
  init() {
    const t = this.container,
      i = t.actualOptions;
    (this.pixelRatio = !i.detectRetina || di() ? 1 : window.devicePixelRatio),
      (this.reduceFactor = 1);
    const s = this.pixelRatio;
    if (t.canvas.element) {
      const o = t.canvas.element;
      (t.canvas.size.width = o.offsetWidth * s),
        (t.canvas.size.height = o.offsetHeight * s);
    }
    const n = i.particles;
    (this.attractDistance = nt(n.move.attract.distance) * s),
      (this.sizeAnimationSpeed = nt(n.size.animation.speed) * s),
      (this.maxSpeed = nt(n.move.gravity.maxSpeed) * s);
  }
  initParticle(t) {
    const i = t.options,
      s = this.pixelRatio,
      n = i.move.distance,
      o = t.retina;
    (o.attractDistance = nt(i.move.attract.distance) * s),
      (o.moveDrift = nt(i.move.drift) * s),
      (o.moveSpeed = nt(i.move.speed) * s),
      (o.sizeAnimationSpeed = nt(i.size.animation.speed) * s);
    const r = o.maxDistance;
    (r.horizontal = n.horizontal !== void 0 ? n.horizontal * s : void 0),
      (r.vertical = n.vertical !== void 0 ? n.vertical * s : void 0),
      (o.maxSpeed = nt(i.move.gravity.maxSpeed) * s);
  }
}
function ot(e) {
  return e && !e.destroyed;
}
function $e(e, t, ...i) {
  const s = new Th(e, t);
  return Dr(s, ...i), s;
}
const Ah = "default",
  vo = {
    generate: (e) => {
      const t = e.velocity.copy();
      return (t.angle += (t.length * Math.PI) / 180), t;
    },
    init: () => {},
    update: () => {},
  };
class Sh {
  constructor(t, i, s) {
    (this.id = i),
      (this._engine = t),
      (this.fpsLimit = 120),
      (this.smooth = !1),
      (this._delay = 0),
      (this.duration = 0),
      (this.lifeTime = 0),
      (this._firstStart = !0),
      (this.started = !1),
      (this.destroyed = !1),
      (this._paused = !0),
      (this.lastFrameTime = 0),
      (this.zLayers = 100),
      (this.pageHidden = !1),
      (this._sourceOptions = s),
      (this._initialSourceOptions = s),
      (this.retina = new zh(this)),
      (this.canvas = new Bu(this)),
      (this.particles = new Ih(this._engine, this)),
      (this.frameManager = new Uu(this)),
      (this.pathGenerators = new Map()),
      (this.interactivity = { mouse: { clicking: !1, inside: !1 } }),
      (this.plugins = new Map()),
      (this.drawers = new Map()),
      (this._options = $e(this._engine, this)),
      (this.actualOptions = $e(this._engine, this)),
      (this._eventListeners = new Hu(this)),
      typeof IntersectionObserver < "u" &&
        IntersectionObserver &&
        (this._intersectionObserver = new IntersectionObserver((n) =>
          this._intersectionManager(n)
        )),
      this._engine.dispatchEvent("containerBuilt", { container: this });
  }
  get options() {
    return this._options;
  }
  get sourceOptions() {
    return this._sourceOptions;
  }
  addClickHandler(t) {
    if (!ot(this)) return;
    const i = this.interactivity.element;
    if (!i) return;
    const s = (u, f, v) => {
        if (!ot(this)) return;
        const g = this.retina.pixelRatio,
          y = { x: f.x * g, y: f.y * g },
          E = this.particles.quadTree.queryCircle(y, v * g);
        t(u, E);
      },
      n = (u) => {
        if (!ot(this)) return;
        const f = u,
          v = { x: f.offsetX || f.clientX, y: f.offsetY || f.clientY };
        s(u, v, 1);
      },
      o = () => {
        !ot(this) || ((c = !0), (h = !1));
      },
      r = () => {
        !ot(this) || (h = !0);
      },
      a = (u) => {
        if (ot(this)) {
          if (c && !h) {
            const f = u;
            let v = f.touches[f.touches.length - 1];
            if (!v && ((v = f.changedTouches[f.changedTouches.length - 1]), !v))
              return;
            const g = this.canvas.element,
              y = g ? g.getBoundingClientRect() : void 0,
              E = {
                x: v.clientX - (y ? y.left : 0),
                y: v.clientY - (y ? y.top : 0),
              };
            s(u, E, Math.max(v.radiusX, v.radiusY));
          }
          (c = !1), (h = !1);
        }
      },
      l = () => {
        !ot(this) || ((c = !1), (h = !1));
      };
    let c = !1,
      h = !1;
    i.addEventListener("click", n),
      i.addEventListener("touchstart", o),
      i.addEventListener("touchmove", r),
      i.addEventListener("touchend", a),
      i.addEventListener("touchcancel", l);
  }
  addPath(t, i, s = !1) {
    return !ot(this) || (!s && this.pathGenerators.has(t))
      ? !1
      : (this.pathGenerators.set(t, i != null ? i : vo), !0);
  }
  destroy() {
    if (!ot(this)) return;
    this.stop(), this.particles.destroy(), this.canvas.destroy();
    for (const [, s] of this.drawers) s.destroy && s.destroy(this);
    for (const s of this.drawers.keys()) this.drawers.delete(s);
    this._engine.plugins.destroy(this), (this.destroyed = !0);
    const t = this._engine.dom(),
      i = t.findIndex((s) => s === this);
    i >= 0 && t.splice(i, 1),
      this._engine.dispatchEvent("containerDestroyed", { container: this });
  }
  draw(t) {
    if (!ot(this)) return;
    let i = t;
    this._drawAnimationFrame = du()(async (s) => {
      i && ((this.lastFrameTime = void 0), (i = !1)),
        await this.frameManager.nextFrame(s);
    });
  }
  exportConfiguration() {
    return JSON.stringify(
      this.actualOptions,
      (t, i) => {
        if (!(t === "_engine" || t === "_container")) return i;
      },
      2
    );
  }
  exportImage(t, i, s) {
    const n = this.canvas.element;
    n && n.toBlob(t, i != null ? i : "image/png", s);
  }
  exportImg(t) {
    this.exportImage(t);
  }
  getAnimationStatus() {
    return !this._paused && !this.pageHidden && ot(this);
  }
  handleClickMode(t) {
    if (ot(this)) {
      this.particles.handleClickMode(t);
      for (const [, i] of this.plugins)
        i.handleClickMode && i.handleClickMode(t);
    }
  }
  async init() {
    if (!ot(this)) return;
    const t = this._engine.plugins.getSupportedShapes();
    for (const s of t) {
      const n = this._engine.plugins.getShapeDrawer(s);
      n && this.drawers.set(s, n);
    }
    (this._options = $e(
      this._engine,
      this,
      this._initialSourceOptions,
      this.sourceOptions
    )),
      (this.actualOptions = $e(this._engine, this, this._options));
    const i = this._engine.plugins.getAvailablePlugins(this);
    for (const [s, n] of i) this.plugins.set(s, n);
    this.retina.init(),
      this.canvas.init(),
      this.updateActualOptions(),
      this.canvas.initBackground(),
      this.canvas.resize(),
      (this.zLayers = this.actualOptions.zLayers),
      (this.duration = nt(this.actualOptions.duration) * 1e3),
      (this._delay = nt(this.actualOptions.delay) * 1e3),
      (this.lifeTime = 0),
      (this.fpsLimit =
        this.actualOptions.fpsLimit > 0 ? this.actualOptions.fpsLimit : 120),
      (this.smooth = this.actualOptions.smooth);
    for (const [, s] of this.drawers) s.init && (await s.init(this));
    for (const [, s] of this.plugins) s.init && (await s.init());
    this._engine.dispatchEvent("containerInit", { container: this }),
      this.particles.init(),
      this.particles.setDensity();
    for (const [, s] of this.plugins) s.particlesSetup && s.particlesSetup();
    this._engine.dispatchEvent("particlesSetup", { container: this });
  }
  async loadTheme(t) {
    !ot(this) || ((this._currentTheme = t), await this.refresh());
  }
  pause() {
    if (
      !!ot(this) &&
      (this._drawAnimationFrame !== void 0 &&
        (fu()(this._drawAnimationFrame), delete this._drawAnimationFrame),
      !this._paused)
    ) {
      for (const [, t] of this.plugins) t.pause && t.pause();
      this.pageHidden || (this._paused = !0),
        this._engine.dispatchEvent("containerPaused", { container: this });
    }
  }
  play(t) {
    if (!ot(this)) return;
    const i = this._paused || t;
    if (this._firstStart && !this.actualOptions.autoPlay) {
      this._firstStart = !1;
      return;
    }
    if ((this._paused && (this._paused = !1), i))
      for (const [, s] of this.plugins) s.play && s.play();
    this._engine.dispatchEvent("containerPlay", { container: this }),
      this.draw(i || !1);
  }
  async refresh() {
    if (ot(this)) return this.stop(), this.start();
  }
  async reset() {
    if (ot(this))
      return (this._options = $e(this._engine, this)), this.refresh();
  }
  setNoise(t, i, s) {
    !ot(this) || this.setPath(t, i, s);
  }
  setPath(t, i, s) {
    if (!t || !ot(this)) return;
    const n = Object.assign({}, vo);
    if (typeof t == "function")
      (n.generate = t), i && (n.init = i), s && (n.update = s);
    else {
      const o = n;
      (n.generate = t.generate || o.generate),
        (n.init = t.init || o.init),
        (n.update = t.update || o.update);
    }
    this.addPath(Ah, n, !0);
  }
  async start() {
    !ot(this) ||
      this.started ||
      (await this.init(),
      (this.started = !0),
      await new Promise((t) => {
        this._delayTimeout = setTimeout(async () => {
          this._eventListeners.addListeners(),
            this.interactivity.element instanceof HTMLElement &&
              this._intersectionObserver &&
              this._intersectionObserver.observe(this.interactivity.element);
          for (const [, i] of this.plugins) i.start && (await i.start());
          this._engine.dispatchEvent("containerStarted", { container: this }),
            this.play(),
            t();
        }, this._delay);
      }));
  }
  stop() {
    if (!(!ot(this) || !this.started)) {
      this._delayTimeout &&
        (clearTimeout(this._delayTimeout), delete this._delayTimeout),
        (this._firstStart = !0),
        (this.started = !1),
        this._eventListeners.removeListeners(),
        this.pause(),
        this.particles.clear(),
        this.canvas.clear(),
        this.interactivity.element instanceof HTMLElement &&
          this._intersectionObserver &&
          this._intersectionObserver.unobserve(this.interactivity.element);
      for (const [, t] of this.plugins) t.stop && t.stop();
      for (const t of this.plugins.keys()) this.plugins.delete(t);
      (this._sourceOptions = this._options),
        this._engine.dispatchEvent("containerStopped", { container: this });
    }
  }
  updateActualOptions() {
    this.actualOptions.responsive = [];
    const t = this.actualOptions.setResponsive(
      this.canvas.size.width,
      this.retina.pixelRatio,
      this._options
    );
    return (
      this.actualOptions.setTheme(this._currentTheme),
      this.responsiveMaxWidth === t ? !1 : ((this.responsiveMaxWidth = t), !0)
    );
  }
  _intersectionManager(t) {
    if (!(!ot(this) || !this.actualOptions.pauseOnOutsideViewport))
      for (const i of t)
        i.target === this.interactivity.element &&
          (i.isIntersecting ? this.play : this.pause)();
  }
}
function kh(e) {
  console.error(`tsParticles - Error ${e} while retrieving config file`);
}
async function Lh(e, t) {
  const i = Ze(e, t);
  if (!i) return;
  const s = await fetch(i);
  if (s.ok) return s.json();
  kh(s.status);
}
class Rh {
  constructor(t) {
    this._engine = t;
  }
  load(t, i, s) {
    const n = { index: s, remote: !1 };
    return (
      typeof t == "string" ? (n.tagId = t) : (n.options = t),
      typeof i == "number"
        ? (n.index = i)
        : (n.options = i != null ? i : n.options),
      this.loadOptions(n)
    );
  }
  async loadJSON(t, i, s) {
    let n, o;
    return (
      typeof i == "number" || i === void 0 ? (n = t) : ((o = t), (n = i)),
      this.loadRemoteOptions({ tagId: o, url: n, index: s, remote: !0 })
    );
  }
  async loadOptions(t) {
    var i, s, n;
    const o =
        (i = t.tagId) !== null && i !== void 0
          ? i
          : `tsparticles${Math.floor(oe() * 1e4)}`,
      { index: r, url: a, remote: l } = t,
      c = l ? await Lh(a, r) : t.options;
    let h =
      (s = t.element) !== null && s !== void 0 ? s : document.getElementById(o);
    h ||
      ((h = document.createElement("div")),
      (h.id = o),
      (n = document.querySelector("body")) === null ||
        n === void 0 ||
        n.append(h));
    const u = Ze(c, r),
      f = this._engine.dom(),
      v = f.findIndex((E) => E.id === o);
    if (v >= 0) {
      const E = this._engine.domItem(v);
      E && !E.destroyed && (E.destroy(), f.splice(v, 1));
    }
    let g;
    if (h.tagName.toLowerCase() === "canvas")
      (g = h), (g.dataset[Ge] = "false");
    else {
      const E = h.getElementsByTagName("canvas");
      E.length
        ? ((g = E[0]), (g.dataset[Ge] = "false"))
        : ((g = document.createElement("canvas")),
          (g.dataset[Ge] = "true"),
          h.appendChild(g));
    }
    g.style.width || (g.style.width = "100%"),
      g.style.height || (g.style.height = "100%");
    const y = new Sh(this._engine, o, u);
    return (
      v >= 0 ? f.splice(v, 0, y) : f.push(y),
      y.canvas.loadCanvas(g),
      await y.start(),
      y
    );
  }
  async loadRemoteOptions(t) {
    return this.loadOptions(t);
  }
  async set(t, i, s, n) {
    const o = { index: n, remote: !1 };
    return (
      typeof t == "string" ? (o.tagId = t) : (o.element = t),
      i instanceof HTMLElement ? (o.element = i) : (o.options = i),
      typeof s == "number"
        ? (o.index = s)
        : (o.options = s != null ? s : o.options),
      this.loadOptions(o)
    );
  }
  async setJSON(t, i, s, n) {
    let o, r, a, l;
    return (
      t instanceof HTMLElement
        ? ((l = t), (o = i), (a = s))
        : ((r = t), (l = i), (o = s), (a = n)),
      this.loadRemoteOptions({
        tagId: r,
        url: o,
        index: a,
        element: l,
        remote: !0,
      })
    );
  }
}
function ys(e, t, i, s = !1) {
  let n = t.get(e);
  return (!n || s) && ((n = [...i.values()].map((o) => o(e))), t.set(e, n)), n;
}
class Fh {
  constructor(t) {
    (this._engine = t),
      (this.plugins = []),
      (this._initializers = {
        interactors: new Map(),
        movers: new Map(),
        updaters: new Map(),
      }),
      (this.interactors = new Map()),
      (this.movers = new Map()),
      (this.updaters = new Map()),
      (this.presets = new Map()),
      (this.drawers = new Map()),
      (this.pathGenerators = new Map());
  }
  addInteractor(t, i) {
    this._initializers.interactors.set(t, i);
  }
  addParticleMover(t, i) {
    this._initializers.movers.set(t, i);
  }
  addParticleUpdater(t, i) {
    this._initializers.updaters.set(t, i);
  }
  addPathGenerator(t, i) {
    this.getPathGenerator(t) || this.pathGenerators.set(t, i);
  }
  addPlugin(t) {
    this.getPlugin(t.id) || this.plugins.push(t);
  }
  addPreset(t, i, s = !1) {
    (s || !this.getPreset(t)) && this.presets.set(t, i);
  }
  addShapeDrawer(t, i) {
    this.getShapeDrawer(t) || this.drawers.set(t, i);
  }
  destroy(t) {
    this.updaters.delete(t), this.movers.delete(t), this.interactors.delete(t);
  }
  getAvailablePlugins(t) {
    const i = new Map();
    for (const s of this.plugins)
      !s.needsPlugin(t.actualOptions) || i.set(s.id, s.getPlugin(t));
    return i;
  }
  getInteractors(t, i = !1) {
    return ys(t, this.interactors, this._initializers.interactors, i);
  }
  getMovers(t, i = !1) {
    return ys(t, this.movers, this._initializers.movers, i);
  }
  getPathGenerator(t) {
    return this.pathGenerators.get(t);
  }
  getPlugin(t) {
    return this.plugins.find((i) => i.id === t);
  }
  getPreset(t) {
    return this.presets.get(t);
  }
  getShapeDrawer(t) {
    return this.drawers.get(t);
  }
  getSupportedShapes() {
    return this.drawers.keys();
  }
  getUpdaters(t, i = !1) {
    return ys(t, this.updaters, this._initializers.updaters, i);
  }
  loadOptions(t, i) {
    for (const s of this.plugins) s.loadOptions(t, i);
  }
  loadParticlesOptions(t, i, ...s) {
    const n = this.updaters.get(t);
    if (n) for (const o of n) o.loadOptions && o.loadOptions(i, ...s);
  }
}
class Dh {
  constructor() {
    (this._domArray = []),
      (this._eventDispatcher = new su()),
      (this._initialized = !1),
      (this._loader = new Rh(this)),
      (this.plugins = new Fh(this));
  }
  addEventListener(t, i) {
    this._eventDispatcher.addEventListener(t, i);
  }
  async addInteractor(t, i) {
    this.plugins.addInteractor(t, i), await this.refresh();
  }
  async addMover(t, i) {
    this.plugins.addParticleMover(t, i), await this.refresh();
  }
  async addParticleUpdater(t, i) {
    this.plugins.addParticleUpdater(t, i), await this.refresh();
  }
  async addPathGenerator(t, i) {
    this.plugins.addPathGenerator(t, i), await this.refresh();
  }
  async addPlugin(t) {
    this.plugins.addPlugin(t), await this.refresh();
  }
  async addPreset(t, i, s = !1) {
    this.plugins.addPreset(t, i, s), await this.refresh();
  }
  async addShape(t, i, s, n, o) {
    let r;
    typeof i == "function"
      ? (r = { afterEffect: n, destroy: o, draw: i, init: s })
      : (r = i),
      this.plugins.addShapeDrawer(t, r),
      await this.refresh();
  }
  dispatchEvent(t, i) {
    this._eventDispatcher.dispatchEvent(t, i);
  }
  dom() {
    return this._domArray;
  }
  domItem(t) {
    const i = this.dom(),
      s = i[t];
    if (s && !s.destroyed) return s;
    i.splice(t, 1);
  }
  init() {
    this._initialized || (this._initialized = !0);
  }
  async load(t, i) {
    return this._loader.load(t, i);
  }
  async loadFromArray(t, i, s) {
    return this._loader.load(t, i, s);
  }
  async loadJSON(t, i, s) {
    return this._loader.loadJSON(t, i, s);
  }
  async refresh() {
    for (const t of this.dom()) await t.refresh();
  }
  removeEventListener(t, i) {
    this._eventDispatcher.removeEventListener(t, i);
  }
  async set(t, i, s) {
    return this._loader.set(t, i, s);
  }
  async setJSON(t, i, s, n) {
    return this._loader.setJSON(t, i, s, n);
  }
  setOnClickHandler(t) {
    const i = this.dom();
    if (!i.length)
      throw new Error(
        "Can only set click handlers after calling tsParticles.load() or tsParticles.loadJSON()"
      );
    for (const s of i) s.addClickHandler(t);
  }
}
class Bh {
  constructor() {
    (this.key = "hsl"), (this.stringPrefix = "hsl");
  }
  handleColor(t) {
    var i;
    const s = t.value,
      n = (i = s.hsl) !== null && i !== void 0 ? i : t.value;
    if (n.h !== void 0 && n.l !== void 0) return Bs(n);
  }
  handleRangeColor(t) {
    var i;
    const s = t.value,
      n = (i = s.hsl) !== null && i !== void 0 ? i : t.value;
    if (n.h !== void 0 && n.l !== void 0)
      return Bs({ h: nt(n.h), l: nt(n.l), s: nt(n.s) });
  }
  parseString(t) {
    if (!t.startsWith("hsl")) return;
    const i =
        /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(,\s*([\d.%]+)\s*)?\)/i,
      s = i.exec(t);
    return s
      ? _u({
          a: s.length > 4 ? zr(s[5]) : 1,
          h: parseInt(s[1], 10),
          l: parseInt(s[3], 10),
          s: parseInt(s[2], 10),
        })
      : void 0;
  }
}
class Hh {
  constructor() {
    (this.key = "rgb"), (this.stringPrefix = "rgb");
  }
  handleColor(t) {
    var i;
    const s = t.value,
      n = (i = s.rgb) !== null && i !== void 0 ? i : t.value;
    if (n.r !== void 0) return n;
  }
  handleRangeColor(t) {
    var i;
    const s = t.value,
      n = (i = s.rgb) !== null && i !== void 0 ? i : t.value;
    if (n.r !== void 0) return { r: nt(n.r), g: nt(n.g), b: nt(n.b) };
  }
  parseString(t) {
    if (!t.startsWith(this.stringPrefix)) return;
    const i =
        /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([\d.%]+)\s*)?\)/i,
      s = i.exec(t);
    return s
      ? {
          a: s.length > 4 ? zr(s[5]) : 1,
          b: parseInt(s[3], 10),
          g: parseInt(s[2], 10),
          r: parseInt(s[1], 10),
        }
      : void 0;
  }
}
const Nh = new Hh(),
  Uh = new Bh();
Sr(Nh);
Sr(Uh);
const We = new Dh();
We.init();
let we;
const $h = ji({
    name: "Particles",
    props: {
      id: { type: String, required: !0 },
      options: { type: Object },
      url: { type: String },
      particlesLoaded: { type: Function },
      particlesInit: { type: Function },
    },
    mounted() {
      Hi(async () => {
        var e;
        if (!this.id) throw new Error("Prop 'id' is required!");
        We.init(), this.particlesInit && (await this.particlesInit(We));
        const t = (s) => {
            (we = s), this.particlesLoaded && we && this.particlesLoaded(we);
          },
          i = await (this.url
            ? We.loadJSON(this.id, this.url)
            : We.load(this.id, (e = this.options) != null ? e : {}));
        t(i);
      });
    },
    unmounted() {
      we && (we.destroy(), (we = void 0));
    },
  }),
  jh = (e, t) => {
    const i = e.__vccOpts || e;
    for (const [s, n] of t) i[s] = n;
    return i;
  },
  Wh = ["id"];
function Vh(e, t, i, s, n, o) {
  return Be(), Nl("div", { id: e.id }, null, 8, Wh);
}
const Kh = jh($h, [["render", Vh]]),
  qh = (e, t) => {
    e.component("Particles", Kh);
  };
/*!
 * vue3-lazy v1.0.0-alpha.1
 * (c) 2020-2020 ustbhuangyi
 * Released under the MIT License.
 */ var Dt;
(function (e) {
  (e[(e.loading = 0)] = "loading"),
    (e[(e.loaded = 1)] = "loaded"),
    (e[(e.error = 2)] = "error");
})(Dt || (Dt = {}));
var Yh = typeof window < "u",
  mo = Qh();
function Qh() {
  return Yh &&
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "intersectionRatio" in IntersectionObserverEntry.prototype
    ? ("isIntersecting" in IntersectionObserverEntry.prototype ||
        Object.defineProperty(
          IntersectionObserverEntry.prototype,
          "isIntersecting",
          {
            get: function () {
              return this.intersectionRatio > 0;
            },
          }
        ),
      !0)
    : !1;
}
var bs = function (e, t) {
    return getComputedStyle(e).getPropertyValue(t);
  },
  Jh = function (e) {
    return bs(e, "overflow") + bs(e, "overflow-y") + bs(e, "overflow-x");
  };
function Xh(e) {
  for (
    var t = e;
    t &&
    !(t === document.body || t === document.documentElement || !t.parentNode);

  ) {
    if (/(scroll|auto)/.test(Jh(t))) return t;
    t = t.parentNode;
  }
  return window;
}
function Zh(e) {
  return new Promise(function (t, i) {
    var s = new Image();
    (s.onload = function () {
      t(), n();
    }),
      (s.onerror = function (o) {
        i(o), n();
      }),
      (s.src = e);
    function n() {
      s.onload = s.onerror = null;
    }
  });
}
function Gh(e) {
  console.warn("[Vue3-lazy warn]: " + e);
}
var td = (function () {
  function e(t) {
    (this.el = t.el),
      (this.parent = t.parent),
      (this.src = t.src),
      (this.error = t.error),
      (this.loading = t.loading),
      (this.cache = t.cache),
      (this.state = Dt.loading),
      this.render(this.loading);
  }
  return (
    (e.prototype.load = function (t) {
      if (!(this.state > Dt.loading)) {
        if (this.cache.has(this.src)) {
          (this.state = Dt.loaded), this.render(this.src);
          return;
        }
        this.renderSrc(t);
      }
    }),
    (e.prototype.isInView = function () {
      var t = this.el.getBoundingClientRect();
      return t.top < window.innerHeight && t.left < window.innerWidth;
    }),
    (e.prototype.update = function (t) {
      var i = this.src;
      t !== i && ((this.src = t), (this.state = Dt.loading));
    }),
    (e.prototype.renderSrc = function (t) {
      var i = this;
      Zh(this.src)
        .then(function () {
          (i.state = Dt.loaded), i.render(i.src), i.cache.add(i.src), t && t();
        })
        .catch(function (s) {
          (i.state = Dt.error),
            i.render(i.error),
            Gh(
              "load failed with src image(" +
                i.src +
                ") and the error msg is " +
                s.message
            ),
            t && t();
        });
    }),
    (e.prototype.render = function (t) {
      this.el.setAttribute("src", t);
    }),
    e
  );
})();
function ed(e, t) {
  var i = 0,
    s = 0;
  return function () {
    if (!i) {
      var n = Date.now() - s,
        o = this,
        r = arguments,
        a = function () {
          (s = Date.now()), (i = 0), e.apply(o, r);
        };
      n >= t ? a() : (i = window.setTimeout(a, t));
    }
  };
}
var yo =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  bo = [
    "scroll",
    "wheel",
    "mousewheel",
    "resize",
    "animationend",
    "transitionend",
    "touchmove",
    "transitioncancel",
  ],
  id = 300,
  sd = (function () {
    function e(t) {
      (this.error = t.error || yo),
        (this.loading = t.loading || yo),
        (this.cache = new Set()),
        (this.managerQueue = []),
        (this.throttleLazyHandler = ed(this.lazyHandler.bind(this), id)),
        this.init();
    }
    return (
      (e.prototype.add = function (t, i) {
        var s = i.value,
          n = Xh(t),
          o = new td({
            el: t,
            parent: n,
            src: s,
            error: this.error,
            loading: this.loading,
            cache: this.cache,
          });
        this.managerQueue.push(o),
          mo
            ? this.observer.observe(t)
            : (this.addListenerTarget(n),
              this.addListenerTarget(window),
              this.throttleLazyHandler());
      }),
      (e.prototype.update = function (t, i) {
        var s = i.value,
          n = this.managerQueue.find(function (o) {
            return o.el === t;
          });
        n && n.update(s);
      }),
      (e.prototype.remove = function (t) {
        var i = this.managerQueue.find(function (s) {
          return s.el === t;
        });
        i && this.removeManager(i);
      }),
      (e.prototype.init = function () {
        mo ? this.initIntersectionObserver() : (this.targetQueue = []);
      }),
      (e.prototype.initIntersectionObserver = function () {
        var t = this;
        this.observer = new IntersectionObserver(
          function (i) {
            i.forEach(function (s) {
              if (s.isIntersecting) {
                var n = t.managerQueue.find(function (o) {
                  return o.el === s.target;
                });
                if (n) {
                  if (n.state === Dt.loaded) {
                    t.removeManager(n);
                    return;
                  }
                  n.load();
                }
              }
            });
          },
          { rootMargin: "0px", threshold: 0 }
        );
      }),
      (e.prototype.addListenerTarget = function (t) {
        var i = this.targetQueue.find(function (s) {
          return s.el === t;
        });
        i
          ? i.ref++
          : ((i = { el: t, ref: 1 }),
            this.targetQueue.push(i),
            this.addListener(t));
      }),
      (e.prototype.removeListenerTarget = function (t) {
        var i = this;
        this.targetQueue.some(function (s, n) {
          return t === s.el
            ? (s.ref--,
              s.ref || (i.removeListener(t), i.targetQueue.splice(n, 1)),
              !0)
            : !1;
        });
      }),
      (e.prototype.addListener = function (t) {
        var i = this;
        bo.forEach(function (s) {
          t.addEventListener(s, i.throttleLazyHandler, {
            passive: !0,
            capture: !1,
          });
        });
      }),
      (e.prototype.removeListener = function (t) {
        var i = this;
        bo.forEach(function (s) {
          t.removeEventListener(s, i.throttleLazyHandler);
        });
      }),
      (e.prototype.lazyHandler = function (t) {
        for (var i = this.managerQueue.length - 1; i >= 0; i--) {
          var s = this.managerQueue[i];
          if (s.isInView()) {
            if (s.state === Dt.loaded) {
              this.removeManager(s);
              return;
            }
            s.load();
          }
        }
      }),
      (e.prototype.removeManager = function (t) {
        var i = this.managerQueue.indexOf(t);
        i > -1 && this.managerQueue.splice(i, 1),
          this.observer
            ? this.observer.unobserve(t.el)
            : (this.removeListenerTarget(t.parent),
              this.removeListenerTarget(window));
      }),
      e
    );
  })(),
  nd = {
    install: function (e, t) {
      var i = new sd(t);
      e.directive("lazy", {
        mounted: i.add.bind(i),
        updated: i.update.bind(i),
        unmounted: i.update.bind(i),
      });
    },
  };
const od = Zc(),
  Xi = Lc(Jc);
Xi.use(qh);
Xi.use(od);
Xi.use(nd, { loading: "mouse.png", error: "mouse.png" });
Xi.mount("#app");
export {
  jl as $,
  tc as A,
  er as B,
  Hi as C,
  fl as D,
  dn as E,
  yt as F,
  fd as G,
  na as H,
  oa as I,
  hi as J,
  ut as K,
  st as L,
  K as M,
  ad as N,
  St as O,
  N as P,
  ai as Q,
  Ve as R,
  rd as S,
  vd as T,
  dd as U,
  Wl as V,
  nl as W,
  md as X,
  an as Y,
  ud as Z,
  Yc as _,
  Bi as a,
  gd as a0,
  cd as a1,
  Be as b,
  Nl as c,
  ji as d,
  Ct as e,
  rt as f,
  Ii as g,
  ld as h,
  hd as i,
  Va as j,
  Oi as k,
  rn as l,
  Ki as m,
  Ns as n,
  ui as o,
  Wa as p,
  pd as q,
  me as r,
  yr as s,
  Qr as t,
  wc as u,
  yd as v,
  Ts as w,
  Us as x,
  bd as y,
  lt as z,
};
