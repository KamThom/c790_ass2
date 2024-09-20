let lastFrameTime = 0;             // keep track of the time of last frame
const fixedTimeStep = 1000 / 60;   // 60 updates per second 
let deltaTimeAccumulator = 0;      // tracks accumulated time between frames

function gameUpdate() {
    console.log("Game logic updating...");
}

function gameRender() {
    console.log("Rendering frame...");
}

//main
function gameLoop(currentTime) {
    const timeSinceLastFrame = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    // accumulate the time passed since the last frame
    deltaTimeAccumulator += timeSinceLastFrame;

    // run as many updates as needed to keep up with the fixed time step
    while (deltaTimeAccumulator >= fixedTimeStep) {
        gameUpdate();                   // needed game logic
        deltaTimeAccumulator -= fixedTimeStep;
    }

    gameRender();  // render the frame (variable frame rate)

    // schedule the next frame
    requestAnimationFrame(gameLoop);
}

// loop start
requestAnimationFrame(gameLoop);

/*

Separates updating from rendering (model from view)
Simulates at a constant rate, visible scene may render at variable rate
Need to carefully select time step size (must be > time to update)
Problem: spiral of death if time step < update time
Fix: adjust amount of work in update if frame rate drops

*/
