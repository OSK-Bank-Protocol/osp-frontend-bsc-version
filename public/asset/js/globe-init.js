import createGlobe from "https://cdn.skypack.dev/cobe";

let phi = 0;
let canvas = document.getElementById("cobe");

if (canvas) {
    const globe = createGlobe(canvas, {
        devicePixelRatio: 1,
        width: 700,
        height: 700,
        phi: 0,
        theta: 0,
        dark: 1,
        diffuse: 1.2,
        scale: 1,
        mapSamples: 16000,
        mapBrightness: 4,
        baseColor: [1, 1, 1],
        markerColor: [0, 0, 0],
        glowColor: [1, 1, 1],
        offset: [0, 0],
        markers: [],
        onRender: (state) => {
            state.phi = phi;
            phi += 0.005;
        },
    });
}


