import { useScrollReveal, useTypingEffect } from '../../hooks/useSectionAnims';

const SectionTitle = ({ Title, SubTitle }) => {
  const [ref, isVisible] = useScrollReveal(0.2);
  const plain = typeof Title === 'string' ? Title.replace(/<[^>]+>/g, '') : '';
  const typed = useTypingEffect(plain, isVisible, 34);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.75s ease, transform 0.75s ease',
      }}
    >
      <div className="sub-title">
        {SubTitle}
      </div>
      <h2 className="sec-title">
        {isVisible ? typed : ''}
        {isVisible && typed.length < plain.length && (
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            background: 'currentColor',
            marginLeft: '3px',
            verticalAlign: 'middle',
            animation: 'blink 0.8s step-start infinite',
          }} />
        )}
      </h2>
    </div>
  );
};

export default SectionTitle;