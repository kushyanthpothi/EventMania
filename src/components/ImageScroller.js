import React, { useState, useRef, useEffect } from 'react';
import { database } from './firebaseConfig';
// eslint-disable-next-line
import { ref, onValue, query } from 'firebase/database';
import './ImageScroller.css';

const DynamicImageScroller = () => {
  const [logos, setLogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollerRef = useRef(null);
  const STATIC_HEIGHT = 170; // Fixed height in pixels
  const SHIMMER_COUNT = 10; // Number of shimmer placeholders

  useEffect(() => {
    const fetchCollegeLogos = () => {
      const collegeLogosRef = ref(database, 'Users/College');
      const eventsLogosRef = ref(database, 'events');

      const fetchLogosFromRef = (logoRef) => {
        return new Promise((resolve) => {
          onValue(logoRef, (snapshot) => {
            const logoUrls = [];
            
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              
              if (data) {
                if (data.collegeLogo) {
                  logoUrls.push(data.collegeLogo);
                }
                if (data.eventLogo) {
                  logoUrls.push(data.eventLogo);
                }
              }
            });

            resolve(logoUrls);
          }, (error) => {
            console.error(`Error fetching logos from ${logoRef.toString()}:`, error);
            resolve([]);
          });
        });
      };

      Promise.all([
        fetchLogosFromRef(collegeLogosRef),
        fetchLogosFromRef(eventsLogosRef)
      ]).then(([collegeLogos, eventLogos]) => {
        const combinedLogos = [...collegeLogos, ...eventLogos].filter(logo => logo);

        if (combinedLogos.length > 0) {
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

  const renderShimmerPlaceholders = () => {
    return Array(SHIMMER_COUNT).fill(0).map((_, index) => (
      <div 
        key={`shimmer-${index}`} 
        className="scroller-item shimmer-item"
        style={{
          height: `${STATIC_HEIGHT}px`,
          width: `${STATIC_HEIGHT}px` // Make it square/rectangular
        }}
      >
        <div className="shimmer-rectangle"></div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="scroller-container smooth-fade-up">
        <div className="scroller" ref={scrollerRef}>
          {renderShimmerPlaceholders()}
        </div>
      </div>
    );
  }

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
        {logos.map((logoUrl, index) => (
          <div 
            key={index} 
            className="scroller-item"
            style={{
              height: `${STATIC_HEIGHT}px`
            }}
          >
            <img 
              src={logoUrl} 
              alt={`Logo ${index + 1}`} 
              style={{
                maxHeight: `${STATIC_HEIGHT}px`,
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicImageScroller;