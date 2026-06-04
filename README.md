<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tire Calculator</title>
    <style>
        body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9;}
        .lang-btn { cursor: pointer; padding: 5px 10px; margin-right: 5px; border: 1px solid #ccc; background: #fff; border-radius: 4px;}
        .lang-btn:hover { background: #eee; }
        .controls { display: flex; gap: 40px; margin-top: 20px; }
        input { width: 60px; padding: 5px; margin-bottom: 5px; }
        canvas { border: 1px solid #ddd; background: #fff; display: block; margin: 20px 0; border-radius: 8px;}
        #result { padding: 15px; background: #e3f2fd; border-radius: 5px; border-left: 5px solid #007bff; font-weight: bold; line-height: 1.5; }
    </style>
</head>
<body>

    <div id="lang-selector">
        <span class="lang-btn" onclick="setLang('en')">EN</span>
        <span class="lang-btn" onclick="setLang('es')">ES</span>
        <span class="lang-btn" onclick="setLang('fr')">FR</span>
        <span class="lang-btn" onclick="setLang('de')">DE</span>
    </div>

    <h2 id="t_title">Tire Size Calculator</h2>
    
    <div class="controls">
        <div>
            <h3 id="t_original" style="color: #666;">Original Size:</h3>
            <input type="number" id="w1" value="205" oninput="calculate()"> Width<br>
            <input type="number" id="p1" value="55" oninput="calculate()"> Profile<br>
            <input type="number" id="d1" value="16" oninput="calculate()"> Rim
        </div>
        <div>
            <h3 id="t_new" style="color: #007bff;">New Size:</h3>
            <input type="number" id="w2" value="225" oninput="calculate()"> Width<br>
            <input type="number" id="p2" value="45" oninput="calculate()"> Profile<br>
            <input type="number" id="d2" value="17" oninput="calculate()"> Rim
        </div>
    </div>

    <canvas id="tireCanvas" width="400" height="240"></canvas>
    
    <div id="result">Result will appear here...</div>

    <script>
        // Словарь для мультиязычности
        const dict = {
            en: { title: "Tire Size Calculator", orig: "Original Size", new: "New Size", res: "Clearance change: {diff} mm<br>Speedometer error: {err}%" },
            es: { title: "Calculadora de Neumáticos", orig: "Tamaño Original", new: "Nuevo Tamaño", res: "Cambio de altura: {diff} mm<br>Error del velocímetro: {err}%" },
            fr: { title: "Calculateur de Pneus", orig: "Taille d'Origine", new: "Nouvelle Taille", res: "Garde au sol: {diff} mm<br>Erreur de vitesse: {err}%" },
            de: { title: "Reifenrechner", orig: "Originalgröße", new: "Neue Größe", res: "Bodenfreiheit: {diff} mm<br>Tachoabweichung: {err}%" }
        };

        let currentLang = 'en'; // Язык по умолчанию

        function setLang(lang) {
            currentLang = lang;
            document.getElementById('t_title').innerText = dict[lang].title;
            document.getElementById('t_original').innerText = dict[lang].orig + ":";
            document.getElementById('t_new').innerText = dict[lang].new + ":";
            calculate(); // Пересчитываем, чтобы обновились тексты на графике и в результате
        }

        function calculate() {
            const w1 = document.getElementById('w1').value, p1 = document.getElementById('p1').value, d1 = document.getElementById('d1').value;
            const w2 = document.getElementById('w2').value, p2 = document.getElementById('p2').value, d2 = document.getElementById('d2').value;

            const getDia = (w, p, d) => (w * (p / 100) * 2) + (d * 25.4);
            const dia1 = getDia(w1, p1, d1);
            const dia2 = getDia(w2, p2, d2);
            
            draw(dia1, dia2); // Рисуем графику

            const diff = ((dia2 - dia1) / 2).toFixed(1); // Изменение клиренса (половина разницы диаметров)
            const error = ((dia2 / dia1 - 1) * 100).toFixed(1);

            let resText = dict[currentLang].res.replace('{diff}', (diff > 0 ? '+' : '') + diff).replace('{err}', (error > 0 ? '+' : '') + error);
            document.getElementById('result').innerHTML = resText;
        }

        function draw(d1, d2) {
            const canvas = document.getElementById('tireCanvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scale = 0.35; // Масштаб для холста
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2 + 10;

            ctx.font = "14px Arial";
            ctx.textAlign = "center";

            // Рисуем старое колесо (серое)
            ctx.beginPath();
            ctx.arc(centerX, centerY, d1 * scale / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Подпись для старого колеса
            ctx.fillStyle = '#666';
            ctx.fillText(dict[currentLang].orig, centerX, centerY - (d1 * scale / 2) - 10);

            // Рисуем новое колесо (синее)
            ctx.beginPath();
            ctx.arc(centerX, centerY, d2 * scale / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]); // Делаем линию пунктирной для наглядности
            ctx.stroke();
            ctx.setLineDash([]); // Возвращаем сплошную линию
            
            // Подпись для нового колеса
            ctx.fillStyle = '#007bff';
            ctx.fillText(dict[currentLang].new, centerX, centerY + (d2 * scale / 2) + 20);
        }

        calculate(); // Запускаем расчет при открытии страницы
    </script>
</body>
</html>
