import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { auth, database } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const Login = ({ closeModal }) => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formData, setFormData] = useState({
    fullname: '',
    facultyName: '',
    collegeName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeEmail: '',
  });

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkEmailExists = async (email) => {
    try {
      const studentRef = ref(database, 'Users/Students');
      const collegeRef = ref(database, 'Users/College');
      
      const studentSnapshot = await get(studentRef);
      const collegeSnapshot = await get(collegeRef);
      
      const studentData = studentSnapshot.val() || {};
      const collegeData = collegeSnapshot.val() || {};
      
      const studentEmails = Object.values(studentData).map(user => user.email);
      const collegeEmails = Object.values(collegeData).map(user => user.collegeEmail);
      
      return studentEmails.includes(email) || collegeEmails.includes(email);
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        alert('Please verify your email before logging in.');
        auth.signOut();
        return;
      }

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


  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }


    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const emailToCheck = selectedRole === 'student' ? formData.email : formData.collegeEmail;
    const emailExists = await checkEmailExists(emailToCheck);

    if (emailExists) {
      alert('This email is already registered. Please use a different email.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailToCheck, formData.password);
      const user = userCredential.user;

      if (selectedRole === 'student') {
        const userRef = ref(database, `Users/Students/${user.uid}`);
        await set(userRef, {
          fullname: formData.fullname,
          email: formData.email,
          role: 'student',
        });

        // Send email verification
        await sendEmailVerification(user);
        alert('Email verification link has been sent. Please verify your email before logging in.');
        auth.signOut(); // Prevent automatic login after signup
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
          role: 'clg-representative',
          isAdmin: false,
          status: 'pending',
        });

        // Send email verification
        await sendEmailVerification(user);

        // Show the required alerts
        alert('Email verification link has been sent to your college email. Please verify your email before logging in.');
        alert('Wait for the approval of your account by the admin.');

        auth.signOut(); // Prevent automatic login after signup
      }

      console.log('User registered and data saved to Realtime Database.');
      closeModal();
    } catch (error) {
      console.error('Signup Error:', error.message);
      alert('Signup failed, please try again. ' + error.message);
    }
  };


  return (
    <div className="login-popup">
      {!showSignup ? (
        <form className="login-form" onSubmit={handleLoginSubmit}>
          <span className="close-btn" onClick={closeModal}>&times;</span>
          <h2 className='login-name'>Login</h2>
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
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="show-password">
            <input
              type="checkbox"
              onChange={togglePasswordVisibility}
              checked={showPassword}
            />
            <label>Show Password</label>
          </div>
          <button type="submit">Login</button>
          <p className='login-name'>
            Don't have an account?{' '}
            <span className="signup-cursor" onClick={() => setShowSignup(true)}>Signup</span>
          </p>
        </form>
      ) : (
        <form className="signup-form" onSubmit={handleSignupSubmit}>
          <span className="close-btn" onClick={closeModal}>&times;</span>
          <h2 className='login-name'>Signup</h2>
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
                type="email"
                name="collegeEmail"
                placeholder="College Email"
                value={formData.collegeEmail}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </>
          )}
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
          <input
            className="input-field"
            type="password"
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
          <button type="submit">Signup</button>
          <p className='login-name'>
            Already have an account?{' '}
            <span className="signup-cursor" onClick={() => setShowSignup(false)}>Login</span>
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
