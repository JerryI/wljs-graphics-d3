/**
 * dat-gui JavaScript Controller Library
 * https://github.com/dataarts/dat.gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

function colorToString (color, forceCSSHex) {
  var colorFormat = color.__state.conversionName.toString();
  var r = Math.round(color.r);
  var g = Math.round(color.g);
  var b = Math.round(color.b);
  var a = color.a;
  var h = Math.round(color.h);
  var s = color.s.toFixed(1);
  var v = color.v.toFixed(1);
  if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
    var str = color.hex.toString(16);
    while (str.length < 6) {
      str = '0' + str;
    }
    return '#' + str;
  } else if (colorFormat === 'CSS_RGB') {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  } else if (colorFormat === 'CSS_RGBA') {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  } else if (colorFormat === 'HEX') {
    return '0x' + color.hex.toString(16);
  } else if (colorFormat === 'RGB_ARRAY') {
    return '[' + r + ',' + g + ',' + b + ']';
  } else if (colorFormat === 'RGBA_ARRAY') {
    return '[' + r + ',' + g + ',' + b + ',' + a + ']';
  } else if (colorFormat === 'RGB_OBJ') {
    return '{r:' + r + ',g:' + g + ',b:' + b + '}';
  } else if (colorFormat === 'RGBA_OBJ') {
    return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
  } else if (colorFormat === 'HSV_OBJ') {
    return '{h:' + h + ',s:' + s + ',v:' + v + '}';
  } else if (colorFormat === 'HSVA_OBJ') {
    return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
  }
  return 'unknown format';
}

var ARR_EACH = Array.prototype.forEach;
var ARR_SLICE = Array.prototype.slice;
var Common = {
  BREAK: {},
  extend: function extend(target) {
    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function (key) {
        if (!this.isUndefined(obj[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  defaults: function defaults(target) {
    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function (key) {
        if (this.isUndefined(target[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  compose: function compose() {
    var toCall = ARR_SLICE.call(arguments);
    return function () {
      var args = ARR_SLICE.call(arguments);
      for (var i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },
  each: function each(obj, itr, scope) {
    if (!obj) {
      return;
    }
    if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      var key = void 0;
      var l = void 0;
      for (key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (var _key in obj) {
        if (itr.call(scope, obj[_key], _key) === this.BREAK) {
          return;
        }
      }
    }
  },
  defer: function defer(fnc) {
    setTimeout(fnc, 0);
  },
  debounce: function debounce(func, threshold, callImmediately) {
    var timeout = void 0;
    return function () {
      var obj = this;
      var args = arguments;
      function delayed() {
        timeout = null;
        if (!callImmediately) func.apply(obj, args);
      }
      var callNow = callImmediately || !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(delayed, threshold);
      if (callNow) {
        func.apply(obj, args);
      }
    };
  },
  toArray: function toArray(obj) {
    if (obj.toArray) return obj.toArray();
    return ARR_SLICE.call(obj);
  },
  isUndefined: function isUndefined(obj) {
    return obj === undefined;
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isNaN: function (_isNaN) {
    function isNaN(_x) {
      return _isNaN.apply(this, arguments);
    }
    isNaN.toString = function () {
      return _isNaN.toString();
    };
    return isNaN;
  }(function (obj) {
    return isNaN(obj);
  }),
  isArray: Array.isArray || function (obj) {
    return obj.constructor === Array;
  },
  isObject: function isObject(obj) {
    return obj === Object(obj);
  },
  isNumber: function isNumber(obj) {
    return obj === obj + 0;
  },
  isString: function isString(obj) {
    return obj === obj + '';
  },
  isBoolean: function isBoolean(obj) {
    return obj === false || obj === true;
  },
  isFunction: function isFunction(obj) {
    return obj instanceof Function;
  }
};

var INTERPRETATIONS = [
{
  litmus: Common.isString,
  conversions: {
    THREE_CHAR_HEX: {
      read: function read(original) {
        var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
        if (test === null) {
          return false;
        }
        return {
          space: 'HEX',
          hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
        };
      },
      write: colorToString
    },
    SIX_CHAR_HEX: {
      read: function read(original) {
        var test = original.match(/^#([A-F0-9]{6})$/i);
        if (test === null) {
          return false;
        }
        return {
          space: 'HEX',
          hex: parseInt('0x' + test[1].toString(), 0)
        };
      },
      write: colorToString
    },
    CSS_RGB: {
      read: function read(original) {
        var test = original.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
        if (test === null) {
          return false;
        }
        return {
          space: 'RGB',
          r: parseFloat(test[1]),
          g: parseFloat(test[2]),
          b: parseFloat(test[3])
        };
      },
      write: colorToString
    },
    CSS_RGBA: {
      read: function read(original) {
        var test = original.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
        if (test === null) {
          return false;
        }
        return {
          space: 'RGB',
          r: parseFloat(test[1]),
          g: parseFloat(test[2]),
          b: parseFloat(test[3]),
          a: parseFloat(test[4])
        };
      },
      write: colorToString
    }
  }
},
{
  litmus: Common.isNumber,
  conversions: {
    HEX: {
      read: function read(original) {
        return {
          space: 'HEX',
          hex: original,
          conversionName: 'HEX'
        };
      },
      write: function write(color) {
        return color.hex;
      }
    }
  }
},
{
  litmus: Common.isArray,
  conversions: {
    RGB_ARRAY: {
      read: function read(original) {
        if (original.length !== 3) {
          return false;
        }
        return {
          space: 'RGB',
          r: original[0],
          g: original[1],
          b: original[2]
        };
      },
      write: function write(color) {
        return [color.r, color.g, color.b];
      }
    },
    RGBA_ARRAY: {
      read: function read(original) {
        if (original.length !== 4) return false;
        return {
          space: 'RGB',
          r: original[0],
          g: original[1],
          b: original[2],
          a: original[3]
        };
      },
      write: function write(color) {
        return [color.r, color.g, color.b, color.a];
      }
    }
  }
},
{
  litmus: Common.isObject,
  conversions: {
    RGBA_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
          return {
            space: 'RGB',
            r: original.r,
            g: original.g,
            b: original.b,
            a: original.a
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          r: color.r,
          g: color.g,
          b: color.b,
          a: color.a
        };
      }
    },
    RGB_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
          return {
            space: 'RGB',
            r: original.r,
            g: original.g,
            b: original.b
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          r: color.r,
          g: color.g,
          b: color.b
        };
      }
    },
    HSVA_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
          return {
            space: 'HSV',
            h: original.h,
            s: original.s,
            v: original.v,
            a: original.a
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          h: color.h,
          s: color.s,
          v: color.v,
          a: color.a
        };
      }
    },
    HSV_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
          return {
            space: 'HSV',
            h: original.h,
            s: original.s,
            v: original.v
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          h: color.h,
          s: color.s,
          v: color.v
        };
      }
    }
  }
}];
var result = void 0;
var toReturn = void 0;
var interpret = function interpret() {
  toReturn = false;
  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
  Common.each(INTERPRETATIONS, function (family) {
    if (family.litmus(original)) {
      Common.each(family.conversions, function (conversion, conversionName) {
        result = conversion.read(original);
        if (toReturn === false && result !== false) {
          toReturn = result;
          result.conversionName = conversionName;
          result.conversion = conversion;
          return Common.BREAK;
        }
      });
      return Common.BREAK;
    }
  });
  return toReturn;
};

var tmpComponent = void 0;
var ColorMath = {
  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1.0 - s);
    var q = v * (1.0 - f * s);
    var t = v * (1.0 - (1.0 - f) * s);
    var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
    return {
      r: c[0] * 255,
      g: c[1] * 255,
      b: c[2] * 255
    };
  },
  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h = void 0;
    var s = void 0;
    if (max !== 0) {
      s = delta / max;
    } else {
      return {
        h: NaN,
        s: 0,
        v: 0
      };
    }
    if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h /= 6;
    if (h < 0) {
      h += 1;
    }
    return {
      h: h * 360,
      s: s,
      v: max / 255
    };
  },
  rgb_to_hex: function rgb_to_hex(r, g, b) {
    var hex = this.hex_with_component(0, 2, r);
    hex = this.hex_with_component(hex, 1, g);
    hex = this.hex_with_component(hex, 0, b);
    return hex;
  },
  component_from_hex: function component_from_hex(hex, componentIndex) {
    return hex >> componentIndex * 8 & 0xFF;
  },
  hex_with_component: function hex_with_component(hex, componentIndex, value) {
    return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Color = function () {
  function Color() {
    classCallCheck(this, Color);
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw new Error('Failed to interpret color arguments');
    }
    this.__state.a = this.__state.a || 1;
  }
  createClass(Color, [{
    key: 'toString',
    value: function toString() {
      return colorToString(this);
    }
  }, {
    key: 'toHexString',
    value: function toHexString() {
      return colorToString(this, true);
    }
  }, {
    key: 'toOriginal',
    value: function toOriginal() {
      return this.__state.conversion.write(this);
    }
  }]);
  return Color;
}();
function defineRGBComponent(target, component, componentHexIndex) {
  Object.defineProperty(target, component, {
    get: function get$$1() {
      if (this.__state.space === 'RGB') {
        return this.__state[component];
      }
      Color.recalculateRGB(this, component, componentHexIndex);
      return this.__state[component];
    },
    set: function set$$1(v) {
      if (this.__state.space !== 'RGB') {
        Color.recalculateRGB(this, component, componentHexIndex);
        this.__state.space = 'RGB';
      }
      this.__state[component] = v;
    }
  });
}
function defineHSVComponent(target, component) {
  Object.defineProperty(target, component, {
    get: function get$$1() {
      if (this.__state.space === 'HSV') {
        return this.__state[component];
      }
      Color.recalculateHSV(this);
      return this.__state[component];
    },
    set: function set$$1(v) {
      if (this.__state.space !== 'HSV') {
        Color.recalculateHSV(this);
        this.__state.space = 'HSV';
      }
      this.__state[component] = v;
    }
  });
}
Color.recalculateRGB = function (color, component, componentHexIndex) {
  if (color.__state.space === 'HEX') {
    color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
  } else if (color.__state.space === 'HSV') {
    Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
  } else {
    throw new Error('Corrupted color state');
  }
};
Color.recalculateHSV = function (color) {
  var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
  Common.extend(color.__state, {
    s: result.s,
    v: result.v
  });
  if (!Common.isNaN(result.h)) {
    color.__state.h = result.h;
  } else if (Common.isUndefined(color.__state.h)) {
    color.__state.h = 0;
  }
};
Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
defineRGBComponent(Color.prototype, 'r', 2);
defineRGBComponent(Color.prototype, 'g', 1);
defineRGBComponent(Color.prototype, 'b', 0);
defineHSVComponent(Color.prototype, 'h');
defineHSVComponent(Color.prototype, 's');
defineHSVComponent(Color.prototype, 'v');
Object.defineProperty(Color.prototype, 'a', {
  get: function get$$1() {
    return this.__state.a;
  },
  set: function set$$1(v) {
    this.__state.a = v;
  }
});
Object.defineProperty(Color.prototype, 'hex', {
  get: function get$$1() {
    if (this.__state.space !== 'HEX') {
      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      this.__state.space = 'HEX';
    }
    return this.__state.hex;
  },
  set: function set$$1(v) {
    this.__state.space = 'HEX';
    this.__state.hex = v;
  }
});

var Controller = function () {
  function Controller(object, property) {
    classCallCheck(this, Controller);
    this.initialValue = object[property];
    this.domElement = document.createElement('div');
    this.object = object;
    this.property = property;
    this.__onChange = undefined;
    this.__onFinishChange = undefined;
  }
  createClass(Controller, [{
    key: 'onChange',
    value: function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    }
  }, {
    key: 'onFinishChange',
    value: function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    }
  }, {
    key: 'setValue',
    value: function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.object[this.property];
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      return this;
    }
  }, {
    key: 'isModified',
    value: function isModified() {
      return this.initialValue !== this.getValue();
    }
  }]);
  return Controller;
}();

var EVENT_MAP = {
  HTMLEvents: ['change'],
  MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
  KeyboardEvents: ['keydown']
};
var EVENT_MAP_INV = {};
Common.each(EVENT_MAP, function (v, k) {
  Common.each(v, function (e) {
    EVENT_MAP_INV[e] = k;
  });
});
var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
function cssValueToPixels(val) {
  if (val === '0' || Common.isUndefined(val)) {
    return 0;
  }
  var match = val.match(CSS_VALUE_PIXELS);
  if (!Common.isNull(match)) {
    return parseFloat(match[1]);
  }
  return 0;
}
var dom = {
  makeSelectable: function makeSelectable(elem, selectable) {
    if (elem === undefined || elem.style === undefined) return;
    elem.onselectstart = selectable ? function () {
      return false;
    } : function () {};
    elem.style.MozUserSelect = selectable ? 'auto' : 'none';
    elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
    elem.unselectable = selectable ? 'on' : 'off';
  },
  makeFullscreen: function makeFullscreen(elem, hor, vert) {
    var vertical = vert;
    var horizontal = hor;
    if (Common.isUndefined(horizontal)) {
      horizontal = true;
    }
    if (Common.isUndefined(vertical)) {
      vertical = true;
    }
    elem.style.position = 'absolute';
    if (horizontal) {
      elem.style.left = 0;
      elem.style.right = 0;
    }
    if (vertical) {
      elem.style.top = 0;
      elem.style.bottom = 0;
    }
  },
  fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
    var params = pars || {};
    var className = EVENT_MAP_INV[eventType];
    if (!className) {
      throw new Error('Event type ' + eventType + ' not supported.');
    }
    var evt = document.createEvent(className);
    switch (className) {
      case 'MouseEvents':
        {
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
          0,
          clientX,
          clientY,
          false, false, false, false, 0, null);
          break;
        }
      case 'KeyboardEvents':
        {
          var init = evt.initKeyboardEvent || evt.initKeyEvent;
          Common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: undefined,
            charCode: undefined
          });
          init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
          break;
        }
      default:
        {
          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
          break;
        }
    }
    Common.defaults(evt, aux);
    elem.dispatchEvent(evt);
  },
  bind: function bind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.addEventListener) {
      elem.addEventListener(event, func, bool);
    } else if (elem.attachEvent) {
      elem.attachEvent('on' + event, func);
    }
    return dom;
  },
  unbind: function unbind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.removeEventListener) {
      elem.removeEventListener(event, func, bool);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + event, func);
    }
    return dom;
  },
  addClass: function addClass(elem, className) {
    if (elem.className === undefined) {
      elem.className = className;
    } else if (elem.className !== className) {
      var classes = elem.className.split(/ +/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
      }
    }
    return dom;
  },
  removeClass: function removeClass(elem, className) {
    if (className) {
      if (elem.className === className) {
        elem.removeAttribute('class');
      } else {
        var classes = elem.className.split(/ +/);
        var index = classes.indexOf(className);
        if (index !== -1) {
          classes.splice(index, 1);
          elem.className = classes.join(' ');
        }
      }
    } else {
      elem.className = undefined;
    }
    return dom;
  },
  hasClass: function hasClass(elem, className) {
    return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
  },
  getWidth: function getWidth(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
  },
  getHeight: function getHeight(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
  },
  getOffset: function getOffset(el) {
    var elem = el;
    var offset = { left: 0, top: 0 };
    if (elem.offsetParent) {
      do {
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return offset;
  },
  isActive: function isActive(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  }
};

var BooleanController = function (_Controller) {
  inherits(BooleanController, _Controller);
  function BooleanController(object, property) {
    classCallCheck(this, BooleanController);
    var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
    var _this = _this2;
    _this2.__prev = _this2.getValue();
    _this2.__checkbox = document.createElement('input');
    _this2.__checkbox.setAttribute('type', 'checkbox');
    function onChange() {
      _this.setValue(!_this.__prev);
    }
    dom.bind(_this2.__checkbox, 'change', onChange, false);
    _this2.domElement.appendChild(_this2.__checkbox);
    _this2.updateDisplay();
    return _this2;
  }
  createClass(BooleanController, [{
    key: 'setValue',
    value: function setValue(v) {
      var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn;
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute('checked', 'checked');
        this.__checkbox.checked = true;
        this.__prev = true;
      } else {
        this.__checkbox.checked = false;
        this.__prev = false;
      }
      return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return BooleanController;
}(Controller);

var OptionController = function (_Controller) {
  inherits(OptionController, _Controller);
  function OptionController(object, property, opts) {
    classCallCheck(this, OptionController);
    var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
    var options = opts;
    var _this = _this2;
    _this2.__select = document.createElement('select');
    if (Common.isArray(options)) {
      var map = {};
      Common.each(options, function (element) {
        map[element] = element;
      });
      options = map;
    }
    Common.each(options, function (value, key) {
      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);
    });
    _this2.updateDisplay();
    dom.bind(_this2.__select, 'change', function () {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });
    _this2.domElement.appendChild(_this2.__select);
    return _this2;
  }
  createClass(OptionController, [{
    key: 'setValue',
    value: function setValue(v) {
      var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn;
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (dom.isActive(this.__select)) return this;
      this.__select.value = this.getValue();
      return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return OptionController;
}(Controller);

var StringController = function (_Controller) {
  inherits(StringController, _Controller);
  function StringController(object, property) {
    classCallCheck(this, StringController);
    var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
    var _this = _this2;
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.__input = document.createElement('input');
    _this2.__input.setAttribute('type', 'text');
    dom.bind(_this2.__input, 'keyup', onChange);
    dom.bind(_this2.__input, 'change', onChange);
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(StringController, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return StringController;
}(Controller);

function numDecimals(x) {
  var _x = x.toString();
  if (_x.indexOf('.') > -1) {
    return _x.length - _x.indexOf('.') - 1;
  }
  return 0;
}
var NumberController = function (_Controller) {
  inherits(NumberController, _Controller);
  function NumberController(object, property, params) {
    classCallCheck(this, NumberController);
    var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
    var _params = params || {};
    _this.__min = _params.min;
    _this.__max = _params.max;
    _this.__step = _params.step;
    if (Common.isUndefined(_this.__step)) {
      if (_this.initialValue === 0) {
        _this.__impliedStep = 1;
      } else {
        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      _this.__impliedStep = _this.__step;
    }
    _this.__precision = numDecimals(_this.__impliedStep);
    return _this;
  }
  createClass(NumberController, [{
    key: 'setValue',
    value: function setValue(v) {
      var _v = v;
      if (this.__min !== undefined && _v < this.__min) {
        _v = this.__min;
      } else if (this.__max !== undefined && _v > this.__max) {
        _v = this.__max;
      }
      if (this.__step !== undefined && _v % this.__step !== 0) {
        _v = Math.round(_v / this.__step) * this.__step;
      }
      return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
    }
  }, {
    key: 'min',
    value: function min(minValue) {
      this.__min = minValue;
      return this;
    }
  }, {
    key: 'max',
    value: function max(maxValue) {
      this.__max = maxValue;
      return this;
    }
  }, {
    key: 'step',
    value: function step(stepValue) {
      this.__step = stepValue;
      this.__impliedStep = stepValue;
      this.__precision = numDecimals(stepValue);
      return this;
    }
  }]);
  return NumberController;
}(Controller);

function roundToDecimal(value, decimals) {
  var tenTo = Math.pow(10, decimals);
  return Math.round(value * tenTo) / tenTo;
}
var NumberControllerBox = function (_NumberController) {
  inherits(NumberControllerBox, _NumberController);
  function NumberControllerBox(object, property, params) {
    classCallCheck(this, NumberControllerBox);
    var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
    _this2.__truncationSuspended = false;
    var _this = _this2;
    var prevY = void 0;
    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!Common.isNaN(attempted)) {
        _this.setValue(attempted);
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onBlur() {
      onFinish();
    }
    function onMouseDrag(e) {
      var diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prevY = e.clientY;
    }
    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      onFinish();
    }
    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prevY = e.clientY;
    }
    _this2.__input = document.createElement('input');
    _this2.__input.setAttribute('type', 'text');
    dom.bind(_this2.__input, 'change', onChange);
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__input, 'mousedown', onMouseDown);
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
        onFinish();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(NumberControllerBox, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
      return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return NumberControllerBox;
}(NumberController);

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}
var NumberControllerSlider = function (_NumberController) {
  inherits(NumberControllerSlider, _NumberController);
  function NumberControllerSlider(object, property, min, max, step) {
    classCallCheck(this, NumberControllerSlider);
    var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
    var _this = _this2;
    _this2.__background = document.createElement('div');
    _this2.__foreground = document.createElement('div');
    dom.bind(_this2.__background, 'mousedown', onMouseDown);
    dom.bind(_this2.__background, 'touchstart', onTouchStart);
    dom.addClass(_this2.__background, 'slider');
    dom.addClass(_this2.__foreground, 'slider-fg');
    function onMouseDown(e) {
      document.activeElement.blur();
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      e.preventDefault();
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      return false;
    }
    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }
      dom.bind(window, 'touchmove', onTouchMove);
      dom.bind(window, 'touchend', onTouchEnd);
      onTouchMove(e);
    }
    function onTouchMove(e) {
      var clientX = e.touches[0].clientX;
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
    }
    function onTouchEnd() {
      dom.unbind(window, 'touchmove', onTouchMove);
      dom.unbind(window, 'touchend', onTouchEnd);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    _this2.__background.appendChild(_this2.__foreground);
    _this2.domElement.appendChild(_this2.__background);
    return _this2;
  }
  createClass(NumberControllerSlider, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + '%';
      return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return NumberControllerSlider;
}(NumberController);

var FunctionController = function (_Controller) {
  inherits(FunctionController, _Controller);
  function FunctionController(object, property, text) {
    classCallCheck(this, FunctionController);
    var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
    var _this = _this2;
    _this2.__button = document.createElement('div');
    _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
    dom.bind(_this2.__button, 'click', function (e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(_this2.__button, 'button');
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  createClass(FunctionController, [{
    key: 'fire',
    value: function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    }
  }]);
  return FunctionController;
}(Controller);

var ColorController = function (_Controller) {
  inherits(ColorController, _Controller);
  function ColorController(object, property) {
    classCallCheck(this, ColorController);
    var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
    _this2.__color = new Color(_this2.getValue());
    _this2.__temp = new Color(0);
    var _this = _this2;
    _this2.domElement = document.createElement('div');
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement('div');
    _this2.__selector.className = 'selector';
    _this2.__saturation_field = document.createElement('div');
    _this2.__saturation_field.className = 'saturation-field';
    _this2.__field_knob = document.createElement('div');
    _this2.__field_knob.className = 'field-knob';
    _this2.__field_knob_border = '2px solid ';
    _this2.__hue_knob = document.createElement('div');
    _this2.__hue_knob.className = 'hue-knob';
    _this2.__hue_field = document.createElement('div');
    _this2.__hue_field.className = 'hue-field';
    _this2.__input = document.createElement('input');
    _this2.__input.type = 'text';
    _this2.__input_textShadow = '0 1px 1px ';
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__selector, 'mousedown', function () {
      dom.addClass(this, 'drag').bind(window, 'mouseup', function () {
        dom.removeClass(_this.__selector, 'drag');
      });
    });
    dom.bind(_this2.__selector, 'touchstart', function () {
      dom.addClass(this, 'drag').bind(window, 'touchend', function () {
        dom.removeClass(_this.__selector, 'drag');
      });
    });
    var valueField = document.createElement('div');
    Common.extend(_this2.__selector.style, {
      width: '122px',
      height: '102px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
    });
    Common.extend(_this2.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });
    Common.extend(_this2.__hue_knob.style, {
      position: 'absolute',
      width: '15px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });
    Common.extend(_this2.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });
    Common.extend(valueField.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });
    linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
    Common.extend(_this2.__hue_field.style, {
      width: '15px',
      height: '100px',
      border: '1px solid #555',
      cursor: 'ns-resize',
      position: 'absolute',
      top: '3px',
      right: '3px'
    });
    hueGradient(_this2.__hue_field);
    Common.extend(_this2.__input.style, {
      outline: 'none',
      textAlign: 'center',
      color: '#fff',
      border: 0,
      fontWeight: 'bold',
      textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
    });
    dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
    dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
    dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
    dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
    dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
    dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'touchmove', setSV);
      dom.bind(window, 'mouseup', fieldUpSV);
      dom.bind(window, 'touchend', fieldUpSV);
    }
    function fieldDownH(e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'touchmove', setH);
      dom.bind(window, 'mouseup', fieldUpH);
      dom.bind(window, 'touchend', fieldUpH);
    }
    function fieldUpSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'touchmove', setSV);
      dom.unbind(window, 'mouseup', fieldUpSV);
      dom.unbind(window, 'touchend', fieldUpSV);
      onFinish();
    }
    function fieldUpH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'touchmove', setH);
      dom.unbind(window, 'mouseup', fieldUpH);
      dom.unbind(window, 'touchend', fieldUpH);
      onFinish();
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
      }
    }
    _this2.__saturation_field.appendChild(valueField);
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.__selector.appendChild(_this2.__hue_field);
    _this2.__hue_field.appendChild(_this2.__hue_knob);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf('touch') === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__saturation_field.getBoundingClientRect();
      var _ref = e.touches && e.touches[0] || e,
          clientX = _ref.clientX,
          clientY = _ref.clientY;
      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }
      if (s > 1) {
        s = 1;
      } else if (s < 0) {
        s = 0;
      }
      _this.__color.v = v;
      _this.__color.s = s;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    function setH(e) {
      if (e.type.indexOf('touch') === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__hue_field.getBoundingClientRect();
      var _ref2 = e.touches && e.touches[0] || e,
          clientY = _ref2.clientY;
      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    return _this2;
  }
  createClass(ColorController, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      var i = interpret(this.getValue());
      if (i !== false) {
        var mismatch = false;
        Common.each(Color.COMPONENTS, function (component) {
          if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {};
          }
        }, this);
        if (mismatch) {
          Common.extend(this.__color.__state, i);
        }
      }
      Common.extend(this.__temp.__state, this.__color.__state);
      this.__temp.a = 1;
      var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
      var _flip = 255 - flip;
      Common.extend(this.__field_knob.style, {
        marginLeft: 100 * this.__color.s - 7 + 'px',
        marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
        backgroundColor: this.__temp.toHexString(),
        border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
      this.__input.value = this.__color.toString();
      Common.extend(this.__input.style, {
        backgroundColor: this.__color.toHexString(),
        color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
        textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
      });
    }
  }]);
  return ColorController;
}(Controller);
var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
function linearGradient(elem, x, a, b) {
  elem.style.background = '';
  Common.each(vendors, function (vendor) {
    elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
  });
}
function hueGradient(elem) {
  elem.style.background = '';
  elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
  elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
}

var css = {
  load: function load(url, indoc) {
    var doc = indoc || document;
    var link = doc.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    doc.getElementsByTagName('head')[0].appendChild(link);
  },
  inject: function inject(cssContent, indoc) {
    var doc = indoc || document;
    var injected = document.createElement('style');
    injected.type = 'text/css';
    injected.innerHTML = cssContent;
    var head = doc.getElementsByTagName('head')[0];
    try {
      head.appendChild(injected);
    } catch (e) {
    }
  }
};

var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

var ControllerFactory = function ControllerFactory(object, property) {
  var initialValue = object[property];
  if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
    return new OptionController(object, property, arguments[2]);
  }
  if (Common.isNumber(initialValue)) {
    if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
      }
      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
    }
    if (Common.isNumber(arguments[4])) {
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
    }
    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
  }
  if (Common.isString(initialValue)) {
    return new StringController(object, property);
  }
  if (Common.isFunction(initialValue)) {
    return new FunctionController(object, property, '');
  }
  if (Common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }
  return null;
};

function requestAnimationFrame(callback) {
  setTimeout(callback, 1000 / 60);
}
var requestAnimationFrame$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame;

var CenteredDiv = function () {
  function CenteredDiv() {
    classCallCheck(this, CenteredDiv);
    this.backgroundElement = document.createElement('div');
    Common.extend(this.backgroundElement.style, {
      backgroundColor: 'rgba(0,0,0,0.8)',
      top: 0,
      left: 0,
      display: 'none',
      zIndex: '1000',
      opacity: 0,
      WebkitTransition: 'opacity 0.2s linear',
      transition: 'opacity 0.2s linear'
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = 'fixed';
    this.domElement = document.createElement('div');
    Common.extend(this.domElement.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '1001',
      opacity: 0,
      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
      transition: 'transform 0.2s ease-out, opacity 0.2s linear'
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, 'click', function () {
      _this.hide();
    });
  }
  createClass(CenteredDiv, [{
    key: 'show',
    value: function show() {
      var _this = this;
      this.backgroundElement.style.display = 'block';
      this.domElement.style.display = 'block';
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = 'scale(1.1)';
      this.layout();
      Common.defer(function () {
        _this.backgroundElement.style.opacity = 1;
        _this.domElement.style.opacity = 1;
        _this.domElement.style.webkitTransform = 'scale(1)';
      });
    }
  }, {
    key: 'hide',
    value: function hide() {
      var _this = this;
      var hide = function hide() {
        _this.domElement.style.display = 'none';
        _this.backgroundElement.style.display = 'none';
        dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
        dom.unbind(_this.domElement, 'transitionend', hide);
        dom.unbind(_this.domElement, 'oTransitionEnd', hide);
      };
      dom.bind(this.domElement, 'webkitTransitionEnd', hide);
      dom.bind(this.domElement, 'transitionend', hide);
      dom.bind(this.domElement, 'oTransitionEnd', hide);
      this.backgroundElement.style.opacity = 0;
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = 'scale(1.1)';
    }
  }, {
    key: 'layout',
    value: function layout() {
      this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
      this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
    }
  }]);
  return CenteredDiv;
}();

var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .cr.function .property-name{width:100%}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

css.inject(styleSheet);
var CSS_NAMESPACE = 'dg';
var HIDE_KEY_CODE = 72;
var CLOSE_BUTTON_HEIGHT = 20;
var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
var SUPPORTS_LOCAL_STORAGE = function () {
  try {
    return !!window.localStorage;
  } catch (e) {
    return false;
  }
}();
var SAVE_DIALOGUE = void 0;
var autoPlaceVirgin = true;
var autoPlaceContainer = void 0;
var hide = false;
var hideableGuis = [];
var GUI = function GUI(pars) {
  var _this = this;
  var params = pars || {};
  this.domElement = document.createElement('div');
  this.__ul = document.createElement('ul');
  this.domElement.appendChild(this.__ul);
  dom.addClass(this.domElement, CSS_NAMESPACE);
  this.__folders = {};
  this.__controllers = [];
  this.__rememberedObjects = [];
  this.__rememberedObjectIndecesToControllers = [];
  this.__listening = [];
  params = Common.defaults(params, {
    closeOnTop: false,
    autoPlace: true,
    width: GUI.DEFAULT_WIDTH
  });
  params = Common.defaults(params, {
    resizable: params.autoPlace,
    hideable: params.autoPlace
  });
  if (!Common.isUndefined(params.load)) {
    if (params.preset) {
      params.load.preset = params.preset;
    }
  } else {
    params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
  }
  if (Common.isUndefined(params.parent) && params.hideable) {
    hideableGuis.push(this);
  }
  params.resizable = Common.isUndefined(params.parent) && params.resizable;
  if (params.autoPlace && Common.isUndefined(params.scrollable)) {
    params.scrollable = true;
  }
  var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
  var saveToLocalStorage = void 0;
  var titleRow = void 0;
  Object.defineProperties(this,
  {
    parent: {
      get: function get$$1() {
        return params.parent;
      }
    },
    scrollable: {
      get: function get$$1() {
        return params.scrollable;
      }
    },
    autoPlace: {
      get: function get$$1() {
        return params.autoPlace;
      }
    },
    closeOnTop: {
      get: function get$$1() {
        return params.closeOnTop;
      }
    },
    preset: {
      get: function get$$1() {
        if (_this.parent) {
          return _this.getRoot().preset;
        }
        return params.load.preset;
      },
      set: function set$$1(v) {
        if (_this.parent) {
          _this.getRoot().preset = v;
        } else {
          params.load.preset = v;
        }
        setPresetSelectIndex(this);
        _this.revert();
      }
    },
    width: {
      get: function get$$1() {
        return params.width;
      },
      set: function set$$1(v) {
        params.width = v;
        setWidth(_this, v);
      }
    },
    name: {
      get: function get$$1() {
        return params.name;
      },
      set: function set$$1(v) {
        params.name = v;
        if (titleRow) {
          titleRow.innerHTML = params.name;
        }
      }
    },
    closed: {
      get: function get$$1() {
        return params.closed;
      },
      set: function set$$1(v) {
        params.closed = v;
        if (params.closed) {
          dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
        } else {
          dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
        }
        this.onResize();
        if (_this.__closeButton) {
          _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
        }
      }
    },
    load: {
      get: function get$$1() {
        return params.load;
      }
    },
    useLocalStorage: {
      get: function get$$1() {
        return useLocalStorage;
      },
      set: function set$$1(bool) {
        if (SUPPORTS_LOCAL_STORAGE) {
          useLocalStorage = bool;
          if (bool) {
            dom.bind(window, 'unload', saveToLocalStorage);
          } else {
            dom.unbind(window, 'unload', saveToLocalStorage);
          }
          localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
        }
      }
    }
  });
  if (Common.isUndefined(params.parent)) {
    this.closed = params.closed || false;
    dom.addClass(this.domElement, GUI.CLASS_MAIN);
    dom.makeSelectable(this.domElement, false);
    if (SUPPORTS_LOCAL_STORAGE) {
      if (useLocalStorage) {
        _this.useLocalStorage = true;
        var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
        if (savedGui) {
          params.load = JSON.parse(savedGui);
        }
      }
    }
    this.__closeButton = document.createElement('div');
    this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
    dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
    if (params.closeOnTop) {
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
      this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
    } else {
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
      this.domElement.appendChild(this.__closeButton);
    }
    dom.bind(this.__closeButton, 'click', function () {
      _this.closed = !_this.closed;
    });
  } else {
    if (params.closed === undefined) {
      params.closed = true;
    }
    var titleRowName = document.createTextNode(params.name);
    dom.addClass(titleRowName, 'controller-name');
    titleRow = addRow(_this, titleRowName);
    var onClickTitle = function onClickTitle(e) {
      e.preventDefault();
      _this.closed = !_this.closed;
      return false;
    };
    dom.addClass(this.__ul, GUI.CLASS_CLOSED);
    dom.addClass(titleRow, 'title');
    dom.bind(titleRow, 'click', onClickTitle);
    if (!params.closed) {
      this.closed = false;
    }
  }
  if (params.autoPlace) {
    if (Common.isUndefined(params.parent)) {
      if (autoPlaceVirgin) {
        autoPlaceContainer = document.createElement('div');
        dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
        dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
        document.body.appendChild(autoPlaceContainer);
        autoPlaceVirgin = false;
      }
      autoPlaceContainer.appendChild(this.domElement);
      dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
    }
    if (!this.parent) {
      setWidth(_this, params.width);
    }
  }
  this.__resizeHandler = function () {
    _this.onResizeDebounced();
  };
  dom.bind(window, 'resize', this.__resizeHandler);
  dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
  dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
  dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
  this.onResize();
  if (params.resizable) {
    addResizeHandle(this);
  }
  saveToLocalStorage = function saveToLocalStorage() {
    if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
    }
  };
  this.saveToLocalStorageIfPossible = saveToLocalStorage;
  function resetWidth() {
    var root = _this.getRoot();
    root.width += 1;
    Common.defer(function () {
      root.width -= 1;
    });
  }
  if (!params.parent) {
    resetWidth();
  }
};
GUI.toggleHide = function () {
  hide = !hide;
  Common.each(hideableGuis, function (gui) {
    gui.domElement.style.display = hide ? 'none' : '';
  });
};
GUI.CLASS_AUTO_PLACE = 'a';
GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
GUI.CLASS_MAIN = 'main';
GUI.CLASS_CONTROLLER_ROW = 'cr';
GUI.CLASS_TOO_TALL = 'taller-than-window';
GUI.CLASS_CLOSED = 'closed';
GUI.CLASS_CLOSE_BUTTON = 'close-button';
GUI.CLASS_CLOSE_TOP = 'close-top';
GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
GUI.CLASS_DRAG = 'drag';
GUI.DEFAULT_WIDTH = 245;
GUI.TEXT_CLOSED = 'Close Controls';
GUI.TEXT_OPEN = 'Open Controls';
GUI._keydownHandler = function (e) {
  if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
    GUI.toggleHide();
  }
};
dom.bind(window, 'keydown', GUI._keydownHandler, false);
Common.extend(GUI.prototype,
{
  add: function add(object, property) {
    return _add(this, object, property, {
      factoryArgs: Array.prototype.slice.call(arguments, 2)
    });
  },
  addColor: function addColor(object, property) {
    return _add(this, object, property, {
      color: true
    });
  },
  remove: function remove(controller) {
    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    var _this = this;
    Common.defer(function () {
      _this.onResize();
    });
  },
  destroy: function destroy() {
    if (this.parent) {
      throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
    }
    if (this.autoPlace) {
      autoPlaceContainer.removeChild(this.domElement);
    }
    var _this = this;
    Common.each(this.__folders, function (subfolder) {
      _this.removeFolder(subfolder);
    });
    dom.unbind(window, 'keydown', GUI._keydownHandler, false);
    removeListeners(this);
  },
  addFolder: function addFolder(name) {
    if (this.__folders[name] !== undefined) {
      throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
    }
    var newGuiParams = { name: name, parent: this };
    newGuiParams.autoPlace = this.autoPlace;
    if (this.load &&
    this.load.folders &&
    this.load.folders[name]) {
      newGuiParams.closed = this.load.folders[name].closed;
      newGuiParams.load = this.load.folders[name];
    }
    var gui = new GUI(newGuiParams);
    this.__folders[name] = gui;
    var li = addRow(this, gui.domElement);
    dom.addClass(li, 'folder');
    return gui;
  },
  removeFolder: function removeFolder(folder) {
    this.__ul.removeChild(folder.domElement.parentElement);
    delete this.__folders[folder.name];
    if (this.load &&
    this.load.folders &&
    this.load.folders[folder.name]) {
      delete this.load.folders[folder.name];
    }
    removeListeners(folder);
    var _this = this;
    Common.each(folder.__folders, function (subfolder) {
      folder.removeFolder(subfolder);
    });
    Common.defer(function () {
      _this.onResize();
    });
  },
  open: function open() {
    this.closed = false;
  },
  close: function close() {
    this.closed = true;
  },
  hide: function hide() {
    this.domElement.style.display = 'none';
  },
  show: function show() {
    this.domElement.style.display = '';
  },
  onResize: function onResize() {
    var root = this.getRoot();
    if (root.scrollable) {
      var top = dom.getOffset(root.__ul).top;
      var h = 0;
      Common.each(root.__ul.childNodes, function (node) {
        if (!(root.autoPlace && node === root.__save_row)) {
          h += dom.getHeight(node);
        }
      });
      if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
      } else {
        dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = 'auto';
      }
    }
    if (root.__resize_handle) {
      Common.defer(function () {
        root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
      });
    }
    if (root.__closeButton) {
      root.__closeButton.style.width = root.width + 'px';
    }
  },
  onResizeDebounced: Common.debounce(function () {
    this.onResize();
  }, 50),
  remember: function remember() {
    if (Common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
    }
    if (this.parent) {
      throw new Error('You can only call remember on a top level GUI.');
    }
    var _this = this;
    Common.each(Array.prototype.slice.call(arguments), function (object) {
      if (_this.__rememberedObjects.length === 0) {
        addSaveMenu(_this);
      }
      if (_this.__rememberedObjects.indexOf(object) === -1) {
        _this.__rememberedObjects.push(object);
      }
    });
    if (this.autoPlace) {
      setWidth(this, this.width);
    }
  },
  getRoot: function getRoot() {
    var gui = this;
    while (gui.parent) {
      gui = gui.parent;
    }
    return gui;
  },
  getSaveObject: function getSaveObject() {
    var toReturn = this.load;
    toReturn.closed = this.closed;
    if (this.__rememberedObjects.length > 0) {
      toReturn.preset = this.preset;
      if (!toReturn.remembered) {
        toReturn.remembered = {};
      }
      toReturn.remembered[this.preset] = getCurrentPreset(this);
    }
    toReturn.folders = {};
    Common.each(this.__folders, function (element, key) {
      toReturn.folders[key] = element.getSaveObject();
    });
    return toReturn;
  },
  save: function save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }
    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
  },
  saveAs: function saveAs(presetName) {
    if (!this.load.remembered) {
      this.load.remembered = {};
      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
    }
    this.load.remembered[presetName] = getCurrentPreset(this);
    this.preset = presetName;
    addPresetOption(this, presetName, true);
    this.saveToLocalStorageIfPossible();
  },
  revert: function revert(gui) {
    Common.each(this.__controllers, function (controller) {
      if (!this.getRoot().load.remembered) {
        controller.setValue(controller.initialValue);
      } else {
        recallSavedValue(gui || this.getRoot(), controller);
      }
      if (controller.__onFinishChange) {
        controller.__onFinishChange.call(controller, controller.getValue());
      }
    }, this);
    Common.each(this.__folders, function (folder) {
      folder.revert(folder);
    });
    if (!gui) {
      markPresetModified(this.getRoot(), false);
    }
  },
  listen: function listen(controller) {
    var init = this.__listening.length === 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
  },
  updateDisplay: function updateDisplay() {
    Common.each(this.__controllers, function (controller) {
      controller.updateDisplay();
    });
    Common.each(this.__folders, function (folder) {
      folder.updateDisplay();
    });
  }
});
function addRow(gui, newDom, liBefore) {
  var li = document.createElement('li');
  if (newDom) {
    li.appendChild(newDom);
  }
  if (liBefore) {
    gui.__ul.insertBefore(li, liBefore);
  } else {
    gui.__ul.appendChild(li);
  }
  gui.onResize();
  return li;
}
function removeListeners(gui) {
  dom.unbind(window, 'resize', gui.__resizeHandler);
  if (gui.saveToLocalStorageIfPossible) {
    dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
  }
}
function markPresetModified(gui, modified) {
  var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
  if (modified) {
    opt.innerHTML = opt.value + '*';
  } else {
    opt.innerHTML = opt.value;
  }
}
function augmentController(gui, li, controller) {
  controller.__li = li;
  controller.__gui = gui;
  Common.extend(controller, {
    options: function options(_options) {
      if (arguments.length > 1) {
        var nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: nextSibling,
          factoryArgs: [Common.toArray(arguments)]
        });
      }
      if (Common.isArray(_options) || Common.isObject(_options)) {
        var _nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: _nextSibling,
          factoryArgs: [_options]
        });
      }
    },
    name: function name(_name) {
      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
      return controller;
    },
    listen: function listen() {
      controller.__gui.listen(controller);
      return controller;
    },
    remove: function remove() {
      controller.__gui.remove(controller);
      return controller;
    }
  });
  if (controller instanceof NumberControllerSlider) {
    var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
    Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
      var pc = controller[method];
      var pb = box[method];
      controller[method] = box[method] = function () {
        var args = Array.prototype.slice.call(arguments);
        pb.apply(box, args);
        return pc.apply(controller, args);
      };
    });
    dom.addClass(li, 'has-slider');
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    var r = function r(returned) {
      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
        controller.remove();
        var newController = _add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step]
        });
        newController.name(oldName);
        if (wasListening) newController.listen();
        return newController;
      }
      return returned;
    };
    controller.min = Common.compose(r, controller.min);
    controller.max = Common.compose(r, controller.max);
  } else if (controller instanceof BooleanController) {
    dom.bind(li, 'click', function () {
      dom.fakeEvent(controller.__checkbox, 'click');
    });
    dom.bind(controller.__checkbox, 'click', function (e) {
      e.stopPropagation();
    });
  } else if (controller instanceof FunctionController) {
    dom.bind(li, 'click', function () {
      dom.fakeEvent(controller.__button, 'click');
    });
    dom.bind(li, 'mouseover', function () {
      dom.addClass(controller.__button, 'hover');
    });
    dom.bind(li, 'mouseout', function () {
      dom.removeClass(controller.__button, 'hover');
    });
  } else if (controller instanceof ColorController) {
    dom.addClass(li, 'color');
    controller.updateDisplay = Common.compose(function (val) {
      li.style.borderLeftColor = controller.__color.toString();
      return val;
    }, controller.updateDisplay);
    controller.updateDisplay();
  }
  controller.setValue = Common.compose(function (val) {
    if (gui.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui.getRoot(), true);
    }
    return val;
  }, controller.setValue);
}
function recallSavedValue(gui, controller) {
  var root = gui.getRoot();
  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
  if (matchedIndex !== -1) {
    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
    if (controllerMap === undefined) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }
    controllerMap[controller.property] = controller;
    if (root.load && root.load.remembered) {
      var presetMap = root.load.remembered;
      var preset = void 0;
      if (presetMap[gui.preset]) {
        preset = presetMap[gui.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        return;
      }
      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
        var value = preset[matchedIndex][controller.property];
        controller.initialValue = value;
        controller.setValue(value);
      }
    }
  }
}
function _add(gui, object, property, params) {
  if (object[property] === undefined) {
    throw new Error('Object "' + object + '" has no property "' + property + '"');
  }
  var controller = void 0;
  if (params.color) {
    controller = new ColorController(object, property);
  } else {
    var factoryArgs = [object, property].concat(params.factoryArgs);
    controller = ControllerFactory.apply(gui, factoryArgs);
  }
  if (params.before instanceof Controller) {
    params.before = params.before.__li;
  }
  recallSavedValue(gui, controller);
  dom.addClass(controller.domElement, 'c');
  var name = document.createElement('span');
  dom.addClass(name, 'property-name');
  name.innerHTML = controller.property;
  var container = document.createElement('div');
  container.appendChild(name);
  container.appendChild(controller.domElement);
  var li = addRow(gui, container, params.before);
  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
  if (controller instanceof ColorController) {
    dom.addClass(li, 'color');
  } else {
    dom.addClass(li, _typeof(controller.getValue()));
  }
  augmentController(gui, li, controller);
  gui.__controllers.push(controller);
  return controller;
}
function getLocalStorageHash(gui, key) {
  return document.location.href + '.' + key;
}
function addPresetOption(gui, name, setSelected) {
  var opt = document.createElement('option');
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}
function showHideExplain(gui, explain) {
  explain.style.display = gui.useLocalStorage ? 'block' : 'none';
}
function addSaveMenu(gui) {
  var div = gui.__save_row = document.createElement('li');
  dom.addClass(gui.domElement, 'has-save');
  gui.__ul.insertBefore(div, gui.__ul.firstChild);
  dom.addClass(div, 'save-row');
  var gears = document.createElement('span');
  gears.innerHTML = '&nbsp;';
  dom.addClass(gears, 'button gears');
  var button = document.createElement('span');
  button.innerHTML = 'Save';
  dom.addClass(button, 'button');
  dom.addClass(button, 'save');
  var button2 = document.createElement('span');
  button2.innerHTML = 'New';
  dom.addClass(button2, 'button');
  dom.addClass(button2, 'save-as');
  var button3 = document.createElement('span');
  button3.innerHTML = 'Revert';
  dom.addClass(button3, 'button');
  dom.addClass(button3, 'revert');
  var select = gui.__preset_select = document.createElement('select');
  if (gui.load && gui.load.remembered) {
    Common.each(gui.load.remembered, function (value, key) {
      addPresetOption(gui, key, key === gui.preset);
    });
  } else {
    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
  }
  dom.bind(select, 'change', function () {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
    }
    gui.preset = this.value;
  });
  div.appendChild(select);
  div.appendChild(gears);
  div.appendChild(button);
  div.appendChild(button2);
  div.appendChild(button3);
  if (SUPPORTS_LOCAL_STORAGE) {
    var explain = document.getElementById('dg-local-explain');
    var localStorageCheckBox = document.getElementById('dg-local-storage');
    var saveLocally = document.getElementById('dg-save-locally');
    saveLocally.style.display = 'block';
    if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
      localStorageCheckBox.setAttribute('checked', 'checked');
    }
    showHideExplain(gui, explain);
    dom.bind(localStorageCheckBox, 'change', function () {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain(gui, explain);
    });
  }
  var newConstructorTextArea = document.getElementById('dg-new-constructor');
  dom.bind(newConstructorTextArea, 'keydown', function (e) {
    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
      SAVE_DIALOGUE.hide();
    }
  });
  dom.bind(gears, 'click', function () {
    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
    SAVE_DIALOGUE.show();
    newConstructorTextArea.focus();
    newConstructorTextArea.select();
  });
  dom.bind(button, 'click', function () {
    gui.save();
  });
  dom.bind(button2, 'click', function () {
    var presetName = prompt('Enter a new preset name.');
    if (presetName) {
      gui.saveAs(presetName);
    }
  });
  dom.bind(button3, 'click', function () {
    gui.revert();
  });
}
function addResizeHandle(gui) {
  var pmouseX = void 0;
  gui.__resize_handle = document.createElement('div');
  Common.extend(gui.__resize_handle.style, {
    width: '6px',
    marginLeft: '-3px',
    height: '200px',
    cursor: 'ew-resize',
    position: 'absolute'
  });
  function drag(e) {
    e.preventDefault();
    gui.width += pmouseX - e.clientX;
    gui.onResize();
    pmouseX = e.clientX;
    return false;
  }
  function dragStop() {
    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, 'mousemove', drag);
    dom.unbind(window, 'mouseup', dragStop);
  }
  function dragStart(e) {
    e.preventDefault();
    pmouseX = e.clientX;
    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, 'mousemove', drag);
    dom.bind(window, 'mouseup', dragStop);
    return false;
  }
  dom.bind(gui.__resize_handle, 'mousedown', dragStart);
  dom.bind(gui.__closeButton, 'mousedown', dragStart);
  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
}
function setWidth(gui, w) {
  gui.domElement.style.width = w + 'px';
  if (gui.__save_row && gui.autoPlace) {
    gui.__save_row.style.width = w + 'px';
  }
  if (gui.__closeButton) {
    gui.__closeButton.style.width = w + 'px';
  }
}
function getCurrentPreset(gui, useInitialValues) {
  var toReturn = {};
  Common.each(gui.__rememberedObjects, function (val, index) {
    var savedValues = {};
    var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
    Common.each(controllerMap, function (controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });
    toReturn[index] = savedValues;
  });
  return toReturn;
}
function setPresetSelectIndex(gui) {
  for (var index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}
function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame$1.call(window, function () {
      updateDisplays(controllerArray);
    });
  }
  Common.each(controllerArray, function (c) {
    c.updateDisplay();
  });
}
var GUI$1 = GUI;

var node = {};

Object.defineProperty(node, "__esModule", {
  value: true
});
var default_1 = node.default = void 0;
const t1 = 6 / 29;
const t2 = 3 * t1 * t1;

const lrgb2rgb = x => Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)) || 0;

const lab2xyz = t => t > t1 ? t * t * t : t2 * (t - 4 / 29);

var _default = ({
  luminance,
  a,
  b
}) => {
  const baseY = (luminance + 16) / 116;
  const x = 0.96422 * lab2xyz(baseY + a / 500);
  const y = Number(lab2xyz(baseY));
  const z = 0.82521 * lab2xyz(baseY - b / 200);
  return {
    red: lrgb2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
    green: lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
    blue: lrgb2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z)
  };
};

default_1 = node.default = _default;

function arrDepth(arr) {
    if (arr.length === 0)                   return 0;
    if (arr[0].length === undefined)        return 1;
    if (arr[0][0].length === undefined)     return 2;
    if (arr[0][0][0].length === undefined)  return 3;
  } 
 
  
  let d3 = false;
  let interpolatePath = false;

  let g2d = {};
  g2d.name = "WebObjects/Graphics";


  interpretate.contextExpand(g2d);

 //polyfill for symbols
 ["FaceForm", "CurrentValue", "FontColor", "Tiny", "VertexColors", "Antialiasing","Small", "Plot",  "ListLinePlot", "ListPlot", "Automatic", "Controls","All","TickLabels","FrameTicksStyle", "AlignmentPoint","AspectRatio","Axes","AxesLabel","AxesOrigin","AxesStyle","Background","BaselinePosition","BaseStyle","ColorOutput","ContentSelectable","CoordinatesToolOptions","DisplayFunction","Epilog","FormatType","Frame","FrameLabel","FrameStyle","FrameTicks","FrameTicksStyle","GridLines","GridLinesStyle","ImageMargins","ImagePadding","ImageSize","ImageSizeRaw","LabelStyle","Method","PlotLabel","PlotRange","PlotRangeClipping","PlotRangePadding","PlotRegion","PreserveImageOptions","Prolog","RotateLabel","Ticks","TicksStyle", "TransitionDuration"].map((name)=>{
  g2d[name] = () => name;
  //g2d[name].destroy = () => name;
  g2d[name].update = () => name;
  
  });

  g2d.HoldForm = async (args, env) => await interpretate(args[0], env);
  g2d.HoldForm.update = async (args, env) => await interpretate(args[0], env);
  //g2d.HoldForm.destroy = async (args, env) => await interpretate(args[0], env)

  g2d.Scale = async (args, env) => await interpretate(args[0], env);
  g2d.Scale.update = async (args, env) => await interpretate(args[0], env);
  //g2d.Scale.destroy = async (args, env) => await interpretate(args[0], env)  

  g2d.NamespaceBox = async (args, env) => await interpretate(args[1], env);
  g2d.DynamicModuleBox = async (args, env) => await interpretate(args[1], env);
  g2d.TagBox = async (args, env) => await interpretate(args[0], env);  
  g2d.DynamicModule = async (args, env) => await interpretate(args[1], env);
  g2d["Charting`DelayedClickEffect"] = async (args, env) => await interpretate(args[0], env);

  g2d.TransitionDuration = () => "TransitionDuration";
  g2d.TransitionType = () => "TransitionType";

  var assignTransition = (env) => {
    if ('transitiontype' in env) {
      switch (env.transitiontype) {
        case 'Linear':
          env.transitionType = d3.easeLinear;
        break;
        case 'CubicInOut':
          env.transitionType = d3.easeCubicInOut;
        break;
        default:
          env.transitionType = false;
      }
    }

    if (env.transitionduration) {
      env.transitionDuration = env.transitionduration;
    }
  };

  g2d.Offset = async (args, env) => {
    const list = await interpretate(args[1], env);

    env.offset = {
      x: env.xAxis(list[0]) - env.xAxis(0),
      y: env.yAxis(list[1]) - env.yAxis(0)
    };

    const data = await interpretate(args[0], env);
    if (Array.isArray(data)) {
      data.map((el, i) => el + list[i]);
      return [0,0];
    }

    return data;
  };

  //g2d.Offset.destroy = g2d.Offset
  g2d.Offset.update = g2d.Offset;

  g2d.Graphics = async (args, env) => {
    await interpretate.shared.d3.load();
    if (!d3) d3 = interpretate.shared.d3.d3;
    if (!interpolatePath) interpolatePath = interpretate.shared.d3['d3-interpolate-path'].interpolatePath;

    g2d.interpolatePath = interpolatePath;
    g2d.d3 = d3;

    d3.selection.prototype.maybeTransition = function(type, duration) {
      return type ? this.transition().ease(type).duration(duration) : this;
    };

    d3.selection.prototype.maybeTransitionTween = function(type, duration, d, func) {


      return type ? this.transition()
      .ease(type)
      .duration(duration).attrTween(d, func) : this.attr(d, func.apply(this.node(), this.data())(1.0));
    };




    /**
     * @type {Object}
     */  
    let options = await core._getRules(args, {...env, context: g2d, hold:true});


    if (Object.keys(options).length == 0 && args.length > 1) {
      options = await core._getRules(await interpretate(args[1], {...env, context: g2d, hold:true}), {...env, context: g2d, hold:true});
 
    }

    console.log(options);

    /**
     * @type {HTMLElement}
     */
    var container = env.element;

    /**
     * @type {[Number, Number]}
     */
    let ImageSize = await interpretate(options.ImageSize, env) || [core.DefaultWidth, 0.618034*core.DefaultWidth];

    const aspectratio = await interpretate(options.AspectRatio, env) || 0.618034;

    //if only the width is specified
    if (!(ImageSize instanceof Array)) ImageSize = [ImageSize, ImageSize*aspectratio];

    console.log('Image size');
    console.log(ImageSize); 

    //simplified version
    let axis = [false, false];
    let invertedTicks = false;
    let ticklengths = [5,5,5,5];
    let tickLabels = [true, true, true, true];
    let ticks = undefined;
    let framed = false;
    let axesstyle = undefined;
    let ticksstyle = undefined;

    console.log(options);

    if (options.Frame) {
      options.Frame = await interpretate(options.Frame, env);
      if (options.Frame === true) {
        framed = true;
      } else {
        if (options.Frame[0][0] === true) framed = true;
        if (options.Frame[0] === true) framed = true;  
      }
    }
    
    if (options.Axes) {
      options.Axes = await interpretate(options.Axes, env);
      if (options.Axes === true) {
        axis = [true, true];
      } else if (Array.isArray(options.Axes)) {
        axis = options.Axes;

      }
    }  

    if (framed) {
      invertedTicks = true;
      axis = [true, true, true, true];
    }

    

    if (options.Ticks) {
      options.Ticks = await interpretate(options.Ticks, env);
      //BRRRR

      //left, bottom
      if (Array.isArray(options.Ticks)) {
        if (Array.isArray(options.Ticks[0])) {
          if (Number.isInteger(options.Ticks[0][0]) || Array.isArray(options.Ticks[0][0])) {
            ticks = [...options.Ticks, ...options.Ticks];
          }
        }
      }      
    }

    if (options.FrameTicks && framed) {
      options.FrameTicks = await interpretate(options.FrameTicks, env);
      //I HATE YOU WOLFRAM

      //left,right,  bottom,top
      if (Array.isArray(options.FrameTicks)) {
        if (Array.isArray(options.FrameTicks[0])) {
          if (Array.isArray(options.FrameTicks[0][0])) {
            if (Number.isInteger(options.FrameTicks[0][0][0]) || Array.isArray(options.FrameTicks[0][0][0])) {
              ticks = [options.FrameTicks[0][0], options.FrameTicks[1][0], options.FrameTicks[0][1], options.FrameTicks[1][1]];
            }
          }
        }
      }
    }



    
    
    if (options.TickDirection) {
      const dir = await interpretate(options.TickDirection, env);
      if (dir === "Inward") invertedTicks = true;
      if (dir === "Outward") invertedTicks = false;
    }

    if (options.TickLengths) {
      options.TickLengths = await interpretate(options.TickLengths, env);
      if (!Array.isArray(options.TickLengths)) {
        ticklengths = [options.TickLengths, options.TickLengths, options.TickLengths, options.TickLengths];
      }
    }

    if (options.TickLabels) {
      options.TickLabels = await interpretate(options.TickLabels, env);
      if (!Array.isArray(options.TickLabels)) {
        tickLabels = [false, false, false, false];
      } else {
        tickLabels = options.TickLabels.flat();
      }      
    }

    //-----------------
    let margin = {top: 0, right: 0, bottom: 10, left: 40};
    let padding = {top: 0, right: 0, bottom: 15, left: 0};

    if (axis[2]) {
      margin.top = margin.bottom;
      margin.left = margin.right;
    }
    if (options.AxesLabel) {
      padding.bottom = 10;
      margin.top = 30;
      margin.right = 50;
      padding.right = 50;
    }

    if (framed) {
      padding.left = 40;
      padding.left = 30;
      margin.left = 30;
      margin.right = 40;
      margin.top = 30;

      padding.bottom = 10;
      margin.bottom = 35;
    }

    if (options.ImagePadding) {
      console.log('padding: ');
      console.log(options.ImagePadding);
      options.ImagePadding = await interpretate(options.ImagePadding, env);

      if (options.ImagePadding === 'None') {
        margin.top = 0;
        margin.bottom = 0;
        margin.left = 0;
        margin.right = 0;
      } else if (Number.isInteger(options.ImagePadding)) {
        margin.top = options.ImagePadding;
        margin.bottom = options.ImagePadding;
        margin.left = options.ImagePadding;
        margin.right = options.ImagePadding;
      } else if (options.ImagePadding === "All") ; else {
        console.error('given ImagePadding is not supported!');
      }
    }
    
    let width = ImageSize[0] - margin.left - margin.right;
    let height = ImageSize[1] - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg;
    
    
    if (env.inset) 
      svg = env.inset.append("svg");
    else
      svg = d3.select(container).append("svg");


    if ('ViewBox' in options) {

      let boxsize = await interpretate(options.ViewBox, env);
      if (!(boxsize instanceof Array)) boxsize = [0,0,boxsize, boxsize*aspectratio];
      svg.attr("viewBox", boxsize);     

    } else {
      svg.attr("width", width + margin.left + margin.right + padding.left)
         .attr("height", height + margin.top + margin.bottom + padding.bottom);
    }

    const listenerSVG = svg;
    
    svg = svg  
    .append("g")
      .attr("transform",
            "translate(" + (margin.left + padding.left) + "," + margin.top + ")");

    
    
    let range = [[-1.15,1.15],[-1.15,1.15]];
    let unknownRanges = true;

    if (options.PlotRange) {
      const r = await interpretate(options.PlotRange, env);
      if (Number.isFinite(r[0][0])) {
        if (Number.isFinite(r[1][0])) {
          range = r;
          unknownRanges = false;
        } else {
          range[0] = r[0];
          range[1] = r[0];
        }
      }
    }

    /*if (options.FrameTicks && framed && !options.PlotRange) {
      //shitty fix for MatrixPlot 
      console.log('shitty fix for MatrixPLot');
      range = [[0,1], [0,1]];
      const test = [...options.FrameTicks].flat(Infinity);
      console.log(test);
      if (!isNaN(test[0])) {
        const xx = options.FrameTicks[0].flat(Infinity);
        const yy = options.FrameTicks[1].flat(Infinity);
        console.log(xx);
        console.log(yy);
        range[0][1] = Math.max(...xx);
        range[1][1] = Math.max(...yy);
        unknownRanges = false;
      }
      console.log(range);
    }*/
    

    let transitionType = d3.easeLinear;

    if (options.TransitionType) {
      const type = await interpretate(options.TransitionType, {...env, context: g2d});
      switch (type) {
        case 'Linear':
          transitionType = d3.easeLinear;
        break;
        case 'CubicInOut':
          transitionType = d3.easeCubicInOut;
        break;
        default:
          transitionType = undefined;
      }
    }



    console.log(range);


    let gX = undefined;
    let gY = undefined;

    let gTX = undefined;
    let gRY = undefined;
    
      let x = d3.scaleLinear()
      .domain(range[0])
      .range([ 0, width ]);

    let xAxis = d3.axisBottom(x);
    let txAxis = d3.axisTop(x);

    console.log(axis);
    
    if (ticks) {
      if (Array.isArray(ticks[0][0])) {
        const labels = ticks[0].map((el) => el[1]);
        xAxis = xAxis.tickValues(ticks[0].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        xAxis = xAxis.tickValues(ticks[0]);
      }      
    }
    if (ticks) {
      if (Array.isArray(ticks[2][0])) {
        const labels = ticks[2].map((el) => el[1]);
        txAxis = txAxis.tickValues(ticks[2].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        txAxis = txAxis.tickValues(ticks[2]);
      }
    }

    if (!tickLabels[0]) xAxis = xAxis.tickFormat(x => ``);
    if (!tickLabels[1]) txAxis = txAxis.tickFormat(x => ``);

    if (invertedTicks) {
      xAxis = xAxis.tickSizeInner(-ticklengths[0]).tickSizeOuter(0);
      txAxis = txAxis.tickSizeInner(-ticklengths[2]).tickSizeOuter(0);
    } else { 
      xAxis = xAxis.tickSizeInner(ticklengths[0]).tickSizeOuter(0);
      txAxis = txAxis.tickSizeInner(ticklengths[2]).tickSizeOuter(0); 
    }

 
    // Add Y axis
    let y = d3.scaleLinear()
    .domain(range[1])
    .range([ height, 0 ]);

    let yAxis = d3.axisLeft(y);
    let ryAxis = d3.axisRight(y);

    if (ticks) {
      if (Array.isArray(ticks[1][0])) {
        const labels = ticks[1].map((el) => el[1]);
        yAxis = yAxis.tickValues(ticks[1].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        yAxis = yAxis.tickValues(ticks[1]);
      }  
    }

    if (ticks) {
      if (Array.isArray(ticks[3][0])) {
        const labels = ticks[3].map((el) => el[1]);
        ryAxis = ryAxis.tickValues(ticks[3].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        ryAxis = ryAxis.tickValues(ticks[3]);
      }        
    }

    if (!tickLabels[2]) yAxis = yAxis.tickFormat(x => ``);
    if (!tickLabels[3]) ryAxis = ryAxis.tickFormat(x => ``);    
    
    if (invertedTicks) {
      yAxis = yAxis.tickSizeInner(-ticklengths[1]).tickSizeOuter(0);
      ryAxis = ryAxis.tickSizeInner(-ticklengths[3]).tickSizeOuter(0);
    } else {
      yAxis = yAxis.tickSizeInner(ticklengths[1]).tickSizeOuter(0);
      ryAxis = ryAxis.tickSizeInner(ticklengths[3]).tickSizeOuter(0);      
    }

    



    env.context = g2d;
    env.svg = svg.append("g");
    env.xAxis = x;
    env.yAxis = y;     
    env.numerical = true;
    env.tostring = false;
    env.offset = {x: 0, y: 0};
    env.color = 'rgb(68, 68, 68)';
    env.stroke = undefined;
    env.opacity = 1;
    env.fontsize = 10;
    env.fontfamily = 'sans-serif';
    env.strokeWidth = 1.5;
    env.pointSize = 0.013;
    env.transitionDuration = 50;
    env.transitionType = transitionType;

    axesstyle = {...env};
    ticksstyle = {...env};

    if (options.AxesStyle) {
      await interpretate(options.AxesStyle, axesstyle);
    }

    if (options.FrameStyle) {
      console.warn('FrameStyle');
      console.log(options.FrameStyle);
      //console.log(JSON.stringify(axesstyle));
      await interpretate(options.FrameStyle, axesstyle);
      console.log(axesstyle);
    }    

    if (options.FrameTicksStyle) {
      await interpretate(options.FrameTicksStyle, ticksstyle);
    }

    if (axis[0]) gX = svg.append("g").attr("transform", "translate(0," + height + ")").call(xAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);
    if (axis[2]) gTX = svg.append("g").attr("transform", "translate(0," + 0 + ")").call(txAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);
    
    if (axis[1]) gY = svg.append("g").call(yAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);
    if (axis[3]) gRY = svg.append("g").attr("transform", "translate(" + width + ", 0)").call(ryAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);



    if (options.AxesLabel && !framed) {
      
      options.AxesLabel = await interpretate(options.AxesLabel, {...env, hold:true});

      if (Array.isArray(options.AxesLabel)) {
        let temp = {...env};
        let value = await interpretate(options.AxesLabel[0], temp);
        if (value != 'None' && gX) {
          g2d.Text.PutText(gX.append("text")
          .attr("x", width + temp.offset.x + 10)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "start")
          , value, axesstyle); 
        }

        temp = {...env};
        value = await interpretate(options.AxesLabel[1], temp);        
        if (value != 'None' && gY) {
          g2d.Text.PutText(gY.append("text")
          .attr("x", 0 + temp.offset.x)
          .attr("y", -margin.top/2 + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "start")
          , value, axesstyle); 
        }        
 
      }

    }

    if (options.FrameLabel && framed) {
      options.FrameLabel = await interpretate(options.FrameLabel, {...env, hold:true});

      if (Array.isArray(options.FrameLabel)) {

        const lb = await interpretate(options.FrameLabel[0], {...env, hold:true});
        const rt = await interpretate(options.FrameLabel[1], {...env, hold:true});
        
        let temp;
        let value;

      if (lb != 'None' && lb) {
        temp = {...env};
        value = await interpretate(lb[0], temp);

        if (value != 'None' && gY) {
          g2d.Text.PutText(gY.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + temp.offset.x)
          .attr("x", -height/2 - temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "middle")
          , value, axesstyle); 
        } 


        temp = {...env};
        value = await interpretate(lb[1], temp);

        if (value != 'None' && gRY) {
          g2d.Text.PutText(
            gRY.append("text")
              .attr("x", 0 + temp.offset.x)
              .attr("y", margin.bottom + temp.offset.y)
              .attr("font-size", axesstyle.fontsize)
              .attr("fill", axesstyle.color)
              .attr("text-anchor", "middle"),
            
            value, axesstyle);
        } 
      }  

      if (rt != 'None' && rt) {

        temp = {...env};
        value = await interpretate(rt[1], temp);        
        
        if (value != 'None' && gTX) {
          g2d.Text.PutText(
          gTX.append("text")
          .attr("x", width/2 + temp.offset.x)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "middle")
          , value, axesstyle);
        }

        temp = {...env};
        value = await interpretate(rt[0], temp);        

        if (value != 'None' && gX) {
          g2d.Text.PutText(gX.append("text")
          .attr("x", width/2 + temp.offset.x)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "middle")
          , value, axesstyle); 
        }   
         
      }    
 
      }

    } 
    //since FE object insolates env already, there is no need to make a copy

      
      if (options.TransitionDuration) {
        env.transitionDuration = await interpretate(options.TransitionDuration, env);
      }

      env.local.xAxis = x;
      env.local.yAxis = y;

      if (options.Controls || (typeof options.Controls === 'undefined')) {
        //add pan and zoom
        if (typeof options.Controls === 'undefined') {
          addPanZoom(listenerSVG, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env);
        } else {
          if (await interpretate(options.Controls, env))
            addPanZoom(listenerSVG, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env);
        }
      }

      if (!env.inset) {

        //Setting GUI
        const gui = new GUI$1({ autoPlace: false, name: '...' , closed:true});

        const guiContainer = document.createElement('div');
        guiContainer.classList.add('graphics2d-controller');
        guiContainer.appendChild(gui.domElement);  
      
        const button = { Save:function(){ 
          saveFile(serialize(container.firstChild), "plot.svg");
        }};
        gui.add(button, 'Save');        

        env.element.appendChild(guiContainer);
      }



      await interpretate(options.Prolog, env); 
      await interpretate(args[0], env);
      await interpretate(options.Epilog, env);

      if (unknownRanges) {
        console.warn('d3.js autoscale!');
        //credits https://gist.github.com/mootari
        //thank you, nice guy
        
        

        const xsize = ImageSize[0] - (margin.left + margin.right);
        const ysize = ImageSize[1] - (margin.top + margin.bottom);

        const box = env.svg.node().getBBox();
        const scale = Math.min(xsize / box.width, ysize / box.height);
        
        // Reset transform.
        let transform = d3.zoomTransform(listenerSVG);
        

        
        // Center [0, 0].
        transform = transform.translate(xsize / 2, ysize / 2);
        // Apply scale.
        transform = transform.scale(scale);
        // Center elements.
        transform = transform.translate(-box.x - box.width / 2, -box.y - box.height / 2);
       
        
        reScale(transform, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y);

        if (env._zoom) {
          env._zoom.transform(listenerSVG, transform);
        }        

        /*setTimeout(() => {
          dx =  - (dims.x)*k;
          dy =  - (dims.y)*k;

          reScale(, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y);
  
          k = Math.min(ImageSize[0] / (dims.x + dims.width + dx), ImageSize[1] / (dims.y + dims.height + dy));

          setTimeout(() => {

            reScale({x: dx, y: dy, k: k}, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y);
            dx =  - (dims.x)*k;
            dy =  - (dims.y)*k;

            setTimeout(() => {
              reScale({x: dx, y: dy, k: k}, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y);
            }, 500);

          }, 500);
        }, 500);*/

        




        //imagesize
      }
  };

  const reScale = (transform, raw, view, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y) => {
      view.attr("transform", transform);
      if (gX)
        gX.call(xAxis.scale(transform.rescaleX(x)));
      if (gY)
        gY.call(yAxis.scale(transform.rescaleY(y)));

      if (gTX)
        gTX.call(txAxis.scale(transform.rescaleX(x)));
      if (gRY)
        gRY.call(ryAxis.scale(transform.rescaleY(y)));          
 
};

  g2d.Graphics.update = (args, env) => { console.error('root update method for Graphics is not supported'); };
  g2d.Graphics.destroy = (args, env) => { console.error('Nothing to destroy...'); };

  g2d.Inset = async (args, env) => {
    const co = await interpretate(args[1], env);

    const group = env.svg.append('g');
    await interpretate(args[0], {...env, inset: group});

    env.local.group = group;

    return group.attr("transform", "translate(" + (env.xAxis(co[0])) + "," + (env.yAxis(co[1])) + ")");
  };

  g2d.Inset.update = async (args, env) => {
    const co = await interpretate(args[1], env);

    env.local.group.attr("transform", "translate(" + (env.xAxis(co[0])) + "," + (env.yAxis(co[1])) + ")");
    return env.local.group;
  };

  g2d.Inset.destroy = async (args, env) => {
    console.warn('Destory method is not defined for Inset');
  };

  g2d.Inset.virtual = true;

  const serialize = (svg) => {
    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";

    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], {type: "image/svg+xml"});
  };

  function saveFile(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    }
  }

  const addPanZoom = (listener, raw, view, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env) => {

      d3.zoomTransform;
      const zoom = d3.zoom().filter(filter).on("zoom", zoomed);
   
      listener.call(zoom);
      
      env._zoom = zoom;

      

      function zoomed({ transform }) {
        
        view.attr("transform", transform);
        if (gX)
          gX.call(xAxis.scale(transform.rescaleX(x)));
        if (gY)
          gY.call(yAxis.scale(transform.rescaleY(y)));

        if (gTX)
          gTX.call(txAxis.scale(transform.rescaleX(x)));
        if (gRY)
          gRY.call(ryAxis.scale(transform.rescaleY(y)));          
      }
  
    
      // prevent scrolling then apply the default filter
      function filter(event) {
        event.preventDefault();
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      }    
  };

  g2d.SVGAttribute = async (args, env) => {
    const attrs = await core._getRules(args, env);
    let obj = await interpretate(args[0], env);
    
    Object.keys(attrs).forEach((a)=> {
      obj = obj.attr(a, attrs[a]);
    });

    env.local.object = obj;
    return obj;
  };

  g2d.SVGAttribute.update = async (args, env) => {
    const attrs = await core._getRules(args, env);
    //skipping evaluation of the children object
    let obj = env.local.object.maybeTransition(env.transitionType, env.transitionDuration);
    
    Object.keys(attrs).forEach((a)=> {
      obj = obj.attr(a, attrs[a]);
    });

    return obj;
  };  

  g2d.SVGAttribute.destroy = async (args, env) => {
    console.log('SVGAttribute: nothing to destroy');
  };

  g2d.SVGAttribute.virtual = true;

  g2d.LABColor =  async (args, env) => {
    let lab;
    if (args.length > 1)
      lab = [await interpretate(args[0], env), await interpretate(args[1], env), await interpretate(args[2], env)];
    else 
      lab = await interpretate(args[0], env);

    
    const color = default_1({luminance: 100*lab[0], a: 100*lab[1], b: 100*lab[2]});
    console.log(lab);
    console.log('LAB color');
    console.log(color);
    
    env.color = "rgb("+Math.floor(color.red)+","+Math.floor(color.green)+","+Math.floor(color.blue)+")";
    if (args.length > 3) env.opacity = await interpretate(args[3], env);
    
    return env.color;   
  };

  g2d.LABColor.update = () => {};
 // g2d.LABColor.destroy = () => {}

 g2d.arrowGenerator = undefined;

 let arrow1;

 g2d.Arrow = async (args, env) => {
   await interpretate.shared.d3.load();
   if (!arrow1) arrow1 = (await interpretate.shared.d3['d3-arrow']).arrow1;

   env.xAxis;
   env.yAxis;

   const uid = uuidv4();
   const arrow = arrow1()
   .id(uid)
   .attr("fill", env.color)
   .attr("stroke", "none");

   env.svg.call(arrow);

   const path = await interpretate(args[0], env);

   env.local.line = d3.line()
     .x(function(d) { return env.xAxis(d[0]) })
     .y(function(d) { return env.yAxis(d[1]) });

   const object = env.svg.append("path")
   .datum(path)
   .attr("vector-effect", "non-scaling-stroke")
   .attr("fill", "none")
   .attr('opacity', env.opacity)
   .attr("stroke", env.color)
   .attr("stroke-width", env.strokeWidth)
   .attr("d", env.local.line
   ).attr("marker-end", "url(#"+uid+")"); 

   env.local.arrow = object;
   
   return object;

 };

 g2d.Arrow.update = async (args, env) => {
   env.xAxis;
   env.yAxis;

   const path = await interpretate(args[0], env);
   //console.log(env.local);

   const object = env.local.arrow.datum(path).maybeTransitionTween(env.TransitionType, env.TransitionDuration, 'd', function (d) {
    var previous = d3.select(this).attr('d');
    var current = env.local.line(d);
    return interpolatePath(previous, current);
  });
   
   return object;
 };

 g2d.Arrow.virtual = true;

 g2d.Arrow.destroy = async () => {};  

  g2d.Arrowheads = async () => {
    console.warn('not implemented!');
  };

  //g2d.Arrowheads.destroy = async () => {};

  //g2d.Arrow.destroy = async () => {}  

  g2d.Text = async (args, env) => {
    const text = await interpretate(args[0], env);
    const coords = await interpretate(args[1], env);


    env.local.text = text;

    let globalOffset = {x: 0, y: 0};
    if (env.offset) {
      globalOffset = env.offset;
    }

    const object = env.svg.append('text')
      .attr("font-family", env.fontfamily)
      .attr("font-size", env.fontsize)
      .attr("fill", env.color);

    if (args.length > 2) {
      const offset = await interpretate(args[2], env);

      object
      .attr("x", env.xAxis(coords[0] + offset[0]) + globalOffset.x)
      .attr("y", env.yAxis(coords[1] + offset[1]) + globalOffset.y);

    } else {

      object
      .attr("x", env.xAxis(coords[0]) + globalOffset.x)
      .attr("y", env.yAxis(coords[1]) + globalOffset.y);

    }

    g2d.Text.PutText(object, text, env);

    env.local.object = object;

    return object;
  };

  g2d.Text.PutText = (object, text, env) => {
    //parse the text
    if (!text) return;
    const tokens = [g2d.Text.TokensSplit(text.replaceAll(/\\([a-zA-z]+)/g, g2d.Text.GreekReplacer), g2d.Text.TextOperators)].flat(Infinity);
    console.log(tokens);

    object.html(tokens.shift());

    let token;
    let dy = 0;
    while((token = tokens.shift()) != undefined) {
      if (typeof token === 'string') {
        object.append('tspan').html(token).attr('font-size', env.fontsize).attr('dy', -dy);
        dy = 0;
      } else {
        dy = -env.fontsize*token.ky;
        object.append('tspan').html(token.data).attr('font-size', Math.round(env.fontsize*token.kf)).attr('dy', dy);
      }
    }
  };

  g2d.Text.TextOperators = [
    {
      type: 'sup',
      handler: (a) => a,
      regexp: /\^(\d{1,3})/,
      meta: {
        ky: 0.5,
        kf: 0.5
      }
    },
    {
      type: 'sup',
      handler: (a) => a,
      regexp: /\^{([^{|}]*)}/,
      meta: {
        ky: 0.5,
        kf: 0.5
      }      
    },
    {
      type: 'sub',
      handler: (a) => a,
      regexp: /\_(\d{1,3})/,
      meta: {
        ky: -0.5,
        kf: 0.5
      }      
    },
    {
      type: 'sub',
      handler: (a) => a,
      regexp: /\_{([^{|}]*)}/,
      meta: {
        ky: -0.5,
        kf: 0.5
      }
    }  
  ];
  
  g2d.Text.GreekReplacer = (a, b, c) => {
    return "&" +
        b
          .toLowerCase()
          .replace("sqrt", "radic")
          .replace("degree", "deg") +
        ";";
  };
  
  g2d.Text.TokensSplit = (str, ops, index = 0) => {
    if (index === ops.length || index < 0) return str;
    const match = str.match(ops[index].regexp);
    if (match === null) return g2d.Text.TokensSplit(str, ops, index + 1);
    const obj = {type: ops[index].type, data: ops[index].handler(match[1]), ...ops[index].meta};
    return [g2d.Text.TokensSplit(str.slice(0, match.index), ops, index + 1), obj, g2d.Text.TokensSplit(str.slice(match.index+match[0].length), ops, 0)]
  };  

  g2d.Text.virtual = true;

  g2d.Text.update = async (args, env) => {
    const text = await interpretate(args[0], env);
    const coords = await interpretate(args[1], env);

    let trans;

    if (env.local.text != text) {
      trans = env.local.object
      .maybeTransition(env.transitionType, env.transitionDuration)
      .text(text)
      .attr("x", env.xAxis(coords[0]))
      .attr("y", env.yAxis(coords[1]))
      .attr("fill", env.color);
    } else {
      trans = env.local.object
      .maybeTransition(env.transitionType, env.transitionDuration)
      .attr("x", env.xAxis(coords[0]))
      .attr("y", env.yAxis(coords[1]))
      .attr("fill", env.color);
    }



    return trans;
  };   


  g2d.Text.destroy = () => {
    console.log('Nothing to destory');
  };


  //g2d.Text.destroy = async (args, env) => {
    //for (const o of args) {
      //await interpretate(o, env);
    //}
  //}

  //transformation context to convert fractions and etc to SVG form
  g2d.Text.subcontext = {};
  //TODO

  g2d.FontSize = () => "FontSize";
  //g2d.FontSize.destroy = g2d.FontSize
  g2d.FontSize.update = g2d.FontSize;
  g2d.FontFamily = () => "FontFamily";
  //g2d.FontFamily.destroy = g2d.FontFamily
  g2d.FontFamily.update = g2d.FontFamily;
  
  g2d.Style = async (args, env) => {
    const options = await core._getRules(args, env);
    
    if (options.FontSize) {
      env.fontsize = options.FontSize;
    }  

    if (options.FontColor) {
      env.color = options.FontColor;
    }
  
    if (options.FontFamily) {
      env.fontfamily = options.FontFamily;
    } 
  
    return await interpretate(args[0], env);
  };

  //g2d.Style.destroy = async (args, env) => {
    //const options = await core._getRules(args, env);  
   // return await interpretate(args[0], env);
  //}  
  
  g2d.Style.update = async (args, env) => {
    const options = await core._getRules(args, env);
    
    if (options.FontSize) {
      env.fontsize = options.FontSize;
    }  
  
    if (options.FontFamily) {
      env.fontfamily = options.FontFamily;
    } 
  
    return await interpretate(args[0], env);
  };  

  g2d.AnimationFrameListener = async (args, env) => {
    await interpretate(args[0], env);
    const options = await core._getRules(args, {...env, hold:true});
    env.local.event = await interpretate(options.Event, env);
    env.local.fire = () => {
      server.kernel.emitt(env.local.event, 'True', 'Frame');
    };

    window.requestAnimationFrame(env.local.fire);
  };

  g2d.AnimationFrameListener.update = async (args, env) => {
    window.requestAnimationFrame(env.local.fire);
  };

  g2d.AnimationFrameListener.destroy = async (args, env) => {
    console.warn('AnimationFrameListener does not exist anymore');
  };

  g2d.AnimationFrameListener.virtual = true;

  g2d.GraphicsComplex = async (args, env) => {
    const vertices = await interpretate(args[0], env);
    const opts = await core._getRules(args, env);
    const copy = {...env, vertices: vertices};
    if (opts.VertexColors) {
      copy.vertexColors = opts.VertexColors;
    }

    return await interpretate(args[1], copy);
  };

  //g2d.GraphicsComplex.destroy = async (args, env) => {
    //await interpretate(args[0], env);
    //await interpretate(args[1], env);
  //}

  g2d.GraphicsGroup = async (args, env) => {
    return await interpretate(args[0], env);
  };

  g2d.GraphicsGroup.update = async (args, env) => {
    return await interpretate(args[0], env);
  };  

  //g2d.GraphicsGroup.destroy = async (args, env) => {
    //await interpretate(args[0], env);
  //}  

  g2d.AbsoluteThickness = (args, env) => {
    env.strokeWidth = interpretate(args[0], env);
  };

  g2d.PointSize = (args, env) => {
    env.pointSize = interpretate(args[0], env);
  };

  g2d.Annotation = core.List;

  g2d.Directive = async (args, env) => {
    const opts = await core._getRules(args, env);
    for (const o of Object.keys(opts)) {
      env[o.toLowerCase()] = opts[o];
    }

    //rebuild transition structure
    assignTransition(env);

    for (let i=0; i<(args.length - Object.keys(opts).length); ++i) {
      await interpretate(args[i], env);
    }
  };

  //g2d.Directive.destroy = g2d.Directive

  g2d.EdgeForm = async (args, env) => {
    const copy = {...env};
    await interpretate(args[0], copy);

    env.strokeWidth = copy.strokeWidth;
    
    env.strokeOpacity = copy.opacity;
    //hack. sorry
    if (copy.color !== 'rgb(68, 68, 68)')
      env.stroke = copy.color;
  };

  g2d.EdgeForm.update = async (args, env) => {

  };

  //g2d.EdgeForm.destroy = async (args, env) => {

  //}

  g2d.Opacity = async (args, env) => {
    env.opacity = await interpretate(args[0], env);
  };

  g2d.GrayLevel = async (args, env) => {
    let level = await interpretate(args[0], env);
    if (level.length) {
      level = level[0];
    }

    level = Math.floor(level * 255);

    env.color = `rgb(${level},${level},${level})`;
    return env.color;
  };

  g2d.RGBColor = async (args, env) => {
    if (args.length == 3) {
      env.color = "rgb(";
      env.color += String(Math.floor(255 * (await interpretate(args[0], env)))) + ",";
      env.color += String(Math.floor(255 * (await interpretate(args[1], env)))) + ",";
      env.color += String(Math.floor(255 * (await interpretate(args[2], env)))) + ")";

    } else {
      const a = await interpretate(args[0], env);
      env.color = "rgb(";
      env.color += String(Math.floor(255 * a[0])) + ",";
      env.color += String(Math.floor(255 * a[1])) + ",";
      env.color += String(Math.floor(255 * a[2])) + ")";      
    }

    return env.color;
  };

  //g2d.RGBColor.destroy = (args, env) => {}
  //g2d.Opacity.destroy = (args, env) => {}
  //g2d.GrayLevel.destroy = (args, env) => {}
  
  //g2d.PointSize.destroy = (args, env) => {}
  //g2d.AbsoluteThickness.destroy = (args, env) => {}

  g2d.Hue = (args, env) => {
    if (args.length == 3) {
      const color = args.map(el => 100*interpretate(el, env));
      env.color = "hsl("+(3.59*color[0])+","+Math.round(color[1])+"%,"+Math.round(color[2])+"%)";
    } else {
      console.error('g2d: Hue must have three arguments!');
    }
  }; 
  
  //g2d.Hue.destroy = (args, env) => {}

  g2d.CubicInOut = () => 'CubicInOut';
  g2d.Linear = () => 'Linear';

  g2d.Tooltip = () => {
    console.log('Tooltip is not implemented.');
  };

  //g2d.Tooltip.destroy = g2d.Tooltip

  g2d.Polygon = async (args, env) => {
    let points = await interpretate(args[0], env);

    if (env.vertices) {
      env.local.line = d3.line()
      .x(function(d) { return env.xAxis(d[0]) })
      .y(function(d) { return env.yAxis(d[1]) });

      const array = [];

      let color = env.color;

      //if this is a single polygon
      if (!points[0][0]) {
        points = [points];
      }

      points.forEach((path) => {
        if (env.vertexColors) {
          //stupid flat shading
          color = [0,0,0];
          path.map((vert) => {
            if(typeof env.vertexColors[vert-1] === 'string') {
              //console.log(env.vertexColors[vert-1]);
              const u = d3.color(env.vertexColors[vert-1]);
              //console.log(u);
              color[0] = color[0] + u.r/255.0;
              color[1] = color[1] + u.g/255.0;
              color[2] = color[2] + u.b/255.0;
            } else {
              color[0] = color[0] + env.vertexColors[vert-1][0];
              color[1] = color[1] + env.vertexColors[vert-1][1];
              color[2] = color[2] + env.vertexColors[vert-1][2];
            }
          });

          color[0] = 255.0 * color[0] / path.length;
          color[1] = 255.0 * color[1] / path.length;
          color[2] = 255.0 * color[2] / path.length;

          color = "rgb("+color[0]+","+color[1]+","+color[2]+")";
        }

        array.push(env.svg.append("path")
          .datum(path.map((vert) => env.vertices[vert-1]))
          .attr("fill", color)
          .attr('fill-opacity', env.opacity)
          .attr('stroke-opacity', env.strokeOpacity || env.opacity)
          .attr("vector-effect", "non-scaling-stroke")
          .attr("stroke-width", env.strokeWidth)
          .attr("stroke", env.stroke || color)
          .attr("d", env.local.line));

      });

      env.local.area = array;
      return env.local.area;
    }
  
    env.local.line = d3.line()
          .x(function(d) { return env.xAxis(d[0]) })
          .y(function(d) { return env.yAxis(d[1]) });

    if (Array.isArray(points[0][0])) {
      console.log('most likely there are many polygons');
      const object = env.svg.append('g')
      .attr("fill", env.color)
      .attr('fill-opacity', env.opacity)
      .attr('stroke-opacity', env.strokeOpacity || env.opacity)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", env.strokeWidth)
      .attr("stroke", env.stroke || env.color);

      points.forEach((e) => {
        e.push(e[0]);
        object.append("path")
          .datum(e)
          .attr("d", env.local.line);
      });

      env.local.polygons = object;
      return object;

    }
    
    points.push(points[0]);
    

  
    env.local.area = env.svg.append("path")
      .datum(points)
      .attr("fill", env.color)
      .attr('fill-opacity', env.opacity)
      .attr('stroke-opacity', env.strokeOpacity || env.opacity)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", env.strokeWidth)
      .attr("stroke", env.stroke || env.color)
      .attr("d", env.local.line);
    
    
    return env.local.area;
  };
  
  g2d.Polygon.update = async (args, env) => {
    let points = await interpretate(args[0], env);

    if (env.vertices) {
      throw 'update method of vertices is not supported'
    }    

    if (env.local.polygons) {
      throw 'update method for many polygons in not supported'
    }    
  
    env.xAxis;
    env.yAxis;
  
    const object = env.local.area
          .datum(points)
          .maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); 
    
    return object;  
  };
  
  g2d.Polygon.destroy = (args, env) => {
    console.log('area destroyed');
    delete env.local.area;
  };
  
  g2d.Polygon.virtual = true; //for local memeory and dynamic binding

  g2d.IdentityFunction = async (args, env) => {
    return (await interpretate(args[0], env));
  };

  g2d.Tooltip = g2d.IdentityFunction;

  g2d.StatusArea = g2d.IdentityFunction;

  g2d["Charting`DelayedMouseEffect"] = g2d.IdentityFunction;

  g2d.Line = async (args, env) => {
    console.log('drawing a line');
    
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    if (env.vertices) {
      //vertex mode
      if (!data[0][0]) {

        const object = env.svg.append("path")
        .datum(data.map((index) => env.vertices[index-1]))
        .attr("fill", "none")
        .attr("vector-effect", "non-scaling-stroke")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          ); 

        return object;
      } else {
        const gr = env.svg.append("g");
        gr.attr("fill", "none")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth);

        data.forEach((dt) => {
          gr.append("path")
          .datum(dt.map((index) => env.vertices[index-1]))
          .attr("vector-effect", "non-scaling-stroke")
          .attr("d", d3.line()
            .x(function(d) { return x(d[0]) })
            .y(function(d) { return y(d[1]) })
            ); 
        });

        return gr;
      }
    }
    

    const uid = uuidv4();
    env.local.uid = uid;

    env.local.uid = uid;

    let object;

    //TODO: Get rid of CLASSES!!!!
    switch(arrDepth(data)) {
      case 0:
        //empty
        object = env.svg.append("path")
        .datum([])
        .attr("class", 'line-'+uid)
        .attr("fill", "none")
        .attr("vector-effect", "non-scaling-stroke")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          );    

      break;        
      case 2:
       
        object = env.svg.append("path")
        .datum(data)
        .attr("class", 'line-'+uid)
        .attr("vector-effect", "non-scaling-stroke")
        .attr("fill", "none")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          );    
      break;
    
      case 3:
        console.log(data);

        data.forEach((d, i)=>{
         
          object = env.svg.append("path")
          .datum(d).join("path")
          .attr("class", 'line-'+uid+'-'+i)
          .attr("vector-effect", "non-scaling-stroke")
          .attr("fill", "none")
          .attr("stroke", env.color)
          .attr("stroke-width", env.strokeWidth)
          .attr("d", d3.line()
            .x(function(d) { return x(d[0]) })
            .y(function(d) { return y(d[1]) })
            );
        });    
      break;
    } 

    env.local.nsets = data.length;

    env.local.line = d3.line()
        .x(function(d) { return env.xAxis(d[0]) })
        .y(function(d) { return env.yAxis(d[1]) });

    return object;
  };

  //g2d.Line.destroy = (args, env) => {
    //console.warn('Line was destroyed');
  //}




  g2d.Line.update = async (args, env) => {

    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    let obj;

    if (env.vertices) {
      throw 'Update mode for vertices in Line is not supported for now!';
    }


    switch(arrDepth(data)) {
      case 0:
        //empty
        obj = env.svg.selectAll('.line-'+env.local.uid)
        .datum([])
        .attr("class",'line-'+env.local.uid)
        .maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
          var previous = d3.select(this).attr('d');
          var current = env.local.line(d);
          return interpolatePath(previous, current);
        }); 

      break;
      case 2:
        Math.min(data.length, env.local.nsets);
        //animate equal

        //animate the rest
        obj = env.svg.selectAll('.line-'+env.local.uid)
        .datum(data)
        .attr("class",'line-'+env.local.uid).maybeTransition(env.transitionType, env.transitionDuration);

          /*.attrTween('d', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); */

      break;
    
      case 3:
        for (let i=0; i < Math.min(data.length, env.local.nsets); ++i) {
          console.log('upd 1');
          obj = env.svg.selectAll('.line-'+env.local.uid+'-'+i)
          .datum(data[i])
          .attr("class",'line-'+env.local.uid+'-'+i)
          .maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); 
        }
        if (data.length > env.local.nsets) {
          console.log('upd 2');
          console.log('new lines');
          for (let i=env.local.nsets; i < data.length; ++i) {
            obj = env.svg.append("path")
            .datum(data[i])
            .attr("class", 'line-'+env.local.uid+'-'+i)
            .attr("fill", "none")
            .attr("stroke", env.color)
            .attr("stroke-width", env.strokeWidth)
            .maybeTransition(env.transitionType, env.transitionDuration)          
            .attr("d", d3.line()
              .x(function(d) { return x(d[0]) })
              .y(function(d) { return y(d[1]) })
              );          
          }
        }

        if (data.length < env.local.nsets) {
          console.log('upd 3');
          for (let i=data.length; i < env.local.nsets; ++i) {
            obj = env.svg.selectAll('.line-'+env.local.uid+'-'+i).datum(data[0])
            .join("path")
            .attr("class",'line-'+env.local.uid+'-'+i)
            .maybeTransition(env.transitionType, env.transitionDuration)
            .attr("d", env.local.line);            
          }
        }

        
      break;
    }    

    env.local.nsets = Math.max(data.length, env.local.nsets);

    return obj;

  };

  g2d.Line.virtual = true;

  g2d.Line.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  };

  g2d.Circle = async (args, env) => {
    let data = await interpretate(args[0], env);
    let radius = 1; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (Array.isArray(radius)) radius = (radius[0] + radius[1])/2.0;
    }

    const x = env.xAxis;
    const y = env.yAxis;

    const object = env.svg
    .append("circle")
    .attr("vector-effect", "non-scaling-stroke")
      .attr("cx", x(data[0]) )
      .attr("cy", y(data[1]) )
      .attr("r", x(radius) - x(0))
      .style("stroke", env.color)
      .style("fill", 'none')
      .style("opacity", env.opacity);

    return object;
  };

  //g2d.Circle.destroy = () => {}

  g2d._arc = async (args, env) => {
    let data = await interpretate(args[0], env);
    let radius = await interpretate(args[1], env);
      if (Array.isArray(radius)) radius = (radius[0] + radius[1])/2.0;
    
    let angles = await interpretate(args[2], env);

    const x = env.xAxis;
    const y = env.yAxis;

    env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = x(radius) - x(0);

    const arc = d3.arc() 
      .outerRadius(0) 
      .innerRadius(env.local.r) 
      .startAngle(angles[0]).endAngle(angles[1]); 
    
    env.local.arc = arc;

    console.log({x: x(data[0]), xorg: data[0], r: env.local.r, rorg: radius});

    const object = env.svg.append("path") 
      .attr("vector-effect", "non-scaling-stroke")
      .attr("transform", `translate(${x(data[0])},${y(data[1])})`)
      .style("stroke", 'none')
      .style("fill", env.color)
      .style("opacity", env.opacity) 
      .attr("d", arc);  
      
    return object;
  };


  g2d.Disk = async (args, env) => {
    if (args.length > 2) {
      return await g2d._arc(args, env);
    }

    let data = await interpretate(args[0], env);
    let radius = 1; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (Array.isArray(radius)) radius = (radius[0] + radius[1])/2.0;
    }

    //console.warn(args);

    const x = env.xAxis;
    const y = env.yAxis;

    env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = x(radius) - x(0);

    const object = env.svg
    .append("circle")
    .attr("vector-effect", "non-scaling-stroke")
      .attr("cx",  x(data[0]))
      .attr("cy", y(data[1]) )
      .attr("r", env.local.r)
      .style("stroke", 'none')
      .style("fill", env.color)
      .style("opacity", env.opacity);

    env.local.object = object;

    return object;
  };

  g2d.Disk.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    let radius = 1; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (Array.isArray(radius)) radius = (radius[0] + radius[1])/2.0;
    }

    const x = env.xAxis;
    const y = env.yAxis;     

    env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = x(radius) - x(0);

    //console.warn(args);

 
    
    env.local.object.maybeTransition(env.transitionType, env.transitionDuration)
    .attr("cx",  env.local.coords[0])
    .attr("cy", env.local.coords[1])
    .attr("r", env.local.r);
  };

  //g2d.Disk.destroy = () => {}

  g2d.Disk.virtual = true;

  g2d.Disk.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  };

  g2d.Point = async (args, env) => {
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    if (env.vertices) {
      if (data[0][0]) data = data.flat();
      data = data.map((e) => env.vertices[e-1]);
    } else {
      const dp = arrDepth(data);
      if (dp === 0) {
          data = [];
      } else {
        if (dp < 2) {
          data = [data];
        }
      }
    }



    const uid = uuidv4();
    env.local.uid = uid;

    /*const object = env.svg.append('g')
    .selectAll()
    .data(data)
    .enter()
    .append("circle")
    .attr("vector-effect", "non-scaling-stroke")
    .attr('class', "dot-"+uid)
      .attr("cx", function (d) { return x(d[0]); } )
      .attr("cy", function (d) { return y(d[1]); } )
      .attr("r", env.pointSize*100)
      .style("fill", env.color)
      .style("opacity", env.opacity);*/

    const object = env.svg.append('g')
    .style("stroke-width", env.pointSize*100*2)
    .style("stroke-linecap", "round")
    .style("stroke", env.color)
    .style("opacity", env.opacity);

    const points = [];

    //a hack to make non-scalable 
    //https://muffinman.io/blog/svg-non-scaling-circle-and-rectangle/
    let color;

    data.forEach((d, vert) => {

      if (env.vertexColors) {
       
        color = [0,0,0];
        if(typeof env.vertexColors[vert] === 'string') {
          //console.log(env.vertexColors[vert-1]);
          const u = d3.color(env.vertexColors[vert]);
          //console.log(u);
          color[0] = color[0] + u.r/255.0;
          color[1] = color[1] + u.g/255.0;
          color[2] = color[2] + u.b/255.0;
        } else {
          color[0] = color[0] + env.vertexColors[vert][0];
          color[1] = color[1] + env.vertexColors[vert][1];
          color[2] = color[2] + env.vertexColors[vert][2];
        }

        color[0] = 255.0 * color[0] ;
        color[1] = 255.0 * color[1] ;
        color[2] = 255.0 * color[2] ;

        color = "rgb("+color[0]+","+color[1]+","+color[2]+")";
        points.push(
          object.append("path")
         .attr('stroke', color)
         .attr("d", `M ${x(d[0])} ${y(d[1])} l 0.0001 0`) 
         .attr("vector-effect", "non-scaling-stroke")
         );

      } else {
        points.push(
         object.append("path")
        .attr("d", `M ${x(d[0])} ${y(d[1])} l 0.0001 0`) 
        .attr("vector-effect", "non-scaling-stroke")
        );
      }
    });

    env.local.points = points;
    env.local.object = object;
    
    return object;
  }; 

  g2d.Point.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    
    if (env.vertices) throw('vertices update method is not supported!');

    const dp = arrDepth(data);
    if (dp === 0) {
        data = [];
    } else {
      if (dp < 2) {
        data = [data];
      }
    }
  
    const x = env.xAxis;
    const y = env.yAxis;

    let object;
  
    const u = env.local.object;

    const minLength = Math.min(env.local.points.length, data.length);

    let prev = [0,0];

    for (let i=env.local.points.length; i<data.length; i++) {
      if (i-1 >= 0) prev = data[i-1];

      object = u.append("path")
      .attr("d", `M ${x(prev[0])} ${y(prev[1])} l 0.0001 0`) 
      .style("opacity", env.opacity/5)
      .attr("vector-effect", "non-scaling-stroke");

      env.local.points.push(object);

      object = object.maybeTransition(env.transitionType, env.transitionDuration)
      .attr("d", `M ${x(data[i][0])} ${y(data[i][1])} l 0.0001 0`) 
      .style("opacity", env.opacity);
    }
    for (let i=env.local.points.length; i>data.length; i--) {
      object = env.local.points.pop();

      object.maybeTransition(env.transitionType, env.transitionDuration)
      .style("opacity", 0)
      .remove(); 
    }
    for (let i=0; i < minLength; i++) {
      object = env.local.points[i].maybeTransition(env.transitionType, env.transitionDuration)
      .attr("d", `M ${x(data[i][0])} ${y(data[i][1])} l 0.0001 0`);
    }

    return object;
  };

  //g2d.Point.destroy = (args, env) => {interpretate(args[0], env)}

  g2d.Point.virtual = true;  

  g2d.Point.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  };

  g2d.EventListener = async (args, env) => {
    const rules = await interpretate(args[1], env);

    let object = await interpretate(args[0], env);
    if (Array.isArray(object)) object = object[0];

    rules.forEach((rule)=>{
      g2d.EventListener[rule.lhs](rule.rhs, object, env);
    });

    return null;
  };

  g2d.EventListener.update = async (args, env) => {
    console.log('EventListener does not support updates');
  };
  
  g2d.EventListener.onload = (uid, object, env) => {

    console.log('onload event generator');
    server.kernel.emitt(uid, `True`, 'onload');
  };  

  g2d.MiddlewareListener = async (args, env) => {
    const options = await core._getRules(args, env);
    const name = await interpretate(args[1], env);
    const uid = await interpretate(args[2], env);
    console.log(args);
    env.local.middleware = g2d.MiddlewareListener[name](uid, options, env);

    return (await interpretate(args[0], env));
  };

  g2d.MiddlewareListener.update = (args, env) => {
    return interpretate(args[0], env);
  };

  //g2d.MiddlewareListener.destroy = (args, env) => {
    //return interpretate(args[0], env);
  //}  

  g2d.MiddlewareListener.end = (uid, params, env) => {
    const threshold = params.Threshold || 1.0;
    
    server.kernel.emitt(uid, `True`, 'end');
    console.log("pre Fire");

    return (object) => {
      let state = false;
      

      return object.then((r) => r.tween(uid, function (d) {
        return function (t) {
          if (t >= threshold && !state) {
            server.kernel.emitt(uid, `True`, 'end');
            state = true;
          }
        }
      }))
    }
  };

  g2d.MiddlewareListener.endtransition = g2d.MiddlewareListener.end;

  //g2d.EventListener.destroy = (args, env) => {interpretate(args[0], env)}

  g2d.EventListener.drag = (uid, object, env) => {

    console.log('drag event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    let origin = [];

    function dragstarted(event, d) {
      if (origin.length === 0) origin = [event.x, event.y];
      //d3.select(this).raise().attr("stroke", "black");   
    }

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'drag');
    });
  
    function dragged(event, d) {
      d3.select(this).raise().attr("transform", d=> "translate("+[event.x - origin[0], event.y  - origin[1]]+")" );

      updatePos(xAxis.invert(event.x), yAxis.invert(event.y));
    }
  
    function dragended(event, d) {
      //d3.select(this).attr("stroke", null);
    }
  
    object.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  };

  g2d.EventListener.dragall = (uid, object, env) => {

    console.log('drag event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    function dragstarted(event, d) {
      //d3.select(this).raise().attr("stroke", "black");
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragstarted");
    }

    const updatePos = throttle((x,y,t) => {
      server.kernel.emitt(uid, `{"${t}", {${x}, ${y}}}`.replace('e', '*^').replace('e', '*^'), 'dragall');
    });
  
    function dragged(event, d) {
      //d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragged");
    }
  
    function dragended(event, d) {
      //d3.select(this).attr("stroke", null);
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragended");
    }
  
    object.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  };


  g2d.EventListener.click = (uid, object, env) => {

    console.log('click event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'click');
    });
  
    function clicked(event, d) {
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y));
    }
  
    object.call(d3.drag()
        .on("start", clicked));
  };

  g2d.EventListener.mousemove = (uid, object, env) => {

    console.log('mouse event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'mousemove');
    });
  
    function moved(arr) {
      updatePos(xAxis.invert(arr[0]), yAxis.invert(arr[1]));
    }
  
    object.on("mousemove", e => moved(d3.pointer(e)));
  };  

  g2d.EventListener.mouseover = (uid, object, env) => {

    console.log('mouse event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'mouseover');
    });
  
    function moved(arr) {
      updatePos(xAxis.invert(arr[0]), yAxis.invert(arr[1]));
    }
  
    object.on("mouseover", e => moved(d3.pointer(e)));
  };   

  g2d.EventListener.zoom = (uid, object, env) => {

    console.log('zoom event generator');
    console.log(env.local);

    const updatePos = throttle(k => {
      server.kernel.emitt(uid, `${k}`, 'zoom');
    });

    function zoom(e) {
      console.log();
      updatePos(e.transform.k);
    }
  
    object.call(d3.zoom()
        .on("zoom", zoom));
  }; 


  
  g2d.Rotate = async (args, env) => {
    const degrees = await interpretate(args[1], env);
    if (args.length > 2) {
      await interpretate(args[2], env);
    }

    const group = env.svg.append("g");
    
    env.local.group = group;

    await interpretate(args[0], {...env, svg: group});

    const centre = group.node().getBBox();

    const rotation = "rotate(" + (degrees / Math.PI * 180.0) + ", " + 
    (centre.x + centre.width / 2) + ", " + (centre.y + centre.height / 2) + ")";

    group.attr("transform", rotation);

    env.local.rotation = rotation;
  };

  g2d.Rotate.update = async (args, env) => {
    const degrees = await interpretate(args[1], env);

    const centre = env.local.group.node().getBBox();

    const rotation = "rotate(" + (degrees / Math.PI * 180.0) + ", " + 
    (centre.x + centre.width / 2) + ", " + (centre.y + centre.height / 2) + ")";

    var interpol_rotate = d3.interpolateString(env.local.rotation, rotation);

    env.local.group.maybeTransitionTween(env.transitionType, env.transitionDuration, 'transform' , function(d,i,a){ return interpol_rotate } );
  
    env.local.rotation = rotation;
  };

  g2d.Rotate.virtual = true;

  g2d.Rotate.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  };

  g2d.Translate = async (args, env) => {
    const pos = await interpretate(args[1], env);
    const group = env.svg.append("g");

   // if (arrDepth(pos) > 1) throw 'List arguments for Translate is not supported for now!';
    
    env.local.group = group;

    const xAxis = env.xAxis;
    const yAxis = env.yAxis;    

    await interpretate(args[0], {...env, svg: group});
    return group.attr("transform", `translate(${xAxis(pos[0]) - xAxis(0)}, ${yAxis(pos[1]) - yAxis(0)})`);
  };

  g2d.Translate.update = async (args, env) => {
    const pos = await interpretate(args[1], env);

    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    return env.local.group.maybeTransition(env.transitionType, env.transitionDuration).attr("transform", `translate(${xAxis(pos[0])- xAxis(0)}, ${yAxis(pos[1]) - yAxis(0)})`);
  };

  //g2d.Translate.destroy = async (args, env) => {
   // const pos = await interpretate(args[1], env);
   // const obj = await interpretate(args[0], env);
  //}  

  g2d.Translate.virtual = true;  

  g2d.Translate.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  };


  g2d.Center = () => 'Center';
  //g2d.Center.destroy = g2d.Center
  g2d.Center.update = g2d.Center;

  g2d.Degree = () => Math.PI/180.0;
  //g2d.Degree.destroy = g2d.Degree
  g2d.Degree.update = g2d.Degree;


  g2d.Rectangle = async (args, env) => {
    const from = await interpretate(args[0], env);
    const to = await interpretate(args[1], env);

    if (from[1] > to[1]) {
      const t = from[1];
      from[1] = to[1];
      to[1] = t;
    }

    if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }

    const x = env.xAxis;
    const y = env.yAxis;

    from[0] = x(from[0]);
    from[1] = y(from[1]);
    to[0] = x(to[0]);
    to[1] = y(to[1]);

    /*if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }*/


    

    const size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];



    env.local.rect = env.svg.append('rect')
    .attr('x', from[0])
    .attr('y', from[1] - size[1])
    .attr('width', size[0])
    .attr('height', size[1])
    .attr("vector-effect", "non-scaling-stroke")
    .attr('stroke', env.stroke)
    .attr('opacity', env.opacity)
    .attr('fill', env.color);

    return env.local.rect;
     
  };

  //g2d.Rectangle.destroy = async (args, env) => {
    //await interpretate(args[0], env);
    //await interpretate(args[1], env);
  //}
  
  g2d.Rectangle.update = async (args, env) => {
    const from = await interpretate(args[0], env);
    const to = await interpretate(args[1], env);
    
    if (from[1] > to[1]) {
      const t = from[1];
      from[1] = to[1];
      to[1] = t;
    }

    if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }

    const x = env.xAxis;
    const y = env.yAxis;

    from[0] = x(from[0]);
    from[1] = y(from[1]);
    to[0] = x(to[0]);
    to[1] = y(to[1]);

    /*if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }

    if (from[1] > to[1]) {
      const t = from[1];
      from[1] = to[1];
      to[1] = t;
    }*/

    

    const size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];



    env.local.rect.maybeTransition(env.transitionType, env.transitionDuration)
    .attr('x', from[0])
    .attr('y', from[1] - size[1]) 
    .attr('width', size[0])
    .attr('height', size[1]);
  };

  g2d.Rectangle.virtual = true;

  g2d.Rectangle.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  };

  //plugs
  g2d.Void = (args, env) => {};

  g2d.Identity              = g2d.Void;
  g2d.Scaled                = g2d.Void;
  g2d.GoldenRatio           = g2d.Void;
  g2d.None                  = () => false;

  g2d.AbsolutePointSize     = g2d.Void;
  g2d.CopiedValueFunction   = g2d.Void;

  g2d.Raster = async (args, env) => {
    if (env.image) return await interpretate(args[0], env);

    const data = await interpretate(args[0], {...env, context: g2d, nfast:true, numeric:true});
    console.log(args);
    const height = data.length;
    const width = data[0].length;
    const rgb = data[0][0].length;

    const x = env.xAxis;
    const y = env.yAxis;    

    let ranges = [[0, width],[0, height]];
    if (args.length > 1) {
      const optsRanges = await interpretate(args[1], env);
      ranges[0][0] = optsRanges[0][0];
      ranges[0][1] = optsRanges[1][0];
      ranges[1][0] = optsRanges[0][1];
      ranges[1][1] = optsRanges[1][1];      
    }
    if (args.length > 2) {
      await interpretate(args[2], env);
      //not implemented
      console.warn('scaling is not implemented!');
    }



    const rectWidth = Math.abs((x(ranges[0][1]) - x(ranges[0][0])) / width);
    const rectHeight = Math.abs((y(ranges[1][1]) - y(ranges[1][0])) / height);

    const stepX = (ranges[0][1] - ranges[0][0]) / width;
    const stepY = (ranges[1][1] - ranges[1][0]) / height;

    const group = env.svg;

    if (!rgb) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', env.opacity)
          .attr('fill', `rgb(${255*data[i][j]}, ${255*data[i][j]}, ${255*data[i][j]})`);
          
        }
      }  
      return;
    }

    if (rgb === 2) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', data[i][j][1])
          .attr('fill', `rgb(${255*data[i][j][0]}, ${255*data[i][j][0]}, ${255*data[i][j][0]})`);
          
        }
      }  
      return;
    }    

    if (rgb === 3) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', env.opacity)
          .attr('fill', `rgb(${255*data[i][j][0]}, ${255*data[i][j][1]}, ${255*data[i][j][2]})`);
          
        }
      } 
      return;
    }

    if (rgb === 4) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', data[i][j][3])
          .attr('fill', `rgb(${255*data[i][j][0]}, ${255*data[i][j][1]}, ${255*data[i][j][2]})`);
          
        }
      } 
      return;
    }    
  };

  //g2d.Raster.destroy = () => {}

  g2d.Image = async (args, env) => {
    const data = await interpretate(args[0], {...env, context: g2d, nfast:true, numeric:true, image:true});
    const height = data.length;
    const width = data[0].length;
    const rgb = data[0][0].length;
    let ctx;


    if (env.inset) {
      const foreignObject = env.inset.append('foreignObject')
      .attr('width', width)
      .attr('height', height);
    
      const canvas = foreignObject.append('xhtml:canvas')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml');

      ctx = canvas.node().getContext('2d');
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;      
      env.element.appendChild(canvas);
      ctx  = canvas.getContext("2d");
    }
    
    
    // Get a pointer to the current location in the image.

    env.local.ctx = ctx;
    env.local.length = width*height*4;
    env.local.width = width;
    env.local.height = height;
    env.local.rgb = rgb;

    // Wrap your array as a Uint8ClampedArray
    const rgba = new Uint8ClampedArray(width*height*4);
  
    //OH shitty slow Javascript, why...you do not have faster methods
    //TODO: rewrite using webGL!!!
    let index = 0;

    if (!rgb) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j]*255;
          rgba[index+1] = data[i][j]*255;
          rgba[index+2] = data[i][j]*255;
          rgba[index+3] = 255;

          index+=4;
        }
      }  

      ctx.putImageData(new ImageData(rgba, width, height),0,0);
      return;
    }

    if (rgb === 3) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = 255;

          index+=4;
        }
      }
    }

    if (rgb === 4) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = data[i][j][3];

          index+=4;
        }
      }
    }    


    // Repost the data.
    ctx.putImageData(new ImageData(rgba, width, height),0,0);
};

