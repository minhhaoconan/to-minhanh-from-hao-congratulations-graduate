document.addEventListener('DOMContentLoaded', () => {
	
	const bgm = document.getElementById('bgm');
	bgm.volume = 0.7;
	bgm.muted = true;
	let spotifyMaster = false;
	
	function enableBgm() {
	    bgm.muted = false;
	    bgm.play();
	    if (bgmToggle) setBgmToggleLabel();
	    document.removeEventListener('click', enableBgm);
	}

	document.addEventListener('click', enableBgm);
	
	const bgmToggle = document.getElementById('bgm-toggle');
	
	function isBgmPlaying(){ return !bgm.muted && !bgm.paused }
	function setBgmToggleLabel(){ bgmToggle.textContent = isBgmPlaying() ? 'Tắt nhạc nền' : 'Bật nhạc nền' }

	const spotifyBtn = document.getElementById('spotify-btn');
	const spotify = document.getElementById('spotify');
	const spotifyPlay = document.getElementById('spotify-play');
	const spotifyPause = document.getElementById('spotify-pause');


    const house = document.getElementById('house');
    const messageBtn = document.getElementById('message-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const letter = document.getElementById('letter');
    const pomodoro = document.getElementById('pomodoro');
    const timerDisplay = document.getElementById('timer');
    const startPauseBtn = document.getElementById('start-pause');
    const resetPomodoro = document.getElementById('reset-pomodoro');
    const background = document.getElementById('background');
    const sunflowers = document.getElementById('sunflowers');
    const character = document.getElementById('character');
    const gameCanvas = document.getElementById('game');
    const ctx = gameCanvas.getContext('2d');
    const groundOffset = 5;
	const obstacleImg = new Image();
	obstacleImg.src = 'img/obstacle.png';
	
	function openPopup(popupEl) {
	    const overlay = document.createElement('div');
	    overlay.classList.add('overlay');
	    document.body.appendChild(overlay);
	    if (popupEl === spotify) {
	        spotifyMaster = true;
	        bgm.pause();
	    }
	    popupEl.classList.remove('hidden');
	    overlay.addEventListener('click', () => {
	        popupEl.classList.add('hidden');
	        overlay.remove();
	    });
	}
	
	spotifyBtn.addEventListener('click', () => {
	    openPopup(spotify);
	    setBgmToggleLabel();
	});
	
	bgmToggle.addEventListener('click', () => {
	    if (isBgmPlaying()) {
	        bgm.pause();
	    } else {
	        bgm.muted = false;
	        bgm.play().catch(()=>{});
	    }
	    setBgmToggleLabel();
	});

    messageBtn.addEventListener('click', () => {
        openPopup(letter);
        setTimeout(() => {
            background.classList.remove('bg-day');
            background.classList.add('bg-night2');
        }, 10000);
    });

    pomodoroBtn.addEventListener('click', () => {
        openPopup(pomodoro);
    });
	
	spotifyBtn.addEventListener('click', () => {
	    openPopup(spotify);
	});

    // ===== Pomodoro Logic =====
    const modes = {
        pomodoro: 1500,
        short: 300,
        long: 900
    };
    let currentMode = 'pomodoro';
    let timeLeft = modes[currentMode];
    let isRunning = false;
    let timerInterval;
    let completedPomos = 0;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        document.getElementById('pomo-count').textContent = completedPomos;
    }

    document.querySelectorAll('.mode-buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.mode-buttons .active').classList.remove('active');
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            timeLeft = modes[currentMode];
            isRunning = false;
            clearInterval(timerInterval);
            startPauseBtn.textContent = 'Bắt đầu';
            updateDisplay();
        });
    });

    startPauseBtn.addEventListener('click', () => {
        if (!isRunning && timeLeft > 0) {
            isRunning = true;
            startPauseBtn.textContent = 'Tạm dừng';
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startPauseBtn.textContent = 'Bắt đầu';
                    if (currentMode === 'pomodoro') {
                        completedPomos++;
                    }
                    new Audio('ding.mp3').play();
                }
            }, 1000);
        } else if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            startPauseBtn.textContent = 'Bắt đầu';
        }
    });

    resetPomodoro.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = modes[currentMode];
        startPauseBtn.textContent = 'Bắt đầu';
        updateDisplay();
    });

    updateDisplay();
    // ===== End Pomodoro Logic =====

    // ===== Game Logic =====
    house.addEventListener('click', () => {
        character.classList.remove('hidden');
        setTimeout(() => {
            background.classList.add('hidden');
            messageBtn.parentNode.classList.add('hidden');
            house.classList.add('hidden');
            sunflowers.classList.add('hidden');
            gameCanvas.classList.remove('hidden');
            startGame();
        }, 5000);
    });

    const LOGIC_W = 800;
    const LOGIC_H = 300;

    const charImg = new Image();
    charImg.src = 'img/char.png';

    let player = { x: 50, y: LOGIC_H - 50, width: 50, height: 50, velocity: 0, gravity: 0.5, jump: -12 };
    let obstacles = [];
    let frame = 0;
    let gameOver = false;
    let score = 0;
	let bestScore = 0;

	let obstacleAspect = 1;
	obstacleImg.onload = () => {
		obstacleAspect = obstacleImg.width / obstacleImg.height;
	};


    charImg.onload = () => {
        const ratio = charImg.height / charImg.width;
        player.width = 60;
        player.height = Math.round(player.width * ratio);
        player.y = LOGIC_H - player.height - groundOffset;
    };
    
    const visualOffset = 12;
    function drawPlayer() {
        ctx.drawImage(charImg, player.x, player.y + visualOffset, player.width, player.height);
    }

	function drawObstacles() {
		obstacles.forEach(obs => {
			ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
		});
	}
	
	function resetGameState() {
	    obstacles = [];
	    frame = 0;
	    score = 0;
	    gameOver = false;
	    player.x = 50;
	    player.velocity = 0;
	    player.y = LOGIC_H - player.height - groundOffset;
	}

	function update() {
	    frame++;
	
	    if (!gameOver) {
	        player.velocity += player.gravity;
	        player.y += player.velocity;
	        if (player.y > LOGIC_H - player.height - groundOffset) player.y = LOGIC_H - player.height - groundOffset;
	
	        if (frame % 100 === 0) {
	            const h = 55;
	            const w = h * obstacleAspect;
	            obstacles.push({ x: LOGIC_W, y: LOGIC_H - h - groundOffset, width: w, height: h });
	        }
	
	        obstacles.forEach(obs => {
	            obs.x -= 5;
	            if (player.x < obs.x + obs.width && player.x + player.width > obs.x &&
	                player.y < obs.y + obs.height && player.y + player.height > obs.y) {
	                gameOver = true;
					if (score > bestScore) bestScore = score;
	            }
	        });
	        obstacles = obstacles.filter(o => o.x + o.width >= 0);
	        score = Math.floor(frame / 60);
	    }
	
	    ctx.clearRect(0, 0, LOGIC_W, LOGIC_H);
	    ctx.fillStyle = '#87CEEB';
	    ctx.fillRect(0, 0, LOGIC_W, LOGIC_H);
	    drawPlayer();
	    drawObstacles();
	    ctx.fillStyle = '#1A535C';
	    ctx.font = 'bold 16px Quicksand';
	    ctx.fillText(`Điểm: ${score}`, LOGIC_W - 100, 30);
	
		if (gameOver) {
		    ctx.save();
		    ctx.fillStyle = 'rgba(0,0,0,0.35)';
		    ctx.fillRect(0, 0, LOGIC_W, LOGIC_H);
		    ctx.textAlign = 'center';
		    ctx.textBaseline = 'middle';
		    ctx.fillStyle = '#FDFBF7';
		    ctx.font = 'bold 28px Quicksand';
		    ctx.fillText('Thua keo này ta bày keo khác.', LOGIC_W / 2, LOGIC_H / 2 - 20);
		    ctx.font = 'bold 18px Quicksand';
		    ctx.fillText(`Bạn đã sống sót được: ${score} giây  |  Best: ${bestScore} giây`, LOGIC_W / 2, LOGIC_H / 2 + 12);
		    ctx.fillStyle = '#FFE66D';
		    ctx.font = 'bold 16px Quicksand';
		    ctx.fillText('Nhấn Space để chơi lại', LOGIC_W / 2, LOGIC_H / 2 + 44);
		    ctx.restore();
		}

	
	    requestAnimationFrame(update);
	}


    function startGame() {
        const dpr = window.devicePixelRatio || 1;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        gameCanvas.width = vw * dpr;
        gameCanvas.height = vh * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const scaleX = vw / LOGIC_W;
        const scaleY = vh / LOGIC_H;
        const scale = Math.min(scaleX, scaleY);
        ctx.scale(scale * dpr, scale * dpr);
        const offsetX = (vw / scale - LOGIC_W) / 2;
        const offsetY = (vh / scale - LOGIC_H) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.imageSmoothingEnabled = false;

		document.addEventListener('keydown', (e) => {
		    if (e.code !== 'Space') return;
		    e.preventDefault();
		    if (gameOver) {
		        resetGameState();
		        return;
		    }
		    if (player.y >= LOGIC_H - player.height - groundOffset) {
		        player.velocity = player.jump;
		    }
		});
        update();
    }

});




