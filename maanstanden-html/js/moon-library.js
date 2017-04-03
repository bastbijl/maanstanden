require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module base
 */
/**
 * Base: Functions and other definitions useful with multiple packages.
 *
 * Base contains various definitions and support functions useful in multiple
 * chapters.
 *
 * Bessellian and Julian Year
 *
 * Chapter 21, Precession actually contains these definitions.  They are moved
 * here because of their general utility.
 *
 * Chapter 22, Nutation contains the function for Julian centuries since J2000.
 *
 * Phase angle functions
 *
 * Two functions, Illuminated and Limb, concern the illumnated phase of a body
 * and are given in two chapters, 41 an 48.  They are collected here because
 * the identical functions apply in both chapters.
 *
 * General purpose math functions
 *
 * SmallAngle is recommended in chapter 17, p. 109.
 *
 * PMod addresses the issue on p. 7, chapter 1, in the section "Trigonometric
 * functions of large angles", but the function is not written to be specific
 * to angles and so has more general utility.
 *
 * Horner is described on p. 10, chapter 1.
 *
 * FloorDiv and FloorDiv64 are optimizations for the INT function described
 * on p. 60, chapter 7.
*/

const M = exports

// ---- constants ----

/** K is the Gaussian gravitational constant. */
M.K = 0.01720209895
// K from ch 33, p. 228, for example

/** AU is one astronomical unit in km. */
M.AU = 149597870
// from Appendix I, p, 407.

/** SOblJ2000 sine obliquity at J2000. */
M.SOblJ2000 = 0.397777156
/** COblJ2000 cosine obliquity at J2000. */
M.COblJ2000 = 0.917482062
// SOblJ2000, COblJ2000 from ch 33, p. 228, for example

/**
 * lightTime returns time for light to travel a given distance.
 * `dist` is distance in to earth in AU. √(x² + y² + z²)
 * Result in seconds of time.
 * @param {Number} dist - distance in to earth in AU
 * @returns {Number} time for light to travel a given distance in seconds
 */
M.lightTime = function (dist) {
  // Formula given as (33.3) p. 224.
  return 0.0057755183 * dist
}

// ---- julian ----

/**
 * Julian and Besselian years described in chapter 21, Precession.
 * T, Julian centuries since J2000 described in chapter 22, Nutation.
 */

/** JMod is the Julian date of the modified Julian date epoch. */
M.JMod = 2400000.5

/** J2000 is the Julian date corresponding to January 1.5, year 2000. */
M.J2000 = 2451545.0

// Julian days of common epochs.
// B1900, B1950 from p. 133
/** Julian days of Julian epoch 1900 */
M.J1900 = 2415020.0
/** Julian days of Besselian epoch 1900 */
M.B1900 = 2415020.3135
/** Julian days of Besselian epoch 1950 */
M.B1950 = 2433282.4235

// JulianYear and other common periods
/** JulianYear in days */
M.JulianYear = 365.25 // days
/** JulianCentury in days */
M.JulianCentury = 36525 // days
/** BesselianYear in days; equals mean tropical year */
M.BesselianYear = 365.2421988 // days
/** Mean sidereal year */
M.meanSiderealYear = 365.25636 // days

/**
 * JulianYearToJDE returns the Julian ephemeris day for a Julian year.
 * @param {Number} jy - Julian year
 * @returns {Number} jde - Julian ephemeris day
 */
M.JulianYearToJDE = function (jy) {
  return M.J2000 + M.JulianYear * (jy - 2000)
}

/**
 * JDEToJulianYear returns a Julian year for a Julian ephemeris day.
 * @param {Number} jde - Julian ephemeris day
 * @returns {Number} jy - Julian year
 */
M.JDEToJulianYear = function (jde) {
  return 2000 + (jde - M.J2000) / M.JulianYear
}

/**
 * BesselianYearToJDE returns the Julian ephemeris day for a Besselian year.
 * @param {Number} by - Besselian year
 * @returns {Number} jde - Julian ephemeris day
 */
M.BesselianYearToJDE = function (by) {
  return M.B1900 + M.BesselianYear * (by - 1900)
}

/**
 * JDEToBesselianYear returns the Besselian year for a Julian ephemeris day.
 * @param {Number} jde - Julian ephemeris day
 * @returns {Number} by - Besselian year
 */
M.JDEToBesselianYear = function (jde) {
  return 1900 + (jde - M.B1900) / M.BesselianYear
}

/**
 * J2000Century returns the number of Julian centuries since J2000.
 *
 * The quantity appears as T in a number of time series.
 * @param {Number} jde - Julian ephemeris day
 * @returns {Number} number of Julian centuries since J2000
 */
M.J2000Century = function (jde) {
  // The formula is given in a number of places in the book, for example
  // (12.1) p. 87.
  // (22.1) p. 143.
  // (25.1) p. 163.
  return (jde - M.J2000) / M.JulianCentury
}

// ---- phase ----

/**
 * illuminated returns the illuminated fraction of a body's disk.
 *
 * The illuminated body can be the Moon or a planet.
 *
 * @param {Number} i - phase angle in radians.
 * @returns {Number} illuminated fraction of a body's disk.
 */
M.illuminated = function (i) {
  // (41.1) p. 283, also (48.1) p. 345.
  return (1 + Math.cos(i)) * 0.5
}

/**
 * celestial coordinates in right ascension and declination
 * or ecliptic coordinates in longitude and latitude
 *
 * @param {number} ra - right ascension (or longitude)
 * @param {number} dec - declination (or latitude)
 * @param {number} [range] - distance
 * @param {number} [elongation] - elongation
 */
function Coord (ra /* lon */, dec /* lat */, range, elongation) {
  this._ra = ra || 0
  this._dec = dec || 0
  this.range = range
  this.elongation = elongation

  Object.defineProperties(this, {
    ra: {
      get: function () { return this._ra },
      set: function (ra) { this._ra = ra }
    },
    dec: {
      get: function () { return this._dec },
      set: function (dec) { this._dec = dec }
    },
    lon: {
      get: function () { return this._ra },
      set: function (ra) { this._ra = ra }
    },
    lat: {
      get: function () { return this._dec },
      set: function (dec) { this._dec = dec }
    }
  })
}
M.Coord = Coord

/**
 * Limb returns the position angle of the midpoint of an illuminated limb.
 *
 * The illuminated body can be the Moon or a planet.
 *
 * @param {base.Coord} equ - equatorial coordinates of the body `{ra, dec}` (in radians)
 * @param {base.Coord} appSun - apparent coordinates of the Sun `{ra, dec}` (In radians).
 * @returns {Number} position angle of the midpoint (in radians).
 */
M.limb = function (equ, appSun) {
  let α = equ.ra
  let δ = equ.dec
  let α0 = appSun.ra
  let δ0 = appSun.dec
  // Mentioned in ch 41, p. 283.  Formula (48.5) p. 346
  let sδ = Math.sin(δ)
  let cδ = Math.cos(δ)
  let sδ0 = Math.sin(δ0)
  let cδ0 = Math.cos(δ0)
  let sα0α = Math.sin(α0 - α)
  let cα0α = Math.cos(α0 - α)
  let χ = Math.atan2(cδ0 * sα0α, (sδ0 * cδ - cδ0 * sδ * cα0α))
  if (χ < 0) {
    χ += 2 * Math.PI
  }
  return χ
}

// ---- math ----

// In chapter 17, p. 109, Meeus recommends 10′.
/**
 * SmallAngle is threshold used by various routines for switching between
 * trigonometric functions and Pythagorean approximations.
 */
M.SmallAngle = 10 * Math.PI / 180 / 60 // about .003 radians
/** cosine of SmallAngle */
M.CosSmallAngle = Math.cos(M.SmallAngle) // about .999996

/**
 * pmod returns a positive floating-point x mod y.
 *
 * For a positive argument y, it returns a value in the range [0,y).
 *
 * @param {Number} x
 * @param {Number} y
 * @returns {Number} x % y - The result may not be useful if y is negative.
 */
M.pmod = function (x, y) {
  var r = x % y
  if (r < 0) {
    r += y
  }
  return r
}

/**
 * horner evaluates a polynomal with coefficients c at x.  The constant
 * term is c[0].
 * @param {Number} x
 * @param {Number|Number[]} c - coefficients
 * @returns {Number}
 */
M.horner = function (x, ...c) {
  if (Array.isArray(c[0])) {
    c = c[0]
  }
  var i = c.length - 1
  var y = c[i]
  while (i > 0) {
    i--
    y = y * x + c[i]
  }
  return y
}

/**
 * FloorDiv returns the integer floor of the fractional value (x / y).
 * @param {Number} x
 * @param {Number} y
 * @returns {Number} (int)
 */
M.floorDiv = function (x, y) {
  var q = x / y
  return Math.floor(q)
}

/**
 * Cmp compares two float64s and returns -1, 0, or 1 if a is <, ==, or > b,
 * respectively.
 * .
 * @param {Number} a
 * @param {Number} b
 * @returns {Number} comparison result
 */
