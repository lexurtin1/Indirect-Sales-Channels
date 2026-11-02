/* @ds-bundle: {"format":3,"namespace":"CalastoneDesignSystem_d5328f","components":[{"name":"Hexagon","sourcePath":"components/brand/Hexagon.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"ParticipantNode","sourcePath":"components/brand/ParticipantNode.jsx"},{"name":"ROLE_COLORS","sourcePath":"components/brand/ParticipantNode.jsx"},{"name":"StatCallout","sourcePath":"components/brand/StatCallout.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardEyebrow","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"}],"sourceHashes":{"components/brand/Hexagon.jsx":"0565fb20a54d","components/brand/Logo.jsx":"bb63c2c8fe18","components/brand/ParticipantNode.jsx":"2b887ffd2e3b","components/brand/StatCallout.jsx":"abaed58a4f34","components/core/Badge.jsx":"5f622e9a5ba3","components/core/Button.jsx":"f8351f735f7d","components/core/Card.jsx":"b42e4f189ce3","components/core/IconButton.jsx":"9347c02626b5","components/core/Input.jsx":"2550fecb5fd5","components/core/SegmentedControl.jsx":"ab5390a1fcf8","components/core/Switch.jsx":"9742ff112ac2","components/core/Tabs.jsx":"136071149150","ui_kits/network/NetworkDiagram.jsx":"d4319c5e4ca9","ui_kits/network/OrderRouting.jsx":"a1611cc1facd"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CalastoneDesignSystem_d5328f = window.CalastoneDesignSystem_d5328f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Hexagon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Hexagon — the core Calastone brand shape. Pointy-top hex, used for
 * network nodes, the hub, and decorative geometry.
 */
function Hexagon({
  size = 96,
  fill = 'var(--grad-brand)',
  label,
  labelColor = '#fff',
  glow = false,
  flatTop = false,
  style,
  children,
  ...rest
}) {
  const clip = flatTop ? 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)' : 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';
  const h = flatTop ? size * 0.866 : size * 1.1;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      height: h,
      clipPath: clip,
      background: fill,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: glow ? 'drop-shadow(0 8px 22px rgba(45,154,142,0.35))' : 'none',
      ...style
    }
  }, rest), children || label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-bold)',
      fontSize: Math.max(9, size * 0.13),
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: labelColor,
      textAlign: 'center',
      padding: '0 8px',
      lineHeight: 1.15
    }
  }, label));
}
Object.assign(__ds_scope, { Hexagon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Hexagon.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
/**
 * Calastone logo lockup. Uses the real wordmark asset; `assetBase`
 * points at the design-system root (where /assets lives).
 */
function Logo({
  variant = 'black',
  showTagline = false,
  height = 28,
  assetBase = '..',
  style
}) {
  const src = `${assetBase}/assets/logos/calastone-wordmark-${variant === 'white' ? 'white' : 'black'}.png`;
  const taglineColor = variant === 'white' ? '#7d9097' : 'var(--ink-500)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '5px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "Calastone",
    style: {
      height,
      width: 'auto',
      display: 'block'
    }
  }), showTagline && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '9px',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: taglineColor
    }
  }, "An SS&C Company"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/brand/ParticipantNode.jsx
try { (() => {
const ROLE_COLORS = {
  investor: 'var(--role-investor)',
  distributor: 'var(--role-distributor)',
  fundmanager: 'var(--role-fundmanager)',
  transferagent: 'var(--role-transferagent)',
  custodian: 'var(--role-custodian)',
  calastone: 'var(--grad-brand)'
};

/** A labelled network participant — hexagon node + role label, as on the network map. */
function ParticipantNode({
  role = 'investor',
  label,
  size = 64,
  labelBelow = true,
  glow = false,
  style
}) {
  const fill = ROLE_COLORS[role] || 'var(--role-investor)';
  const text = label || role.charAt(0).toUpperCase() + role.slice(1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Hexagon, {
    size: size,
    fill: fill,
    glow: glow || role === 'calastone'
  }), labelBelow && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--ink-800)'
    }
  }, text));
}
Object.assign(__ds_scope, { ParticipantNode, ROLE_COLORS });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/ParticipantNode.jsx", error: String((e && e.message) || e) }); }

