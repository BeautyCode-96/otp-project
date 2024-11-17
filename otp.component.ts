import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { OtpService } from './otp.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent {
  otpForm: FormGroup;
  otpSent = false; // Flag to track if OTP has been sent
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

   messageTimeout: any;

  constructor(private fb: FormBuilder, private otpService: OtpService) {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  get emailControl(): AbstractControl | null {
    return this.otpForm.get('email');
  }

  get otpControl(): AbstractControl | null {
    return this.otpForm.get('otp');
  }

  emailDomainValidator(control: AbstractControl) {
    const domain = control.value.split('@')[1];
    if (domain !== 'dso.org.sg') {
      return { domainInvalid: true };
    }
    return null;
  }

   showMessage(message: string, isError: boolean, resetAfterDelay: boolean = false) {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    if (isError) {
      this.errorMessage = message;
      this.successMessage = null;
    } else {
      this.successMessage = message;
      this.errorMessage = null;
    }

    if (resetAfterDelay) {
      this.messageTimeout = setTimeout(() => {
        this.errorMessage = null;
        this.successMessage = null;
      }, 2000); // Clear messages after 2 seconds
    }
  }

  onEmailBlur() {
    this.submitted = true;
  }

  onSendOtp() {
    this.submitted = true;

    if (this.otpForm.get('email')?.invalid) {
      return;
    }

    const email = this.otpForm.get('email')?.value;

    this.otpService.generate_OTP_email(email).subscribe({
      next: (response: any) => {
        // Handle success
        
        // alert(`Your OTP code is: ${response.otp}. Your code is valid for 1 minute.`);


        //consoling the otp email body
        console.log("Your OTP code is:" +response.otp+". Your code is valid for 1 minute.")

        this.otpSent = true; // OTP is now sent
        this.showMessage('OTP has been sent successfully.', false);
      },
      error: (err: any) => {
        // Handle error
        this.showMessage('Failed to send OTP. Please try again later.', true);
        console.error(err);
      }
    });
  }

  onVerifyOtp() {
    this.submitted = true;

    if (this.otpForm.invalid) {
      return;
    }

    const email = this.otpForm.get('email')?.value;
    const enteredOtp = this.otpForm.get('otp')?.value;

    this.otpService.check_OTP(email, enteredOtp).subscribe({
      next: (isValid: any) => {
        if (isValid) {
          this.showMessage('OTP is valid!', false, true);
          this.resetForm();
        } else {
          this.showMessage('Invalid OTP. Please try again.', true, true);
        }
      },
      error: (err: any) => {
        if (err.message.includes('Maximum number of attempts reached')) {
          this.showMessage('Maximum number of attempts reached. Please try again later.', true, true);
          this.resetForm();
        } 
        else if (err.message.includes('OTP has expired')) {
          this.showMessage('OTP has expired. Please request a new one.', true, true);
}
else{
  this.showMessage('Invalid OTP. Please try again.', true, true);

}
console.error(err);
      }
    });
  }

   resetForm() {
    // Reset the form to its initial state
    this.otpForm.reset({
      email: '',
      otp: ''
    });
    this.otpSent = false;
    this.submitted = false;
  }
}
