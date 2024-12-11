import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { auth, database } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';

const Login = ({ closeModal }) => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
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
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkEmailExists = async (email) => {
    const studentRef = ref(database, 'Users/Students/');
    const collegeRef = ref(database, 'Users/College/');
    const [studentSnapshot, collegeSnapshot] = await Promise.all([get(studentRef), get(collegeRef)]);
    const studentEmails = Object.keys(studentSnapshot.val() || {}).map(key => studentSnapshot.val()[key].email);
    const collegeEmails = Object.keys(collegeSnapshot.val() || {}).map(key => collegeSnapshot.val()[key].collegeEmail);
    return studentEmails.includes(email) || collegeEmails.includes(email);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert('Please verify your email before logging in.');
        auth.signOut();
        return;
      }

      const roleRef = ref(database, `Users/Students/${user.uid}`);
      const collegeRef = ref(database, `Users/College/${user.uid}`);
      const adminRequestRef = ref(database, `AdminRequests/${user.uid}`);
      const [roleSnapshot, collegeSnapshot, adminRequestSnapshot] = await Promise.all([
        get(roleRef),
        get(collegeRef),
        get(adminRequestRef)
      ]);

      const isStudent = roleSnapshot.exists();
      const isCollegeRep = collegeSnapshot.exists();
      const adminRequest = adminRequestSnapshot.exists() ? adminRequestSnapshot.val() : null;

      if (isStudent) {
        closeModal();
        console.log('Logged in as student successfully');
      } else if (isCollegeRep) {
        if (adminRequest && adminRequest.status === 'pending') {
          alert('Your request is still pending approval from the super admin.');
          auth.signOut();
          return;
        }

        const collegeData = collegeSnapshot.val();
        if (collegeData.superAdmin) {
          navigate('/super-admin-home');
        } else {
          navigate('/');
        }
        closeModal();
        console.log('Logged in as college representative successfully');
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      alert('Login failed, please check your credentials.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
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

        // Save the college representative data in the `AdminRequests` collection for approval
        const adminRequestRef = ref(database, `AdminRequests/${user.uid}`);
        await set(adminRequestRef, {
          facultyName: formData.facultyName,
          collegeName: formData.collegeName,
          collegeEmail: formData.collegeEmail,
          role: 'clg-representative',
          isAdmin: false, // Set isAdmin to false by default
          status: 'pending', // Set the status to 'pending'
        });

        alert('Your request has been submitted for approval by the super admin.');
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
          <h2>Login</h2>
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
          <p>
            Don't have an account?{' '}
            <span className="signup-cursor" onClick={() => setShowSignup(true)}>Signup</span>
          </p>
          <p>
            <span className="signup-cursor" onClick={() => alert('Forgot password functionality to be implemented!')}>
              Forgot Password?
            </span>
          </p>
        </form>
      ) : (
        <form className="signup-form" onSubmit={handleSignupSubmit}>
          <span className="close-btn" onClick={closeModal}>&times;</span>
          <h2>Signup</h2>
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
          <input
            className="input-field"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
          <button type="submit">Signup</button>
          <p>
            Already have an account?{' '}
            <span className="signup-cursor" onClick={() => setShowSignup(false)}>Login</span>
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