M.cmp = function (a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * shorthand function for Math.sin, Math.cos
 * @param {Number} ε
 * @returns {Number[]} [sin(ε), cos(ε)]
 */
M.sincos = function (ε) {
  return [Math.sin(ε), Math.cos(ε)]
}

/**
 * Convert degrees to radians
 * @param  {Number} deg - Angle in degrees
 * @return {Number} Angle in radians
 */
M.toRad = function (deg) {
  return (Math.PI / 180.0) * deg
}

/**
 * Convert radians to degrees
 * @param  {Number} rad - Angle in radians
 * @return {Number} Angle in degrees
 */
M.toDeg = function (rad) {
  return (180.0 / Math.PI) * rad
}

/**
 * separate fix `i` from fraction `f`
 * @param {Number} float
 * @returns {Array} [i, f]
 *  {Number} i - (int) fix value
 *  {Number} f - (float) fractional portion; always > 1
 */
M.modf = function (float) {
  var i = Math.trunc(float)
  var f = Math.abs(float - i)
  return [i, f]
}

/**
 * Rounds `float` value by precision
 * @param {Number} float - value to round
 * @param {Number} precision - (int) number of post decimal positions
 * @return {Number} rounded `float`
 */
M.round = function (float, precision) {
  precision = precision == undefined ? 14 : precision // eslint-disable-line eqeqeq
  return parseFloat(float.toFixed(precision), 10)
}

M.errorCode = function (msg, code) {
  let err = new Error(msg)
  err.code = code
  return err
}

},{}],2:[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module coord
 */
/**
 * Coord: Chapter 13, Transformation of Coordinates.
 *
 * Transforms in this package are provided in two forms, function and method.
 * The results of the two forms should be identical.
 *
 * The function forms pass all arguments and results as single values.  These
 * forms are best used when you are transforming a single pair of coordinates
 * and wish to avoid memory allocation.
 *
 * The method forms take and return pointers to structs.  These forms are best
 * used when you are transforming multiple coordinates and can reuse one or
 * more of the structs.  In this case reuse of structs will minimize
 * allocations, and the struct pointers will pass more efficiently on the
 * stack.  These methods transform their arguments, placing the result in
 * the receiver.  The receiver is then returned for convenience.
 *
 * A number of the functions take sine and cosine of the obliquity of the
 * ecliptic.  This becomes an advantage when you doing multiple transformations
 * with the same obliquity.  The efficiency of computing sine and cosine once
 * and reuse these values far outweighs the overhead of passing one number as
 * opposed to two.
 */

const base = require('./base')
const sexa = require('./sexagesimal')

const M = exports

/** Ecliptic coordinates are referenced to the plane of the ecliptic. */
class Ecliptic {
  /**
   * IMPORTANT: Longitudes are measured *positively* westwards
   * e.g. Washington D.C. +77°04; Vienna -16°23'
   * @param {Number} lon - Longitude (λ) in radians
   * @param {Number} lat - Latitude (β) in radians
   */
  constructor (lon, lat) {
    if (typeof lon === 'object') {
      lat = lon.lat
      lon = lon.lon
    }
    this.lon = lon || 0
    this.lat = lat || 0
  }

  /**
   * converts ecliptic coordinates to equatorial coordinates.
   * @param {Number} ε - Obliquity
   * @returns {Equatorial}
   */
  toEquatorial (ε) {
    let [εsin, εcos] = base.sincos(ε)
    let [sβ, cβ] = base.sincos(this.lat)
    let [sλ, cλ] = base.sincos(this.lon)
    let ra = Math.atan2(sλ * εcos - (sβ / cβ) * εsin, cλ) // (13.3) p. 93
    if (ra < 0) {
      ra += 2 * Math.PI
    }
    let dec = Math.asin(sβ * εcos + cβ * εsin * sλ) // (13.4) p. 93
    return new Equatorial(ra, dec)
  }
}
M.Ecliptic = Ecliptic

/**
 * Equatorial coordinates are referenced to the Earth's rotational axis.
 */
class Equatorial {
  /**
   * @param {Number} ra - (float) Right ascension (α) in radians
   * @param {Number} dec - (float) Declination (δ) in radians
   */
  constructor (ra = 0, dec = 0) {
    this.ra = ra
    this.dec = dec
  }

  /**
   * EqToEcl converts equatorial coordinates to ecliptic coordinates.
   * @param {Number} ε - Obliquity
   * @returns {Ecliptic}
   */
  toEcliptic (ε) {
    let [εsin, εcos] = base.sincos(ε)
    let [sα, cα] = base.sincos(this.ra)
    let [sδ, cδ] = base.sincos(this.dec)
    let lon = Math.atan2(sα * εcos + (sδ / cδ) * εsin, cα) // (13.1) p. 93
    let lat = Math.asin(sδ * εcos - cδ * εsin * sα)        // (13.2) p. 93
    return new Ecliptic(lon, lat)
  }

  /**
   * EqToHz computes Horizontal coordinates from equatorial coordinates.
   *
   * Argument g is the location of the observer on the Earth.  Argument st
   * is the sidereal time at Greenwich.
   *
   * Sidereal time must be consistent with the equatorial coordinates.
   * If coordinates are apparent, sidereal time must be apparent as well.
   *
   * @param {Equatorial} eq - equatorial coordinates (right ascension, declination)
   * @param {globe.Coord} g - coordinates of observer on Earth
   * @param {Number} st - sidereal time at Greenwich at time of observation
   * @returns {Horizontal}
   */
  toHorizontal (g, st) {
    let H = new sexa.Time(st).rad() - g.lon - this.ra
    let [sH, cH] = base.sincos(H)
    let [sφ, cφ] = base.sincos(g.lat)
    let [sδ, cδ] = base.sincos(this.dec)
    let azimuth = Math.atan2(sH, cH * sφ - (sδ / cδ) * cφ) // (13.5) p. 93
    let altitude = Math.asin(sφ * sδ + cφ * cδ * cH) // (13.6) p. 93
    return new Horizontal(azimuth, altitude)
  }

  /**
   * EqToGal converts equatorial coordinates to galactic coordinates.
   *
   * Equatorial coordinates must be referred to the standard equinox of B1950.0.
   * For conversion to B1950, see package precess and utility functions in
   * package "common".
   *
   * @param {Equatorial} eq
   * @returns {Galactic}
   */
  toGalactic () {
    let [sdα, cdα] = base.sincos(galacticNorth.ra - this.ra)
    let [sgδ, cgδ] = base.sincos(galacticNorth.dec)
    let [sδ, cδ] = base.sincos(this.dec)
    let x = Math.atan2(sdα, cdα * sgδ - (sδ / cδ) * cgδ) // (13.7) p. 94
    let lon = (Math.PI + galacticLon0 - x) % (2 * Math.PI) // (13.8) p. 94
    let lat = Math.asin(sδ * sgδ + cδ * cgδ * cdα)
    return new Galactic(lon, lat)
  }

}
M.Equatorial = Equatorial

/**
 * Horizontal coordinates are referenced to the local horizon of an observer
 * on the surface of the Earth.
 * @param {Number} az - Azimuth (A) in radians
 * @param {Number} alt - Altitude (h) in radians
 */
class Horizontal {
  constructor (az = 0, alt = 0) {
    this.az = az
    this.alt = alt
  }

  /**
   * transforms horizontal coordinates to equatorial coordinates.
   *
   * Sidereal time must be consistent with the equatorial coordinates.
   * If coordinates are apparent, sidereal time must be apparent as well.
   * @param {globe.Coord} g - coordinates of observer on Earth (lat, lon)
   * @param {Number} st - sidereal time at Greenwich at time of observation.
   * @returns {Equatorial} (right ascension, declination)
   */
  toEquatorial (g, st) {
    let [sA, cA] = base.sincos(this.az)
    let [sh, ch] = base.sincos(this.alt)
    let [sφ, cφ] = base.sincos(g.lat)
    let H = Math.atan2(sA, cA * sφ + sh / ch * cφ)
    let ra = base.pmod(sexa.Time(st).rad() - g.lon - H, 2 * Math.PI)
    let dec = Math.asin(sφ * sh - cφ * ch * cA)
    return new Equatorial(ra, dec)
  }
}
M.Horizontal = Horizontal

/**
 * Galactic coordinates are referenced to the plane of the Milky Way.
 * @param {Number} lon - Longitude (l) in radians
 * @param {Number} lat - Latitude (b) in radians
 */
class Galactic {
  constructor (lon = 0, lat = 0) {
    this.lon = lon
    this.lat = lat
  }

  /**
   * GalToEq converts galactic coordinates to equatorial coordinates.
   *
   * Resulting equatorial coordinates will be referred to the standard equinox of
   * B1950.0.  For subsequent conversion to other epochs, see package precess and
   * utility functions in package meeus.
   *
   * @returns {Equatorial} (right ascension, declination)
   */
  toEquatorial () {
    var [sdLon, cdLon] = base.sincos(this.lon - galacticLon0)
    var [sgδ, cgδ] = base.sincos(galacticNorth.dec)
    var [sb, cb] = base.sincos(this.lat)
    var y = Math.atan2(sdLon, cdLon * sgδ - (sb / cb) * cgδ)
    var ra = base.pmod(y + galacticNorth.ra, 2 * Math.PI)
    var dec = Math.asin(sb * sgδ + cb * cgδ * cdLon)
    return new Equatorial(ra, dec)
  }
}
M.Galactic = Galactic

/**
 * GalToEq converts galactic coordinates to equatorial coordinates.
 *
 * Resulting equatorial coordinates will be referred to the standard equinox of
 * B1950.0.  For subsequent conversion to other epochs, see package precess and
 * utility functions in package meeus.
 * @param {Galactic} g
 * @returns {Equatorial}
 */

/** equatorial coords for galactic north */
var galacticNorth = M.galacticNorth = new Equatorial(
  new sexa.RA(12, 49, 0).rad(),
  27.4 * Math.PI / 180
)

/** Galactic Longitude 0° */
var galacticLon0 = M.galacticLon0 = 123 * Math.PI / 180

},{"./base":1,"./sexagesimal":5}],3:[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module moonposition
 */
/**
 * Moonposition: Chapter 47, Position of the Moon.
 */

const base = require('./base')
const {asin, sin} = Math
const D2R = Math.PI / 180

const M = exports
const EARTH_RADIUS = 6378.137 // km

/**
 * parallax returns equatorial horizontal parallax of the Moon.
 *
 * @param {Number} distance - distance between centers of the Earth and Moon, in km.
 * @returns {Number} Result in radians.
 */
M.parallax = function (distance) {
  // p. 337
  return asin(EARTH_RADIUS / distance)
}

function dmf (T) {
  let d = base.horner(T, 297.8501921 * D2R, 445267.1114034 * D2R, -0.0018819 * D2R, D2R / 545868, -D2R / 113065000)
  let m = base.horner(T, 357.5291092 * D2R, 35999.0502909 * D2R, -0.0001535 * D2R, D2R / 24490000)
  let m_ = base.horner(T, 134.9633964 * D2R, 477198.8675055 * D2R,
    0.0087414 * D2R, D2R / 69699, -D2R / 14712000)
  let f = base.horner(T, 93.272095 * D2R, 483202.0175233 * D2R, -0.0036539 * D2R, -D2R / 3526000, D2R / 863310000)
  return [d, m, m_, f]
}

/**
 * position returns geocentric location of the Moon.
 *
 * Results are referenced to mean equinox of date and do not include
 * the effect of nutation.
 *
 * @param {number} jde - Julian ephemeris day
 * @returns {base.Coord}
 *  {number} lon - Geocentric longitude λ, in radians.
 *  {number} lat - Geocentric latitude β, in radians.
 *  {number} range - Distance Δ between centers of the Earth and Moon, in km.
 */
M.position = function (jde) {
  let T = base.J2000Century(jde)
  let l_ = base.horner(T, 218.3164477 * D2R, 481267.88123421 * D2R, -0.0015786 * D2R, D2R / 538841, -D2R / 65194000)
  let [d, m, m_, f] = dmf(T)
  let a1 = 119.75 * D2R + 131.849 * D2R * T
  let a2 = 53.09 * D2R + 479264.29 * D2R * T
  let a3 = 313.45 * D2R + 481266.484 * D2R * T
  let e = base.horner(T, 1, -0.002516, -0.0000074)
  let e2 = e * e
  let Σl = 3958 * sin(a1) + 1962 * sin(l_ - f) + 318 * sin(a2)
  let Σr = 0.0
  let Σb = -2235 * sin(l_) + 382 * sin(a3) + 175 * sin(a1 - f) +
    175 * sin(a1 + f) + 127 * sin(l_ - m_) - 115 * sin(l_ + m_)
  ta.forEach((r) => {
    let [sina, cosa] = base.sincos(d * r.d + m * r.m + m_ * r.m_ + f * r.f)
    switch (r.m) {
      case 0:
        Σl += r.Σl * sina
        Σr += r.Σr * cosa
        break
      case -1:
      case 1:
        Σl += r.Σl * sina * e
        Σr += r.Σr * cosa * e
        break
      case -2:
      case 2:
        Σl += r.Σl * sina * e2
        Σr += r.Σr * cosa * e2
        break
    }
  })

  tb.forEach((r) => {
    let sb = sin(d * r.d + m * r.m + m_ * r.m_ + f * r.f)
    switch (r.m) {
      case 0:
        Σb += r.Σb * sb
        break
      case -1:
      case 1:
        Σb += r.Σb * sb * e
        break
      case -2:
      case 2:
        Σb += r.Σb * sb * e2
        break
    }
  })
  let lon = base.pmod(l_, 2 * Math.PI) + Σl * 1e-6 * D2R
  let lat = Σb * 1e-6 * D2R
  let range = 385000.56 + Σr * 1e-3
  return new base.Coord(lon, lat, range)
}

const ta = (function () {
  const ta = [
    [0, 0, 1, 0, 6288774, -20905355],
    [2, 0, -1, 0, 1274027, -3699111],
    [2, 0, 0, 0, 658314, -2955968],
    [0, 0, 2, 0, 213618, -569925],

    [0, 1, 0, 0, -185116, 48888],
    [0, 0, 0, 2, -114332, -3149],
    [2, 0, -2, 0, 58793, 246158],
    [2, -1, -1, 0, 57066, -152138],

    [2, 0, 1, 0, 53322, -170733],
    [2, -1, 0, 0, 45758, -204586],
    [0, 1, -1, 0, -40923, -129620],
    [1, 0, 0, 0, -34720, 108743],

    [0, 1, 1, 0, -30383, 104755],
    [2, 0, 0, -2, 15327, 10321],
    [0, 0, 1, 2, -12528, 0],
    [0, 0, 1, -2, 10980, 79661],

    [4, 0, -1, 0, 10675, -34782],
    [0, 0, 3, 0, 10034, -23210],
    [4, 0, -2, 0, 8548, -21636],
    [2, 1, -1, 0, -7888, 24208],

    [2, 1, 0, 0, -6766, 30824],
    [1, 0, -1, 0, -5163, -8379],
    [1, 1, 0, 0, 4987, -16675],
    [2, -1, 1, 0, 4036, -12831],

    [2, 0, 2, 0, 3994, -10445],
    [4, 0, 0, 0, 3861, -11650],
    [2, 0, -3, 0, 3665, 14403],
    [0, 1, -2, 0, -2689, -7003],

    [2, 0, -1, 2, -2602, 0],
    [2, -1, -2, 0, 2390, 10056],
    [1, 0, 1, 0, -2348, 6322],
    [2, -2, 0, 0, 2236, -9884],

    [0, 1, 2, 0, -2120, 5751],
    [0, 2, 0, 0, -2069, 0],
    [2, -2, -1, 0, 2048, -4950],
    [2, 0, 1, -2, -1773, 4130],

    [2, 0, 0, 2, -1595, 0],
    [4, -1, -1, 0, 1215, -3958],
    [0, 0, 2, 2, -1110, 0],
    [3, 0, -1, 0, -892, 3258],

    [2, 1, 1, 0, -810, 2616],
    [4, -1, -2, 0, 759, -1897],
    [0, 2, -1, 0, -713, -2117],
    [2, 2, -1, 0, -700, 2354],

    [2, 1, -2, 0, 691, 0],
    [2, -1, 0, -2, 596, 0],
    [4, 0, 1, 0, 549, -1423],
    [0, 0, 4, 0, 537, -1117],

    [4, -1, 0, 0, 520, -1571],
    [1, 0, -2, 0, -487, -1739],
    [2, 1, 0, -2, -399, 0],
    [0, 0, 2, -2, -381, -4421],

    [1, 1, 1, 0, 351, 0],
    [3, 0, -2, 0, -340, 0],
    [4, 0, -3, 0, 330, 0],
    [2, -1, 2, 0, 327, 0],

    [0, 2, 1, 0, -323, 1165],
    [1, 1, -1, 0, 299, 0],
    [2, 0, 3, 0, 294, 0],
    [2, 0, -1, -2, 0, 8752]
  ]
  return ta.map((row) => {
    let o = {}
      ;['d', 'm', 'm_', 'f', 'Σl', 'Σr'].map((D2R, i) => {
        o[D2R] = row[i]
      })
    return o
  })
})()

const tb = (function () {
  const tb = [
    [0, 0, 0, 1, 5128122],
    [0, 0, 1, 1, 280602],
    [0, 0, 1, -1, 277693],
    [2, 0, 0, -1, 173237],

    [2, 0, -1, 1, 55413],
    [2, 0, -1, -1, 46271],
    [2, 0, 0, 1, 32573],
    [0, 0, 2, 1, 17198],

    [2, 0, 1, -1, 9266],
    [0, 0, 2, -1, 8822],
    [2, -1, 0, -1, 8216],
    [2, 0, -2, -1, 4324],

    [2, 0, 1, 1, 4200],
    [2, 1, 0, -1, -3359],
    [2, -1, -1, 1, 2463],
    [2, -1, 0, 1, 2211],

    [2, -1, -1, -1, 2065],
    [0, 1, -1, -1, -1870],
    [4, 0, -1, -1, 1828],
    [0, 1, 0, 1, -1794],

    [0, 0, 0, 3, -1749],
    [0, 1, -1, 1, -1565],
    [1, 0, 0, 1, -1491],
    [0, 1, 1, 1, -1475],

    [0, 1, 1, -1, -1410],
    [0, 1, 0, -1, -1344],
    [1, 0, 0, -1, -1335],
    [0, 0, 3, 1, 1107],

    [4, 0, 0, -1, 1021],
    [4, 0, -1, 1, 833],

    [0, 0, 1, -3, 777],
    [4, 0, -2, 1, 671],
    [2, 0, 0, -3, 607],
    [2, 0, 2, -1, 596],

    [2, -1, 1, -1, 491],
    [2, 0, -2, 1, -451],
    [0, 0, 3, -1, 439],
    [2, 0, 2, 1, 422],

    [2, 0, -3, -1, 421],
    [2, 1, -1, 1, -366],
    [2, 1, 0, 1, -351],
    [4, 0, 0, 1, 331],

    [2, -1, 1, 1, 315],
    [2, -2, 0, -1, 302],
    [0, 0, 1, 3, -283],
    [2, 1, 1, -1, -229],

    [1, 1, 0, -1, 223],
    [1, 1, 0, 1, 223],
    [0, 1, -2, -1, -220],
    [2, 1, -1, -1, -220],

    [1, 0, 1, 1, -185],
    [2, -1, -2, -1, 181],
    [0, 1, 2, 1, -177],
    [4, 0, -2, -1, 176],

    [4, -1, -1, -1, 166],
    [1, 0, 1, -1, -164],
    [4, 0, 1, -1, 132],
    [1, 0, -1, -1, -119],

    [4, -1, 0, -1, 115],
    [2, -2, 0, 1, 107]
  ]
  return tb.map((row) => {
    let o = {}
      ;['d', 'm', 'm_', 'f', 'Σb'].map((D2R, i) => {
        o[D2R] = row[i]
      })
    return o
  })
})()

/**
 * Node returns longitude of the mean ascending node of the lunar orbit.
 *
 * @param {number} jde - Julian ephemeris day
 * @returns result in radians.
 */
M.node = function (jde) {
  return base.pmod(
    base.horner(
      base.J2000Century(jde),
      125.0445479 * D2R,
      -1934.1362891 * D2R,
      0.0020754 * D2R,
      D2R / 467441,
      -D2R / 60616000
    ), 2 * Math.PI
  )
}

/**
 * perigee returns longitude of perigee of the lunar orbit.
 *
 * @param {number} jde - Julian ephemeris day
 * @returns result in radians.
 */
M.perigee = function (jde) {
  return base.pmod(
    base.horner(
      base.J2000Century(jde),
      83.3532465 * D2R,
      4069.0137287 * D2R,
      -0.01032 * D2R,
      -D2R / 80053,
      D2R / 18999000
    ), 2 * Math.PI
  )
}

/**
 * trueNode returns longitude of the true ascending node.
 *
 * That is, the node of the instantaneous lunar orbit.
 *
 * @param {number} jde - Julian ephemeris day
 * @returns result in radians.
 */
M.trueNode = function (jde) {
  let [d, m, m_, f] = dmf(base.J2000Century(jde))
  return M.node(jde) +
    -1.4979 * D2R * sin(2 * (d - f)) +
    -0.15 * D2R * sin(m) +
    -0.1226 * D2R * sin(2 * d) +
    0.1176 * D2R * sin(2 * f) +
    -0.0801 * D2R * sin(2 * (m_ - f))
}

},{"./base":1}],4:[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module nutation
 */
/**
 * Nutation: Chapter 22, Nutation and the Obliquity of the Ecliptic.
 */

const base = require('./base')
const sexa = require('./sexagesimal')

const M = exports

// Nutation: Chapter 22, Nutation and the Obliquity of the Ecliptic.

/**
 * Nutation returns nutation in longitude (Δψ) and nutation in obliquity (Δε)
 * for a given JDE.
 *
 * JDE = UT + ΔT, see package.
 *
 * Computation is by 1980 IAU theory, with terms < .0003″ neglected.
 *
 * Result units are radians.
 *
 * @param {number} jde - Julian ephemeris day
 * @return {number[]} [Δψ, Δε] - [longitude, obliquity] in radians
 */
M.nutation = function (jde) {
  var T = base.J2000Century(jde)
  var D = base.horner(T,
    297.85036, 445267.11148, -0.0019142, 1.0 / 189474) * Math.PI / 180
  var M = base.horner(T,
    357.52772, 35999.050340, -0.0001603, -1.0 / 300000) * Math.PI / 180
  var N = base.horner(T,
    134.96298, 477198.867398, 0.0086972, 1.0 / 5620) * Math.PI / 180
  var F = base.horner(T,
    93.27191, 483202.017538, -0.0036825, 1.0 / 327270) * Math.PI / 180
  var Ω = base.horner(T,
    125.04452, -1934.136261, 0.0020708, 1.0 / 450000) * Math.PI / 180
  var Δψ = 0
  var Δε = 0
  // sum in reverse order to accumulate smaller terms first
  for (var i = table22A.length - 1; i >= 0; i--) {
    var row = table22A[i]
    var arg = row.d * D + row.m * M + row.n * N + row.f * F + row.ω * Ω
    var [s, c] = base.sincos(arg)
    Δψ += s * (row.s0 + row.s1 * T)
    Δε += c * (row.c0 + row.c1 * T)
  }
  Δψ *= 0.0001 / 3600 * (Math.PI / 180)
  Δε *= 0.0001 / 3600 * (Math.PI / 180)
  return [Δψ, Δε] // (Δψ, Δε float)
}
/**
 * ApproxNutation returns a fast approximation of nutation in longitude (Δψ)
 * and nutation in obliquity (Δε) for a given JDE.
 *
 * Accuracy is 0.5″ in Δψ, 0.1″ in Δε.
 *
 * Result units are radians.
 *
 * @param {number} jde - Julian ephemeris day
 * @return {number[]} [Δψ, Δε] - [longitude, obliquity] in radians
 */
M.approxNutation = function (jde) {
  var T = (jde - base.J2000) / 36525
  var Ω = (125.04452 - 1934.136261 * T) * Math.PI / 180
  var L = (280.4665 + 36000.7698 * T) * Math.PI / 180
  var N = (218.3165 + 481267.8813 * T) * Math.PI / 180
  var [sΩ, cΩ] = base.sincos(Ω)
  var [s2L, c2L] = base.sincos(2 * L)
  var [s2N, c2N] = base.sincos(2 * N)
  var [s2Ω, c2Ω] = base.sincos(2 * Ω)
  var Δψ = (-17.2 * sΩ - 1.32 * s2L - 0.23 * s2N + 0.21 * s2Ω) / 3600 * (Math.PI / 180)
  var Δε = (9.2 * cΩ + 0.57 * c2L + 0.1 * c2N - 0.09 * c2Ω) / 3600 * (Math.PI / 180)
  return [Δψ, Δε] // (Δψ, Δε float)
}

/**
 * MeanObliquity returns mean obliquity (ε₀) following the IAU 1980
 * polynomial.
 *
 * Accuracy is 1″ over the range 1000 to 3000 years and 10″ over the range
 * 0 to 4000 years.
 *
 * Result unit is radians.
 *
 * @param {number} jde - Julian ephemeris day
 * @return {number} mean obliquity (ε₀)
 */
M.meanObliquity = function (jde) {
  // (22.2) p. 147
  return base.horner(
    base.J2000Century(jde),
    new sexa.Angle(false, 23, 26, 21.448).rad(),
    -46.815 / 3600 * (Math.PI / 180),
    -0.00059 / 3600 * (Math.PI / 180),
    0.001813 / 3600 * (Math.PI / 180)
  )
}

/**
 * MeanObliquityLaskar returns mean obliquity (ε₀) following the Laskar
 * 1986 polynomial.
 *
 * Accuracy over the range 1000 to 3000 years is .01″.
 *
 * Accuracy over the valid date range of -8000 to +12000 years is
 * "a few seconds."
 *
 * Result unit is radians.
 *
 * @param {number} jde - Julian ephemeris day
 * @return {number} mean obliquity (ε₀)
 */
M.meanObliquityLaskar = function (jde) {
  // (22.3) p. 147
  return base.horner(
    base.J2000Century(jde) * 0.01,
    new sexa.Angle(false, 23, 26, 21.448).rad(),
    -4680.93 / 3600 * (Math.PI / 180),
    -1.55 / 3600 * (Math.PI / 180),
    1999.25 / 3600 * (Math.PI / 180),
    -51.38 / 3600 * (Math.PI / 180),
    -249.67 / 3600 * (Math.PI / 180),
    -39.05 / 3600 * (Math.PI / 180),
    7.12 / 3600 * (Math.PI / 180),
    27.87 / 3600 * (Math.PI / 180),
    5.79 / 3600 * (Math.PI / 180),
    2.45 / 3600 * (Math.PI / 180)
  )
}

/**
 * NutationInRA returns "nutation in right ascension" or "equation of the
 * equinoxes."
 *
 * Result is an angle in radians.
 *
 * @param {number} jde - Julian ephemeris day
 * @return {number} nutation in right ascension
 */
M.nutationInRA = function (jde) {
  var [Δψ, Δε] = M.nutation(jde)
  var ε0 = M.meanObliquity(jde)
  return Δψ * Math.cos(ε0 + Δε)
}

var table22A = (function () {
  const PROPS = 'd,m,n,f,ω,s0,s1,c0,c1'.split(',')
  const tab = [
    [0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9],
    [-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1],
    [0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5],
    [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5],
    [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1],
    [0, 0, 1, 0, 0, 712, 0.1, -7, 0],
    [-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6],
    [0, 0, 0, 2, 1, -386, -0.4, 200, 0],
    [0, 0, 1, 2, 2, -301, 0, 129, -0.1],
    [-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3],
    [-2, 0, 1, 0, 0, -158, 0, 0, 0],
    [-2, 0, 0, 2, 1, 129, 0.1, -70, 0],
    [0, 0, -1, 2, 2, 123, 0, -53, 0],
    [2, 0, 0, 0, 0, 63, 0, 0, 0],
    [0, 0, 1, 0, 1, 63, 0.1, -33, 0],
    [2, 0, -1, 2, 2, -59, 0, 26, 0],
    [0, 0, -1, 0, 1, -58, -0.1, 32, 0],
    [0, 0, 1, 2, 1, -51, 0, 27, 0],
    [-2, 0, 2, 0, 0, 48, 0, 0, 0],
    [0, 0, -2, 2, 1, 46, 0, -24, 0],
    [2, 0, 0, 2, 2, -38, 0, 16, 0],
    [0, 0, 2, 2, 2, -31, 0, 13, 0],
    [0, 0, 2, 0, 0, 29, 0, 0, 0],
    [-2, 0, 1, 2, 2, 29, 0, -12, 0],
    [0, 0, 0, 2, 0, 26, 0, 0, 0],
    [-2, 0, 0, 2, 0, -22, 0, 0, 0],
    [0, 0, -1, 2, 1, 21, 0, -10, 0],
    [0, 2, 0, 0, 0, 17, -0.1, 0, 0],
    [2, 0, -1, 0, 1, 16, 0, -8, 0],
    [-2, 2, 0, 2, 2, -16, 0.1, 7, 0],
    [0, 1, 0, 0, 1, -15, 0, 9, 0],
    [-2, 0, 1, 0, 1, -13, 0, 7, 0],
    [0, -1, 0, 0, 1, -12, 0, 6, 0],
    [0, 0, 2, -2, 0, 11, 0, 0, 0],
    [2, 0, -1, 2, 1, -10, 0, 5, 0],
    [2, 0, 1, 2, 2, -8, 0, 3, 0],
    [0, 1, 0, 2, 2, 7, 0, -3, 0],
    [-2, 1, 1, 0, 0, -7, 0, 0, 0],
    [0, -1, 0, 2, 2, -7, 0, 3, 0],
    [2, 0, 0, 2, 1, -7, 0, 3, 0],
    [2, 0, 1, 0, 0, 6, 0, 0, 0],
    [-2, 0, 2, 2, 2, 6, 0, -3, 0],
    [-2, 0, 1, 2, 1, 6, 0, -3, 0],
    [2, 0, -2, 0, 1, -6, 0, 3, 0],
    [2, 0, 0, 0, 1, -6, 0, 3, 0],
    [0, -1, 1, 0, 0, 5, 0, 0, 0],
    [-2, -1, 0, 2, 1, -5, 0, 3, 0],
    [-2, 0, 0, 0, 1, -5, 0, 3, 0],
    [0, 0, 2, 2, 1, -5, 0, 3, 0],
    [-2, 0, 2, 0, 1, 4, 0, 0, 0],
    [-2, 1, 0, 2, 1, 4, 0, 0, 0],
    [0, 0, 1, -2, 0, 4, 0, 0, 0],
    [-1, 0, 1, 0, 0, -4, 0, 0, 0],
    [-2, 1, 0, 0, 0, -4, 0, 0, 0],
    [1, 0, 0, 0, 0, -4, 0, 0, 0],
    [0, 0, 1, 2, 0, 3, 0, 0, 0],
    [0, 0, -2, 2, 2, -3, 0, 0, 0],
    [-1, -1, 1, 0, 0, -3, 0, 0, 0],
    [0, 1, 1, 0, 0, -3, 0, 0, 0],
    [0, -1, 1, 2, 2, -3, 0, 0, 0],
    [2, -1, -1, 2, 2, -3, 0, 0, 0],
    [0, 0, 3, 2, 2, -3, 0, 0, 0],
    [2, -1, 0, 2, 2, -3, 0, 0, 0]
  ]

  return tab.map((row) => {
    var o = {}
    PROPS.forEach((p, i) => {
      o[p] = row[i]
    })
    return o
  })
})()

},{"./base":1,"./sexagesimal":5}],5:[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module sexagesimal
 */
/**
 * Sexagesimal functions
 */

const M = exports

/**
 * Angle represents a general purpose angle.
 * Unit is radians.
 */
class Angle {
  /**
  * constructs a new Angle value from sign, degree, minute, and second
  * components.
  * __One argument__
  * @param {Number} angle - (float) angle in radians
  * __Four arguments__
  * @param {Boolean} neg - sign, true if negative
  * @param {Number} d - (int) degree
  * @param {Number} m - (int) minute
  * @param {Number} s - (float) second
  */
  constructor (neg, d, m, s) {
    if (arguments.length === 1) {
      this.angle = neg
    } else {
      this.setDMS(neg, d, m, s)
    }
  }

  /**
   * SetDMS sets the value of an FAngle from sign, degree, minute, and second
   * components.
   * The receiver is returned as a convenience.
   * @param {Boolean} neg - sign, true if negative
   * @param {Number} d - (int) degree
   * @param {Number} m - (int) minute
   * @param {Number} s - (float) second
   * @returns {Angle}
   */
  setDMS (neg = 0, d = 0, m = 0, s = 0.0) {
    this.angle = (M.DMSToDeg(neg, d, m, s) * Math.PI / 180)
    return this
  }

  /**
   * sets angle
   * @param {Number} angle - (float) angle in radians
   * @returns {Angle}
   */
  setAngle (rad) {
    this.angle = rad
    return this
  }

  /**
   * Rad returns the angle in radians.
   * @returns {Number} angle in radians
   */
  rad () {
    return this.angle
  }

  /**
   * Deg returns the angle in degrees.
   * @returns {Number} angle in degree
   */
  deg () {
    return this.angle * 180 / Math.PI
  }

  /**
   * Print angle in degree using `d°m´s.ss″`
   * @param {Number} precision - precision of `s.ss`
   * @returns {String}
   */
  toString (precision) {
    var [neg, d, m, s] = M.degToDMS(this.deg())
    s = round(s, precision).toString().replace(/^0\./, '.')
    var str = (neg ? '-' : '') +
      (d + '°') +
      (m + '′') +
      (s + '″')
    return str
  }

  /**
   * Print angle in degree using `d°.ff`
   * @param {Number} precision - precision of `.ff`
   * @returns {String}
   */
  toDegString (precision) {
    var [i, s] = modf(this.deg())
    s = round(s, precision).toString().replace(/^0\./, '.')
    var str = (i + '°') + s
    return str
  }
}
M.Angle = Angle

/**
 * HourAngle represents an angle corresponding to angular rotation of
 * the Earth in a specified time.
 *
 * Unit is radians.
 */
class HourAngle extends Angle {
  /**
  * NewHourAngle constructs a new HourAngle value from sign, hour, minute,
  * and second components.
  * @param {Boolean} neg
  * @param {Number} h - (int)
  * @param {Number} m - (int)
  * @param {Number} s - (float)
  */
  // constructor (neg, h, m, s) {
    // super(neg, h, m, s)
  // }

  /**
   * SetDMS sets the value of an FAngle from sign, degree, minute, and second
   * components.
   * The receiver is returned as a convenience.
   * @param {Boolean} neg - sign, true if negative
   * @param {Number} h - (int) hour
   * @param {Number} m - (int) minute
   * @param {Number} s - (float) second
   * @returns {Angle}
   */
  setDMS (neg = 0, h = 0, m = 0, s = 0.0) {
    this.angle = (M.DMSToDeg(neg, h, m, s) * 15 * Math.PI / 180)
    return this
  }

  /**
   * Hour returns the hour angle as hours of time.
   * @returns hour angle
   */
  hour () {
    return this.angle * 12 / Math.PI // 12 = 180 / 15
  }

  deg () {
    return this.hour()
  }

  /**
   * Print angle in `HʰMᵐs.ssˢ`
   * @param {Number} precision - precision of `s.ss`
   * @returns {String}
   */
  toString (precision) {
    var [neg, h, m, s] = M.degToDMS(this.deg())
    s = round(s, precision).toString().replace(/^0\./, '.')
    var str = (neg ? '-' : '') +
      (h + 'ʰ') +
      (m + 'ᵐ') +
      (s + 'ˢ')
    return str
  }
}
M.HourAngle = HourAngle

/**
 * DMSToDeg converts from parsed sexagesimal angle components to decimal
 * degrees.
 * @param {Boolean} neg - sign, true if negative
 * @param {Number} d - (int) degree
 * @param {Number} m - (int) minute
 * @param {Number} s - (float) second
 * @returns {Number} angle in degree
 */
M.DMSToDeg = function (neg, d, m, s) {
  s = (((d * 60 + m) * 60) + s) / 3600
  if (neg) {
    return -s
  }
  return s
}

/**
 * DegToDMS converts from decimal degrees to parsed sexagesimal angle component.
 * @param {Number} deg - angle in degree
 * @returns {Array} [neg, d, m, s]
 *  {Boolean} neg - sign, true if negative
 *  {Number} d - (int) degree
 *  {Number} m - (int) minute
 *  {Number} s - (float) second
 */
M.degToDMS = function (deg) {
  var neg = (deg < 0)
  deg = Math.abs(deg)
  var [d, s] = modf(deg % 360)
  var [m, s1] = modf(s * 60)
  s = round(s1 * 60) // may introduce an error < 1e13
  return [neg, d, m, s]
}

/**
 * TODO
 */
class RA extends HourAngle {
  /**
   * constructs a new RA value from hour, minute, and second components.
   * Negative values are not supported, RA wraps values larger than 24
   * to the range [0,24) hours.
   * @param {Number} h - (int) hour
   * @param {Number} m - (int) minute
   * @param {Number} s - (float) second
   */
  constructor (h = 0, m = 0, s = 0) {
    super()
    let args = [].slice.call(arguments)
    if (args.length === 1) {
      this.angle = h
    } else {
      let hr = M.DMSToDeg(false, h, m, s) % 24
      this.angle = hr * 15 * Math.PI / 180
    }
  }

  hour () {
    let h = this.angle * 12 / Math.PI
    return (24 + (h % 24)) % 24
  }
}
M.RA = RA

/**
 * TODO
 */
class Time {
  /**
   * @param {Boolean} neg - set `true` if negative
   * @param {Number} h - (int) hour
   * @param {Number} m - (int) minute
   * @param {Number} s - (float) second
   */
  constructor (neg, h, m, s) {
    if (arguments.length === 1) {
      this.time = neg
    } else {
      this.setHMS(neg, h, m, s)
    }
  }

  setHMS (neg = false, h = 0, m = 0, s = 0) {
    s += ((h * 60 + m) * 60)
    if (neg) {
      s = -s
    }
    this.time = s
  }

  /**
   * @returns {Number} time in seconds.
   */
  sec () {
    return this.time
  }

  /**
   * @returns {Number} time in minutes.
   */
  min () {
    return this.time / 60
  }

  /**
   * @returns {Number} time in hours.
   */
  hour () {
    return this.time / 3600
  }

  /**
   * @returns {Number} time in days.
   */
  day () {
    return this.time / 3600 / 24
  }

  /**
   * @returns {Number} time in radians, where 1 day = 2 Pi radians.
   */
  rad () {
    return this.time * Math.PI / 12 / 3600
  }

  /**
   * convert time to HMS
   * @returns {Array} [neg, h, m, s]
   *  {Boolean} neg - sign, true if negative
   *  {Number} h - (int) hour
   *  {Number} m - (int) minute
   *  {Number} s - (float) second
   */
  toHMS () {
    var t = this.time
    var neg = (t < 0)
    t = (neg ? -t : t)
    var h = Math.trunc(t / 3600)
    t = t - (h * 3600)
    var m = Math.trunc(t / 60)
    var s = t - (m * 60)
    return [neg, h, m, s]
  }

  /**
   * Print time using `HʰMᵐsˢ.ss`
   * @param {Number} precision - precision of `.ss`
   * @returns {String}
   */
  toString (precision) {
    var [neg, h, m, s] = this.toHMS()
    var [si, sf] = modf(s)
    if (precision === 0) {
      si = round(s, 0)
      sf = 0
    } else {
      sf = round(sf, precision).toString().substr(1)
    }
    var str = (neg ? '-' : '') +
      (h + 'ʰ') +
      (m + 'ᵐ') +
      (si + 'ˢ') +
      (sf || '')
    return str
  }
}
M.Time = Time

/**
 * separate fix `i` from fraction `f`
 * @private
 * @param {Number} float
 * @returns {Array} [i, f]
 *  {Number} i - (int) fix value
 *  {Number} f - (float) fractional portion; always > 1
 */
function modf (float) {
  var i = Math.trunc(float)
  var f = Math.abs(float - i)
  return [i, f]
}

/**
 * Rounds `float` value by precision
 * @private
 * @param {Number} float - value to round
 * @param {Number} precision - (int) number of post decimal positions
 * @return {Number} rounded `float`
 */
function round (float, precision) {
  precision = (precision === undefined ? 10 : precision)
  return parseFloat(float.toFixed(precision), 10)
}

},{}],6:[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module solar
 */
/**
 * Solar: Chapter 25, Solar Coordinates.
 *
 * Partial implementation:
 *
 * 1. Higher accuracy positions are not computed with Appendix III but with
 * full VSOP87 as implemented in package planetposition.
 *
 * 2. Higher accuracy correction for aberration (using the formula for
 * variation Δλ on p. 168) is not implemented.  Results for example 25.b
 * already match the full VSOP87 values on p. 165 even with the low accuracy
 * correction for aberration, thus there are no more significant digits that
 * would check a more accurate result.  Also the size of the formula presents
 * significant chance of typographical error.
 */

const base = require('./base')
const coord = require('./coord')
const nutation = require('./nutation')

const M = exports

/**
 * True returns true geometric longitude and anomaly of the sun referenced to the mean equinox of date.
 *
 * @param {Number} T - number of Julian centuries since J2000. See base.J2000Century.
 * @returns {Object}
 *   {Number} lon = true geometric longitude, ☉, in radians
 *   {Number} ano = true anomaly in radians
 */
M.true = function (T) {
  // (25.2) p. 163
  let L0 = base.horner(T, 280.46646, 36000.76983, 0.0003032) *
    Math.PI / 180
  let m = M.meanAnomaly(T)
  let C = (base.horner(T, 1.914602, -0.004817, -0.000014) *
    Math.sin(m) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m)) * Math.PI / 180
  let lon = base.pmod(L0 + C, 2 * Math.PI)
  let ano = base.pmod(m + C, 2 * Math.PI)
  return {lon, ano}
}

