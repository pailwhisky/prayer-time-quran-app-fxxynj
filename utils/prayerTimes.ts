
import * as Location from 'expo-location';

export interface PrayerTime {
  name: string;
  time: Date;
  arabicName: string;
  isNext: boolean;
}

export interface PrayerTimesData {
  fajr: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  location: string;
}

// Prayer calculation using simplified astronomical calculations
export class PrayerCalculator {
  private latitude: number;
  private longitude: number;

  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
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

  private static getTimeForAngle(
    julianDay: number,
    latitude: number,
    longitude: number,
    angle: number,
    isRise: boolean = true
  ): number {
    const declination = PrayerCalculator.getSunDeclination(julianDay);
    const latRad = PrayerCalculator.toRadians(latitude);
    
    const hourAngle = Math.acos(
      (Math.sin(PrayerCalculator.toRadians(angle)) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination))
    );
    
    const timeCorrection = 4 * (longitude - PrayerCalculator.toDegrees(hourAngle * (isRise ? -1 : 1)));
    const equationOfTime = 4 * (PrayerCalculator.toDegrees(
      0.0172 * Math.sin(2 * PrayerCalculator.toRadians((julianDay - 81) * 360 / 365))
    ));
    
    return 12 + timeCorrection / 60 + equationOfTime / 60;
  }

  getTodayPrayerTimes(date: Date = new Date()): PrayerTimesData {
    const julianDay = PrayerCalculator.getJulianDay(date);
    
    // Calculate prayer times using standard angles
    const fajrTime = PrayerCalculator.getTimeForAngle(julianDay, this.latitude, this.longitude, -18, true);
    const sunriseTime = PrayerCalculator.getTimeForAngle(julianDay, this.latitude, this.longitude, -0.833, true);
    const dhuhrTime = 12 - (4 * this.longitude) / 60; // Solar noon
    const asrTime = PrayerCalculator.getTimeForAngle(julianDay, this.latitude, this.longitude, -4, false); // Simplified Asr
    const maghribTime = PrayerCalculator.getTimeForAngle(julianDay, this.latitude, this.longitude, -0.833, false);
    const ishaTime = PrayerCalculator.getTimeForAngle(julianDay, this.latitude, this.longitude, -18, false);

    const createTimeFromHours = (hours: number): Date => {
      const result = new Date(date);
      result.setHours(Math.floor(hours), Math.floor((hours % 1) * 60), 0, 0);
      return result;
    };

    const fajrDate = createTimeFromHours(fajrTime);
    const dhuhrDate = createTimeFromHours(dhuhrTime);
    const asrDate = createTimeFromHours(asrTime);
    const maghribDate = createTimeFromHours(maghribTime);
    const ishaDate = createTimeFromHours(ishaTime);

    // Determine next prayer
    const now = new Date();
    const prayers = [
      { name: 'fajr', time: fajrDate },
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

  static calculatePrayerTimes(latitude: number, longitude: number, date: Date = new Date()): PrayerTimesData {
    const calculator = new PrayerCalculator(latitude, longitude);
    return calculator.getTodayPrayerTimes(date);
  }

  static getPrayerTimesList(prayerData: PrayerTimesData): PrayerTime[] {
    return [
      prayerData.fajr,
      prayerData.dhuhr,
      prayerData.asr,
      prayerData.maghrib,
      prayerData.isha,
    ];
  }
}

export const getQiblaDirection = (latitude: number, longitude: number): number => {
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