// components/brand/StatCallout.jsx
try { (() => {
/** Big-number stat callout — the hero figures (273.3m orders, 51 countries). */
function StatCallout({
  value,
  unit,
  label,
  accent = false,
  size = 'lg',
  align = 'left',
  style
}) {
  const fs = {
    sm: '2rem',
    md: '2.75rem',
    lg: '3.5rem'
  }[size];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      textAlign: align,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '6px',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-extrabold)',
      fontSize: fs,
      letterSpacing: 'var(--ls-tight)',
      color: accent ? 'var(--teal-600)' : 'var(--ink-800)'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-bold)',
      fontSize: `calc(${fs} * 0.42)`,
      color: 'var(--teal-500)'
    }
  }, unit)), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-eyebrow)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label));
}
Object.assign(__ds_scope, { StatCallout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/StatCallout.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Status / category badge. Subtle tinted pill. */
function Badge({
  children,
  tone = 'neutral',
  solid = false,
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      bg: 'var(--ink-100)',
      fg: 'var(--ink-700)',
      solidBg: 'var(--ink-600)'
    },
    teal: {
      bg: 'var(--teal-100)',
      fg: 'var(--teal-700)',
      solidBg: 'var(--teal-500)'
    },
    accent: {
      bg: 'var(--teal-050)',
      fg: 'var(--accent-600)',
      solidBg: 'var(--accent-500)'
    },
    success: {
      bg: 'var(--status-success-bg)',
      fg: 'var(--green-700)',
      solidBg: 'var(--status-success)'
    },
    warning: {
      bg: 'var(--status-warning-bg)',
      fg: '#9a6e10',
      solidBg: 'var(--status-warning)'
    },
    danger: {
      bg: 'var(--status-danger-bg)',
      fg: '#a83b3b',
      solidBg: 'var(--status-danger)'
    },
    info: {
      bg: 'var(--status-info-bg)',
      fg: '#2b6a93',
      solidBg: 'var(--status-info)'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      borderRadius: 'var(--radius-pill)',
      background: solid ? tones.solidBg : tones.bg,
      color: solid ? '#fff' : tones.fg,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Calastone Button — primary actions use the brand teal; the accent
 * (bright) variant is used for the "lit up" interactive CTAs.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      h: 'var(--control-h-sm)',
      px: '14px',
      fs: 'var(--text-sm)'
    },
    md: {
      h: 'var(--control-h-md)',
      px: '20px',
      fs: 'var(--text-sm)'
    },
    lg: {
      h: 'var(--control-h-lg)',
      px: '28px',
      fs: 'var(--text-base)'
    }
  }[size];
  const variants = {
    primary: {
      background: 'var(--teal-500)',
      color: '#fff',
      border: '1px solid var(--teal-500)'
    },
    accent: {
      background: 'var(--accent-500)',
      color: '#fff',
      border: '1px solid var(--accent-500)'
    },
    gradient: {
      background: 'var(--grad-brand)',
      color: '#fff',
      border: '1px solid transparent'
    },
    secondary: {
      background: '#fff',
      color: 'var(--ink-800)',
      border: '1px solid var(--ink-300)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--teal-600)',
      border: '1px solid transparent'
    },
    ink: {
      background: 'var(--ink-900)',
      color: '#fff',
      border: '1px solid var(--ink-900)'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: sizes.h,
      padding: `0 ${sizes.px}`,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontSize: sizes.fs,
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: '0.01em',
      lineHeight: 1,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'var(--transition-base)',
      boxShadow: variant === 'secondary' ? 'var(--shadow-xs)' : 'none',
      ...variants,
      ...style
    },
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.filter = 'brightness(0.93)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.filter = 'none';
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = 'translateY(1px)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'none';
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Surface container. Calastone cards are white, hairline-bordered, softly shadowed. */
function Card({
  children,
  elevated = false,
  interactive = false,
  padding = 'var(--space-6)',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--ink-100)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover ? 'var(--shadow-lg)' : elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      padding,
      transition: 'var(--transition-base)',
      cursor: interactive ? 'pointer' : 'default',
      transform: hover ? 'translateY(-2px)' : 'none',
      ...style
    }
  }, rest), children);
}