/**
 * meanAnomaly returns the mean anomaly of Earth at the given T.
 *
 * @param {Number} T - number of Julian centuries since J2000. See base.J2000Century.
 * @returns {Number} Result is in radians and is not normalized to the range 0..2π.
 */
M.meanAnomaly = function (T) {
  // (25.3) p. 163
  return base.horner(T, 357.52911, 35999.05029, -0.0001537) * Math.PI / 180
}

/**
 * eccentricity returns eccentricity of the Earth's orbit around the sun.
 *
 * @param {Number} T - number of Julian centuries since J2000. See base.J2000Century.
 * @returns {Number} eccentricity of the Earth's orbit around the sun.
 */
M.eccentricity = function (T) {
  // (25.4) p. 163
  return base.horner(T, 0.016708634, -0.000042037, -0.0000001267)
}

/**
 * Radius returns the Sun-Earth distance in AU.
 *
 * @param {Number} T - number of Julian centuries since J2000. See base.J2000Century.
 * @returns {Number} Sun-Earth distance in AU
 */
M.radius = function (T) {
  let {lon, ano} = M.true(T) // eslint-disable-line
  let e = M.eccentricity(T)
  // (25.5) p. 164
  return 1.000001018 * (1 - e * e) / (1 + e * Math.cos(ano))
}

