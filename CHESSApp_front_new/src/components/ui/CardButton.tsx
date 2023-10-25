import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
// import { useState } from 'react';

export type CardButtonProps = {
  title: string;
  text: string;
  buttonText: string;
}

function CardButton(props: CardButtonProps) {

  // const [isSelected, setIsSelected] = useState(false);

  // const handleButtonClick = () => {
  //   setIsSelected(!isSelected);
  // };

  const { title, text, buttonText } = props;

  return (
    <Card style={{ width: '18rem', backgroundColor: '#f5f5f5'}}>

      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{text}</Card.Text>
        <Button variant="outline-primary">
          {buttonText}
        </Button>
      </Card.Body>

    </Card>
  );
}



export default CardButton;

// next steps:
// 1) make cards render based on data sources fetched from api
// 2) make a next button to navigate to different pages; or do the swipe thing
// 3) share data between pages, and print a json with all gtf specifications at the end of the app