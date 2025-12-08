
import * as Location from 'expo-location';

export interface PrayerTime {
  name: string;
  time: Date;
  arabicName: string;
  isNext: boolean;
}

export interface PrayerTimesData {
  fajr: PrayerTime;
  sunrise: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  location: string;
}

// Calculation method configurations
export interface CalculationMethod {
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  ishaMinutes?: number; // For methods using minutes after maghrib
}

export const CALCULATION_METHODS: Record<string, CalculationMethod> = {
  MWL: { name: 'Muslim World League', fajrAngle: 18, ishaAngle: 17 },
  ISNA: { name: 'Islamic Society of North America', fajrAngle: 15, ishaAngle: 15 },
  EGYPT: { name: 'Egyptian General Authority', fajrAngle: 19.5, ishaAngle: 17.5 },
  KARACHI: { name: 'University of Islamic Sciences, Karachi', fajrAngle: 18, ishaAngle: 18 },
  UMMALQURA: { name: 'Umm al-Qura University, Makkah', fajrAngle: 18.5, ishaAngle: 0, ishaMinutes: 90 },
};

export type AsrMethod = 'SHAFI' | 'HANAFI';

// Prayer calculation using astronomical calculations
export class PrayerCalculator {
  private latitude: number;
  private longitude: number;
  private calculationMethod: CalculationMethod;
  private asrMethod: AsrMethod;

