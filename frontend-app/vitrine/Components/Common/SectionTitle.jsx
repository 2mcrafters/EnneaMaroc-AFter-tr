import parse from 'html-react-parser';

const SectionTitle = ({Title,SubTitle}) => {
    return (
        <div>
      <div className="sub-title"><span><i className="asterisk"></i></span>{parse(SubTitle)}</div>
      <h2 className="sec-title">{parse(Title)}</h2>             
        </div>
    );
};

export default SectionTitle;