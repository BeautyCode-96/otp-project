import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { OtpComponent } from './otp.component';
import { OtpService } from './otp.service';

describe('OtpComponent', () => {
  let component: OtpComponent;
  let fixture: ComponentFixture<OtpComponent>;
  let otpService: OtpService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [ OtpService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpComponent);
    component = fixture.componentInstance;
    otpService = TestBed.inject(OtpService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message when email is invalid', () => {
    component.otpForm.get('email')?.setValue('invalid-email');
    component.otpForm.get('email')?.markAsTouched();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.text-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('Invalid email format.');
  });

  it('should call sendOtp and show success message on successful OTP send', () => {
    spyOn(otpService, 'generate_OTP_email').and.returnValue(of({ otp: '123456' }));
    component.otpForm.get('email')?.setValue('test@dso.org.sg');
    component.onSendOtp();
    fixture.detectChanges();

    expect(otpService.generate_OTP_email).toHaveBeenCalled();
    const successMsg = fixture.debugElement.query(By.css('.alert-success')).nativeElement;
    expect(successMsg.textContent).toContain('OTP has been sent successfully.');
  });

  it('should call verifyOtp and show success message on valid OTP', () => {
    spyOn(otpService, 'check_OTP').and.returnValue(of(true));
    component.otpForm.get('email')?.setValue('test@dso.org.sg');
    component.otpForm.get('otp')?.setValue('123456');
    component.otpSent = true;
    component.onVerifyOtp();
    fixture.detectChanges();

    expect(otpService.check_OTP).toHaveBeenCalled();
    const successMsg = fixture.debugElement.query(By.css('.alert-success')).nativeElement;
    expect(successMsg.textContent).toContain('OTP is valid!');
  });

  it('should show error message on invalid OTP', () => {
    spyOn(otpService, 'check_OTP').and.returnValue(throwError(() => new Error('Invalid OTP.')));
    component.otpForm.get('email')?.setValue('test@dso.org.sg');
    component.otpForm.get('otp')?.setValue('654321');
    component.otpSent = true;
    component.onVerifyOtp();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.alert-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('Invalid OTP. Please try again.');
  });

  it('should show error message when maximum attempts reached', () => {
    spyOn(otpService, 'check_OTP').and.returnValue(throwError(() => new Error('Maximum number of attempts reached.')));
    component.otpForm.get('email')?.setValue('test@dso.org.sg');
    component.otpForm.get('otp')?.setValue('123456');
    component.otpSent = true;
    component.onVerifyOtp();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.alert-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('Maximum number of attempts reached. Please try again later.');
  });

  it('should show error message when OTP has expired', () => {
    spyOn(otpService, 'check_OTP').and.returnValue(throwError(() => new Error('OTP has expired.')));
    component.otpForm.get('email')?.setValue('test@dso.org.sg');
    component.otpForm.get('otp')?.setValue('123456');
    component.otpSent = true;
    component.onVerifyOtp();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.alert-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('OTP has expired. Please request a new one.');
  });

  it('should reset form after successful verification', () => {
    spyOn(otpService, 'check_OTP').and.returnValue(of(true));
    component.otpForm.get('email')?.setValue('test@dso.org.sg');
    component.otpForm.get('otp')?.setValue('123456');
    component.otpSent = true;
    component.onVerifyOtp();
    fixture.detectChanges();

    expect(component.otpForm.get('email')?.value).toBe('');
    expect(component.otpForm.get('otp')?.value).toBe('');
    expect(component.otpSent).toBeFalse();
  });

  it('should handle email blur event', () => {
    component.onEmailBlur();
    expect(component.submitted).toBeTrue();
  });

  it('should show error message if email is required and empty', () => {
    component.otpForm.get('email')?.setValue('');
    component.otpForm.get('email')?.markAsTouched();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.text-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('Email is required.');
  });

  it('should show error message if OTP is required and empty', () => {
    component.otpForm.get('otp')?.setValue('');
    component.otpForm.get('otp')?.markAsTouched();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.text-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('OTP is required.');
  });

  it('should show error message if OTP format is incorrect', () => {
    component.otpForm.get('otp')?.setValue('12345a');
    component.otpForm.get('otp')?.markAsTouched();
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.text-danger')).nativeElement;
    expect(errorMsg.textContent).toContain('OTP must be a 6-digit number.');
  });
});
