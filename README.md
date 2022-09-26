# DocSeek Backend

## Endpoints

### Auth
`POST auth/signup-doctor`: Sign up as a doctor

`POST auth/login-doctor`: Log in as a doctor

`POST auth/signup-patient`: Sign up as a patient

`POST auth/login-patient`: Log in as a patient

`POST auth/token`: Refresh access token

`POST password-reset`: Request a reset link

`POST password-reset/:userId/:token`: Use reset token and update password

### Doctor

`GET doctor/profile`: Get doctor's profile

`POST doctor/profile/save`: Save doctor's profile

`GET doctor/specialties`: Get list of specialties

`GET doctor/list`: Get list of all doctors

`POST doctor/timeslots`: Save doctor's timeslots

`POST doctor/rate`: Save doctor's consultation rate

`POST doctor/consultation/update`: Update consultation notes and prescription

`POST doctor/consultation/update-status`: Update consultation status

`GET doctor/consultation`: Get doctor's consultations

### Patient

`GET patient/profile`: Get patient's profile

`POST patient/profile/save`: Save patient's profile

`POST patient/consultation/new`: Request consultation with doctor

`GET patient/consultation`: Get patient's consultations

`GET patient/list`: Get list of all patients