/**
 * ApparentLongitude returns apparent longitude of the Sun referenced to the true equinox of date.
 * Result includes correction for nutation and aberration.  Unit is radians.
 *
 * @param {Number} T - number of Julian centuries since J2000. See base.J2000Century.
 * @returns {Number} apparent longitude of the Sun referenced to the true equinox of date.
 */
M.apparentLongitude = function (T) {
  let Ω = node(T)
  let {lon, ano} = M.true(T) // eslint-disable-line
  return lon - 0.00569 * Math.PI / 180 - 0.00478 * Math.PI / 180 * Math.sin(Ω)
}

/**
 * @private
 */
function node (T) {
  return 125.04 * Math.PI / 180 - 1934.136 * Math.PI / 180 * T
}

/**
 * true2000 returns true geometric longitude and anomaly of the sun referenced to equinox J2000.
 * Results are accurate to .01 degree for years 1900 to 2100.
 *
 * @param {Number} T - number of Julian centuries since J2000. See base.J2000Century.
 * @returns {Object}
 *   {Number} lon - true geometric longitude, ☉, in radians
 *   {Number} ano - true anomaly in radians
 */
M.true2000 = function (T) {
  let {lon, ano} = M.true(T)
  lon -= 0.01397 * Math.PI / 180 * T * 100
  return {lon, ano}
}

