import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { auth, database } from './firebaseConfig';
import { FcGoogle } from 'react-icons/fc';
import { HiMail } from 'react-icons/hi';
import {
  FaUser,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaUniversity,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaCalendarAlt
} from 'react-icons/fa';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,

} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const Login = ({ closeModal }) => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showGoogleSignupForm, setShowGoogleSignupForm] = useState(false);
  // const [googleEmail, setGoogleEmail] = useState('');
  // const [googleName, setGoogleName] = useState('');
  const [formData, setFormData] = useState({
    fullname: '',
    facultyName: '',
    collegeName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeEmail: '',
    department: '',
    year: '',
    phoneNumber: '',
    location: '',
    collegeLocation: ''
  });

  const departmentOptions = [
    'CSE',
    'ECE',
    'EEE',
    'IT',
    'CSD',
    'CAI',
    'CSM',
    'MECH',
    'CIVIL'
  ];

  const yearOptions = [
    '1st year',
    '2nd year',
    '3rd year',
    '4th year'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Password validation
    if (name === 'password') {
      const error = validatePassword(value);
      setPasswordError(error);

      // Check password match if confirm password is not empty
      if (formData.confirmPassword) {
        setConfirmPasswordError(
          value !== formData.confirmPassword ? 'Passwords do not match' : ''
        );
      }
    }

    // Confirm password validation
    if (name === 'confirmPassword') {
      setConfirmPasswordError(
        value !== formData.password ? 'Passwords do not match' : ''
      );
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    if (e.target.value === 'student') {
      setFormData({
        ...formData,
        facultyName: '',
        collegeName: '',
        collegeEmail: '',
      });
    } else {
      setFormData({
        ...formData,
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const checkAuthAndDatabaseEmail = async (email) => {
    try {
      // Check if email exists in Firebase Authentication
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      const existsInAuth = signInMethods.length > 0;

      // Check in Students
      const studentRef = ref(database, 'Users/Students');
      const studentSnapshot = await get(studentRef);
      const studentData = studentSnapshot.val() || {};

      // Check in College Representatives
      const collegeRef = ref(database, 'Users/College');
      const collegeSnapshot = await get(collegeRef);
      const collegeData = collegeSnapshot.val() || {};

      // Check if email exists in database
      const studentExists = Object.values(studentData).some(user => user.email === email);
      const collegeExists = Object.values(collegeData).some(user => user.collegeEmail === email);

      return {
        existsInAuth,
        existsInDatabase: studentExists || collegeExists
      };
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();

    // Validation for each step
    if (currentStep === 1) {
      if (!formData.email || (selectedRole === '' || selectedRole === undefined)) {
        alert('Please fill in all fields');
        return;
      }
    }

    if (selectedRole === 'student') {
      if (currentStep === 2 && (!formData.fullname || !formData.phoneNumber)) {
        alert('Please fill in all fields');
        return;
      }
      if (currentStep === 3 && (!formData.department || !formData.year)) {
        alert('Please fill in all fields');
        return;
      }
      if (currentStep === 4 && (!formData.phoneNumber || !formData.location)) {
        alert('Please fill in all fields');
        return;
      }
    } else {
      if (currentStep === 2 && (!formData.facultyName || !formData.collegeName)) {
        alert('Please fill in all fields');
        return;
      }
      if (currentStep === 3 && (!formData.phoneNumber || !formData.collegeLocation)) {
        alert('Please fill in all fields');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  // Function to handle previous step
  const handlePreviousStep = (e) => {
    e.preventDefault();
    setCurrentStep(currentStep - 1);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const checkEmailExistsInDatabase = async (email) => {
    try {
      // Check in Students
      const studentRef = ref(database, 'Users/Students');
      const studentSnapshot = await get(studentRef);
      const studentExists = Object.values(studentSnapshot.val() || {}).some(
        student => student.email === email
      );

      // Check in College Representatives
      const collegeRef = ref(database, 'Users/College');
      const collegeSnapshot = await get(collegeRef);
      const collegeExists = Object.values(collegeSnapshot.val() || {}).some(
        college => college.collegeEmail === email
      );

      // Check in Admin Requests
      const adminRequestRef = ref(database, 'AdminRequests');
      const adminRequestSnapshot = await get(adminRequestRef);
      const adminRequestExists = Object.values(adminRequestSnapshot.val() || {}).some(
        request => request.collegeEmail === email
      );

      return studentExists || collegeExists || adminRequestExists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Realtime Database
      const studentRef = ref(database, `Users/Students/${user.uid}`);
      const collegeRef = ref(database, `Users/College/${user.uid}`);
      const [studentSnapshot, collegeSnapshot] = await Promise.all([
        get(studentRef),
        get(collegeRef)
      ]);

      // If user exists in database, proceed with login
      if (studentSnapshot.exists() || collegeSnapshot.exists()) {
        if (studentSnapshot.exists()) {
          closeModal();
          console.log('Logged in as student successfully');
        } else {
          navigate(collegeSnapshot.val().superAdmin ? '/super-admin-home' : '/');
          closeModal();
        }
      } else {
        // Check if email exists in any other records
        const emailExists = await checkEmailExistsInDatabase(user.email);
        if (emailExists) {
          await auth.signOut();
          alert('This email is already registered. Please use a different email or login with your existing account.');
          return;
        }

        // Set form data with Google user info
        setFormData(prev => ({
          ...prev,
          email: user.email,
          fullname: user.displayName || '',
          collegeEmail: user.email // For college representative flow
        }));

        // Show the signup form with pre-filled Google data
        setShowSignup(true);
        setShowGoogleSignupForm(true);
        setCurrentStep(1); // Start at role selection
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      alert('Google sign in failed. Please try again.');
    }
  };

  const handleGoogleFormSubmit = async (e) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser; // Get the current Google-authenticated user

      if (!user) {
        alert('Please sign in with Google again.');
        return;
      }

      if (selectedRole === 'student') {
        // Check if this specific email exists as a student
        const studentQuery = ref(database, 'Users/Students');
        const studentSnapshot = await get(studentQuery);
        const studentExists = Object.values(studentSnapshot.val() || {}).some(
          student => student.email === user.email
        );

        if (studentExists) {
          await auth.signOut();
          alert('This email is already registered as a student. Please use a different email.');
          return;
        }

        const userRef = ref(database, `Users/Students/${user.uid}`);
        await set(userRef, {
          fullname: formData.fullname,
          email: user.email,
          department: formData.department,
          year: formData.year,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          role: 'student'
        });

        closeModal();
      } else {
        // Check if this specific email exists as a college representative
        const collegeQuery = ref(database, 'Users/College');
        const adminRequestQuery = ref(database, 'AdminRequests');
        const [collegeSnapshot, adminRequestSnapshot] = await Promise.all([
          get(collegeQuery),
          get(adminRequestQuery)
        ]);

        const collegeExists = Object.values(collegeSnapshot.val() || {}).some(
          college => college.collegeEmail === user.email
        );
        const adminRequestExists = Object.values(adminRequestSnapshot.val() || {}).some(
          request => request.collegeEmail === user.email
        );

        if (collegeExists || adminRequestExists) {
          await auth.signOut();
          alert('This email is already registered as a college representative. Please use a different email.');
          return;
        }

        const adminRequestRef = ref(database, `AdminRequests/${user.uid}`);
        await set(adminRequestRef, {
          facultyName: formData.facultyName,
          collegeName: formData.collegeName,
          collegeEmail: user.email,
          phoneNumber: formData.phoneNumber,
          collegeLocation: formData.collegeLocation,
          role: 'clg-representative',
          isAdmin: false,
          status: 'pending'
        });

        alert('Wait for the approval of your account by the admin.');
        await auth.signOut();
      }

      closeModal();
    } catch (error) {
      console.error('Google Form Submission Error:', error);
      alert('Failed to save user details. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkEmailExists = async (email) => {
    try {
      // Check in Students
      const studentRef = ref(database, 'Users/Students');
      const studentSnapshot = await get(studentRef);
      const studentData = studentSnapshot.val() || {};

      // Check in College Representatives
      const collegeRef = ref(database, 'Users/College');
      const collegeSnapshot = await get(collegeRef);
      const collegeData = collegeSnapshot.val() || {};

      // Check in Admin Requests
      const adminRequestRef = ref(database, 'AdminRequests');
      const adminRequestSnapshot = await get(adminRequestRef);
      const adminRequestData = adminRequestSnapshot.val() || {};

      // Check if email exists in any of the locations
      const studentExists = Object.values(studentData).some(user => user.email === email);
      const collegeExists = Object.values(collegeData).some(user => user.collegeEmail === email);
      const adminRequestExists = Object.values(adminRequestData).some(user => user.collegeEmail === email);

      return {
        exists: studentExists || collegeExists || adminRequestExists,
        inStudents: studentExists,
        inCollege: collegeExists,
        inAdminRequests: adminRequestExists
      };
    } catch (error) {
      console.error('Error checking email existence:', error);
      return {
        exists: false,
        inStudents: false,
        inCollege: false,
        inAdminRequests: false
      };
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if the email exists in Users/Students or Users/College
      const studentRef = ref(database, `Users/Students/${user.uid}`);
      const collegeRef = ref(database, `Users/College/${user.uid}`);
      const adminRequestRef = ref(database, `AdminRequests/${user.uid}`);
      const [studentSnapshot, collegeSnapshot, adminRequestSnapshot] = await Promise.all([
        get(studentRef),
        get(collegeRef),
        get(adminRequestRef),
      ]);

      const studentData = studentSnapshot.val();
      const collegeData = collegeSnapshot.val();
      const adminRequestData = adminRequestSnapshot.val();

      // Check if this user was originally created via Google Sign-in
      const isGoogleUser = user.providerData.some(
        provider => provider.providerId === 'google.com'
      );

      // Only check email verification if the user wasn't created via Google
      if (!isGoogleUser && !user.emailVerified) {
        alert('Please verify your email before logging in.');
        auth.signOut();
        return;
      }

      if (
        (studentData && studentData.email === formData.email) ||
        (collegeData && collegeData.collegeEmail === formData.email)
      ) {
        // If email matches in Users/Students or Users/College
        if (studentData) {
          closeModal();
          console.log('Logged in as student successfully');
        } else if (collegeData) {
          if (collegeData.superAdmin) {
            navigate('/super-admin-home');
          } else {
            navigate('/');
          }
          closeModal();
          console.log('Logged in as college representative successfully');
        }
      } else if (adminRequestData && adminRequestData.collegeEmail === formData.email) {
        // If email matches in AdminRequests
        alert('Your account is pending approval by the Super Admin.');
        auth.signOut();
      } else {
        // If email does not exist anywhere
        alert('Invalid account or email is not registered.');
        auth.signOut();
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      alert('Login failed, please check your credentials.');
    }
  };


  const renderSignupForm = () => (
    <form className="signup-form" onSubmit={handleSignupSubmit}>
      <span className="close-btn" onClick={closeModal}>&times;</span>
      <h2 className='login-name'>Signup</h2>
      <div className="progress-steps">
        {[1, 2, 3, 4, selectedRole === 'student' ? 5 : null].filter(Boolean).map((step) => (
          <div
            key={step}
            className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">Step {step}</div>
          </div>
        ))}
      </div>

      {selectedRole === 'student' ? renderStudentStepContent() : renderCollegeRepStepContent()}

      <div className="step-navigation">
        {currentStep > 1 && (
          <button type="button" onClick={handlePreviousStep} className="prev-btn">
            Previous
          </button>
        )}
        {((selectedRole === 'student' && currentStep < 5) ||
          (selectedRole === 'clg-representative' && currentStep < 4)) ? (
          <button type="button" onClick={handleNextStep} className="next-btn">
            Next
          </button>
        ) : (
          currentStep !== 1 && <button type="submit">Sign Up</button>
        )}
      </div>

      {currentStep === 1 && (
        <p className='login-name'>
          Already have an account?{' '}
          <span className="signup-cursor" onClick={() => setShowSignup(false)}>
            Login
          </span>
        </p>
      )}
    </form>
  );

  const renderStudentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="select-wrapper">
              <select
                className="custom-select"
                value={selectedRole}
                onChange={handleRoleChange}
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="student">Student</option>
                <option value="clg-representative">College Representative</option>
              </select>
            </div>
            {!showGoogleSignupForm ? (
              <>
                <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
                  <FcGoogle className="google-icon" />
                  <span>Sign up with Google</span>
                </button>

                <div className="divider">
                  <span>or</span>
                </div>
                <div className="input-container">
                  <input
                    className="input-field"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <HiMail className="icon" />
                </div>
              </>
            ) : (
              <div className="google-email-display">
                <FcGoogle className="google-icon" />
                <span>{formData.email}</span>
              </div>
            )}
          </>
        );
      case 2:
        return (
          <>
            <div className="input-container">
              <input
                className="input-field"
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
              <FaUser className="icon" />
            </div>
            <div className="input-container">
              <input
                className="input-field"
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <FaPhone className="icon" />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="input-container">
              <div className="select-wrapper">
                <select
                  className="input-field custom-select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <FaGraduationCap className="icon" />
            </div>
            <div className="input-container">
              <div className="select-wrapper">
                <select
                  className="input-field custom-select"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <FaCalendarAlt className="icon" />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="input-container">
              <input
                className="input-field"
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <FaMapMarkerAlt className="icon" />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="input-container password-field">
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <FaLock className="icon" />
              <div
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
            <div className="input-container password-field">
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <FaLock className="icon" />
              <div
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
          </>
        );
      default:
        return null;
    }
  };

  // Render step content for college representative signup
  const renderCollegeRepStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="select-wrapper">
              <select
                className="custom-select"
                value={selectedRole}
                onChange={handleRoleChange}
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="student">Student</option>
                <option value="clg-representative">College Representative</option>
              </select>
            </div>
            {!showGoogleSignupForm ? (
              <>
                <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
                  <FcGoogle className="google-icon" />
                  <span>Sign up with Google</span>
                </button>

                <div className="divider">
                  <span>or</span>
                </div>

                <div className="input-container">
                  <input
                    className="input-field"
                    type="email"
                    name="collegeEmail"
                    placeholder="College Email"
                    value={formData.collegeEmail}
                    onChange={handleChange}
                    required
                  />
                  <HiMail className="icon" />
                </div>
              </>
            ) : (
              <div className="google-email-display">
                <FcGoogle className="google-icon" />
                <span>{formData.collegeEmail}</span>
              </div>
            )}
          </>
        );
      case 2:
        return (
          <>
            <div className="input-container">
              <input
                className="input-field"
                type="text"
                name="facultyName"
                placeholder="Faculty Name"
                value={formData.facultyName}
                onChange={handleChange}
                required
              />
              <FaUser className="icon" />
            </div>
            <div className="input-container">
              <input
                className="input-field"
                type="text"
                name="collegeName"
                placeholder="College Name"
                value={formData.collegeName}
                onChange={handleChange}
                required
              />
              <FaUniversity className="icon" />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="input-container">
              <input
                className="input-field"
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <FaPhone className="icon" />
            </div>
            <div className="input-container">
              <input
                className="input-field"
                type="text"
                name="collegeLocation"
                placeholder="College Location"
                value={formData.collegeLocation}
                onChange={handleChange}
                required
              />
              <FaBuilding className="icon" />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="input-container password-field">
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <FaLock className="icon" />
              <div
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
            <div className="input-container password-field">
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <FaLock className="icon" />
              <div
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
          </>
        );
      default:
        return null;
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    const emailToCheck = selectedRole === 'student' ? formData.email : formData.collegeEmail;

    try {
      // Check both Authentication and Database
      const { existsInAuth, existsInDatabase } = await checkAuthAndDatabaseEmail(emailToCheck);

      if (existsInDatabase) {
        alert('This email is already registered in our database. Please use a different email.');
        return;
      }

      let user;

      // If we're in Google signup flow, use the existing user
      if (showGoogleSignupForm) {
        user = auth.currentUser; // Get the current Google-authenticated user

        // Link the email/password credentials to the Google account
        const credential = EmailAuthProvider.credential(emailToCheck, formData.password);
        await linkWithCredential(user, credential);
      } else {
        // Regular email/password signup
        const userCredential = await createUserWithEmailAndPassword(auth, emailToCheck, formData.password);
        user = userCredential.user;
      }

      if (selectedRole === 'student') {
        const userRef = ref(database, `Users/Students/${user.uid}`);
        await set(userRef, {
          fullname: formData.fullname,
          email: formData.email,
          department: formData.department,
          year: formData.year,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          role: 'student'
        });

        if (!showGoogleSignupForm) {
          await sendEmailVerification(user);
          alert('Email verification link has been sent. Please verify your email before logging in.');
        }
      } else if (selectedRole === 'clg-representative') {
        if (!formData.facultyName || !formData.collegeName || !formData.collegeEmail) {
          alert('Please fill in all college representative fields.');
          return;
        }

        const adminRequestRef = ref(database, `AdminRequests/${user.uid}`);
        await set(adminRequestRef, {
          facultyName: formData.facultyName,
          collegeName: formData.collegeName,
          collegeEmail: formData.collegeEmail,
          phoneNumber: formData.phoneNumber,
          collegeLocation: formData.collegeLocation,
          role: 'clg-representative',
          isAdmin: false,
          status: 'pending'
        });

        if (!showGoogleSignupForm) {
          await sendEmailVerification(user);
          alert('Email verification link has been sent to your college email. Please verify your email before logging in.');
        }
        alert('Wait for the approval of your account by the admin.');
      }

      await auth.signOut(); // Sign out after completion
      console.log('User registered and data saved to Realtime Database.');
      closeModal();
    } catch (error) {
      console.error('Signup Error:', error.message);

      // Handle specific error cases
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already registered. Please use the Google Sign-In button to log in.');
      } else {
        alert('Signup failed, please try again. ' + error.message);
      }
    }
  };


  return (
    <div className="login-popup">
      {showGoogleForm ? (
        <form className="signup-form" onSubmit={handleGoogleFormSubmit}>
          <span className="close-btn" onClick={closeModal}>&times;</span>
          <h2 className="login-name">Complete Your Profile</h2>

          <div className="select-wrapper">
            <select className="custom-select" value={selectedRole} onChange={handleRoleChange}>
              <option value="" disabled>Select an option</option>
              <option value="student">Student</option>
              <option value="clg-representative">College Representative</option>
            </select>
          </div>

          {selectedRole === 'student' ? (
            <>
              <input
                className="input-field"
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <select
                className="input-field custom-select"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                className="input-field custom-select"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                className="input-field"
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Set Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {passwordError && <p className="error-message">{passwordError}</p>}
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
              <div className="show-password">
                <input
                  type="checkbox"
                  onChange={togglePasswordVisibility}
                  checked={showPassword}
                />
                <label>Show Password</label>
              </div>
            </>
          ) : (
            <>
              <input
                className="input-field"
                type="text"
                name="facultyName"
                placeholder="Faculty Name"
                value={formData.facultyName}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type="text"
                name="collegeName"
                placeholder="College Name"
                value={formData.collegeName}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type="text"
                name="collegeLocation"
                placeholder="College Location"
                value={formData.collegeLocation}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Set Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {passwordError && <p className="error-message">{passwordError}</p>}
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
              <div className="show-password">
                <input
                  type="checkbox"
                  onChange={togglePasswordVisibility}
                  checked={showPassword}
                />
                <label>Show Password</label>
              </div>
            </>
          )}
          <button type="submit">Complete Signup</button>
        </form>
      ) : !showSignup ? (
        // Login Form
        <form className="login-form" onSubmit={handleLoginSubmit}>
          <span className="close-btn" onClick={closeModal}>&times;</span>
          <h2 className='login-name'>Login</h2>

          <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
            <FcGoogle className="google-icon" />
            <span>Sign in with Google</span>
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="input-container">
            <input
              className="input-field"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
            />
            <HiMail className="icon" />
          </div>

          <div className="input-container password-field">
            <input
              className="input-field"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <FaLock className="icon" />
            <div
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button type="submit">Login</button>
          <p className='login-name'>
            Don't have an account?{' '}
            <span className="signup-cursor" onClick={() => setShowSignup(true)}>
              Signup
            </span>
          </p>
        </form>
      ) : (
        // Signup Form
        renderSignupForm()
      )}
    </div>
  );
};

export default Login;
