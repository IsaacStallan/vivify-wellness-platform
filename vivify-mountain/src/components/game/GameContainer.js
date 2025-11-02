import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import TrainingHouse from './scenes/TrainingHouse';
import WorldMap from './scenes/WorldMap';
import MountainClimbing from './scenes/MountainClimbing';
import GameUI from './GameUI';
import './GameContainer.css';

function GameContainer() {
    const { mountainData } = useGame();
    const [currentScene, setCurrentScene] = useState('training'); // training, worldmap, climbing
    const [selectedMountain, setSelectedMountain] = useState(null);

    // Determine which scene to show
    function renderScene() {
        switch(currentScene) {
            case 'training':
                return (
                    <TrainingHouse
                        onComplete={() => setCurrentScene('worldmap')}
                    />
                );
            case 'worldmap':
                return (
                    <WorldMap
                        onSelectMountain={(mountainId) => {
                            setSelectedMountain(mountainId);
                            setCurrentScene('climbing');
                        }}
                        onReturnHome={() => setCurrentScene('training')}
                    />
                );
            case 'climbing':
                return (
                    <MountainClimbing
                        mountainId={selectedMountain}
                        onReturnToMap={() => setCurrentScene('worldmap')}
                    />
                );
            default:
                return <TrainingHouse onComplete={() => setCurrentScene('worldmap')} />;
        }
    }

    return (
        <div className="game-container">
            <div className="game-screen">
                {renderScene()}
                <GameUI currentScene={currentScene} />
            </div>
        </div>
    );
}

export default GameContainer;
