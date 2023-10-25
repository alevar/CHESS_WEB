import TissueTable from "../../ui/TissueTable"
import NextButton from "./NextButton"

const TissueType = () => {
  return (
    <div className = "mt-4">
        <TissueTable/>
        <NextButton/>
    </div>
  )
}

export default TissueType

// Write prop to pass in link to NextButton component!!