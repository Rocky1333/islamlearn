

const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth; // Установка ширины canvas равной ширине body
canvas.height = document.body.clientHeight; // Установка высоты canvas равной высоте body

const stars = [];
const numStars = 400;

for (let i = 0; i < numStars; i++) {
	stars.push({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		radius: Math.random() * 1.9,
		alpha: Math.random(),
		dx: Math.random() * 0.5,
		dy: Math.random() * 0.5,
		color: Math.random() > 0.5 ? 'green' : 'white'
	});
}

function drawStars() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	stars.forEach(star => {
		ctx.globalAlpha = star.alpha;
		ctx.fillStyle = star.color;
		ctx.beginPath();
		ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1.0;
	});
}

function updateStars() {
	stars.forEach(star => {
		star.x += star.dx;
		star.y += star.dy;

		if (star.x > canvas.width) {
			star.x = 0;
		} else if (star.x < 0) {
			star.x = canvas.width;
		}

		if (star.y > canvas.height) {
			star.y = 0;
		} else if (star.y < 0) {
			star.y = canvas.height;
		}
	});
}

function animate() {
	drawStars();
	updateStars();
	requestAnimationFrame(animate);
}

animate();






// Настройки меню навигации.

let menu = document.querySelector('.footer');
let canvas_bg = document.querySelector('.starCanvas');

let menu_profile = document.querySelector('.profile');
let menu_referals = document.querySelector('.referals');
let menu_clicker = document.querySelector('.clicker');
let menu_quests = document.querySelector('.quests');
let menu_airdrop = document.querySelector('.airdrop');

let container = document.querySelector('.container');
let body = document.querySelector('body');

let border_bottom_ul = document.querySelector('.menu-ul');
let ul_profile = document.querySelector('.ul_profile');
let ul_referals = document.querySelector('.ul_referals');
let ul_clicker = document.querySelector('.ul_clicker');
let ul_quests = document.querySelector('.ul_quests');
let ul_airdrop = document.querySelector('.ul_airdrop');

function highlightBorder(activeUl) {
    [ul_profile, ul_referals, ul_clicker, ul_quests, ul_airdrop].forEach(ul => {
        ul.style.borderBottom = ul === activeUl ? '2px white solid' : 'none';
    });
}

function openMenu(menuToShow, ulToHighlight) {
    setTimeout(function() {
        menu.style.height = "85vh";
        canvas_bg.style.filter = "blur(2px)";
        container.style.filter = "blur(3px)";
        border_bottom_ul.style.borderBottom = "2px white solid";
        highlightBorder(ulToHighlight);

        [menu_profile, menu_referals, menu_clicker, menu_quests, menu_airdrop].forEach(menu => {
            menu.style.display = menu === menuToShow ? 'flex' : 'none';
        });

    }, 100); // Укажите задержку в миллисекундах
}

function closeMenu() {
    let menuHeightPx = parseFloat(window.getComputedStyle(menu).height);

    if (menuHeightPx >= window.innerHeight * 0.75) {
        menu.style.height = "13vh";
        canvas_bg.style.filter = "none";
        container.style.filter = "none";
        body.style.overflow = "auto";
        border_bottom_ul.style.borderBottom = "none";
        highlightBorder(null);

        [menu_profile, menu_referals, menu_clicker, menu_quests, menu_airdrop].forEach(menu => {
            menu.style.display = 'none';
        });
    }
}




document.querySelector('.ul_profile').addEventListener('click', () => openMenu(menu_profile, ul_profile));
document.querySelector('.ul_referals').addEventListener('click', () => openMenu(menu_referals, ul_referals));
document.querySelector('.ul_clicker').addEventListener('click', () => openMenu(menu_clicker, ul_clicker));
document.querySelector('.ul_quests').addEventListener('click', () => openMenu(menu_quests, ul_quests));
document.querySelector('.ul_airdrop').addEventListener('click', () => openMenu(menu_airdrop, ul_airdrop));
document.querySelector('.container').addEventListener('click', closeMenu);
document.querySelector('.starCanvas').addEventListener('click', closeMenu);

// web app 


const tg = window.Telegram.WebApp;
const id = tg.initDataUnsafe.user.id;
const username = tg.initDataUnsafe.user.first_name;

console.log(id);
console.log(username);

const firstname = document.querySelector('.firstname h1')
firstname.textContent = username;

fetch('/', {
    method: 'POST',
    body: JSON.stringify({ id, username }),
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    console.log('Server response:', data);
})
.catch(error => {
    console.error('Error:', error);
});


/* SOCKET */ 


const socket = io('https://islamlearn.vercel.app')

		socket.on('connect', () => {
			console.log('Connected to server');
		});

		socket.on("balance", user_balance => {
			document.getElementById('balance').textContent = user_balance;
			balance = user_balance;
		});

		socket.on("click", click => {
			const clicker_circle = document.getElementById('clicker-circle')

			clicker_circle.addEventListener("click", () => {
				balance += click;
				clicker_circle.style.transform = "scale(1.02)";
				
				// Обновляем отображение баланса после клика
				document.getElementById('balance').innerHTML = balance;
				
				// Отправляем обновленный баланс на сервер
				socket.emit('balance', balance);

				setTimeout(() => {
                    clicker_circle.style.transform = "scale(1.0)";
                }, 100);
			});
		});	

		socket.on("level", level => {
			const container = document.querySelector(".upgrades-container");
			const children = Array.from(container.querySelectorAll(':scope > div'));
			
			// Определяем количество элементов для скрытия
			const elementsToHide = 8 - level;
			console.log(level);
			// Скрываем нужное количество элементов
			for (let i = 0; i < elementsToHide; i++) {
				if (i < children.length) {
					children[i].style.display = "none";
				}
			}
		});

		

		

		
			