/**
 * trueEquatorial returns the true geometric position of the Sun as equatorial coordinates.
 *
 * @param {Number} jde - Julian ephemeris day
 * @returns {base.Coord}
 *   {Number} ra - right ascension in radians
 *   {Number} dec - declination in radians
 */
M.trueEquatorial = function (jde) {
  let {lon, ano} = M.true(base.J2000Century(jde)) // eslint-disable-line
  let ε = nutation.meanObliquity(jde)
  let [ss, cs] = base.sincos(lon)
  let [sε, cε] = base.sincos(ε)
  // (25.6, 25.7) p. 165
  let ra = Math.atan2(cε * ss, cs)
  let dec = sε * ss
  return new base.Coord(ra, dec)
}

/**
 * apparentEquatorial returns the apparent position of the Sun as equatorial coordinates.
 *
 * @param {Number} jde - Julian ephemeris day
 * @returns {base.Coord}
 *   {Number} ra - right ascension in radians
 *   {Number} dec - declination in radians
 */
M.apparentEquatorial = function (jde) {
  let T = base.J2000Century(jde)
  let λ = M.apparentLongitude(T)
  let ε = nutation.meanObliquity(jde)
  let [sλ, cλ] = base.sincos(λ)
  // (25.8) p. 165
  let [sε, cε] = base.sincos(ε + 0.00256 * Math.PI / 180 * Math.cos(node(T)))
  let ra = Math.atan2(cε * sλ, cλ)
  let dec = Math.asin(sε * sλ)
  return new base.Coord(ra, dec)
}

