import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set, get, query, orderByChild, equalTo } from 'firebase/database';
import './CompanyAuth.css';

const COMPANIES = [
  { id: 1, name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
  { id: 2, name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
  { id: 3, name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 4, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 5, name: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png' },
  { id: 6, name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
  { id: 7, name: 'Intel', logo: 'https://logodownload.org/wp-content/uploads/2014/04/intel-logo-0.png' },
  { id: 8, name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
  { id: 9, name: 'Cisco', logo: 'https://logodownload.org/wp-content/uploads/2014/04/cisco-logo-0.png' },
  { id: 10, name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
  { id: 11, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { id: 12, name: 'Adobe', logo: 'https://logos-world.net/wp-content/uploads/2023/07/Adobe-Logo-New.png' },
  { id: 13, name: 'NVIDIA', logo: 'https://static.vecteezy.com/system/resources/previews/024/039/095/non_2x/nvidia-logo-transparent-free-png.png' },
  { id: 14, name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Netflix_logo.svg' },
  { id: 15, name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg' },
  { id: 16, name: 'Twitter', logo: 'https://cdn.freelogovectors.net/wp-content/uploads/2023/07/x-logo-twitter-freelogovectors.net_.png' },
  { id: 17, name: 'LinkedIn', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
  { id: 18, name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Salesforce.com_logo.svg' },
  { id: 19, name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  { id: 20, name: 'Zoom', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Zoom_Communications_Logo.svg' },
  { id: 21, name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png' },
  { id: 22, name: 'Pinterest', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Pinterest_favicon_red.svg' },
  { id: 23, name: 'eBay', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/EBay_logo.svg' },
  { id: 24, name: 'Shopify', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Shopify_logo_2020.svg' },
  { id: 25, name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Stripe_Logo%2C_revised_2016.svg' },
  { id: 26, name: 'Square', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Square%2C_Inc._Logo.svg' },
  { id: 27, name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' },
  { id: 28, name: 'Lyft', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Lyft_logo.svg' },
  { id: 29, name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
  { id: 30, name: 'Reddit', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Reddit_logo_new.svg' },
  { id: 31, name: 'TikTok', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg' },
  { id: 32, name: 'Snapchat', logo: 'https://upload.wikimedia.org/wikipedia/en/a/ad/Snapchat_logo.svg' },
  { id: 33, name: 'Baidu', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Baidu_logo.svg' },
  { id: 34, name: 'Alibaba', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Alibaba_Group_Logo.svg' },
  { id: 35, name: 'Tencent', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Tencent_logo.svg' },
  { id: 36, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Sony_logo.svg' },
  { id: 37, name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/LG_logo_%282015%29.svg' },
  { id: 38, name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/HP_logo_2012.svg' },
  { id: 39, name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Dell_Logo.svg' },
  { id: 40, name: 'Asus', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/AsusTek_Logo.svg' },
  { id: 41, name: 'Acer', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Acer_2011_logo.svg' },
  { id: 42, name: 'Lenovo', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Lenovo_2015_logo.svg' },
  { id: 43, name: 'Qualcomm', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Qualcomm_logo.svg' },
  { id: 44, name: 'AMD', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/AMD_logo.svg' },
  { id: 45, name: 'ARM', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Arm_Holdings_logo_2017.svg' },
  { id: 46, name: 'VMware', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/VMware_Logo.svg' },
  { id: 47, name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
  { id: 48, name: 'Huawei', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Huawei_Logo.svg' },
  { id: 49, name: 'Oppo', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/OPPO_Logo.svg' },
  { id: 50, name: 'Vivo', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Vivo_logo_2019.svg' }
];

const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1-50', label: '1 to 50' },
  { value: '50-100', label: '50 to 100' },
  { value: '100+', label: '100+' }
];

const CompanyAuth = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [years, setYears] = useState([]);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registrationData, setRegistrationData] = useState({
    companyName: '',
    // ceoEmail: '',
    companyEmail: '',
    password: '',
    confirmPassword: '',
    website: '',
    employeeCount: '',
    yearFounded: '',
    industry: '',
    headquarters: '',
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearArray = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
    setYears(yearArray);
  }, []);

  const checkStudentEmail = async (email) => {
    try {
      console.log('Checking student email:', email);
      const studentsRef = ref(database, 'Users/Students');
      const studentSnapshot = await get(studentsRef);

      if (studentSnapshot.exists()) {
        const students = studentSnapshot.val();
        return Object.values(students).some(student => student.email === email);
      }
      return false;
    } catch (error) {
      console.error('Error checking student email:', error);
      throw new Error('Failed to check student email');
    }
  };

  // Function to check if email exists in College collection
  const checkCollegeEmail = async (email) => {
    try {
      console.log('Checking college email:', email);
      const collegeRef = ref(database, 'Users/College');
      const collegeSnapshot = await get(collegeRef);

      if (collegeSnapshot.exists()) {
        const colleges = collegeSnapshot.val();
        return Object.values(colleges).some(college => college.collegeEmail === email);
      }
      return false;
    } catch (error) {
      console.error('Error checking college email:', error);
      throw new Error('Failed to check college email');
    }
  };

  const validateEmail = async (email) => {
    if (!email) {
      setEmailError('');
      setIsCheckingEmail(false);
      return true;
    }

    setIsCheckingEmail(true);
    setEmailError('');

    try {
      const [isStudentEmail, isCollegeEmail] = await Promise.all([
        checkStudentEmail(email),
        checkCollegeEmail(email)
      ]);

      if (isStudentEmail || isCollegeEmail) {
        setEmailError('This email is already registered in our system');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Validation error details:', error);
      setEmailError('Error validating email. Please try again.');
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedValidateEmail = React.useCallback(
    debounce((email) => validateEmail(email), 500),
    []
  );


  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistrationChange = async (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'companyEmail' && value) {
      debouncedValidateEmail(value);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      const userRef = ref(database, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.status === 'approved') {
          navigate('/company-dashboard');
        } else {
          alert('Your account is pending approval. Please wait for admin verification.');
          auth.signOut();
        }
      } else {
        alert('User not found. Please register first.');
        auth.signOut();
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    if (registrationData.password !== registrationData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Final email validation before submission
    try {
      const isEmailValid = await validateEmail(registrationData.companyEmail);
      if (!isEmailValid) {
        alert('Please use a different email address.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registrationData.companyEmail,
        registrationData.password
      );

      // Store in companyRequest collection
      const companyRequestRef = ref(database, `companyRequest/${userCredential.user.uid}`);
      await set(companyRequestRef, {
        companyName: registrationData.companyName,
        // ceoEmail: registrationData.ceoEmail,
        companyEmail: registrationData.companyEmail,
        website: registrationData.website,
        employeeCount: registrationData.employeeCount,
        yearFounded: registrationData.yearFounded,
        industry: registrationData.industry,
        headquarters: registrationData.headquarters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        isActive: true,
        role: 'company',
        verificationStatus: 'pending'
      });

      // Store in users collection
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      await set(userRef, {
        email: registrationData.companyEmail,
        companyName: registrationData.companyName,
        role: 'company',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });

      alert('Registration successful! Please wait for admin verification.');
      setIsLogin(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, loginData.email);
      alert('Password reset email sent! Please check your inbox.');
      setShowForgotPassword(false);
    } catch (error) {
      alert('Failed to send reset email: ' + error.message);
    }
  };

  const renderBackgroundLogos = () => (
    <div className="companyAuth__bgContainer">
      {[1, 2, 3, 4, 5].map((rowIndex) => (
        <div key={rowIndex} className={`companyAuth__logoRow companyAuth__logoRow--${rowIndex}`}>
          <div className="companyAuth__logoTrack">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="companyAuth__logoSet">
                {COMPANIES.map((company) => (
                  <div key={`${setIndex}-${company.id}`} className="companyAuth__logo">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="companyAuth__logoImg"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="companyAuth__container">
      {renderBackgroundLogos()}

      <div className="companyAuth__formContainer">
        {showForgotPassword ? (
          <form className="companyAuth__form" onSubmit={handleForgotPassword}>
            <h2 className="companyAuth__title">Reset Password</h2>
            <div className="companyAuth__inputGroup">
              <input
                type="email"
                name="email"
                placeholder="Company Email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                className="companyAuth__input"
              />
            </div>
            <button type="submit" className="companyAuth__button">
              Send Reset Link
            </button>
            <p className="companyAuth__link" onClick={() => setShowForgotPassword(false)}>
              Back to Login
            </p>
          </form>
        ) : isLogin ? (
          <form className="companyAuth__form" onSubmit={handleLoginSubmit}>
            <h2 className="companyAuth__title">Company Login</h2>
            <div className="companyAuth__inputGroup">
              <input
                type="email"
                name="email"
                placeholder="Company Email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                className="companyAuth__input"
              />
            </div>
            <div className="companyAuth__inputGroup">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                className="companyAuth__input"
              />
            </div>
            <button type="submit" className="companyAuth__button">Login</button>
            <p className="companyAuth__link" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </p>
            <p className="companyAuth__link" onClick={() => setIsLogin(false)}>
              Don't have an account? Register
            </p>
          </form>
        ) : (
          <form className="companyAuth__form companyAuth__form--register" onSubmit={handleRegistrationSubmit}>
            <h2 className="companyAuth__title">Company Registration</h2>
            
            {/* Company Name Input */}
            <div className="companyAuth__inputGroup">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={registrationData.companyName}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              />
            </div>

            {/* Company Email Input with Loading Animation */}
            <div className="companyAuth__inputGroup">
              <input
                type="email"
                name="companyEmail"
                placeholder="Company Email"
                value={registrationData.companyEmail}
                onChange={handleRegistrationChange}
                required
                className={`companyAuth__input ${
                  isCheckingEmail ? 'companyAuth__input--loading' : 
                  emailError ? 'companyAuth__input--error' : 
                  registrationData.companyEmail && !emailError ? 'companyAuth__input--valid' : ''
                }`}
              />
              {emailError && (
                <div className="companyAuth__error">{emailError}</div>
              )}
            </div>

            {/* Password Input */}
            <div className="companyAuth__inputGroup">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={registrationData.password}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="companyAuth__inputGroup">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={registrationData.confirmPassword}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              />
            </div>

            {/* Website Input */}
            <div className="companyAuth__inputGroup">
              <input
                type="url"
                name="website"
                placeholder="Website"
                value={registrationData.website}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              />
            </div>

            {/* Employee Count Dropdown */}
            <div className="companyAuth__inputGroup">
              <select
                name="employeeCount"
                value={registrationData.employeeCount}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              >
                <option value="">Select Employee Count</option>
                {EMPLOYEE_COUNT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Founded Dropdown */}
            <div className="companyAuth__inputGroup">
              <select
                name="yearFounded"
                value={registrationData.yearFounded}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              >
                <option value="">Select Year Founded</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Input */}
            <div className="companyAuth__inputGroup">
              <input
                type="text"
                name="industry"
                placeholder="Industry"
                value={registrationData.industry}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              />
            </div>

            {/* Headquarters Input */}
            <div className="companyAuth__inputGroup">
              <input
                type="text"
                name="headquarters"
                placeholder="Headquarters"
                value={registrationData.headquarters}
                onChange={handleRegistrationChange}
                required
                className="companyAuth__input"
              />
            </div>

            <button
              type="submit"
              className="companyAuth__button"
              disabled={isCheckingEmail || emailError}
            >
              Register
            </button>
            <p className="companyAuth__link" onClick={() => setIsLogin(true)}>
              Already have an account? Login
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompanyAuth; 