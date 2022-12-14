// ==UserScript==
// @name         r/place overlay template
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  eh
// @author       oralekin, LittleEndu, ekgame, Wieku, DeadRote, violet-ta
// @match        https://place.manechat.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==
if (window.top !== window.self) {

    window.addEventListener('load', async() => {

        console.log('load');

        sources.reverse();

        const root = document.getElementsByTagName("mona-lisa-embed")[0].shadowRoot.children[0].getElementsByTagName("mona-lisa-canvas")[0].shadowRoot.children[0];

        let canvas, mask, burn, hot_check, visInput;

        const css_size = 1000;
        const size = css_size * 3;

        async function draw() {

            let new_canvas = document.createElement('canvas');
            new_canvas.style = "position: absolute;left: 0;top: 0;image-rendering: pixelated;";

            new_canvas.style.width = new_canvas.style.height = css_size + 'px';
            new_canvas.width = new_canvas.height = size;

            let ctx = new_canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;

            ctx.clearRect(0, 0, size, size);

            let images = [];

            for (let src of sources) {
                const image = document.createElement("img");
                image.src = src[0];
                let x = src[1] * 3;
                let y = src[2] * 3;
                let dx = src[3] * 3;
                let dy = src[4] * 3;

                await image.decode();

                ctx.drawImage(image, x, y, dx, dy);
            }


            if (canvas !== undefined) {
                canvas.remove();
            }
            canvas = new_canvas;

            if (mask !== undefined) {
                mask.remove();
            }

            if (burn !== undefined) {
                burn.remove();
            }


            burn = document.createElement('canvas');
            burn.style = `position: absolute;left: 0;top: 0;image-rendering: pixelated;
                          mix-blend-mode: difference;`;

            burn.style.width = burn.style.height = css_size + 'px';
            burn.width = burn.height = css_size;

            let b_ctx = burn.getContext('2d');
            b_ctx.imageSmoothingEnabled = false;

            b_ctx.drawImage(new_canvas, 0, 0, css_size, css_size);

            root.append(burn);


            mask = document.createElement('canvas');

            mask.style = "position: absolute;left: 0;top: 0;image-rendering: pixelated;";

            mask.style.width = mask.style.height = css_size + 'px';
            mask.width = mask.height = css_size;

            let m_ctx = mask.getContext('2d');
            m_ctx.imageSmoothingEnabled = false;

            m_ctx.fillStyle = 'black';
            m_ctx.fillRect(0, 0, size, size);

            m_ctx.globalCompositeOperation = 'destination-out';
            m_ctx.drawImage(burn, 0, 0);

            root.append(mask);

            mask.style.opacity = hot_check.checked ? 1 : visInput.value;


            for (let i = 0; i < css_size; i += 1) {

                ctx.clearRect(0, i * 3, size, 1);
                ctx.clearRect(0, i * 3 + 2, size, 1);

                ctx.clearRect(i * 3, 0, 1, size);
                ctx.clearRect(i * 3 + 2, 0, 1, size);
            }

            burn.style.display = hot_check.checked ? 'block' : 'none';
            canvas.style.display = hot_check.checked ? 'none' : 'block';

            root.append(canvas);
            console.log(canvas);
        }

        const camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");

        const waitForPreview = setInterval(() => {
            const preview = camera.querySelector("mona-lisa-pixel-preview");
            if (preview) {
                clearInterval(waitForPreview);
                const style = document.createElement('style')
                style.innerHTML = '.pixel { clip-path: polygon(-20% -20%, -20% 120%, 37% 120%, 37% 37%, 62% 37%, 62% 62%, 37% 62%, 37% 120%, 120% 120%, 120% -20%); }'
                preview.shadowRoot.appendChild(style);
            }
        }, 100);


        function initSlider() {
            let visSlider = document.createElement("div");
            visSlider.id = 'visSlider';

            visSlider.style = `
                     position: fixed;
                     right: 80px;
                     display: flex;
                     flex-flow: row nowrap;
                     align-items: center;
                     justify-content: center;
                     height: 40px;
                     top: calc(var(--sait) + 16px);
                     text-shadow: black 1px 0 10px;
                     text-align:center;
                `;

            console.log(innerWidth);

            if (innerWidth < 900) {
                visSlider.style.setProperty('top', 'calc(var(--sait) + 48px)');
                visSlider.style.right = 0;
                visSlider.style.left = 0;
            }

            function from_html(htmlString) {
                var div = document.createElement('div');
                div.innerHTML = htmlString.trim();
                console.log(div);
                return div.firstChild;
            }


            visSlider.append(from_html(`<p style="margin-right: 5px"> Show mismatch </p>`));

            hot_check = from_html(`<input style="margin-right: 15px" type="checkbox">`);
            visSlider.append(hot_check);

            hot_check.addEventListener('input', (e) => {

                burn.style.display = hot_check.checked ? 'block' : 'none';
                canvas.style.display = hot_check.checked ? 'none' : 'block';

                mask.style.opacity = hot_check.checked ? 1 : visInput.value;
            });


            let visText = document.createElement("div");
            visText.innerText = "Highlight zones";
            visText.style['margin-right'] = '5px';
            visSlider.appendChild(visText);

            visInput = document.createElement("input");
            visInput.setAttribute("type", "range");
            visInput.setAttribute("min", "0");
            visInput.setAttribute("max", "1");
            visInput.setAttribute("step", "0.01");
            visInput.value = 0.3;

            visSlider.appendChild(visInput);

            visInput.addEventListener("input", function(evt) {

                mask.style.opacity = hot_check.checked ? 1 : visInput.value;
            });

            return visSlider;
        }

        let slider = initSlider();

        let interval = setInterval(() => {

            let topControls = document.querySelector("mona-lisa-embed").shadowRoot.querySelector(".layout .top-controls");
            if (topControls) {

                clearInterval(interval);
                topControls.after(slider);
            }
        }, 1000);

        draw();
        //setInterval(draw, 180 * 1000);

    }, false);


    // Add your template below, the first ones take precedence in case of conflict
    // 2000x2000 images without spaces between pixels work too ^_^

    const sources = [
        ["https://raw.githubusercontent.com/Sallbet/tgALMNefKZhUxtfi/main/map/derpy.png", 626, 411, 46, 42]
    ];
}