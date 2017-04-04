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

},{}],"/moonphase":[function(require,module,exports){
/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module moonphase
 */
/**
 * Moonphase: Chapter 49, Phases of the Moon
 */

const base = require('./base')
const M = exports

const ck = 1 / 1236.85

/**
 * mean synodial lunar month
 */
M.meanLunarMonth = 29.530588861

// (49.1) p. 349
function mean (T) {
  return base.horner(T, 2451550.09766, 29.530588861 / ck,
    0.00015437, -0.00000015, 0.00000000073)
}

/** snap returns k at specified quarter q nearest year y. */
function snap (y, q) {
  let k = (y - 2000) * 12.3685 // (49.2) p. 350
  return Math.floor(k - q + 0.5) + q
}

/**
 * MeanNew returns the jde of the mean New Moon nearest the given datthis.
 * The mean date is within 0.5 day of the true date of New Moon.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.meanNew = function (year) {
  return mean(snap(year, 0) * ck)
}

/**
 * MeanFirst returns the jde of the mean First Quarter Moon nearest the given datthis.
 * The mean date is within 0.5 day of the true date of First Quarter Moon.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.meanFirst = function (year) {
  return mean(snap(year, 0.25) * ck)
}

/**
 * MeanFull returns the jde of the mean Full Moon nearest the given datthis.
 * The mean date is within 0.5 day of the true date of Full Moon.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.meanFull = function (year) {
  return mean(snap(year, 0.5) * ck)
}

/**
 * MeanLast returns the jde of the mean Last Quarter Moon nearest the given datthis.
 * The mean date is within 0.5 day of the true date of Last Quarter Moon.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.meanLast = function (year) {
  return mean(snap(year, 0.75) * ck)
}

/**
 * New returns the jde of New Moon nearest the given date.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.new = function (year) {
  let m = new Mp(year, 0)
  return mean(m.T) + m.nfc(nc) + m.a()
}

/**
 * First returns the jde of First Quarter Moon nearest the given datthis.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.first = function (year, month, day) {
  let m = new Mp(year, 0.25)
  return mean(m.T) + m.flc() + m.w() + m.a()
}

/**
 * Full returns the jde of Full Moon nearest the given datthis.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.full = function (year, month, day) {
  let m = new Mp(year, 0.5)
  return mean(m.T) + m.nfc(fc) + m.a()
}

/**
 * Last returns the jde of Last Quarter Moon nearest the given datthis.
 *
 * @param {Number} year - decimal year
 * @returns {Number} jde
 */
M.last = function (year, month, day) {
  let m = new Mp(year, 0.75)
  return mean(m.T) + m.flc() - m.w() + m.a()
}

const p = Math.PI / 180

class Mp {
  constructor (y, q) {
    this.A = new Array(14)
    this.k = snap(y, q)
    this.T = this.k * ck // (49.3) p. 350
    this.E = base.horner(this.T, 1, -0.002516, -0.0000074)
    this.M = base.horner(this.T, 2.5534 * p, 29.1053567 * p / ck, -0.0000014 * p, -0.00000011 * p)
    this.M_ = base.horner(this.T, 201.5643 * p, 385.81693528 * p / ck,
      0.0107582 * p, 0.00001238 * p, -0.000000058 * p)
    this.F = base.horner(this.T, 160.7108 * p, 390.67050284 * p / ck, -0.0016118 * p, -0.00000227 * p, 0.000000011 * p)
    this.Ω = base.horner(this.T, 124.7746 * p, -1.56375588 * p / ck,
      0.0020672 * p, 0.00000215 * p)
    this.A[0] = 299.7 * p + 0.107408 * p * this.k - 0.009173 * this.T * this.T
    this.A[1] = 251.88 * p + 0.016321 * p * this.k
    this.A[2] = 251.83 * p + 26.651886 * p * this.k
    this.A[3] = 349.42 * p + 36.412478 * p * this.k
    this.A[4] = 84.66 * p + 18.206239 * p * this.k
    this.A[5] = 141.74 * p + 53.303771 * p * this.k
    this.A[6] = 207.17 * p + 2.453732 * p * this.k
    this.A[7] = 154.84 * p + 7.30686 * p * this.k
    this.A[8] = 34.52 * p + 27.261239 * p * this.k
    this.A[9] = 207.19 * p + 0.121824 * p * this.k
    this.A[10] = 291.34 * p + 1.844379 * p * this.k
    this.A[11] = 161.72 * p + 24.198154 * p * this.k
    this.A[12] = 239.56 * p + 25.513099 * p * this.k
    this.A[13] = 331.55 * p + 3.592518 * p * this.k
  }

  // new or full corrections
  nfc (c) {
    return c[0] * Math.sin(this.M_) +
      c[1] * Math.sin(this.M) * this.E +
      c[2] * Math.sin(2 * this.M_) +
      c[3] * Math.sin(2 * this.F) +
      c[4] * Math.sin(this.M_ - this.M) * this.E +
      c[5] * Math.sin(this.M_ + this.M) * this.E +
      c[6] * Math.sin(2 * this.M) * this.E * this.E +
      c[7] * Math.sin(this.M_ - 2 * this.F) +
      c[8] * Math.sin(this.M_ + 2 * this.F) +
      c[9] * Math.sin(2 * this.M_ + this.M) * this.E +
      c[10] * Math.sin(3 * this.M_) +
      c[11] * Math.sin(this.M + 2 * this.F) * this.E +
      c[12] * Math.sin(this.M - 2 * this.F) * this.E +
      c[13] * Math.sin(2 * this.M_ - this.M) * this.E +
      c[14] * Math.sin(this.Ω) +
      c[15] * Math.sin(this.M_ + 2 * this.M) +
      c[16] * Math.sin(2 * (this.M_ - this.F)) +
      c[17] * Math.sin(3 * this.M) +
      c[18] * Math.sin(this.M_ + this.M - 2 * this.F) +
      c[19] * Math.sin(2 * (this.M_ + this.F)) +
      c[20] * Math.sin(this.M_ + this.M + 2 * this.F) +
      c[21] * Math.sin(this.M_ - this.M + 2 * this.F) +
      c[22] * Math.sin(this.M_ - this.M - 2 * this.F) +
      c[23] * Math.sin(3 * this.M_ + this.M) +
      c[24] * Math.sin(4 * this.M_)
  }

  // first or last corrections
  flc () {
    return -0.62801 * Math.sin(this.M_) +
      0.17172 * Math.sin(this.M) * this.E +
      -0.01183 * Math.sin(this.M_ + this.M) * this.E +
      0.00862 * Math.sin(2 * this.M_) +
      0.00804 * Math.sin(2 * this.F) +
      0.00454 * Math.sin(this.M_ - this.M) * this.E +
      0.00204 * Math.sin(2 * this.M) * this.E * this.E +
      -0.0018 * Math.sin(this.M_ - 2 * this.F) +
      -0.0007 * Math.sin(this.M_ + 2 * this.F) +
      -0.0004 * Math.sin(3 * this.M_) +
      -0.00034 * Math.sin(2 * this.M_ - this.M) +
      0.00032 * Math.sin(this.M + 2 * this.F) * this.E +
      0.00032 * Math.sin(this.M - 2 * this.F) * this.E +
      -0.00028 * Math.sin(this.M_ + 2 * this.M) * this.E * this.E +
      0.00027 * Math.sin(2 * this.M_ + this.M) * this.E +
      -0.00017 * Math.sin(this.Ω) +
      -0.00005 * Math.sin(this.M_ - this.M - 2 * this.F) +
      0.00004 * Math.sin(2 * this.M_ + 2 * this.F) +
      -0.00004 * Math.sin(this.M_ + this.M + 2 * this.F) +
      0.00004 * Math.sin(this.M_ - 2 * this.M) +
      0.00003 * Math.sin(this.M_ + this.M - 2 * this.F) +
      0.00003 * Math.sin(3 * this.M) +
      0.00002 * Math.sin(2 * this.M_ - 2 * this.F) +
      0.00002 * Math.sin(this.M_ - this.M + 2 * this.F) +
      -0.00002 * Math.sin(3 * this.M_ + this.M)
  }

  w () {
    return 0.00306 -
      0.00038 * this.E * Math.cos(this.M) +
      0.00026 * Math.cos(this.M_) -
      0.00002 * (Math.cos(this.M_ - this.M) -
        Math.cos(this.M_ + this.M) -
        Math.cos(2 * this.F)
      )
  }

  // additional corrections
  a () {
    let a = 0
    ac.forEach((c, i) => {
      a += c * Math.sin(this.A[i])
    })
    return a
  }
}

// new coefficients
var nc = [
  -0.4072, 0.17241, 0.01608, 0.01039, 0.00739,
  -0.00514, 0.00208, -0.00111, -0.00057, 0.00056,
  -0.00042, 0.00042, 0.00038, -0.00024, -0.00017,
  -0.00007, 0.00004, 0.00004, 0.00003, 0.00003,
  -0.00003, 0.00003, -0.00002, -0.00002, 0.00002
]

// full coefficients
var fc = [
  -0.40614, 0.17302, 0.01614, 0.01043, 0.00734,
  -0.00515, 0.00209, -0.00111, -0.00057, 0.00056,
  -0.00042, 0.00042, 0.00038, -0.00024, -0.00017,
  -0.00007, 0.00004, 0.00004, 0.00003, 0.00003,
  -0.00003, 0.00003, -0.00002, -0.00002, 0.00002
]

// additional corrections
var ac = [
  0.000325, 0.000165, 0.000164, 0.000126, 0.00011,
  0.000062, 0.00006, 0.000056, 0.000047, 0.000042,
  0.000040, 0.000037, 0.000035, 0.000023
]

},{"./base":1}]},{},[]);
