import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const ParcoursDiagram = () => {
  const location = useLocation();
  // Decode the pathname to handle special characters like accents correctly
  const currentPath = decodeURIComponent(location.pathname);

  const stages = [
    {
      id: 1,
      path: '/découvrir',
      letter: 'D',
      label: 'Découvrir',
      color: '#0a83ca', // Blue
    },
    {
      id: 2,
      path: '/approfondir',
      letter: 'M',
      label: 'Approfondir',
      color: '#10b981', // Green
    },
    {
      id: 3,
      path: '/transmettre',
      letter: 'V',
      label: 'Transmettre',
      color: '#f59e0b', // Orange
    },
  ];

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)',
      marginBottom: '40px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.15)', // Glassmorphism
        backdropFilter: 'blur(12px)',
        padding: '20px 0',
        width: '100%',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '30px',
          maxWidth: '1400px',
          width: '100%',
          padding: '0 20px'
        }}>
        {stages.map((stage, index) => {
          // Check if current path starts with the stage path to handle sub-routes if any
          let isActive = currentPath === stage.path || currentPath.startsWith(stage.path + '/');
          
          // Fallback for Découvrir to handle potential encoding/accent issues
          if (stage.path === '/découvrir' && !isActive) {
             isActive = currentPath === '/decouvrir' || currentPath.startsWith('/decouvrir/');
          }
          
          return (
            <React.Fragment key={stage.id}>
              {/* Connector Arrow */}
              {index > 0 && (
                <div className="d-none d-md-block" style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '20px',
                  flex: '0 0 auto'
                }}>
                  <FaArrowRight />
                </div>
              )}

              {/* Stage Pill */}
              <Link 
                to={stage.path}
                style={{
                  textDecoration: 'none',
                  flex: '0 1 auto', // Changed from 1 1 auto to prevent excessive stretching
                  display: 'flex',
                  justifyContent: 'center',
                  minWidth: '220px'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.1)' : stage.color,
                    border: '2px solid #ffffff',
                    opacity: 1,
                    boxShadow: isActive ? `0 0 0 4px ${stage.color}, 0 0 20px ${stage.color}80` : '0 5px 15px rgba(0,0,0,0.2)',
                    width: '100%',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                    }
                  }}
                >
                  {/* Badge */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isActive ? stage.color : 'white',
                    color: isActive ? 'white' : stage.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px',
                    marginRight: '12px',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    {stage.letter}
                  </div>
                  
                  {/* Label */}
                  <span style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '16px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontFamily: 'sans-serif',
                    whiteSpace: 'nowrap'
                  }}>
                    {stage.label}
                  </span>
                </div>
              </Link>
            </React.Fragment>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default ParcoursDiagram;