/**
 * trueVSOP87 returns the true geometric position of the sun as ecliptic coordinates.
 *
 * Result computed by full VSOP87 theory.  Result is at equator and equinox
 * of date in the FK5 frame.  It does not include nutation or aberration.
 *
 * @param {planetposition.Planet} planet
 * @param {Number} jde - Julian ephemeris day
 * @returns {Object}
 *   {Number} lon - ecliptic longitude in radians
 *   {Number} lat - ecliptic latitude in radians
 *   {Number} range - range in AU
 */
M.trueVSOP87 = function (planet, jde) {
  let {lon, lat, range} = planet.position(jde)
  let s = lon + Math.PI
    // FK5 correction.
  let λp = base.horner(base.J2000Century(jde),
    s, -1.397 * Math.PI / 180, -0.00031 * Math.PI / 180)
  let [sλp, cλp] = base.sincos(λp)
  let Δβ = 0.03916 / 3600 * Math.PI / 180 * (cλp - sλp)
  // (25.9) p. 166
  lon = base.pmod(s - 0.09033 / 3600 * Math.PI / 180, 2 * Math.PI)
  lat = Δβ - lat
  return new base.Coord(lon, lat, range)
}

/**
 * apparentVSOP87 returns the apparent position of the sun as ecliptic coordinates.
 *
 * Result computed by VSOP87, at equator and equinox of date in the FK5 frame,
 * and includes effects of nutation and aberration.
 *
 * @param {planetposition.Planet} planet
 * @param {Number} jde - Julian ephemeris day
 * @returns {base.Coord}
 *   {Number} lon - ecliptic longitude in radians
 *   {Number} lat - ecliptic latitude in radians
 *   {Number} range - range in AU
 */
