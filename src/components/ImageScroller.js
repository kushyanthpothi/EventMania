import React, { useState, useRef, useEffect } from 'react';
import { database } from './firebaseConfig';
import { ref, onValue, query } from 'firebase/database';
import './ImageScroller.css';

const DynamicImageScroller = () => {
  const [logos, setLogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollerRef = useRef(null);
  const STATIC_HEIGHT = 170; // Fixed height in pixels

  useEffect(() => {
    const fetchCollegeLogos = () => {
      // Create refs for both Users/College and events collections
      const collegeLogosRef = ref(database, 'Users/College');
      const eventsLogosRef = ref(database, 'events');

      // Combine logo fetching from both sources
      const fetchLogosFromRef = (logoRef) => {
        return new Promise((resolve) => {
          onValue(logoRef, (snapshot) => {
            const logoData = [];
            
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              
              // Extract logo and college name from different possible locations
              if (data) {
                if (data.collegeLogo) {
                  logoData.push({
                    logoUrl: data.collegeLogo,
                    collegeName: data.collegeName || 'Unknown College'
                  });
                }
                // For events collection, check for event-specific logos
                if (data.eventLogo) {
                  logoData.push({
                    logoUrl: data.eventLogo,
                    collegeName: data.eventName || 'Unknown Event'
                  });
                }
              }
            });

            resolve(logoData);
          }, (error) => {
            console.error(`Error fetching logos from ${logoRef.toString()}:`, error);
            resolve([]);
          });
        });
      };

      // Fetch logos from both sources
      Promise.all([
        fetchLogosFromRef(collegeLogosRef),
        fetchLogosFromRef(eventsLogosRef)
      ]).then(([collegeLogos, eventLogos]) => {
        const combinedLogos = [...collegeLogos, ...eventLogos].filter(logo => logo.logoUrl);

        if (combinedLogos.length > 0) {
          // Create infinite scroll effect
          const infiniteLogos = Array(100).fill(combinedLogos).flat();
          setLogos(infiniteLogos);
        } else {
          console.warn("No logos found in either Users/College or events collections");
        }
        
        setIsLoading(false);
      });
    };

    fetchCollegeLogos();
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (scroller && logos.length > 0) {
      let scrollAmount = 0;
      const totalWidth = scroller.scrollWidth;
      const scrollStep = 1.5;

      const scrollInterval = setInterval(() => {
        scrollAmount += scrollStep;
        scroller.style.transform = `translateX(-${scrollAmount % totalWidth}px)`;
      }, 16);

      return () => clearInterval(scrollInterval);
    }
  }, [logos]);

  // Loading state
  if (isLoading) {
    return (
      <div className="scroller-container smooth-fade-up">
        <div>Loading college logos...</div>
      </div>
    );
  }

  // No logos found state
  if (logos.length === 0) {
    return (
      <div className="scroller-container smooth-fade-up">
        <div>No logos available</div>
      </div>
    );
  }

  return (
    <div className="scroller-container smooth-fade-up">
      <div className="scroller" ref={scrollerRef}>
        {logos.map((logo, index) => (
          <div 
            key={index} 
            className="scroller-item"
            style={{
              height: `${STATIC_HEIGHT}px`
            }}
          >
            <div className="logo-wrapper">
              <img 
                src={logo.logoUrl} 
                alt={`${logo.collegeName} Logo`} 
                style={{
                  maxHeight: `${STATIC_HEIGHT}px`,
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
              <div className="college-name-overlay">{logo.collegeName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicImageScroller;