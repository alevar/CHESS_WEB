import { Button } from "react-bootstrap"
import "./NextButton.css";
import { Link } from 'react-router-dom';

const NextButton = () => {
  return (
    <Link to="/interface/tissue" className="page-transition">
      <Button>Next</Button>
    </Link>
  )
}

export default NextButton