M.apparentVSOP87 = function (planet, jde) {
  // note: see duplicated code in ApparentEquatorialVSOP87.
  let {lon, lat, range} = M.trueVSOP87(planet, jde)
  let Δψ = nutation.nutation(jde)[0]
  let a = M.aberration(range)
  lon = lon + Δψ + a
  return new base.Coord(lon, lat, range)
}

/**
 * apparentEquatorialVSOP87 returns the apparent position of the sun as equatorial coordinates.
 *
 * Result computed by VSOP87, at equator and equinox of date in the FK5 frame,
 * and includes effects of nutation and aberration.
 *
 * @param {planetposition.Planet} planet
 * @param {Number} jde - Julian ephemeris day
 * @returns
 *   {Number} ra - right ascension in radians
 *   {Number} dec - declination in radians
 *   {Number} range - range in AU
 */
M.apparentEquatorialVSOP87 = function (planet, jde) {
  // note: duplicate code from ApparentVSOP87 so we can keep Δε.
  // see also duplicate code in time.E().
  let {lon, lat, range} = M.trueVSOP87(planet, jde)
  let [Δψ, Δε] = nutation.nutation(jde)
  let a = M.aberration(range)
  let λ = lon + Δψ + a
  let ε = nutation.meanObliquity(jde) + Δε
  let {ra, dec} = new coord.Ecliptic(λ, lat).toEquatorial(ε)
  return new base.Coord(ra, dec, range)
}

/**
 * Low precision formula.  The high precision formula is not implemented
 * because the low precision formula already gives position results to the
 * accuracy given on p. 165.  The high precision formula represents lots
 * of typing with associated chance of typos, and no way to test the result.
 * @param {Number} range
 * @returns {Number} aberation
 */
