import CardButton, {CardButtonProps} from '../../ui/CardButton'
import {useState, useEffect} from 'react';
import { Button } from "react-bootstrap"
import { Link } from 'react-router-dom';
import './SelectDataSource.css'

const SelectDataSource = () => {
    let [dataSources, setDataSources] = useState<CardButtonProps[]>([])

    // Preform API call to retrieve data for cards 
    useEffect(() => {

      // let currDataSources: CardButtonProps[] = []
      // fetch("http://localhost:5000/api/main/getSources")
      //   .then(response => response.json())
      //   .then(data => {
      //                   console.log(data);
      //                   currDataSources = data;
      //                 });

      // console.log(currDataSources);

        const currDataSources: CardButtonProps[] = [
            {
                title: "CHESS",
                text: "CHESS is a comprehensive set of human genes based on nearly 10,000 RNA sequencing experiments produced by the GTEx project.",
                buttonText: "Use CHESS",
            },
            {
                title: "RefSeq",
                text: "Reference Sequence (RefSeq) database is an open access, annotated and curated collection of publicly available nucleotide sequences.",
                buttonText: "Use RefSeq",
            },
            {
                title:"GENCODE",
                text: "GENCODE project is to identify and classify all gene features in the human and mouse genomes with high accuracy based on biological evidence.",
                buttonText: "Use GENCODE",
            },
              {
                title: "Custom Annotation",
                text: "Use 2 or more data sources, taking unions or intersections!",
                buttonText: "Create a custom annotation",
              },
          ];
       
       
        setDataSources(currDataSources)
    },[])

    // Return cards representing each data source as well as button linking to the next page
    return (
      <>
        <div className="cardButtonContainer">
          {dataSources.map((cardProps, index) => (
          <CardButton key={index} {...cardProps} />
          ))}
        </div>
            
        
        <Link to="/interface/tissue">
          <Button>Next</Button>
        </Link> 
      </>

  )
}

export default SelectDataSource