g2d.Image.update = async (args, env) => {
    const data = await interpretate(args[0], {...env, nfast:true, numeric:true, image:true});
    const height = data.length;
    const width = data[0].length;
    const rgb = data[0][0].length;

    const ctx = env.local.ctx;

    // Wrap your array as a Uint8ClampedArray
    const rgba = new Uint8ClampedArray(width*height*4);
  
    //OH shitty slow Javascript, why...you do not have faster methods
    //TODO: rewrite using webGL!!!
    let index = 0;

    if (!rgb) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j]*255;
          rgba[index+1] = data[i][j]*255;
          rgba[index+2] = data[i][j]*255;
          rgba[index+3] = 255;

          index+=4;
        }
      }  

      ctx.putImageData(new ImageData(rgba, width, height),0,0);
      return;
    }

  
    if (rgb === 3) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = 255;

          index+=4;
        }
      }
    }

    if (rgb === 4) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = data[i][j][3];

          index+=4;
        }
      }
    }  


    // Repost the data.
    ctx.putImageData(new ImageData(rgba, width, height),0,0);
};

//g2d.Image.destroy = (args, env) => interpretate(args[0], env)

core.NumericArray = (args, env) => interpretate(args[0], env);
core.NumericArray.update = core.NumericArray;
//core.NumericArray.destroy = core.NumericArray

g2d.GraphicsGroupBox = g2d.GraphicsGroup;
g2d.GraphicsComplexBox = g2d.GraphicsComplex;
g2d.DiskBox = g2d.Disk;
g2d.LineBox = g2d.Line;
