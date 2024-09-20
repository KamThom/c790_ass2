// A list of keys that are currently pressed down
var keysdown = {};

// Event listener for key press (keydown)
window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) return; // Do nothing if the event was already processed
    keysdown[event.key] = true;         // Mark the key as pressed
    event.preventDefault();
}, true);

// Event listener for key release (keyup)
window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) return;
    keysdown[event.key] = false;        // Mark the key as released
    event.preventDefault();
}, true);

// initalize 
window.onload = function() {
    const canvas = document.getElementById("myCanvass");
    const ctx = canvas.getContext("2d");

    // dynamic canvass
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // variables
    let stars = [];
    let numStars = 100;
    let score = 0;
    let health = 100;
    let gameOver = false;
    let bullets = [];
    let asteroids = [];
    let numAsteroids = 10;

    // spaceship obj
    const spaceship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 80,
        angle: 0,
        speedX: 0,
        speedY: 0,
        thrusterPower: 0.2,
        rotationSpeed: 0.05,
        friction: 0.98,   // slow down the ship so its not so bouncy
        thrustersActive: false,
        reverseThrustersActive: false
    };

    // FTS
    const fixedTimeStep = 1000 / 60;   
    let lastFrameTime = performance.now();
    let deltaTimeAccumulator = 0;

    // initalize stars and create array of ran dimensions 
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3,
            speed: Math.random() * 0.5 + 0.5
        });  
    }

    // initalize  asteroid 
    function createAsteroids() {
        for (let i = 0; i < numAsteroids; i++) {
            asteroids.push({
                x: Math.random() * canvas.width,
                y: -Math.random() * canvas.height,
                size: Math.random() * 40 + 20,
                speed: Math.random() * 2 + 1,
                hit: false, //did ship hit?
                hitByBullet: false // did bullet hit?
            });
        }
    }

    // shoot bullet when spacebar is pressed
    function shootBullet() {
        bullets.push({
            x: spaceship.x,
            y: spaceship.y,
            size: 5,
            speedX: Math.sin(spaceship.angle) * 5,
            speedY: -Math.cos(spaceship.angle) * 5
        });
    }

    // spacebar event. this was an afterthought but when added to process, it shoots a line
    window.addEventListener("keydown", function(event) {
        if (event.key === ' ') {
            shootBullet();
        }
    });

    // input!
    function processInput() {
        spaceship.thrustersActive = false;
        spaceship.reverseThrustersActive = false;

        if (keysdown.ArrowLeft) {
            spaceship.angle -= spaceship.rotationSpeed;
        }

        if (keysdown.ArrowRight) {
            spaceship.angle += spaceship.rotationSpeed;
        }

        if (keysdown.ArrowUp) {
            let forceX = Math.sin(spaceship.angle) * spaceship.thrusterPower;
            let forceY = -Math.cos(spaceship.angle) * spaceship.thrusterPower;
            spaceship.speedX += forceX;
            spaceship.speedY += forceY;
            spaceship.thrustersActive = true;  // orange thrust forward 
        }

        if (keysdown.ArrowDown) {
            let forceX = Math.sin(spaceship.angle) * spaceship.thrusterPower;
            let forceY = -Math.cos(spaceship.angle) * spaceship.thrusterPower;
            spaceship.speedX -= forceX * 0.5;
            spaceship.speedY -= forceY * 0.5;
            spaceship.reverseThrustersActive = true;  // blue flame backward
        }
    }

    // ship posi
    function updateSpaceship() {
        spaceship.speedX *= spaceship.friction; //adds the fric to slow down over time
        spaceship.speedY *= spaceship.friction;

        spaceship.x += spaceship.speedX;
        spaceship.y += spaceship.speedY;

        // bouncd off walls
        if (spaceship.x < 0) {
            spaceship.x = 0;
            spaceship.speedX *= -1;
        } else if (spaceship.x > canvas.width) {
            spaceship.x = canvas.width;
            spaceship.speedX *= -1;
        }

        if (spaceship.y < 0) {
            spaceship.y = 0;
            spaceship.speedY *= -1;
        } else if (spaceship.y > canvas.height) {
            spaceship.y = canvas.height;
            spaceship.speedY *= -1;
        }
    }

    function drawSpaceship() {
        ctx.save();
        ctx.translate(spaceship.x, spaceship.y);
        ctx.rotate(spaceship.angle);

        // ship bod
        ctx.fillStyle = 'gray';
        ctx.fillRect(-spaceship.width / 2, -spaceship.height / 2, spaceship.width, spaceship.height);

        // forward thrust
        if (spaceship.thrustersActive) {
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.moveTo(-spaceship.width / 4, spaceship.height / 2);
            ctx.lineTo(spaceship.width / 4, spaceship.height / 2);
            ctx.lineTo(0, spaceship.height / 2 + 20);
            ctx.closePath();
            ctx.fill();
        }

        // blue thrusts
        if (spaceship.reverseThrustersActive) {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(-spaceship.width / 4, -spaceship.height / 2);
            ctx.lineTo(spaceship.width / 4, -spaceship.height / 2);
            ctx.lineTo(0, -spaceship.height / 2 - 20);
            ctx.closePath();
            ctx.fill();
        }

        // ship views
        ctx.fillStyle = 'white';
        ctx.fillRect(-spaceship.width / 6, -spaceship.height / 3, spaceship.width / 3, spaceship.height / 6);

        ctx.restore();
    }

    function drawStars() { //background
        ctx.fillStyle = 'white';
        stars.forEach((star) => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });
    }

    function drawBullets() {
        ctx.fillStyle = 'yellow';
        bullets.forEach((bullet) => {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateBullets() {
        bullets.forEach((bullet, index) => {
            bullet.x += bullet.speedX;
            bullet.y += bullet.speedY;

            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) { //if bullet is not on screen i dont need
                bullets.splice(index, 1);
            }
        });
    }

    function drawAsteroids() {
        ctx.fillStyle = 'brown'; // TODO:Why are they red?
        asteroids.forEach((asteroid) => {
            ctx.beginPath();
            ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateAsteroids() {
        asteroids.forEach((asteroid) => {
            asteroid.y += asteroid.speed;

            if (asteroid.y > canvas.height) { // if asteroid goes below screen, reset
                asteroid.y = -asteroid.size;
                asteroid.x = Math.random() * canvas.width;
            }
        });
    }

    function detectCollision() { // all detections
        for (let i = asteroids.length - 1; i >= 0; i--) { // ship hit asteroid?
            let asteroid = asteroids[i];
            let dx = asteroid.x - spaceship.x;
            let dy = asteroid.y - spaceship.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size + spaceship.width / 2) {
                health -= 20;
                if (health <= 0) {
                    gameOver = true;
                }
                asteroids.splice(i, 1); // remove asteroid
            }

            bullets.forEach((bullet, bulletIndex) => { // bullet hit asteroid?
                let dx = asteroid.x - bullet.x;
                let dy = asteroid.y - bullet.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < asteroid.size + bullet.size) {
                    score += 10;
                    asteroids.splice(i, 1);      // del aster
                    bullets.splice(bulletIndex, 1); // del bull
                }
            });
        }
    }

    function displayStats() {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, 10, 30);
        ctx.fillText("Health: " + health, 10, 60);

        if (gameOver) { // game over screen when "dead"
            ctx.fillStyle = "red";
            ctx.font = "50px Arial";
            ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
        }
    }

    function gameLoop(currentTime) {
        deltaTimeAccumulator += currentTime - lastFrameTime;
        lastFrameTime = currentTime;

        while (deltaTimeAccumulator >= fixedTimeStep) {
            processInput();
            updateSpaceship();
            updateBullets();
            updateAsteroids();
            detectCollision();
            deltaTimeAccumulator -= fixedTimeStep;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvass
        drawStars();
        drawSpaceship();
        drawBullets();
        drawAsteroids();
        displayStats();

        requestAnimationFrame(gameLoop); 
    }

    createAsteroids();
    requestAnimationFrame(gameLoop);
};