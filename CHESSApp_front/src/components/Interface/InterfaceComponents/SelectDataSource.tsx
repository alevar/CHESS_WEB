import CardButton, {CardButtonProps} from '../../ui/CardButton'
import {useState, useEffect} from 'react';
import './SelectDataSource.css'

const SelectDataSource = () => {
    let [dataSources, setDataSources] = useState<CardButtonProps[]>([])

    useEffect(() => {

        //fetch("some_url")
        // .then(response => response.json())
        // .then(data => setDataSources(data.message))


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


    return (
    <div className="cardButtonContainer">
        {dataSources.map((cardProps, index) => (
            <CardButton key={index} {...cardProps} />
      ))}
    </div>
  )
}

export default SelectDataSource