  // Cache for prayer times - keyed by lat_lng_date
  private static cache = new Map<string, { data: PrayerTimesData; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    latitude: number,
    longitude: number,
    calculationMethod: CalculationMethod = CALCULATION_METHODS.MWL,
    asrMethod: AsrMethod = 'SHAFI'
  ) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.calculationMethod = calculationMethod;
    this.asrMethod = asrMethod;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  private static getJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;

    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
      Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  private static getSunDeclination(julianDay: number): number {
    const n = julianDay - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = PrayerCalculator.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = PrayerCalculator.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));

    return Math.asin(Math.sin(lambda) * Math.sin(PrayerCalculator.toRadians(23.439)));
  }

  private static getEquationOfTime(julianDay: number): number {
    const n = julianDay - 2451545.0;
    const L = PrayerCalculator.toRadians((280.460 + 0.9856474 * n) % 360);
    const g = PrayerCalculator.toRadians((357.528 + 0.9856003 * n) % 360);

    // Approximation of equation of time in minutes
    const eot = 4 * PrayerCalculator.toDegrees(
      0.0172 * Math.sin(2 * L) - 0.0001 * Math.sin(4 * L) -
      0.0328 * Math.sin(g) + 0.0004 * Math.sin(2 * g)
    );

    return eot;
  }

  /**
   * Calculate time for a given sun angle
   * Returns null if the sun never reaches this angle (polar regions)
   */
  private static getTimeForAngle(
    julianDay: number,
    latitude: number,
    longitude: number,
    angle: number,
    isRise: boolean = true
  ): number | null {
    // Validate input parameters
    if (!isFinite(latitude) || !isFinite(longitude) || !isFinite(julianDay) || !isFinite(angle)) {
      console.warn('⚠️ Invalid parameters for prayer time calculation');
      return null;
    }

    const declination = PrayerCalculator.getSunDeclination(julianDay);
    const latRad = PrayerCalculator.toRadians(latitude);
    const angleRad = PrayerCalculator.toRadians(angle);

    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sinDec = Math.sin(declination);
    const cosDec = Math.cos(declination);

    // Calculate the hour angle
    const cosHourAngle = (Math.sin(angleRad) - sinLat * sinDec) / (cosLat * cosDec);

    // Check for polar regions where sun doesn't reach this angle
    if (cosHourAngle < -1 || cosHourAngle > 1) {
      console.warn(`⚠️ Sun doesn't reach ${angle}° at latitude ${latitude}° today`);
      return null;
    }

    const hourAngle = Math.acos(cosHourAngle);
    const hourAngleDeg = PrayerCalculator.toDegrees(hourAngle);

    // Calculate solar noon (Dhuhr) in hours
    const eot = PrayerCalculator.getEquationOfTime(julianDay);
    const solarNoon = 12 - (longitude / 15) - (eot / 60);

    // Calculate time based on whether it's sunrise or sunset type
    const time = isRise
      ? solarNoon - (hourAngleDeg / 15)
      : solarNoon + (hourAngleDeg / 15);

    // Validate result
    if (!isFinite(time)) {
      console.warn('⚠️ Calculated time is not finite');
      return null;
    }

    return time;
  }

  /**
   * Calculate Asr time using shadow length formula
   * Shafi/Hanbali/Maliki: shadow = object height + noon shadow
   * Hanafi: shadow = 2 * object height + noon shadow
   */
  private calculateAsrTime(julianDay: number, date: Date): number | null {
    const declination = PrayerCalculator.getSunDeclination(julianDay);
    const latRad = PrayerCalculator.toRadians(this.latitude);

    // Shadow factor: 1 for Shafi, 2 for Hanafi
    const shadowFactor = this.asrMethod === 'HANAFI' ? 2 : 1;

    // Calculate sun altitude at noon
    const noonAltitude = Math.abs(latRad - declination);

    // Calculate Asr angle
    const asrAltitude = Math.atan(1 / (shadowFactor + Math.tan(noonAltitude)));
    const asrAngle = PrayerCalculator.toDegrees(asrAltitude);

    return PrayerCalculator.getTimeForAngle(
      julianDay,
      this.latitude,
      this.longitude,
      asrAngle,
      false
    );
  }

  /**
   * Calculate Dhuhr (solar noon) time
   */
  private calculateDhuhrTime(julianDay: number): number {
    const eot = PrayerCalculator.getEquationOfTime(julianDay);
    return 12 - (this.longitude / 15) - (eot / 60);
  }

  /**
   * Create a Date object from hours (with validation)
   */
  private createTimeFromHours(hours: number | null, date: Date, fallbackHours?: number): Date {
    const result = new Date(date);

    if (hours === null || !isFinite(hours)) {
      // Use fallback if provided, otherwise use midnight
      const h = fallbackHours ?? 0;
      result.setHours(Math.floor(h), Math.floor((h % 1) * 60), 0, 0);
    } else {
      // Normalize hours to 0-24 range
      let normalizedHours = hours;
      while (normalizedHours < 0) normalizedHours += 24;
      while (normalizedHours >= 24) normalizedHours -= 24;

      result.setHours(Math.floor(normalizedHours), Math.floor((normalizedHours % 1) * 60), 0, 0);
    }

    return result;
  }

  getTodayPrayerTimes(date: Date = new Date()): PrayerTimesData {
    const julianDay = PrayerCalculator.getJulianDay(date);

    // Calculate prayer times using configured angles
    const fajrTime = PrayerCalculator.getTimeForAngle(
      julianDay, this.latitude, this.longitude,
      -this.calculationMethod.fajrAngle, true
    );

    const sunriseTime = PrayerCalculator.getTimeForAngle(
      julianDay, this.latitude, this.longitude,
      -0.833, true // Standard sunrise angle
    );

    const dhuhrTime = this.calculateDhuhrTime(julianDay);

    const asrTime = this.calculateAsrTime(julianDay, date);

    const maghribTime = PrayerCalculator.getTimeForAngle(
      julianDay, this.latitude, this.longitude,
      -0.833, false // Standard sunset angle
    );

    let ishaTime: number | null;
    if (this.calculationMethod.ishaMinutes) {
      // For methods like Umm al-Qura that use minutes after maghrib
      ishaTime = maghribTime !== null
        ? maghribTime + (this.calculationMethod.ishaMinutes / 60)
        : null;
    } else {
      ishaTime = PrayerCalculator.getTimeForAngle(
        julianDay, this.latitude, this.longitude,
        -this.calculationMethod.ishaAngle, false
      );
    }

    // Create Date objects with fallback handling for polar regions
    const fajrDate = this.createTimeFromHours(fajrTime, date, 5);     // Fallback: 5:00 AM
    const sunriseDate = this.createTimeFromHours(sunriseTime, date, 6); // Fallback: 6:00 AM
    const dhuhrDate = this.createTimeFromHours(dhuhrTime, date, 12);  // Fallback: 12:00 PM
    const asrDate = this.createTimeFromHours(asrTime, date, 15);      // Fallback: 3:00 PM
    const maghribDate = this.createTimeFromHours(maghribTime, date, 18); // Fallback: 6:00 PM
    const ishaDate = this.createTimeFromHours(ishaTime, date, 20);    // Fallback: 8:00 PM

    // Determine next prayer
    const now = new Date();
    const prayers = [
      { name: 'fajr', time: fajrDate },
      { name: 'sunrise', time: sunriseDate },
      { name: 'dhuhr', time: dhuhrDate },
      { name: 'asr', time: asrDate },
      { name: 'maghrib', time: maghribDate },
      { name: 'isha', time: ishaDate },
    ];

    let nextPrayerName = 'fajr'; // Default to fajr if all prayers have passed
    for (const prayer of prayers) {
      if (prayer.time > now) {
        nextPrayerName = prayer.name;
        break;
      }
    }

    return {
      fajr: {
        name: 'Fajr',
        time: fajrDate,
        arabicName: 'الفجر',
        isNext: nextPrayerName === 'fajr',
      },
      sunrise: {
        name: 'Sunrise',
        time: sunriseDate,
        arabicName: 'الشروق',
        isNext: nextPrayerName === 'sunrise',
      },
      dhuhr: {
        name: 'Dhuhr',
        time: dhuhrDate,
        arabicName: 'الظهر',
        isNext: nextPrayerName === 'dhuhr',
      },
      asr: {
        name: 'Asr',
        time: asrDate,
        arabicName: 'العصر',
        isNext: nextPrayerName === 'asr',
      },
      maghrib: {
        name: 'Maghrib',
        time: maghribDate,
        arabicName: 'المغرب',
        isNext: nextPrayerName === 'maghrib',
      },
      isha: {
        name: 'Isha',
        time: ishaDate,
        arabicName: 'العشاء',
        isNext: nextPrayerName === 'isha',
      },
      location: `${this.latitude.toFixed(2)}, ${this.longitude.toFixed(2)}`,
    };
  }

  /**
   * Static method with caching for prayer time calculation
   */
  static calculatePrayerTimes(
    latitude: number,
    longitude: number,
    date: Date = new Date(),
    calculationMethod: CalculationMethod = CALCULATION_METHODS.MWL,
    asrMethod: AsrMethod = 'SHAFI'
  ): PrayerTimesData {
    // Validate input
    if (!isFinite(latitude) || !isFinite(longitude)) {
      console.error('❌ Invalid coordinates provided');
      // Return fallback times
      const fallbackCalc = new PrayerCalculator(0, 0, calculationMethod, asrMethod);
      return fallbackCalc.getTodayPrayerTimes(date);
    }

    // Create cache key
    const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${date.toDateString()}_${calculationMethod.name}_${asrMethod}`;

    // Check cache
    const cached = PrayerCalculator.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < PrayerCalculator.CACHE_TTL) {
      console.log('📦 Using cached prayer times');
      return cached.data;
    }

    // Calculate fresh
    console.log('🔄 Calculating fresh prayer times');
    const calculator = new PrayerCalculator(latitude, longitude, calculationMethod, asrMethod);
    const result = calculator.getTodayPrayerTimes(date);

    // Store in cache
    PrayerCalculator.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Clean old cache entries (keep only last 10)
    if (PrayerCalculator.cache.size > 10) {
      const oldestKey = PrayerCalculator.cache.keys().next().value;
      if (oldestKey) PrayerCalculator.cache.delete(oldestKey);
    }

    return result;
  }

  /**
   * Clear the prayer times cache
   */
  static clearCache(): void {
    PrayerCalculator.cache.clear();
    console.log('🗑️ Prayer times cache cleared');
  }

  static getPrayerTimesList(prayerData: PrayerTimesData): PrayerTime[] {
    return [
      prayerData.fajr,
      prayerData.sunrise,
      prayerData.dhuhr,
      prayerData.asr,
      prayerData.maghrib,
      prayerData.isha,
    ];
  }
}

/**
 * Calculate Qibla direction from a given location
 * @returns Bearing in degrees from North (0-360)
 */
export const getQiblaDirection = (latitude: number, longitude: number): number => {
  // Validate inputs
  if (!isFinite(latitude) || !isFinite(longitude)) {
    console.warn('⚠️ Invalid coordinates for Qibla calculation');
    return 0;
  }

  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  const lat1 = PrayerCalculator['toRadians'](latitude);
  const lat2 = PrayerCalculator['toRadians'](kaabaLat);
  const deltaLng = PrayerCalculator['toRadians'](kaabaLng - longitude);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let bearing = Math.atan2(y, x);
  bearing = PrayerCalculator['toDegrees'](bearing);
  bearing = (bearing + 360) % 360;

  return bearing;
};
