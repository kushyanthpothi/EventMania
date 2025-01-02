import React from 'react';
import Header from './Header';
import ImageScroller from './ImageScroller';
import About from './About';
import Footer from './Footer';
import HomeEvents from './HomeEvents';
import CompanyHome from './CompanyHome';
import './Home.css';

const Home = () => {
  return (
    <div className="homePageContainer">
      <Header id="headerContainer" /> {/* Ensure id matches */}
      <ImageScroller />
      <About id="aboutContainer" /> {/* Ensure id matches */}
      <HomeEvents /> {/* Add this component */}
      <CompanyHome/> 
      <Footer id="footer" /> {/* Ensure id matches */}
    </div>
  );
};

export default Home;
