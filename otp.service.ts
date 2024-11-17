import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private otpStore = new Map<string, { otp: string, timestamp: number, attempts: number }>();
  private otpValidityDuration = 60000;
  private maxAttempts = 10;

  constructor() { }

  generate_OTP_email(email: string) {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with timestamp
    this.otpStore.set(email, { otp, timestamp: Date.now(), attempts: 0 });

    // Simulate API response with delay
    return of({ otp }).pipe(delay(500)); // Simulate network delay
  }

  check_OTP(email: string, enteredOtp: string) {
    const otpData = this.otpStore.get(email);

    if (!otpData) {
      return throwError(() => new Error('OTP not found.'));
    }

    // Check if OTP has expired
    const currentTime = Date.now();
    if (currentTime - otpData.timestamp > this.otpValidityDuration) {
      this.otpStore.delete(email); // Remove expired OTP
      return throwError(() => new Error('OTP has expired.'));
    }

    // Check number of attempts
    if (otpData.attempts >= this.maxAttempts) {
      this.otpStore.delete(email); // Remove OTP after exceeding attempts
      return throwError(() => new Error('Maximum number of attempts reached.'));
    }

    // Check OTP validity
    if (otpData.otp === enteredOtp) {
      this.otpStore.delete(email); // Remove OTP after successful verification
      return of(true);
    } else {
      otpData.attempts++;
      return throwError(() => new Error('Invalid OTP.'));
    }
  }
}
