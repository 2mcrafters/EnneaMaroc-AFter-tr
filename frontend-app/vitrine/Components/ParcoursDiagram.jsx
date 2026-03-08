import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const mobileCSS = `
@media (max-width: 600px) {
  .parcours-bar { padding: 12px 0 !important; }
  .parcours-stages-wrap { gap: 8px !important; flex-wrap: nowrap !important; padding: 0 8px !important; }
  .parcours-stage-link { min-width: 0 !important; flex: 1 1 0 !important; }
  .parcours-stage-pill { padding: 8px 10px !important; }
  .parcours-stage-badge { width: 26px !important; height: 26px !important; min-width: 26px !important; font-size: 13px !important; margin-right: 6px !important; }
  .parcours-stage-label { font-size: 11px !important; letter-spacing: 0 !important; }
}
`;

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
      color: '#2d969a',
    },
    {
      id: 2,
      path: '/approfondir',
      letter: 'M',
      label: 'Approfondir',
      color: '#64508d',
    },
    {
      id: 3,
      path: '/transmettre',
      letter: 'V',
      label: 'Transmettre',
      color: '#ff7d2d',
    },
  ];

  return (
    <>
    <style>{mobileCSS}</style>
    <div style={{
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)',
      marginBottom: '40px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div className="parcours-bar" style={{
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
        <div className="parcours-stages-wrap" style={{
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
                className="parcours-stage-link"
                style={{
                  textDecoration: 'none',
                  flex: '0 1 auto',
                  display: 'flex',
                  justifyContent: 'center',
                  minWidth: '220px'
                }}
              >
                <div 
                  className="parcours-stage-pill"
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
                  <div className="parcours-stage-badge" style={{
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
                  <span className="parcours-stage-label" style={{
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
    </>
  );
};

export default ParcoursDiagram;
