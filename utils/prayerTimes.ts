
import * as Location from 'expo-location';

export interface PrayerTime {
  name: string;
  time: Date;
  arabicName: string;
  isNext: boolean;
}

export interface PrayerTimesData {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  location: string;
}

// Prayer calculation using simplified astronomical calculations
export class PrayerCalculator {
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
    const g = this.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    return Math.asin(Math.sin(lambda) * Math.sin(this.toRadians(23.439)));
  }

  private static getTimeForAngle(
    julianDay: number,
    latitude: number,
    longitude: number,
    angle: number,
    isRise: boolean = true
  ): number {
    const declination = this.getSunDeclination(julianDay);
    const latRad = this.toRadians(latitude);
    
    const hourAngle = Math.acos(
      (Math.sin(this.toRadians(angle)) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination))
    );
    
    const timeCorrection = 4 * (longitude - this.toDegrees(hourAngle * (isRise ? -1 : 1)));
    const equationOfTime = 4 * (this.toDegrees(
      0.0172 * Math.sin(2 * this.toRadians((julianDay - 81) * 360 / 365))
    ));
    
    return 12 + timeCorrection / 60 + equationOfTime / 60;
  }

  static calculatePrayerTimes(latitude: number, longitude: number, date: Date = new Date()): PrayerTimesData {
    const julianDay = this.getJulianDay(date);
    
    // Calculate prayer times using standard angles
    const fajrTime = this.getTimeForAngle(julianDay, latitude, longitude, -18, true);
    const sunriseTime = this.getTimeForAngle(julianDay, latitude, longitude, -0.833, true);
    const dhuhrTime = 12 - (4 * longitude) / 60; // Solar noon
    const asrTime = this.getTimeForAngle(julianDay, latitude, longitude, -4, false); // Simplified Asr
    const maghribTime = this.getTimeForAngle(julianDay, latitude, longitude, -0.833, false);
    const ishaTime = this.getTimeForAngle(julianDay, latitude, longitude, -18, false);

    const createTimeFromHours = (hours: number): Date => {
      const result = new Date(date);
      result.setHours(Math.floor(hours), Math.floor((hours % 1) * 60), 0, 0);
      return result;
    };

    return {
      fajr: createTimeFromHours(fajrTime),
      dhuhr: createTimeFromHours(dhuhrTime),
      asr: createTimeFromHours(asrTime),
      maghrib: createTimeFromHours(maghribTime),
      isha: createTimeFromHours(ishaTime),
      location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    };
  }

  static getPrayerTimesList(prayerData: PrayerTimesData): PrayerTime[] {
    const now = new Date();
    const prayers: PrayerTime[] = [
      { name: 'Fajr', time: prayerData.fajr, arabicName: 'الفجر', isNext: false },
      { name: 'Dhuhr', time: prayerData.dhuhr, arabicName: 'الظهر', isNext: false },
      { name: 'Asr', time: prayerData.asr, arabicName: 'العصر', isNext: false },
      { name: 'Maghrib', time: prayerData.maghrib, arabicName: 'المغرب', isNext: false },
      { name: 'Isha', time: prayerData.isha, arabicName: 'العشاء', isNext: false },
    ];

    // Find next prayer
    let nextPrayerIndex = -1;
    for (let i = 0; i < prayers.length; i++) {
      if (prayers[i].time > now) {
        nextPrayerIndex = i;
        break;
      }
    }

    // If no prayer found for today, next prayer is Fajr tomorrow
    if (nextPrayerIndex === -1) {
      nextPrayerIndex = 0;
    }

    prayers[nextPrayerIndex].isNext = true;
    return prayers;
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
