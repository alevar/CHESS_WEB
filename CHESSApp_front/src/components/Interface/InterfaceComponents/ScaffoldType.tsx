import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ScaffoldType = () => {
    return(
        <>
            <div className="d-grid gap-2 mt-4">
                <Button variant="secondary" size="lg">
                    Alt
                </Button>

                <Button variant="secondary" size="lg">
                    Random
                </Button>

                <Button variant="secondary" size="lg">
                    Unplaced
                </Button>

                <Button variant="secondary" size="lg">
                    Patches
                </Button>

                <Button variant="secondary" size="lg">
                    Primary
                </Button>
            </div>
            <div className="mt-4">
                <Link to="/interface/scaffold">
                    <Button className = "mt-6">Next</Button>
                </Link> 
            </div>
        </>
    )
}

export default ScaffoldType