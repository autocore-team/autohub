<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Universal Tire Size Calculator | Wheel Comparison Tool</title>
    <meta name="description" content="Free multi-language tire size calculator. Compare tire dimensions, clearance changes, and speedometer errors. Supports English, Español, Français, Deutsch.">
    <meta name="keywords" content="tire calculator, calculadora de neumáticos, calculateur de pneus, reifenrechner, wheel size, tire comparison">
    
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            padding: 20px; 
            max-width: 600px; 
            margin: auto; 
            background-color: #f9f9f9;
            color: #333;
        }
        #lang-selector { display: flex; gap: 8px; margin-bottom: 20px; }
        .lang-btn { 
            cursor: pointer; 
            padding: 6px 12px; 
            border: 1px solid #ccc; 
            background: #fff; 
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: bold;
            transition: 0.2s;
        }
        .lang-btn:hover { background: #eee; }
        .lang-btn.active { background: #007bff; color: white; border-color: #007bff; }
        
        .controls { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 20px; 
        }
        @media (max-width: 480px) { .controls { grid-template-columns: 1fr; } }
        
        .param-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .input-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        input { width: 70px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; text-align: center; font-size: 1rem; }
        
        canvas { border: 1px solid #ddd; background: #fff; display: block; margin: 20px auto; border-radius: 8px; max-width: 100%; height: auto;}
        #result { padding: 15px; background: #e3f2fd; border-radius: 5px; border-left: 5px solid #007bff; font-weight: bold; line-height: 1.5; }
    </style>
</head>
<body>

    <div id="lang-selector">
        <button class="lang-btn active" id="btn-en" onclick="setLang('en')">EN</button>
        <button class="lang-btn" id="btn-es" onclick="setLang('es')">ES</button>
        <button class="lang-btn" id="btn-fr" onclick="setLang('fr')">FR</button>
        <button class="lang-btn" id="btn-de" onclick="setLang('de')">DE</button>
    </div>

    <h2 id="t_title">Tire Size Calculator</h2>
    
    <div class="controls">
        <div class="param-box">
            <h3 id="t_original" style="color: #666; margin-top:0;">Original Size:</h3>
            <div class="input-row"><span id="lbl_w1">Width</span> <input type="number" id="w1" value="205" oninput="calculate()"></div>
            <div class="input-row"><span id="lbl_p1">Profile</span> <input type="number" id="p1" value="55" oninput="calculate()"></div>
            <div class="input-row"><span id="lbl_d1">Rim</span> <input type="number" id="d1" value="16" oninput="calculate()"></div>
        </div>
        <div class="param-box">
            <h3 id="t_new" style="color: #007bff; margin-top:0;">New Size:</h3>
            <div class="input-row"><span id="lbl_w2">Width</span> <input type="number" id="w2" value="225" oninput="calculate()"></div>
            <div class="input-row"><span id="lbl_p2">Profile</span> <input type="number" id="p2" value="45" oninput="calculate()"></div>
            <div class="input-row"><span id="lbl_d2">Rim</span> <input type="number" id="d2" value="17" oninput="calculate()"></div>
        </div>
    </div>

    <canvas id="tireCanvas" width="400" height="240"></canvas>
    
    <div id="result">Result will appear here...</div>

    <script>
        // Расширенный словарь для полной мультиязычности
        const dict = {
            en: { 
                title: "Tire Size Calculator", orig: "Original Size", new: "New Size", 
                w: "Width (mm)", p: "Profile (%)", d: "Rim (inch)",
                res: "Clearance change: {diff} mm<br>Speedometer error: {err}%" 
            },
            es: { 
                title: "Calculadora de Neumáticos", orig: "Tamaño Original", new: "Nuevo Tamaño", 
                w: "Ancho (mm)", p: "Perfil (%)", d: "Llanta (pulgadas)",
                res: "Cambio de altura: {diff} mm<br>Error del velocímetro: {err}%" 
            },
            fr: { 
                title: "Calculateur de Pneus", orig: "Taille d'Origine", new: "Nouvelle Taille", 
                w: "Largeur (mm)", p: "Profil (%)", d: "Jante (pouces)",
                res: "Garde au sol: {diff} mm<br>Erreur de vitesse: {err}%" 
            },
            de: { 
                title: "Reifenrechner", orig: "Originalgröße", new: "Neue Größe", 
                w: "Breite (mm)", p: "Profil (%)", d: "Felge (Zoll)",
                res: "Bodenfreiheit: {diff} mm<br>Tachoabweichung: {err}%" 
            }
        };

        let currentLang = 'en';

        function setLang(lang) {
            currentLang = lang;
            
            // Подсветка активной кнопки языка
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('btn-' + lang).classList.add('active');
            
            // Перевод текстов
            document.getElementById('t_title').innerText = dict[lang].title;
            document.getElementById('t_original').innerText = dict[lang].orig + ":";
            document.getElementById('t_new').innerText = dict[lang].new + ":";
            
            // Перевод подписей полей ввода
            document.getElementById('lbl_w1').innerText = dict[lang].w;
            document.getElementById('lbl_p1').innerText = dict[lang].p;
            document.getElementById('lbl_d1').innerText = dict[lang].d;
            document.getElementById('lbl_w2').innerText = dict[lang].w;
            document.getElementById('lbl_p2').innerText = dict[lang].p;
            document.getElementById('lbl_d2').innerText = dict[lang].d;
            
            calculate(); 
        }

        function calculate() {
            const w1 = document.getElementById('w1').value, p1 = document.getElementById('p1').value, d1 = document.getElementById('d1').value;
            const w2 = document.getElementById('w2').value, p2 = document.getElementById('p2').value, d2 = document.getElementById('d2').value;

            const getDia = (w, p, d) => (w * (p / 100) * 2) + (d * 25.4);
            const dia1 = getDia(w1, p1, d1);
            const dia2 = getDia(w2, p2, d2);
            
            draw(dia1, dia2);

            const diff = ((dia2 - dia1) / 2).toFixed(1); 
            const error = ((dia2 / dia1 - 1) * 100).toFixed(1);

            let resText = dict[currentLang].res.replace('{diff}', (diff > 0 ? '+' : '') + diff).replace('{err}', (error > 0 ? '+' : '') + error);
            document.getElementById('result').innerHTML = resText;
        }

        function draw(d1, d2) {
            const canvas = document.getElementById('tireCanvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scale = 0.35; 
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2 + 10;

            ctx.font = "14px Arial";
            ctx.textAlign = "center";

            // Старое колесо (серое)
            ctx.beginPath();
            ctx.arc(centerX, centerY, d1 * scale / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = '#666';
            ctx.fillText(dict[currentLang].orig, centerX, centerY - (d1 * scale / 2) - 10);

            // Новое колесо (синее пунктирное)
            ctx.beginPath();
            ctx.arc(centerX, centerY, d2 * scale / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]); 
            ctx.stroke();
            ctx.setLineDash([]); 
            
            ctx.fillStyle = '#007bff';
            ctx.fillText(dict[currentLang].new, centerX, centerY + (d2 * scale / 2) + 20);
        }

        // Инициализация подписей при первом старте
        setLang('en');
    </script>
</body>
</html>
 