/** Small uppercase label used as a card / panel eyebrow. */
function CardEyebrow({
  children,
  color = 'var(--text-muted)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-eyebrow)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card, CardEyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square icon-only button. Same surface treatments as Button. */
function IconButton({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  onClick,
  style,
  ...rest
}) {
  const dim = {
    sm: 32,
    md: 40,
    lg: 48
  }[size];
  const variants = {
    primary: {
      background: 'var(--teal-500)',
      color: '#fff',
      border: '1px solid var(--teal-500)'
    },
    secondary: {
      background: '#fff',
      color: 'var(--ink-700)',
      border: '1px solid var(--ink-300)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-600)',
      border: '1px solid transparent'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      padding: 0,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'var(--transition-base)',
      ...variants,
      ...style
    },
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.filter = 'brightness(0.93)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.filter = 'none';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text input with optional label + leading element. Teal focus ring. */
function Input({
  label,
  hint,
  error,
  leading,
  type = 'text',
  size = 'md',
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = {
    sm: 'var(--control-h-sm)',
    md: 'var(--control-h-md)',
    lg: 'var(--control-h-lg)'
  }[size];
  const ringColor = error ? 'var(--status-danger)' : 'var(--accent-500)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height: h,
      padding: '0 12px',
      background: disabled ? 'var(--ink-050)' : '#fff',
      border: `1px solid ${error ? 'var(--status-danger)' : focus ? ringColor : 'var(--ink-300)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? `0 0 0 3px ${error ? 'rgba(208,84,84,0.25)' : 'rgba(15,184,156,0.25)'}` : 'none',
      transition: 'var(--transition-base)'
    }
  }, leading && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-400)',
      display: 'inline-flex'
    }
  }, leading), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      minWidth: 0
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--status-danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
/**
 * Segmented control — the rounded pill toggle Calastone uses for
 * Before / After, The Network / Order Routing, etc.
 */
function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  style
}) {
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const pad = size === 'sm' ? '5px 12px' : '7px 16px';
  const fs = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      padding: '3px',
      background: 'var(--ink-100)',
      borderRadius: 'var(--radius-pill)',
      ...style
    }
  }, opts.map(o => {
    const active = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      onClick: () => onChange && onChange(o.value),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: pad,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: fs,
        fontWeight: 'var(--fw-semibold)',
        letterSpacing: '0.01em',
        borderRadius: 'var(--radius-pill)',
        background: active ? '#fff' : 'transparent',
        color: active ? 'var(--ink-900)' : 'var(--ink-500)',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
        transition: 'var(--transition-base)'
      }
    }, o.icon, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
/** Toggle switch. Track turns brand teal when on. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  style
}) {
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  const ctrl = /*#__PURE__*/React.createElement("button", {
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: 'relative',
      width: 40,
      height: 22,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? 'var(--teal-500)' : 'var(--ink-300)',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 20 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
  if (!label) return ctrl;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, ctrl, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
/** Underline tabs. Active tab gets an accent underline + ink label. */
function Tabs({
  tabs,
  value,
  onChange,
  style
}) {
  const items = tabs.map(t => typeof t === 'string' ? {
    value: t,
    label: t
  } : t);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '4px',
      borderBottom: '1px solid var(--ink-200)',
      ...style
    }
  }, items.map(t => {
    const active = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      onClick: () => onChange && onChange(t.value),
      style: {
        position: 'relative',
        border: 'none',
        background: 'transparent',
        padding: '10px 14px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--fw-semibold)',
        color: active ? 'var(--ink-900)' : 'var(--ink-500)',
        transition: 'color var(--dur-fast) var(--ease-out)'
      }
    }, t.label, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: active ? 'var(--accent-500)' : 'transparent',
        borderRadius: 2
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/network/NetworkDiagram.jsx
try { (() => {
// Calastone Network diagram — hexagon participants arranged around the hub.
// Renders "before" (tangled point-to-point mesh) and "after" (one connection
// to the Calastone hub). Pure presentational; controlled by `mode`.
const {
  Hexagon
} = window.CalastoneDesignSystem_d5328f;
const ROLE_FILL = {
  investor: 'var(--role-investor)',
  distributor: 'var(--role-distributor)',
  fundmanager: 'var(--role-fundmanager)',
  transferagent: 'var(--role-transferagent)',
  custodian: 'var(--role-custodian)'
};

// Five groups around a ring; each group is a cluster of 3 nodes.
const W = 720,
  H = 560,
  CX = 360,
  CY = 280;
const GROUPS = [{
  role: 'investor',
  label: 'Investors',
  angle: -90,
  labelDx: 0,
  labelDy: -54
}, {
  role: 'fundmanager',
  label: 'Fund Managers',
  angle: -18,
  labelDx: 64,
  labelDy: 0
}, {
  role: 'transferagent',
  label: 'Transfer Agents',
  angle: 54,
  labelDx: 40,
  labelDy: 44
}, {
  role: 'custodian',
  label: 'Custodians',
  angle: 126,
  labelDx: -40,
  labelDy: 44
}, {
  role: 'distributor',
  label: 'Distributors',
  angle: 198,
  labelDx: -64,
  labelDy: 0
}];
const RING = 210;
function rad(d) {
  return d * Math.PI / 180;
}
function nodePositions() {
  const nodes = [];
  GROUPS.forEach(g => {
    const base = rad(g.angle);
    const gx = CX + RING * Math.cos(base);
    const gy = CY + RING * Math.sin(base);
    // 3 nodes fanned tangentially around the group centre
    const spread = 46;
    const tangent = base + Math.PI / 2;
    [-1, 0, 1].forEach(k => {
      nodes.push({
        role: g.role,
        x: gx + k * spread * Math.cos(tangent),
        y: gy + k * spread * Math.sin(tangent)
      });
    });
    g.gx = gx;
    g.gy = gy;
  });
  return nodes;
}
function NetworkDiagram({
  mode = 'after',
  hovered,
  onHover
}) {
  const nodes = React.useMemo(nodePositions, []);
  const hub = {
    x: CX,
    y: CY
  };

  // BEFORE: mesh — connect every node to several others (tangled point-to-point)
  const meshLines = React.useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].role === nodes[j].role) continue;
        // connect roughly 55% of cross-role pairs for a dense-but-readable mesh
        if ((i * 7 + j * 13) % 9 < 5) lines.push([nodes[i], nodes[j]]);
      }
    }
    return lines;
  }, [nodes]);
  const isAfter = mode === 'after';
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    style: {
      width: '100%',
      height: 'auto',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "hubGlow",
    cx: "50%",
    cy: "50%",
    r: "50%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "rgba(53,181,126,0.30)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "rgba(53,181,126,0)"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "hubGrad",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#2d9a8e"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#35b57e"
  }))), !isAfter && meshLines.map(([a, b], i) => /*#__PURE__*/React.createElement("line", {
    key: 'm' + i,
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
    stroke: "#c7d0d8",
    strokeWidth: "1",
    opacity: "0.7"
  })), isAfter && nodes.map((n, i) => {
    const active = hovered && hovered === n.role;
    return /*#__PURE__*/React.createElement("line", {
      key: 's' + i,
      x1: hub.x,
      y1: hub.y,
      x2: n.x,
      y2: n.y,
      stroke: active ? 'var(--accent-500)' : 'var(--teal-300)',
      strokeWidth: active ? 2.5 : 1.5,
      opacity: hovered ? active ? 1 : 0.25 : 0.9,
      style: {
        transition: 'all 200ms ease'
      }
    });
  }), isAfter && /*#__PURE__*/React.createElement("circle", {
    cx: hub.x,
    cy: hub.y,
    r: "90",
    fill: "url(#hubGlow)"
  }), nodes.map((n, i) => {
    const dim = hovered && hovered !== n.role ? 0.35 : 1;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      transform: `translate(${n.x - 21}, ${n.y - 23})`,
      opacity: dim,
      style: {
        transition: 'opacity 200ms ease',
        cursor: 'pointer'
      },
      onMouseEnter: () => onHover && onHover(n.role),
      onMouseLeave: () => onHover && onHover(null)
    }, /*#__PURE__*/React.createElement("polygon", {
      points: "21,0 42,11.5 42,34.5 21,46 0,34.5 0,11.5",
      fill: ROLE_FILL[n.role]
    }));
  }), GROUPS.map((g, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: g.gx + g.labelDx,
    y: g.gy + g.labelDy,
    textAnchor: "middle",
    dominantBaseline: "middle",
    style: {
      font: '700 14px var(--font-sans)',
      fill: 'var(--ink-800)'
    }
  }, g.label)), isAfter ? /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polygon", {
    points: `${CX},${CY - 40} ${CX + 35},${CY - 20} ${CX + 35},${CY + 20} ${CX},${CY + 40} ${CX - 35},${CY + 20} ${CX - 35},${CY - 20}`,
    fill: "url(#hubGrad)"
  }), /*#__PURE__*/React.createElement("text", {
    x: CX,
    y: CY,
    textAnchor: "middle",
    dominantBaseline: "middle",
    style: {
      font: '700 11px var(--font-sans)',
      letterSpacing: '0.1em',
      fill: '#fff'
    }
  }, "CALASTONE")) : null);
}
window.NetworkDiagram = NetworkDiagram;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/network/NetworkDiagram.jsx", error: String((e && e.message) || e) }); }

// ui_kits/network/OrderRouting.jsx
try { (() => {
// Order Routing flow — the numbered message sequence between Distributor,
// the Calastone hub, and the Fund Manager, with settlement + payments below.
const {
  Hexagon
} = window.CalastoneDesignSystem_d5328f;
function Step({
  n,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      color: 'var(--ink-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--teal-600)',
      fontFamily: 'var(--font-mono)'
    }
  }, n), /*#__PURE__*/React.createElement("span", null, label));
}
function Arrow({
  dir = 'right',
  label,
  n
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      minWidth: 150
    }
  }, /*#__PURE__*/React.createElement(Step, {
    n: n,
    label: label
  }), /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: "10",
    viewBox: "0 0 150 10",
    preserveAspectRatio: "none"
  }, dir === 'right' ? /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "5",
    x2: "142",
    y2: "5",
    stroke: "var(--ink-300)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "150,5 140,1 140,9",
    fill: "var(--ink-400)"
  })) : /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "5",
    x2: "150",
    y2: "5",
    stroke: "var(--ink-300)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "0,5 10,1 10,9",
    fill: "var(--ink-400)"
  }))));
}
function OrderRouting() {
  const lane = (label, fill, color) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      width: 150
    }
  }, /*#__PURE__*/React.createElement(Hexagon, {
    size: 120,
    fill: fill,
    label: label,
    labelColor: color || '#fff'
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, lane('Distributor', 'var(--role-distributor)'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      paddingBottom: 28
    }
  }, /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    n: "1",
    label: "Order instruction"
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    n: "4",
    label: "Business accept"
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    n: "6",
    label: "Price confirmation"
  })), lane('Calastone Order Routing', 'var(--ink-900)'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      paddingBottom: 28
    }
  }, /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    n: "2",
    label: "Order instruction"
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    n: "3",
    label: "Business accept"
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    n: "5",
    label: "Price confirmation"
  })), lane('Fund Manager', 'var(--role-custodian)')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 60,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Hexagon, {
    size: 92,
    fill: "var(--ink-300)",
    label: "Calastone Settlements",
    labelColor: "var(--ink-800)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-500)'
    }
  }, "7\u20139 \xB7 position calc & payment trigger")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Hexagon, {
    size: 92,
    fill: "var(--ink-300)",
    label: "Calastone Payments",
    labelColor: "var(--ink-800)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-500)'
    }
  }, "10\u201312 \xB7 interbank payment & confirmation"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      background: 'var(--ink-900)',
      color: '#fff',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 18px',
      textAlign: 'center',
      fontWeight: 600,
      fontSize: 14,
      letterSpacing: '0.01em'
    }
  }, "Seamless, automated order processing\xA0 |\xA0 Global fund trading made simple\xA0 |\xA0 Interoperable, efficient, secure"));
}
window.OrderRouting = OrderRouting;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/network/OrderRouting.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Hexagon = __ds_scope.Hexagon;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.ParticipantNode = __ds_scope.ParticipantNode;

__ds_ns.ROLE_COLORS = __ds_scope.ROLE_COLORS;

__ds_ns.StatCallout = __ds_scope.StatCallout;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardEyebrow = __ds_scope.CardEyebrow;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
