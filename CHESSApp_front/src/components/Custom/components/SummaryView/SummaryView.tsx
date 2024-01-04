import UpsetPlot from './components/UpsetPlot/UpsetPlot';

const SummaryView: React.FC = () => {
    const sampleData = {
        sets: ['A', 'B', 'C', 'D'],
        intersections: [
            { set: 'A', value: 1000 },
            { set: 'B', value: 500 },
            { set: 'C', value: 800 },
            { set: 'D', value: 300 },
            { set: 'A,B', value: 200 },
            { set: 'A,C', value: 400 },
            { set: 'A,D', value: 100 },
            { set: 'B,C', value: 300 },
            { set: 'B,D', value: 200 },
            { set: 'C,D', value: 100 },
            { set: 'A,B,C', value: 100 },
            { set: 'A,B,D', value: 100 },
            { set: 'A,C,D', value: 0 },
            { set: 'B,C,D', value: 100 },
            { set: 'A,B,C,D', value: 0 },
        ],
    };

    return (
        <div className="custom-container">
            <div className="custom-header">Summary</div>
            <UpsetPlot data={sampleData} />
        </div>
    );
};

export default SummaryView;