M.aberration = function (range) {
  // (25.10) p. 167
  return -20.4898 / 3600 * Math.PI / 180 / range
}

},{"./base":1,"./coord":2,"./nutation":4}],"/moon":[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module moon
 */
/**
 * Moon: Chapter 53, Ephemeris for Physical Observations of the Moon.
 *
 * Incomplete.  Topocentric functions are commented out for lack of test data.
 */

const base = require('./base')
// const parallax = require('./parallax')
const coord = require('./coord')
const moonposition = require('./moonposition')
const nutation = require('./nutation')
// const planetposition = require('./planetposition')
const solar = require('./solar')

const M = exports

const p = Math.PI / 180
const _I = 1.54242 * p // IAU value of inclination of mean lunar equator

let [sI, cI] = base.sincos(_I)

/**
 * Physical returns quantities useful for physical observation of the Moon.
 *
 * Returned l, b are librations in selenographic longitude and latitude.
 * They represent combined optical and physical librations.  Topocentric
 * librations are not considered.
 *
 * Returned P is the the position angle of the Moon's axis of rotation.
 *
 * Returned l0, b0 are the selenographic coordinates of the Sun.
 *
 * Returned values all in radians.

 * @param {number} jde - Julian ephemeris day
 * @param {planetposition.Planet} earth - VSOP87 Planet Earth
 * @return {Array}
 *    {base.Coord} cMoon - selenographic longitude, latitude of the Moon
 *    {number} P - position angle of the Moon's axis of rotation
 *    {base.Coord} cSun - selenographic longitude, latitude of the Sun.
 */
M.physical = function (jde, earth) {
  let {lon, lat, range} = moonposition.position(jde) // (λ without nutation)
  // [λ, β, Δ]
  let m = new Moon(jde)
  let [l, b] = m.lib(lon, lat)
  let P = m.pa(lon, lat, b)
  let [l0, b0] = m.sun(lon, lat, range, earth)
  let cMoon = new base.Coord(l, b)
  let cSun = new base.Coord(l0, b0)
  return [cMoon, P, cSun]
}

/**
 * Quantities computed for a jde and used in computing return values of
 * physical().  Computations are broken into several methods to organize
 * the code.
 */
class Moon {
  constructor (jde) {
    this.jde = jde
      // Δψ, F, Ω, p. 372.0
    let [Δψ, Δε] = nutation.nutation(jde)
    this.Δψ = Δψ
    let T = base.J2000Century(jde)
    let F = this.F = base.horner(T, 93.272095 * p, 483202.0175233 * p, -0.0036539 * p, -p / 3526000, p / 863310000)
    this.Ω = base.horner(T, 125.0445479 * p, -1934.1362891 * p, 0.0020754 * p,
        p / 467441, -p / 60616000)
      // true ecliptic
    this.ε = nutation.meanObliquity(jde) + Δε
    this.sε = Math.sin(this.ε)
    this.cε = Math.cos(this.ε)
      // ρ, σ, τ, p. 372,373
    let D = base.horner(T, 297.8501921 * p, 445267.1114034 * p, -0.0018819 * p, p / 545868, -p / 113065000)
    let M = base.horner(T, 357.5291092 * p, 35999.0502909 * p, -0.0001535 * p, p / 24490000)
    let M_ = base.horner(T, 134.9633964 * p, 477198.8675055 * p,
      0.0087414 * p, p / 69699, -p / 14712000)
    let E = base.horner(T, 1, -0.002516, -0.0000074)
    let K1 = 119.75 * p + 131.849 * p * T
    let K2 = 72.56 * p + 20.186 * p * T
    this.ρ = -0.02752 * p * Math.cos(M_) +
      -0.02245 * p * Math.sin(F) +
      0.00684 * p * Math.cos(M_ - 2 * F) +
      -0.00293 * p * Math.cos(2 * F) +
      -0.00085 * p * Math.cos(2 * (F - D)) +
      -0.00054 * p * Math.cos(M_ - 2 * D) +
      -0.0002 * p * Math.sin(M_ + F) +
      -0.0002 * p * Math.cos(M_ + 2 * F) +
      -0.0002 * p * Math.cos(M_ - F) +
      0.00014 * p * Math.cos(M_ + 2 * (F - D))
    this.σ = -0.02816 * p * Math.sin(M_) +
      0.02244 * p * Math.cos(F) +
      -0.00682 * p * Math.sin(M_ - 2 * F) +
      -0.00279 * p * Math.sin(2 * F) +
      -0.00083 * p * Math.sin(2 * (F - D)) +
      0.00069 * p * Math.sin(M_ - 2 * D) +
      0.0004 * p * Math.cos(M_ + F) +
      -0.00025 * p * Math.sin(2 * M_) +
      -0.00023 * p * Math.sin(M_ + 2 * F) +
      0.0002 * p * Math.cos(M_ - F) +
      0.00019 * p * Math.sin(M_ - F) +
      0.00013 * p * Math.sin(M_ + 2 * (F - D)) +
      -0.0001 * p * Math.cos(M_ - 3 * F)
    this.τ = 0.0252 * p * Math.sin(M) * E +
      0.00473 * p * Math.sin(2 * (M_ - F)) +
      -0.00467 * p * Math.sin(M_) +
      0.00396 * p * Math.sin(K1) +
      0.00276 * p * Math.sin(2 * (M_ - D)) +
      0.00196 * p * Math.sin(this.Ω) +
      -0.00183 * p * Math.cos(M_ - F) +
      0.00115 * p * Math.sin(M_ - 2 * D) +
      -0.00096 * p * Math.sin(M_ - D) +
      0.00046 * p * Math.sin(2 * (F - D)) +
      -0.00039 * p * Math.sin(M_ - F) +
      -0.00032 * p * Math.sin(M_ - M - D) +
      0.00027 * p * Math.sin(2 * (M_ - D) - M) +
      0.00023 * p * Math.sin(K2) +
      -0.00014 * p * Math.sin(2 * D) +
      0.00014 * p * Math.cos(2 * (M_ - F)) +
      -0.00012 * p * Math.sin(M_ - 2 * F) +
      -0.00012 * p * Math.sin(2 * M_) +
      0.00011 * p * Math.sin(2 * (M_ - M - D))
  }

  /**
   * lib() curiously serves for computing both librations and solar coordinates,
   * depending on the coordinates λ, β passed in.  Quantity A not described in
   * the book, but clearly depends on the λ, β of the current context and so
   * does not belong in the moon struct.  Instead just return it from optical
   * and pass it along to physical.
   */
  lib (λ, β) {
    let [l_, b_, A] = this.optical(λ, β)
    let [l$, b$] = this.physical(A, b_)
    let l = l_ + l$
    if (l > Math.PI) {
      l -= 2 * Math.PI
    }
    let b = b_ + b$
    return [l, b]
  }

  optical (λ, β) {
    // (53.1) p. 372
    let W = λ - this.Ω // (λ without nutation)
    let [sW, cW] = base.sincos(W)
    let [sβ, cβ] = base.sincos(β)
    let A = Math.atan2(sW * cβ * cI - sβ * sI, cW * cβ)
    let l_ = base.pmod(A - this.F, 2 * Math.PI)
    let b_ = Math.asin(-sW * cβ * sI - sβ * cI)
    return [l_, b_, A]
  }

  physical (A, b_) {
    // (53.2) p. 373
    let [sA, cA] = base.sincos(A)
    let l$ = -this.τ + (this.ρ * cA + this.σ * sA) * Math.tan(b_)
    let b$ = this.σ * cA - this.ρ * sA
    return [l$, b$]
  }

  pa (λ, β, b) {
    let V = this.Ω + this.Δψ + this.σ / sI
    let [sV, cV] = base.sincos(V)
    let [sIρ, cIρ] = base.sincos(_I + this.ρ)
    let X = sIρ * sV
    let Y = sIρ * cV * this.cε - cIρ * this.sε
    let ω = Math.atan2(X, Y)
    let ecl = new coord.Ecliptic(λ + this.Δψ, β).toEquatorial(this.ε) // eslint-disable-line no-unused-vars
    let P = Math.asin(Math.hypot(X, Y) * Math.cos(ecl.ra - ω) / Math.cos(b))
    if (P < 0) {
      P += 2 * Math.PI
    }
    return P
  }

  sun (λ, β, Δ, earth) {
    let {lon, lat, range} = solar.apparentVSOP87(earth, this.jde)  // eslint-disable-line no-unused-vars
    let ΔR = Δ / (range * base.AU)
    let λH = lon + Math.PI + ΔR * Math.cos(β) * Math.sin(lon - λ)
    let βH = ΔR * β
    return this.lib(λH, βH)
  }
}
M.Moon = Moon

/* commented out for lack of test data
M.Topocentric = function (jde, ρsφ_, ρcφ_, L) { // (jde, ρsφ_, ρcφ_, L float64)  (l, b, P float64)
  λ, β, Δ := moonposition.Position(jde) // (λ without nutation)
  Δψ, Δε := nutation.Nutation(jde)
  sε, cε := base.sincos(nutation.MeanObliquity(jde) + Δε)
  α, δ := coord.EclToEq(λ+Δψ, β, sε, cε)
  α, δ = parallax.Topocentric(α, δ, Δ/base.AU, ρsφ_, ρcφ_, L, jde)
  λ, β = coord.EqToEcl(α, δ, sε, cε)
  let m = newMoon(jde)
  l, b = m.lib(λ, β)
  P = m.pa(λ, β, b)
  return
}

M.TopocentricCorrections = function (jde, b, P, φ, δ, H, π) { // (jde, b, P, φ, δ, H, π float64)  (Δl, Δb, ΔP float64)
  sφ, cφ := base.sincos(φ)
  sH, cH := base.sincos(H)
  sδ, cδ := base.sincos(δ)
  let Q = Math.atan(cφ * sH / (cδ*sφ - sδ*cφ*cH))
  let z = Math.acos(sδ*sφ + cδ*cφ*cH)
  let π_ = π * (Math.sin(z) + 0.0084*Math.sin(2*z))
  sQP, cQP := base.sincos(Q - P)
  Δl = -π_ * sQP / Math.cos(b)
  Δb = π_ * cQP
  ΔP = Δl*Math.sin(b+Δb) - π_*Math.sin(Q)*Math.tan(δ)
  return
}
*/

/**
 * SunAltitude returns altitude of the Sun above the lunar horizon.
 *
 * @param {base.Coords} cOnMoon - selenographic longitude and latitude of a site on the Moon
 * @param {base.Coords} cSun - selenographic coordinates of the Sun (as returned by physical(), for example.)
 * @return altitude in radians.
 */
M.sunAltitude = function (cOnMoon, cSun) { // (η, θ, l0, b0 float64)  float64
  let c0 = Math.PI / 2 - cSun.lon
  let [sb0, cb0] = base.sincos(cSun.lat)
  let [sθ, cθ] = base.sincos(cOnMoon.lat)
  return Math.asin(sb0 * sθ + cb0 * cθ * Math.sin(c0 + cOnMoon.lon))
}

/**
 * Sunrise returns time of sunrise for a point on the Moon near the given date.
 *
 * @param {base.Coord} cOnMoon - selenographic longitude and latitude of a site on the Moon
 * @param {Number} jde - Julian ephemeris day
 * @param {planetposition.Planet} earth - VSOP87 Planet Earth
 * @return time of sunrise as a jde nearest the given jde.
 */
M.sunrise = function (cOnMoon, jde, earth) { // (η, θ, jde float64, earth *pp.V87Planet)  float64
  jde -= srCorr(cOnMoon, jde, earth)
  return jde - srCorr(cOnMoon, jde, earth)
}

/**
 * Sunset returns time of sunset for a point on the Moon near the given date.
 *
 * @param {base.Coords} cOnMoon - selenographic longitude and latitude of a site on the Moon
 * @param {Number} jde - Julian ephemeris day
 * @param {planetposition.Planet} earth - VSOP87 Planet Earth
 * @return time of sunset as a jde nearest the given jde.
 */
M.sunset = function (cOnMoon, jde, earth) { // (η, θ, jde float64, earth *pp.V87Planet)  float64
  jde += srCorr(cOnMoon, jde, earth)
  return jde + srCorr(cOnMoon, jde, earth)
}

/**
 * @private
 */
function srCorr (cOnMoon, jde, earth) {
  let phy = M.physical(jde, earth)
  let h = M.sunAltitude(cOnMoon, phy[2])
  return h / (12.19075 * p * Math.cos(cOnMoon.lat))
}

},{"./base":1,"./coord":2,"./moonposition":3,"./nutation":4,"./solar":6}]},{},[]);
