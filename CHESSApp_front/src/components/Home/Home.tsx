import './Home.css'

const Home = () => {
  return (
    <div>
      <div className="jumbotron">
        <h1 className="display-4">CHESS Web Interface</h1>
        <p className="lead">CHESS is a comprehensive set of human genes based on nearly 10,000 RNA sequencing experiments produced by the GTEx project.</p>
        <hr className="my-4"/>
          <p>You can select through our various references to create a custom annotation!</p>
          <a className="btn btn-primary btn-lg" href={"/interface"} role="button">Build Annotation</a>
      </div>
    </div>
  )
}

export default Home
